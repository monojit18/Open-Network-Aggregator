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

let _express = Express();
let _server = Http.createServer(_express);
let _axiosAgent = null;
let _allUrls = {};

const KStatusACK = "ACK";

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

function prepareMultiSearchInfo(request)
{
    const extractionInfo = {};
    extractionInfo.context = request.body.context;
    extractionInfo.message = request.body.message;
    extractionInfo.headers = request.headers;
    extractionInfo.preferred_network = request.body.preferred_network;
    extractionInfo.preferred_networks = request.body.preferred_networks;    
    extractionInfo.prompt = process.env.PLANNER_EXTRACT_NLP_PROMPT;
    extractionInfo.endpointId = process.env.AGENTIC_MODEL_ENDPOINT_ID;    
    return extractionInfo;
}

function prepareAgriInfo(request)
{
    const transactionInfo = {};
    transactionInfo.context = request.body.context;
    transactionInfo.message = request.body.message;
    transactionInfo.preferred_networks = request.body.preferred_networks;
    return transactionInfo;
}

function prepareExtractContentInfo(promptInfo)
{
    const contentInfo = {};
    const partInfo = {};
    partInfo.text = promptInfo.prompt;

    contentInfo.role = "user";
    contentInfo.parts = [];
    contentInfo.parts.push(partInfo);
    return [contentInfo];
}

function prepareInstructionContentInfo(plannerInfo)
{
    const instruction = {};

    const partInfo = {};
    partInfo.text = plannerInfo.prompt;

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
    else
        filters.type = KConstantValues.ADVISORY;

    requestBody.message.network.relevant_text = KConstantValues.EMPTY;
    return requestBody;
}

function prepareExtractRequest(plannerInfo)
{
    const requestBody = {};

    const promptInfo = {};
    promptInfo.prompt = plannerInfo.message?.network?.filters.query;
    const contentsList = prepareExtractContentInfo(promptInfo);

    requestBody.contents = contentsList;
    requestBody.instruction = prepareInstructionContentInfo(plannerInfo);
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

async function callVideoAgent(extractionInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;
    requestOptions.headers = {};
    requestOptions.headers[process.env.VIDEO_API_KEY] = extractionInfo.headers[process.env.VIDEO_API_KEY];    

    const requestBody = prepareVideoAgentRequest(extractionInfo);
    
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
        const agentResponse = await Axios.post(`${_allUrls[KMicroServices.LLMAgent]}/search`,
                                                    requestBody, requestOptions);
        const agentResult = processGenericResponse(agentResponse);
        return agentResult;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performExtractedSearch(extractedList, extractionInfo)
{
    try
    {
        await Promise.all(extractedList.map(async (item) =>
        {
            switch(item.domain)
            {
                case KDomainNames.ONDC:
                {
                    extractionInfo.message.network.relevant_text = item.relevant_text;
                    await callONDCAgent(extractionInfo);
                }
                break;
    
                case KDomainNames.VIDEO:
                {
                    extractionInfo.message.network.filters.query = item.relevant_text;
                    await callVideoAgent(extractionInfo);
                }
                break;
    
                case KDomainNames.LLM:
                {
                    extractionInfo.message.network.relevant_text = item.relevant_text;
                    await callLLMAgent(extractionInfo);
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

async function performMultiSearch(extractionInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = prepareExtractRequest(extractionInfo);    
    const genAIHeaders = prepareShortHeaders(extractionInfo.endpointId);
    requestOptions.headers = genAIHeaders;

    try
    {
        let response = await Axios.post(`${_allUrls[KMicroServices.GenAITextlib]}/genai/text?type=json`,
                                                requestBody, requestOptions);
        const extractedResponse = processGenericResponse(response);
        const extractedList = extractedResponse.results[0].formatted_response;
        await performExtractedSearch(extractedList, extractionInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
_express.post("/multi/search", async (request, response) =>
{
    const extractionInfo = prepareMultiSearchInfo(request);
    const results = {};

    try
    {
        const ackResponse = prepareAckResponse(extractionInfo);
        results.results = ackResponse;
        response.send(results);
        await performMultiSearch(extractionInfo);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);;
    }
});

_express.post("/agri/search", async (request, response) =>
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
        // console.log(JSON.stringify(exception));
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);;
    }
});

_express.post("/retail/search", async (request, response) =>
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
        response.status(errorInfo.code).send(results);;
    }
});
/* API DEFINITIONS - END */

_server.listen(port);

initializePlanner();

console.log("Server running at http://localhost:%d", port);