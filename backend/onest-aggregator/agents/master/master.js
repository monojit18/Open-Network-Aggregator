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
    ONDCAgent: "ondc-agent",
    ONESTAgent: "onest-agent",
    VideoAgent: "video-agent",
    WeatherAgent: "weather-agent",
    EnaMandiAgent: "enam-mandi-agent",
    LLMAgent: "llm-agent"
}

const KNetworkActions =
{
    SearchAction: "search",
    SelectAction: "select",
    InitAction: "init",
    ConfirmAction: "confirm",
    StatusAction: "status"
}

const KNetworkNames = 
{
    ONDC: "ONDC",
    ONEST: "ONEST",
    VIDEO: "VIDEO",
    WEATHER: "WEATHER",
    ENAMMANDI: "ENAM",
    LLM: "LLM",    
    UI: "UI"
}

// const KNLPPrompt = "Convert the following sentence into a JSON object and return as a proper JSON. Do not add any new items into the response.\nConditions:\nDomain for Learning, Courses, Skills, Jobs, Scholarships and Work Experiences will be \"ONEST\"\nDomain for anything related to Transactional operations in Retail will be \"ONDC\"\nDomain for anything related to Weather Forecast will be \"WEATHER\"\nDomain for anything related to Video and Webinar will be \"VIDEO\"\nDomain for anything related to UI action will be \"UI\"\nDomain for any Generic questions e.g. asking for suggestions, options or guidance will be \"LLM\"";
// const KEndpointId = "8161966183562608640";

const KNLPPrompt = "Convert the following sentence into a JSON object and return as a proper JSON. Do not add any new items into the response.\nConditions:\nDomain for any Search or Transactional query on Learning, Courses, Skills, Jobs, Scholarships and Work Experiences will be \"ONEST\"\nDomain for any Search or Transactional query on Retail, Online Shopping and Booking will be \"ONDC\"\nDomain for search query on Weather Forecast will be \"WEATHER\"\nDomain for search query on Videos and Webinars will be \"VIDEO\"\nDomain for search query on the price of any Agriculture Products or Commodities in a Mandi or Market will be \"ENAM\"\nDomain for any Generic query on any topic asking for suggestions, guidance and help will be \"LLM\"\nDomain for anything related to UI action will be \"UI\"";
const KEndpointId = "2378288730856226816";

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

function processListResponse(response)
{
    const responsesList = response.data;
    const consolidatedList = [];
    for (const response of responsesList)
    {
        const genericResponse = response.results;
        consolidatedList.push(genericResponse);
    }
    return consolidatedList;
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
    _allUrls[KMicroServices.ONESTAgent] = `${process.env.ONEST_AGENT_URL}`;
    _allUrls[KMicroServices.VideoAgent] = `${process.env.VIDEO_AGENT_URL}`;
    _allUrls[KMicroServices.WeatherAgent] = `${process.env.WEATHER_AGENT_URL}`;
    _allUrls[KMicroServices.LLMAgent] = `${process.env.LLM_AGENT_URL}`;
}

function prepareNLPInfo(request)
{
    const nlpInfo = {};
    nlpInfo.transactionId = request.body.transactionId;
    nlpInfo.messageId = request.body.messageId;
    nlpInfo.text = request.body.text;
    nlpInfo.prompt = KNLPPrompt;
    nlpInfo.endpointId = KEndpointId;

    if (request.body.histories != null)
    {
        nlpInfo.histories = request.body.histories
    }
    return nlpInfo;
}

function prepareNetworkInfo(request)
{
    const networkInfo = request.body;
    return networkInfo;
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
    genAIHeaders.maxtokens = 8192;
    genAIHeaders.topk = 40;
    genAIHeaders.topp = 0.95;    
    genAIHeaders.endpointid = endpointId;
    return genAIHeaders;
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
    const detectTextInfo = await detectText(nlpInfo.text);
    if (detectTextInfo.detections[0].languageCode === "en")
    {
        const translatedInfo = {};
        translatedInfo.source = nlpInfo.text;
        translatedInfo.target = nlpInfo.text;
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

async function searchONDCAgent(nlpResponse, nlpInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};
    requestBody.transactionId = nlpInfo.transactionId;
    requestBody.messageId = nlpInfo.messageId;
    requestBody.network = nlpResponse.formatted_response.networks[0];

    const intent = {};
    intent.query = nlpInfo.text;
    requestBody.network.intent[0] = intent;

    try
    {
        const response = await Axios.post(`${_allUrls[KMicroServices.ONDCAgent]}/${KNetworkActions.SearchAction}`,
                                                requestBody, requestOptions);
        const networkResponse = processGenericResponse(response);
        return networkResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function actionONDCAgent(networkInfo, actionString)
{
    return {};
}

async function searchONESTAgent(nlpResponse, nlpInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};
    requestBody.transactionId = nlpInfo.transactionId;
    requestBody.messageId = nlpInfo.messageId;
    requestBody.network = nlpResponse.formatted_response.networks[0];

    try
    {
        const response = await Axios.post(`${_allUrls[KMicroServices.ONESTAgent]}/${KNetworkActions.SearchAction}`,
                                                requestBody, requestOptions);
        const networkResponse = processListResponse(response);
        return networkResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function searchVideoAgent(nlpResponse, nlpInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};
    requestBody.transactionId = nlpInfo.transactionId;
    requestBody.messageId = nlpInfo.messageId;
    requestBody.network = nlpResponse.formatted_response.networks[0];

    try
    {
        const response = await Axios.post(`${_allUrls[KMicroServices.VideoAgent]}/search`,
                                                requestBody, requestOptions);
        const networkResponse = processGenericResponse(response);
        return networkResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function searchWeatherAgent(nlpResponse, nlpInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};
    requestBody.transactionId = nlpInfo.transactionId;
    requestBody.messageId = nlpInfo.messageId;
    requestBody.network = nlpResponse.formatted_response.networks[0];

    try
    {
        const response = await Axios.post(`${_allUrls[KMicroServices.WeatherAgent]}/search`,
                                                requestBody, requestOptions);
        const networkResponse = processGenericResponse(response);
        return networkResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function searchEnamMandiAgent(nlpResponse, nlpInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};
    requestBody.transactionId = nlpInfo.transactionId;
    requestBody.messageId = nlpInfo.messageId;
    requestBody.network = nlpResponse.formatted_response.networks[0];    

    try
    {
        const response = await Axios.post(`${_allUrls[KMicroServices.LLMAgent]}/search`,
                                                requestBody, requestOptions);
        const networkResponse = processGenericResponse(response);
        return networkResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function searchLLMAgent(nlpResponse, nlpInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};
    requestBody.transactionId = nlpInfo.transactionId;
    requestBody.messageId = nlpInfo.messageId;
    requestBody.network = nlpResponse.formatted_response.networks[0];
    requestBody.network.llm.histories = nlpInfo.histories;

    try
    {
        const response = await Axios.post(`${_allUrls[KMicroServices.LLMAgent]}/search`,
                                                requestBody, requestOptions);
        const networkResponse = processGenericResponse(response);
        return networkResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function actionONESTAgent(networkInfo, actionString)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = networkInfo;

    try
    {
        const response = await Axios.post(`${_allUrls[KMicroServices.ONESTAgent]}/${actionString}`,
                                                requestBody, requestOptions);
        const networkResponse = processGenericResponse(response);
        return networkResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

function callUIAction(nlpResponse)
{
    return nlpResponse.formatted_response;
}

async function routeSearchToNetwork(nlpResponse, nlpInfo)
{
    const formattedResponse = nlpResponse.formatted_response;
    const networkName = formattedResponse.networks[0].name;
    let networkResponse = null;
    let httpStatusCode = 200;

    switch(networkName)
    {
        case KNetworkNames.ONDC:
            networkResponse = await searchONDCAgent(nlpResponse, nlpInfo);
            break;
        case KNetworkNames.ONEST:
            networkResponse = await searchONESTAgent(nlpResponse, nlpInfo);
            break;
        case KNetworkNames.VIDEO:
            networkResponse = await searchVideoAgent(nlpResponse, nlpInfo);
            break;
        case KNetworkNames.WEATHER:
            networkResponse = await searchWeatherAgent(nlpResponse, nlpInfo);
            break;
        case KNetworkNames.LLM:
            networkResponse = await searchLLMAgent(nlpResponse, nlpInfo);
            break;
        case KNetworkNames.ENAMMANDI:
            networkResponse = await searchEnamMandiAgent(nlpResponse, nlpInfo);
            break;
        case KNetworkNames.UI:
            networkResponse = callUIAction(nlpResponse);
            break;
    }
    return { networkResponse, httpStatusCode };
}

async function routeToNetwork(networkInfo, actionString)
{
    const domainName = networkInfo.context.domain;
    const networkName = ((domainName.split(":"))[0]).toUpperCase();
    let networkResponse = null;

    switch(networkName)
    {
        case KNetworkNames.ONDC:
            networkResponse = await actionONDCAgent(networkInfo, actionString);
            break;
        case KNetworkNames.ONEST:
            networkResponse = await actionONESTAgent(networkInfo, actionString);
            break;        
    }
    return networkResponse;
}

async function processNLPInfo(nlpInfo)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};

    const promptInfo = {};
    promptInfo.prompt = `${nlpInfo.prompt}\n\n${nlpInfo.text}`;
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
_express.post("/search", async (request, response) =>
{
    const nlpInfo = prepareNLPInfo(request);
    const translatedInfo = await translateText(nlpInfo);
    nlpInfo.text = translatedInfo.target;

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

_express.post("/select", async (request, response) =>
{
    const netwrokInfo = prepareNetworkInfo(request);
    const results = {};

    try
    {
        const responseList = await routeToNetwork(netwrokInfo, KNetworkActions.SelectAction);
        results.results = responseList;
        response.send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

_express.post("/init", async (request, response) =>
{
    const netwrokInfo = prepareNetworkInfo(request);
    const results = {};

    try
    {
        const responseList = await routeToNetwork(netwrokInfo, KNetworkActions.InitAction);
        results.results = responseList;
        response.send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

_express.post("/confirm", async (request, response) =>
{
    const netwrokInfo = prepareNetworkInfo(request);
    const results = {};

    try
    {
        const responseList = await routeToNetwork(netwrokInfo, KNetworkActions.ConfirmAction);
        results.results = responseList;
        response.send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

_express.post("/status", async (request, response) =>
    {
        const netwrokInfo = prepareNetworkInfo(request);
        const results = {};
    
        try
        {
            const responseList = await routeToNetwork(netwrokInfo, KNetworkActions.StatusAction);
            results.results = responseList;
            response.send(results);
        }
        catch(exception)
        {
            let errorInfo = prepareErrorMessage(exception);
            results.results = errorInfo.message;
            response.status(errorInfo.code).send(results);
        }
    });
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10005;
_server.listen(port);
initializeAgent();

console.log("Server running at http://localhost:%d", port);
