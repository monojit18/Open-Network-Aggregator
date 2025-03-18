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

const KMicroServices =
{
    StorageLib: "storagelib",
    TranslateLib: "translatelib",
    GenAIImagelib: "genai-imagelib",
    VectorSearchlib: "vector-searchlib",
    GenAITextlib: "genai-textlib",
    GenAIMultimodallib: "genai-multimodallib",
    AgriAgent: "agri-agent",
    ONDCAgent: "ondc-agent",
    ONESTAgent: "onest-agent",
    VideoAgent: "video-agent",
    WeatherAgent: "weather-agent",
    MandiAgent: "mandi-agent",
    LLMAgent: "llm-agent"
}

const KNetworkActions =
{
    SearchAction: "search"
}

const KNetworkNames = 
{
    ONDC: "ONDC",
    ONEST: "ONEST",
    AGRI: "AGRI",
    VIDEO: "VIDEO",
    WEATHER: "WEATHER",
    MANDI: "ENAM",
    LLM: "LLM"
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
    exception.code = (exception.response.status == undefined) ? 500 : exception.response.status;
    exception.message = exception.response.statusText;
    return exception;
}

function processGenericResponse(response)
{
    const genericResponse = response.data.results;
    return genericResponse;
}

function prepareAllUrls()
{
    _allUrls[KMicroServices.StorageLib] = `${process.env.STORAGELIB_HOST}`;
    _allUrls[KMicroServices.TranslateLib] = `${process.env.TRANSLATELIB_HOST}`;
    _allUrls[KMicroServices.GenAIImagelib] = `${process.env.GENAI_IMAGELIB_HOST}`;
    _allUrls[KMicroServices.VectorSearchlib] = `${process.env.GENAI_VECTORSEARCHLIB_HOST}`;
    _allUrls[KMicroServices.GenAITextlib] = `${process.env.GENAI_TEXTLIB_HOST}`;
    _allUrls[KMicroServices.GenAIMultimodallib] = `${process.env.GENAI_MULTILIB_HOST}`;
    _allUrls[KMicroServices.ONDCAgent] = `${process.env.ONDC_AGENT_URL}`;
    _allUrls[KMicroServices.AgriAgent] = `${process.env.AGRI_AGENT_URL}`;
    _allUrls[KMicroServices.ONESTAgent] = `${process.env.ONEST_AGENT_URL}`;
    _allUrls[KMicroServices.VideoAgent] = `${process.env.VIDEO_AGENT_URL}`;
    _allUrls[KMicroServices.WeatherAgent] = `${process.env.WEATHER_AGENT_URL}`;
    _allUrls[KMicroServices.MandiAgent] = `${process.env.MANDI_AGENT_URL}`;
    _allUrls[KMicroServices.LLMAgent] = `${process.env.LLM_AGENT_URL}`;
}

function prepareNLPInfo(request)
{
    const nlpInfo = {};
    nlpInfo.transaction_id = request.body.transaction_id;
    nlpInfo.message_id = request.body.message_id;
    nlpInfo.query = request.body.query;
    nlpInfo.location = request.body.location;
    nlpInfo.preferred_networks = request.body.preferred_networks;    
    nlpInfo.prompt = process.env.AGENTIC_NLP_PROMPT;
    nlpInfo.endpointId = process.env.AGENTIC_MODEL_ENDPOINT_ID;
    nlpInfo.headers = request.headers;

    if (request.body.histories != null)
    {
        nlpInfo.histories = request.body.histories
    }
    return nlpInfo;
}

function prepareNLPContentInfo(promptInfo)
{
    const contentInfo = {};
    const partInfo = {};
    partInfo.text = promptInfo.prompt;

    contentInfo.role = "user";
    contentInfo.parts = [];
    contentInfo.parts.push(partInfo);
    return [contentInfo];
}

function prepareShortHeaders(endpointId)
{
    const genAIHeaders = {};
    genAIHeaders.temperature = 0.2;
    genAIHeaders.maxtokens = 2048;
    genAIHeaders.topk = 40;
    genAIHeaders.topp = 0.95;    
    genAIHeaders.endpointid = endpointId;
    return genAIHeaders;
}

function prepareOpenNetworkHeaders(nlpInfo)
{
    const openNetworkHeaders = {};    
    openNetworkHeaders[process.env.WEATHER_API_KEY] = nlpInfo.headers[process.env.WEATHER_API_KEY];
    openNetworkHeaders[process.env.VIDEO_API_KEY] = nlpInfo.headers[process.env.VIDEO_API_KEY];
    openNetworkHeaders[process.env.ENAM_MANDI_API_KEY] = nlpInfo.headers[process.env.ENAM_MANDI_API_KEY];
    openNetworkHeaders[process.env.PARTNER_MANDI_API_KEY] = nlpInfo.headers[process.env.PARTNER_MANDI_API_KEY];
    openNetworkHeaders[process.env.PARTNER_WEATHER_API_KEY] = nlpInfo.headers[process.env.PARTNER_WEATHER_API_KEY];
    return openNetworkHeaders;
}

function prepareAgentMessage(nlpInfo, nlpResponse, domainName)
{
    const agentMessage = {};

    const context = {};
    context.domain = `${process.env.AGENTIC_DOMAIN_PREFIX}${domainName}`;
    context.version = process.env.AGENTIC_VERSION;
    context.transaction_id = nlpInfo.transaction_id;
    context.message_id = nlpInfo.message_id;    
    context.location = nlpInfo.location;
    agentMessage.context = context;
    
    const message = {};
    message.network = nlpResponse.formatted_response.networks[0];
    
    const chat  = {};
    chat.histories = nlpInfo.histories;
    message.network.chat = chat;
    agentMessage.message = message;

    agentMessage.preferred_network = nlpInfo.preferred_networks[domainName];
    agentMessage.preferred_networks = nlpInfo.preferred_networks;
    return agentMessage;
}

async function detectText(sourceText)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;
    
    requestOptions.headers = {};
    requestOptions.headers =
    {
       "content-type": "application/json",
       "mime-type": "text/plain"
    }

    const requestBody = [];
    requestBody.push(sourceText);

    try
    {
        const response = await Axios.post(`${_allUrls[KMicroServices.TranslateLib]}/languages/detect`,
                                            requestBody, requestOptions);
        const translateResponseList = processGenericResponse(response);
        return translateResponseList[0];        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function translateText(nlpInfo)
{
    const detectTextInfo = await detectText(nlpInfo.query);
    if (detectTextInfo.detections[0].languageCode === "en")
    {
        const translatedInfo = {};
        translatedInfo.source = nlpInfo.query;
        translatedInfo.target = nlpInfo.query;
        return translatedInfo;
    }

    const textInfo = {};
    textInfo.text = detectTextInfo.source;
    textInfo.sourceLanguage = `${detectTextInfo.detections[0].languageCode}-IN`;
    textInfo.targetLanguage = "en-US";

    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;
    
    requestOptions.headers = {};
    requestOptions.headers =
    {
       "content-type": "application/json",
       "mime-type": "text/plain"
    }

    const requestBody = [];
    requestBody.push(textInfo.text);

    try
    {
        const response = await Axios.post(`${_allUrls[KMicroServices.TranslateLib]}/translate/text?src=${textInfo.sourceLanguage}&trg=${textInfo.targetLanguage}`,
                                            requestBody, requestOptions);
        const translateResponseList = processGenericResponse(response);
        return translateResponseList[0];        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function searchNetworkAgent(nlpResponse, nlpInfo, domainName, url)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;
    requestOptions.headers = prepareOpenNetworkHeaders(nlpInfo);

    const requestBody = prepareAgentMessage(nlpInfo, nlpResponse, domainName);

    try
    {
        const response = await Axios.post(`${url}/search`, requestBody, requestOptions);
        const networkResponse = processGenericResponse(response);
        return networkResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function routeSearchToNetwork(nlpResponse, nlpInfo)
{
    const formattedResponse = nlpResponse.formatted_response;
    const networkName = formattedResponse.networks[0].name;
    let networkResponse = null;
    let httpStatusCode = 200;
    let domainName = null;
    let url = null;

    switch(networkName)
    {
        case KNetworkNames.ONDC:
            {
                domainName = KNetworkNames.ONDC;
                url = `${_allUrls[KMicroServices.ONDCAgent]}`;                
            }
            // networkResponse = await searchONDCAgent(nlpResponse, nlpInfo);
            break;
        case KNetworkNames.ONEST:
            networkResponse = await searchONESTAgent(nlpResponse, nlpInfo);
            httpStatusCode = 501;
            break;
        case KNetworkNames.AGRI:
            {
                domainName = KNetworkNames.AGRI;
                url = `${_allUrls[KMicroServices.AgriAgent]}`;
            }
            // networkResponse = await searchAgriAgent(nlpResponse, nlpInfo);
            break;
        case KNetworkNames.VIDEO:
            {
                domainName = KNetworkNames.VIDEO;
                url = `${_allUrls[KMicroServices.VideoAgent]}`;
            }
            // networkResponse = await searchVideoAgent(nlpResponse, nlpInfo);
            break;
        case KNetworkNames.WEATHER:
            {
                domainName = KNetworkNames.WEATHER;
                url = `${_allUrls[KMicroServices.WeatherAgent]}`;
            }
            // networkResponse = await searchWeatherAgent(nlpResponse, nlpInfo);
            break;
        case KNetworkNames.LLM:
            {
                domainName = KNetworkNames.LLM;
                url = `${_allUrls[KMicroServices.LLMAgent]}`;
            }
            // networkResponse = await searchLLMAgent(nlpResponse, nlpInfo);
            break;
        case KNetworkNames.MANDI:
            {
                domainName = "MANDI";
                url = `${_allUrls[KMicroServices.MandiAgent]}`;
            }
            // networkResponse = await searchMandiAgent(nlpResponse, nlpInfo);
            break;        
    }

    networkResponse = await searchNetworkAgent(nlpResponse, nlpInfo, domainName, url);
    return { networkResponse, httpStatusCode };
}

async function processNLPInfo(nlpInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};

    const promptInfo = {};
    promptInfo.prompt = `${nlpInfo.prompt}\n\n${nlpInfo.query}`;
    const contentsList = prepareNLPContentInfo(promptInfo);
    requestBody.contents = contentsList;

    const genAIHeaders = prepareShortHeaders(nlpInfo.endpointId);
    requestOptions.headers = genAIHeaders;

    try
    {
        let response = await Axios.post(`${_allUrls[KMicroServices.GenAITextlib]}/genai/endpoint/text?type=json`,
                                                requestBody, requestOptions);
        const nlpResponsesList = processGenericResponse(response);
        const nlpResponse = nlpResponsesList[0];
        const domainResponse = await routeSearchToNetwork(nlpResponse, nlpInfo);        
        return domainResponse;
    }
    catch(exception)
    {        
        throw exception;
    }
}

async function initializeAgent()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
    prepareAllUrls();
}

/* API DEFINITIONS - START */
/**
 * @fires /search
 * @method POST
 * @description Health API for the microservice; can be LBs/Gateways while checking the backend health status
 */
_express.get("/healthz", async (request, response) =>
{
    const results = {};
    response.status(200).send(results);
});

/**
 * @fires /search
 * @method POST
 * @description In turn calls Search API of the corresponding Agent
 */
_express.post("/search", async (request, response) =>
{
    const nlpInfo = prepareNLPInfo(request);
    const translatedInfo = await translateText(nlpInfo);
    nlpInfo.query = translatedInfo.target;

    const results = {};

    try
    {
        const { networkResponse, httpStatusCode } = await processNLPInfo(nlpInfo);        
        results.results = networkResponse;
        response.status(httpStatusCode).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10003;
_server.listen(port);
initializeAgent();

console.log("Server running at http://localhost:%d", port);
