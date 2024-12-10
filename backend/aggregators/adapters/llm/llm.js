/*jshint esversion: 8 */

/*
Copyright [2023] [Monojit Datta]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const Http = require("http");
const Https = require("https");
const DotEnv = require("dotenv");
const Express = require("express");
const Cors = require("cors");
const Axios = require('axios');

const KLLMChatPrompt = "Context: Generate response for the following chat query.Provide accurate and to-the-point information.Do not add irrelevant information.";
const KLLMNegativePrompt = "Context: Consider the following sentence to be negative, irrelevant.Generate a polite, generous response rejecting this query. Response should be within 100 words and should not contain any violent, abusive languages.";

let _express = Express();
let _server = Http.createServer(_express);
let _axiosAgent = null;
let _allUrls = {};

const KMicroServices =
{
    GenAITextlib: "genai-textlib"
}

const KStatusACK = "ACK";

const KCallbackEvents =
{
    OnLLMAction: "on_llm",
    OnCallbackAction: "callback",
    OnErrorAction: "on_error"
}

DotEnv.config();

_express.use(Express.json
({
    extended: true
}));
    
_express.use(Express.urlencoded
({
    extended: true,
    limit: '10mb'
}));

_express.use(Cors
({
    origin: "*"
}));

function prepareErrorMessage(exception)
{
    exception.code = (exception.response.status == undefined) ? 500 : exception.response.status;
    exception.message = exception.response.statusText;
    return exception;
}

function prepareAllUrls()
{
    _allUrls[KMicroServices.GenAITextlib] = `${process.env.GENAI_TEXTLIB_HOST}`;
}

function prepareGenAIHeaders()
{
    const genAIHeaders = {};
    genAIHeaders.temperature = 0.4;
    genAIHeaders.maxtokens = 2048;
    genAIHeaders.topk = 40;
    genAIHeaders.topp = 0.95;
    return genAIHeaders;
}

function prepareLLMChatInfo(request)
{
    const llmInfo = {};    
    llmInfo.context = request.body.context;
    llmInfo.message = request.body.message;
    llmInfo.prompt = `${KLLMChatPrompt}`;
    llmInfo.histories = llmInfo.message.network.chat?.histories;

    const filters = llmInfo.message.network.filters;
    if (Array.isArray(filters) == true)
        llmInfo.query = filters[0].query;
    else
        llmInfo.query = filters.query;

    return llmInfo;
}

function prepareLLMNegativeInfo(request)
{
    const llmInfo = prepareLLMChatInfo(request);
    llmInfo.histories = null;
    llmInfo.prompt = `${KLLMNegativePrompt}`;
    llmInfo.query = llmInfo.message.network.filters[0].query;    
    return llmInfo;
}

function prepareLLMChatContentInfo(promptInfo)
{
    const contentInfo = {};
    contentInfo.text = promptInfo.prompt;
    return [contentInfo];
}

function prepareLLMNegativeContentInfo(promptInfo)
{
    const contentInfo = {};
    const partInfo = {};
    partInfo.text = promptInfo.prompt;

    contentInfo.role = "user";
    contentInfo.parts = [];
    contentInfo.parts.push(partInfo);
    return [contentInfo];
}

function prepareAckResponse(weatherInfo)
{
    const ackResponse = {};
    ackResponse.context = weatherInfo.context;

    const message = {};
    const ack = {};
    ack.status = KStatusACK;
    message.ack = ack;
    ackResponse.message = message;
    return ackResponse;
}

function preapreLLMChatResponse(llmResult, llmInfo)
{
    const response = llmResult.data;

    const llmResponse = {};
    llmResponse.context = llmInfo.context;
    llmResponse.message = llmInfo.message;

    const chat = {};
    chat.text = response.results[0].original_response;

    const histories = (llmInfo.histories == null)? [] : llmInfo.histories;
    const userInfo = {};
    userInfo.parts = [];
    const userPart = {};
    userInfo.role = "user";
    userPart.text = llmInfo.text;
    userInfo.parts.push(userPart);
    histories.push(userInfo);

    const modelInfo = {};
    modelInfo.parts = [];
    const modelPart = {};
    modelInfo.role = "model";
    modelPart.text = chat.text;
    modelInfo.parts.push(modelPart);
    histories.push(modelInfo);
    chat.histories = histories;
    llmResponse.message.chat = chat;
    return llmResponse;
}

function preapreLLMNegativeResponse(llmResult, llmInfo)
{
    const response = llmResult.data;

    const llmResponse = {};
    llmResponse.context = llmInfo.context;
    llmResponse.message = llmInfo.message;

    const chat = {};
    chat.text = response.results[0].original_response;
    llmResponse.message.chat = chat;
    return llmResponse;
}

function preapreLLMCallbackData(llmResponse, llmInfo)
{
    const llmData = {};
    llmData.room = llmInfo.context.transaction_id;
    llmData.event = KCallbackEvents.OnLLMAction;
    
    const payload = {};
    payload.context = llmResponse.context;
    payload.message = llmResponse.message;
    llmData.payload = payload;
    return llmData;
}

function initializeAdapter()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
    
    prepareAllUrls();
}

async function fireCallbackEvent(llmResponse, llmInfo)
{
    try
    {
        const llmData = preapreLLMCallbackData(llmResponse, llmInfo);
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, llmData);
    }
    catch(exception)
    {
        throw exception;
    }
}

async function fireErrorEvent(errorInfo, llmInfo)
{
    try
    {
        const errorResponse = {};
        errorResponse.code = errorInfo.response?.data?.error?.code;
        errorResponse.message = errorInfo.response?.data?.error?.message;

        const llmData = preapreLLMCallbackData(errorResponse, llmInfo);
        _socketIOClient.emit(KCallbackEvents.OnCallbackAction, llmData);
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, llmData);
    }
    catch(exception)
    {
        throw exception;
    }    
}

async function emitAdapterEvent(eventName, eventData)
{
    const requestOptions= {};
    requestOptions.httpsAgent = _axiosAgent;
    
    const requestBody = {};
    requestBody.eventName = eventName;
    requestBody.eventData = eventData;

    try
    {
        const socketResponse = await Axios.post(`${process.env.EVENT_RECEIVER_HTTP_HOST}/stream`,
                                                requestBody, requestOptions);
        console.log(socketResponse);
        return socketResponse;
    }
    catch(exception)
    {        
        throw exception;
    }
}

async function performLLMChat(llmInfo)
{
    try
    {
        let llmChatURL = `${_allUrls[KMicroServices.GenAITextlib]}/genai/chat`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"            
        };

        const requestBody = {};
        if ((llmInfo.histories != null) && (llmInfo.histories.length > 0))
        {
            requestBody.histories = llmInfo.histories;
        }
        
        const promptInfo = {};
        promptInfo.prompt = `${llmInfo.prompt}\n\n${llmInfo.query}`;
        const contentsList = prepareLLMChatContentInfo(promptInfo);
        requestBody.contents = contentsList;

        const genAIHeaders = prepareGenAIHeaders();
        requestOptions.headers = genAIHeaders;

        const llmResult = await Axios.post(`${llmChatURL}`, requestBody, requestOptions);
        const llmResponse = preapreLLMChatResponse(llmResult, llmInfo);
        await fireCallbackEvent(llmResponse, llmInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

async function processNegativeQuery(llmInfo)
{
    try
    {
        let llmNegativeURL = `${_allUrls[KMicroServices.GenAITextlib]}/genai/text`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"            
        };

        const requestBody = {};        
        const promptInfo = {};
        promptInfo.prompt = `${llmInfo.prompt}\n\n${llmInfo.text}`;
        const contentsList = prepareLLMNegativeContentInfo(promptInfo);
        requestBody.contents = contentsList;

        const genAIHeaders = prepareGenAIHeaders();
        requestOptions.headers = genAIHeaders;

        const llmResult = await Axios.post(`${llmNegativeURL}`, requestBody, requestOptions);
        const llmResponse = preapreLLMNegativeResponse(llmResult, llmInfo);        
        await fireCallbackEvent(llmResponse, llmInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
_express.post("/llm/chat", async (request, response) =>
{
    const llmInfo = prepareLLMChatInfo(request);
    const results = {};

    try
    {        
        const ackResponse = prepareAckResponse(llmInfo);
        results.results = ackResponse;
        response.send(results);        
        await performLLMChat(llmInfo);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, llmInfo);
    }
});

_express.post("/llm/negative", async (request, response) =>
{
    const llmInfo = prepareLLMNegativeInfo(request);
    const results = {};

    try
    {        
        const ackResponse = prepareAckResponse(llmInfo);
        results.results = ackResponse;
        response.send(results);        
        await processNegativeQuery(llmInfo);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, llmInfo);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10001;
_server.listen(port);
initializeAdapter();

console.log("Server running at http://localhost:%d", port);
