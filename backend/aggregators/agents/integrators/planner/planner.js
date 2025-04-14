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
const { isAbsolute } = require("path");

let _express = Express();
let _server = Http.createServer(_express);
let _axiosAgent = null;
let _allUrls = {};

const KStatusACK = "ACK";

const KCallbackEvents =
{    
    OnCallbackAction: "callback",
    OnErrorAction: "on_error"
}

const KMicroServices =
{
    GenAITextlib: "genai-textlib",
    ONDCAgent: "ondc-agent",
    LLMAgent: "llm-agent",
    VideoAgent: "video-agent"
}

const KDomainNames =
{
    ONDC: "ONDC",
    VIDEO: "VIDEO",
    LLM: "LLM"
}

const KConstantValues =
{
    ADVISORY: "advisory",
    EMPTY: ""
}

DotEnv.config();

_express.use(Express.json
({
    extended: true
}));
    
_express.use(Express.urlencoded
({
    extended: true
}));

_express.use(Cors
({
    origin: "*"
}));

function prepareErrorMessage(exception)
{
    exception.code = exception.response.status;
    exception.message = exception.response.statusText;
    return exception;
}

function processGenericResponse(response)
{
    const genericResponse = response.data;
    return genericResponse;
}

function prepareAllUrls()
{
    _allUrls[KMicroServices.GenAITextlib] = `${process.env.GENAI_TEXTLIB_HOST}`;
    _allUrls[KMicroServices.ONDCAgent] = `${process.env.ONDC_AGENT_URL}`;
    _allUrls[KMicroServices.LLMAgent] = `${process.env.LLM_AGENT_URL}`;
    _allUrls[KMicroServices.VideoAgent] = `${process.env.VIDEO_AGENT_URL}`;
}

function preparePlannerSearchInfo(request, plannerPrompt)
{
    const plannerInfo = {};
    plannerInfo.context = request.body.context;
    plannerInfo.message = request.body.message;
    plannerInfo.headers = request.headers;
    plannerInfo.preferred_network = request.body.preferred_network;
    plannerInfo.preferred_networks = request.body.preferred_networks;    
    plannerInfo.prompt = plannerPrompt;
    plannerInfo.endpointId = process.env.AGENTIC_MODEL_ENDPOINT_ID;    
    return plannerInfo;
}

function prepareAgriInfo(request)
{
    const transactionInfo = {};
    transactionInfo.context = request.body.context;
    transactionInfo.message = request.body.message;
    transactionInfo.preferred_networks = request.body.preferred_networks;
    return transactionInfo;
}

function preparePlannerContentInfo(promptInfo)
{
    const contentInfo = {};
    const partInfo = {};
    partInfo.text = promptInfo.prompt;

    contentInfo.role = "user";
    contentInfo.parts = [];
    contentInfo.parts.push(partInfo);
    return [contentInfo];
}

function prepareInstructionContentInfo(prompt)
{
    const instruction = {};

    const partInfo = {};
    partInfo.text = prompt;

    instruction.parts = [];
    instruction.parts.push(partInfo);
    return instruction;
}

function prepareShortHeaders(endpointId)
{
    const genAIHeaders = {};
    genAIHeaders.temperature = 0.4;
    genAIHeaders.maxtokens = 2048;
    genAIHeaders.topk = 40;
    genAIHeaders.topp = 0.95;
    genAIHeaders.endpointid = endpointId;
    return genAIHeaders;
}

function prepareAckResponse(plannerInfo)
{
    const ackResponse = {};

    const context = plannerInfo.context;    
    ackResponse.context = context;

    const message = {};
    const ack = {};
    ack.status = KStatusACK;
    message.ack = ack;
    ackResponse.message = message;
    return ackResponse;
}

function prepareAgentRequest(plannerInfo, domainName)
{
    const requestBody = {};
    requestBody.context = plannerInfo.context;
    requestBody.context.domain = `${process.env.AGENTIC_DOMAIN_PREFIX}${domainName}`;
    requestBody.message = plannerInfo.message;
    requestBody.message.network.name = domainName;    
    return requestBody;
}

function prepareVideoAgentRequest(plannerInfo)
{
    const requestBody = prepareAgentRequest(plannerInfo, KDomainNames.VIDEO);
    requestBody.preferred_network = plannerInfo.preferred_networks[KDomainNames.VIDEO];    
    requestBody.message.network.filters.query = plannerInfo.message.network.filters.query;
    return requestBody;
}

function prepareONDCAgentRequest(plannerInfo)
{
    const requestBody = prepareAgentRequest(plannerInfo, KDomainNames.ONDC);
    requestBody.preferred_network = (plannerInfo.preferred_networks)[KDomainNames.ONDC];
    requestBody.message.network.relevant_text = plannerInfo.message.network.relevant_text;
    return requestBody;
}

function prepareLLMAgentRequest(plannerInfo)
{
    const requestBody = prepareAgentRequest(plannerInfo, KDomainNames.LLM);

    const filters = requestBody.message.network.filters;
    if (Array.isArray(filters) == true)
        filters[0].type = KConstantValues.ADVISORY;

    requestBody.message.network.relevant_text = KConstantValues.EMPTY;
    return requestBody;
}

function preparePlannerRequest(plannerInfo)
{
    const requestBody = {};
    const promptInfo = {};
    const filters = plannerInfo.message.network.filters;
    const relevantText = plannerInfo.message.network.relevant_text;

    if (Array.isArray(filters) == true)
        promptInfo.prompt = relevantText;
    else
        promptInfo.prompt = filters.query;

    const contentsList = preparePlannerContentInfo(promptInfo);
    requestBody.contents = contentsList;
    requestBody.instruction = prepareInstructionContentInfo(plannerInfo.prompt);
    return requestBody;
}

function prepareAbusiveRequest(plannerInfo)
{
    const requestBody = {};
    const promptInfo = {};
    const filters = plannerInfo.message.network.filters;
    const relevantText = plannerInfo.message.network.relevant_text;

    if (Array.isArray(filters) == true)
        promptInfo.prompt = relevantText;
    else
        promptInfo.prompt = filters.query;

    const contentsList = preparePlannerContentInfo(promptInfo);
    requestBody.contents = contentsList;
    requestBody.instruction = prepareInstructionContentInfo(process.env.PLANNER_ABUSIVE_NLP_PROMPT);
    return requestBody;
}

function initializePlanner()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });

    prepareAllUrls();
}

async function emitPlannerEvent(eventName, eventData)
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

async function fireErrorEvent(errorInfo, plannerInfo)
{
    try
    {
        const plannerData = {};
        plannerData.room = plannerInfo.context.transaction_id;
        plannerData.event = KCallbackEvents.OnErrorAction;
        
        const payload = {};
        payload.context = plannerInfo.context;
        payload.message = plannerInfo.message;

        const errorResponse = {};
        errorResponse.code = errorInfo.code;
        errorResponse.message = errorInfo.message;
        payload.error = errorResponse;

        plannerData.payload = payload;
        await emitPlannerEvent(KCallbackEvents.OnCallbackAction, plannerData);
    }
    catch(exception)
    {
        throw exception;
    }
}

async function checkForAbusiveRequest(plannerInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = prepareAbusiveRequest(plannerInfo);    
    const genAIHeaders = prepareShortHeaders(plannerInfo.endpointId);
    requestOptions.headers = genAIHeaders;

    try
    {
        let response = await Axios.post(`${_allUrls[KMicroServices.GenAITextlib]}/genai/text?type=json`,
                                                requestBody, requestOptions);
        const abusiveResult = processGenericResponse(response);
        const abusiveResponse  = abusiveResult.results[0].formatted_response;
        const isAbusive = ((abusiveResponse.isAbusive == true) || (abusiveResponse.isIndividual) == true);
        return isAbusive;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function callVideoAgent(plannerInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;
    requestOptions.headers = {};
    requestOptions.headers[process.env.VIDEO_API_KEY] = plannerInfo.headers[process.env.VIDEO_API_KEY];    

    const requestBody = prepareVideoAgentRequest(plannerInfo);
    
    try
    {
        const agentResponse = await Axios.post(`${_allUrls[KMicroServices.VideoAgent]}/search`,
                                                    requestBody, requestOptions);
        const agentResult = processGenericResponse(agentResponse);
        return agentResult;        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function callONDCAgent(ondcInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = prepareONDCAgentRequest(ondcInfo);
    
    try
    {
        const agentResponse = await Axios.post(`${_allUrls[KMicroServices.ONDCAgent]}/search`,
                                                    requestBody, requestOptions);        
        const agentResult = processGenericResponse(agentResponse);
        return agentResult;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function callLLMAgent(llmInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = prepareLLMAgentRequest(llmInfo);
    
    try
    {
        const agentResponse = await Axios.post(`${_allUrls[KMicroServices.LLMAgent]}/search/${llmInfo.isAbusive}`,
                                                    requestBody, requestOptions);
        const agentResult = processGenericResponse(agentResponse);
        return agentResult;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performExtractedSearch(extractedList, plannerInfo)
{
    try
    {         
        await Promise.all(extractedList.map(async (item) =>
        {
            switch(item.domain)
            {
                case KDomainNames.ONDC:
                {
                    const copiedPlannerInfo = JSON.parse(JSON.stringify(plannerInfo));
                    copiedPlannerInfo.message.network.relevant_text = item.relevant_text;
                    await callONDCAgent(copiedPlannerInfo);                                        
                }
                break;
    
                case KDomainNames.VIDEO:
                {
                    const copiedPlannerInfo = JSON.parse(JSON.stringify(plannerInfo));
                    copiedPlannerInfo.message.network.filters.query = item.relevant_text;
                    await callVideoAgent(copiedPlannerInfo);                                    
                }
                break;
    
                case KDomainNames.LLM:
                {
                    const copiedPlannerInfo = JSON.parse(JSON.stringify(plannerInfo));
                    copiedPlannerInfo.message.network.filters.query = item.relevant_text;
                    await callLLMAgent(copiedPlannerInfo);
                }
                break;
            }
        }));
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performPlannerSearch(plannerInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = preparePlannerRequest(plannerInfo);    
    const genAIHeaders = prepareShortHeaders(plannerInfo.endpointId);
    requestOptions.headers = genAIHeaders;

    try
    {
        let response = await Axios.post(`${_allUrls[KMicroServices.GenAITextlib]}/genai/text?type=json`,
                                                requestBody, requestOptions);
        const extractedResponse = processGenericResponse(response);
        const extractedList = extractedResponse.results[0].formatted_response;        
        await performExtractedSearch(extractedList, plannerInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
/**
 * @fires /multi/ondc/search
 * @method POST
 * @description Calls Search API of either the ONDC Agent, the Video Agent or LLM Agent
 * based on the intent from the **Master Agent**
 */
_express.post("/multi/ondc/search", async (request, response) =>
{
    const plannerInfo = preparePlannerSearchInfo(request, process.env.PLANNER_EXTRACT_ONDC_PROMPT);
    const results = {};

    try
    {
        const ackResponse = prepareAckResponse(plannerInfo);
        results.results = ackResponse;
        response.send(results);

        const isAbusive = await checkForAbusiveRequest(plannerInfo);
        plannerInfo.isAbusive = isAbusive;
        (isAbusive == true) ? await callLLMAgent(plannerInfo)
                            : await performPlannerSearch(plannerInfo);        
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, plannerInfo);
    }
});

/**
 * @fires /multi/onest/search
 * @method POST
 * @description Calls Search API of either the Video Agent or LLM Agent
 * based on the intent from the **Master Agent**
 */
_express.post("/multi/onest/search", async (request, response) =>
{
    const plannerInfo = preparePlannerSearchInfo(request, process.env.PLANNER_EXTRACT_ONEST_PROMPT);
    const results = {};

    try
    {
        const ackResponse = prepareAckResponse(plannerInfo);
        results.results = ackResponse;
        response.send(results);

        const isAbusive = await checkForAbusiveRequest(plannerInfo);
        plannerInfo.isAbusive = isAbusive;       
        (isAbusive == true) ? await callLLMAgent(plannerInfo)
                            : await performPlannerSearch(plannerInfo);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, plannerInfo);
    }
});

/**
 * @fires /agri/ondc/search
 * @method POST
 * @description Calls Search API of either the ONDC Agent
 */
_express.post("/agri/ondc/search", async (request, response) =>
{
    const agriInfo = prepareAgriInfo(request);
    const results = {};

    try
    {
        const ackResponse = prepareAckResponse(agriInfo);
        results.results = ackResponse;
        response.send(results);
        await callONDCAgent(agriInfo);        
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, agriInfo);
    }
});

/**
 * @fires /agri/search
 * @method POST
 * @description Calls Search API of either the LLM Agent
 */
_express.post("/agri/search", async (request, response) =>
{
    const agriInfo = prepareAgriInfo(request);
    const results = {};

    try
    {
        const ackResponse = prepareAckResponse(agriInfo);
        results.results = ackResponse;
        response.send(results);
        await callLLMAgent(agriInfo);        
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, agriInfo);
    }
});
/* API DEFINITIONS - END */
var port = process.env.port || process.env.PORT || 10002;
_server.listen(port);

initializePlanner();

console.log("Server running at http://localhost:%d", port);