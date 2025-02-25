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
const { v4: uuidv4 } = require('uuid');
const Axios = require('axios');

let _express = Express();
let _server = Http.createServer(_express);
let _axiosAgent = null;
let _allUrls = {};

const KMicroServices =
{
    GenAITextlib: "genai-textlib"
    // PlannerAdapterlib: "planner-adapterlib"
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
    // _allUrls[KMicroServices.PlannerAdapterlib] = `${process.env.PLANNER_ADAPTER_URL}`;
}

function prepareGenAIShortHeaders()
{
    const genAIHeaders = {};
    genAIHeaders.temperature = 0.4;
    genAIHeaders.maxtokens = 1024;
    // genAIHeaders.topk = 40;
    genAIHeaders.topp = 0.95;
    return genAIHeaders;
}

function prepareGenAILongHeaders()
{
    const genAIHeaders = {};
    genAIHeaders.temperature = 1.0;
    genAIHeaders.maxtokens = 2048;
    // genAIHeaders.topk = 40;
    genAIHeaders.topp = 0.95;
    return genAIHeaders;
}

function prepareInstructionContentInfo(systemPrompt)
{
    const instruction = {};

    const partInfo = {};
    partInfo.text = systemPrompt;

    instruction.parts = [];
    instruction.parts.push(partInfo);
    return instruction;
}

// function preparePlannerRequest(llmInfo)
// {
//     const requestBody = {};
//     requestBody.context = llmInfo.context;
//     requestBody.message = llmInfo.message;
//     requestBody.message.network.relevant_text = llmInfo.query;
//     return requestBody;
// }

function prepareLLMChatInfo(request)
{
    const llmInfo = {};
    llmInfo.context = request.body.context;
    llmInfo.message = request.body.message;
    llmInfo.prompt = process.env.LLM_CHAT_PROMP;
    llmInfo.histories = llmInfo.message.network.chat?.histories;

    const filters = llmInfo.message.network.filters;
    if (Array.isArray(filters) == true)
        llmInfo.query = filters[0].query;
    else
        llmInfo.query = filters.query;

    const followupInfo = {};
    followupInfo.query = llmInfo.query;
    followupInfo.prompt = process.env.LLM_FOLLOW_UP_PROMPT;
    llmInfo.followup = followupInfo;
    return llmInfo;
}

function prepareFollowupContentInfo(promptInfo)
{
    const contentInfo = {};
    const partInfo = {};
    partInfo.text = promptInfo.prompt;

    contentInfo.role = "user";
    contentInfo.parts = [];
    contentInfo.parts.push(partInfo);
    return [contentInfo];
}

function prepareLLMChatContentInfo(promptInfo)
{
    const contentInfo = {};
    contentInfo.text = promptInfo.prompt;
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

function preapreFollowupResponse(followupResult)
{
    const response = followupResult.results[0];
    const followupResponse = response.formatted_response.follow_up;
    return followupResponse;
}

function preapreLLMChatResponse(llmResult, llmInfo, followupResponse)
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
    userPart.text = llmInfo.query;
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
    chat.follow_up = followupResponse;
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
        errorResponse.code = errorInfo.code;
        errorResponse.message = errorInfo.message;

        const llmData = preapreLLMCallbackData(errorResponse, llmInfo);
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
        const socketResponse = await Axios.post(`${process.env.EVENT_RECEIVER_HTTP_HOST}/message`,
                                                requestBody, requestOptions);
        console.log(socketResponse);
        return socketResponse;
    }
    catch(exception)
    {        
        throw exception;
    }
}

async function generateLLMFollowup(llmInfo)
{
    try
    {
        let followupURL = `${_allUrls[KMicroServices.GenAITextlib]}/genai/text?type=json`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"
        };

        const requestBody = {};
        
        const promptInfo = {};
        promptInfo.prompt = llmInfo.followup.query;
        const contentsList = prepareFollowupContentInfo(promptInfo);
        requestBody.contents = contentsList;
        requestBody.instruction = prepareInstructionContentInfo(llmInfo.followup.prompt);

        const genAIHeaders = prepareGenAIShortHeaders();
        requestOptions.headers = genAIHeaders;

        const followupResultList = await Axios.post(`${followupURL}`, requestBody, requestOptions);
        const followupResult = followupResultList.data;
        const followupResponse = preapreFollowupResponse(followupResult);
        return followupResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

// async function performPlannerSearch(llmInfo)
// {
//     try
//     {        
//         const requestOptions = {};
//         requestOptions.httpsAgent = _axiosAgent;
//         requestOptions.headers =
//         {
//             "content-type": "application/json"
//         };
        
//         const requestBody = preparePlannerRequest(llmInfo);
//         await Axios.post(`${_allUrls[KMicroServices.PlannerAdapterlib]}/search`, requestBody, requestOptions);                
//     }
//     catch(exception)
//     {
//         throw exception;
//     }
// }

async function performLLMChat(llmInfo, followupResponse)
{
    try
    {
        let llmChatURL = `${_allUrls[KMicroServices.GenAITextlib]}/genai/chat/${llmInfo.context.transaction_id}/stream`;

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
        promptInfo.prompt = llmInfo.query;
        const contentsList = prepareLLMChatContentInfo(promptInfo);
        requestBody.contents = contentsList;
        requestBody.instruction = prepareInstructionContentInfo(llmInfo.prompt);

        const genAIHeaders = prepareGenAILongHeaders();
        requestOptions.headers = genAIHeaders;

        const llmResult = await Axios.post(`${llmChatURL}`, requestBody, requestOptions);
        const llmResponse = preapreLLMChatResponse(llmResult, llmInfo, followupResponse);        
        await fireCallbackEvent(llmResponse, llmInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
/**
 * @fires /search
 * @method POST
 * @description In turn calls Search API of each Affiliate
 */
_express.post("/llm/chat", async (request, response) =>
{
    const llmInfo = prepareLLMChatInfo(request);
    const results = {};

    try
    {        
        const ackResponse = prepareAckResponse(llmInfo);
        results.results = ackResponse;
        response.send(results);

        // if (process.env.LLM_PLANNER_MODE == "true")
        // {
        //     await performPlannerSearch(llmInfo);
        //     return;
        // }

        const followupResponse = await generateLLMFollowup(llmInfo);
        await performLLMChat(llmInfo, followupResponse);
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
