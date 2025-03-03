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
    VideoAgent: "video-agent"
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
    _allUrls[KMicroServices.VideoAgent] = `${process.env.VIDEO_AGENT_URL}`;
}

function preparePlannerInfo(request)
{
    const plannerInfo = {};
    plannerInfo.context = request.body.context;
    plannerInfo.message = request.body.message;  
    plannerInfo.preferred_network = request.body.preferred_network;
    plannerInfo.preferred_networks = request.body.preferred_networks;    
    plannerInfo.prompt = process.env.PLANNER_NLP_PROMPT;
    plannerInfo.endpointId = process.env.AGENTIC_MODEL_ENDPOINT_ID;
    return plannerInfo;
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

function prepareONDCAgentRequest(planner, plannerInfo)
{
    const requestBody = {};
    requestBody.context = plannerInfo.context;
    requestBody.context.domain = `${process.env.AGENTIC_DOMAIN_PREFIX}${planner.domain}`;
    requestBody.message = plannerInfo.message;
    requestBody.preferred_network = plannerInfo.preferred_network;
    requestBody.preferred_networks = plannerInfo.preferred_networks;
    requestBody.message.network.relevant_text = planner.relevant_text;
    return requestBody;
}

function prepareVideoAgentRequest(planner, plannerInfo)
{
    const requestBody = {};
    requestBody.context = plannerInfo.context;
    requestBody.context.domain = `${process.env.AGENTIC_DOMAIN_PREFIX}${planner.domain}`;
    requestBody.message = plannerInfo.message;
    requestBody.preferred_network = plannerInfo.preferred_networks[planner.domain];
    requestBody.preferred_networks = plannerInfo.preferred_networks;
    requestBody.message.network.filters.query = planner.relevant_text;
    return requestBody;
}

function prepareExtractRequest(plannerInfo)
{
    const requestBody = {};

    const promptInfo = {};
    promptInfo.prompt = plannerInfo.message?.network?.relevant_text;
    const contentsList = preparePlannerContentInfo(promptInfo);

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

async function callONDCAgent(planner, plannerInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = prepareONDCAgentRequest(planner, plannerInfo);
    
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

async function callVideoAgent(planner, plannerInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;
    requestOptions.headers = {};
    requestOptions.headers[process.env.VIDEO_API_KEY] = plannerInfo.headers[process.env.VIDEO_API_KEY];

    const requestBody = prepareVideoAgentRequest(planner, plannerInfo);
    
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

async function callLLMAdapter(plannerInfo)
{
    
}

async function performPlannerSearch(plannerResponse, plannerInfo)
{
    const plannerList = plannerResponse.results[0].formatted_response;
    // const planner = plannerList[0];
    await Promise.all(plannerList.map(async (planner) =>
    {
        switch(planner.domain)
        {
            case "ONDC":
            {
                await callONDCAgent(planner, plannerInfo);
            }
            break;

            case "VIDEO":
            {
                // await callVideoAgent(planner, plannerInfo);
            }
            break;

            case "LLM":
            {
                // await callLLMAdapter(plannerInfo);
            }
            break;
        }
    }));
}

async function performPlannerExtract(plannerInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = prepareExtractRequest(plannerInfo);    
    const genAIHeaders = prepareShortHeaders(plannerInfo.endpointId);
    requestOptions.headers = genAIHeaders;

    try
    {
        let response = await Axios.post(`${_allUrls[KMicroServices.GenAITextlib]}/genai/text?type=json`,
                                                requestBody, requestOptions);
        const plannerResponse = processGenericResponse(response);
        await performPlannerSearch(plannerResponse, plannerInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
_express.post("/search", async (request, response) =>
{
    const plannerInfo = preparePlannerInfo(request);
    const results = {};

    try
    {
        const ackResponse = prepareAckResponse(plannerInfo);
        results.results = ackResponse;
        response.send(results);
        await performPlannerExtract(plannerInfo);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);;
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 11001;
_server.listen(port);

initializePlanner();

console.log("Server running at http://localhost:%d", port);