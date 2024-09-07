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
    ONESTAgent: "onest-agent",
    VideoAgent: "video-agent",
    WeatherAgent: "weather-agent"
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
    UI: "UI"
}

// const KNLPPrompt = "Convert the following sentence into a JSON object and return as a proper JSON. Do not add any new items into the response; strictly ground response to the input text.\nConditions:\nDomain for Learning, Courses, Skills, Jobs, Scholarships and Work Experiences will be \"ONEST\"\nDomain for anything related to Retail will be \"ONDC\"\nDomain for anything related to UI action will be \"UI\"";
// const KEndpointId = "4173620794712129536";

const KNLPPrompt = "Convert the following sentence into a JSON object and return as a proper JSON. Do not add any new items into the response.\nConditions:\nDomain for Learning, Courses, Skills, Jobs, Scholarships and Work Experiences will be \"ONEST\"\nDomain for anything related to Retail will be \"ONDC\"\nDomain for anything related to Weather Forecast will be \"WEATHER\"\nDomain for anything related to Video and Webinar will be \"VIDEO\"\nDomain for anything related to UI action will be \"UI\"";
const KEndpointId = "4302627593510715392";

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

function processVideoResponse(response)
{
    const videoResponse = response.data.results;
    return videoResponse;
}

function processWeatherResponse(response)
{
    const weatherResponse = response.data.results;
    return weatherResponse;
}

function processTranslationResponse(response)
{
    const translateResponseList = response.data.results;
    return translateResponseList;
}

function prepareAllUrls()
{
    _allUrls[KMicroServices.StorageLib] = `${process.env.STORAGELIB_HOST}`;
    _allUrls[KMicroServices.TranslateLib] = `${process.env.TRANSLATELIB_HOST}`;
    _allUrls[KMicroServices.GenAIImagelib] = `${process.env.GENAI_IMAGELIB_HOST}`;
    _allUrls[KMicroServices.VectorSearchlib] = `${process.env.GENAI_VECTORSEARCHLIB_HOST}`;
    _allUrls[KMicroServices.GenAITextlib] = `${process.env.GENAI_TEXTLIB_HOST}`;
    _allUrls[KMicroServices.GenAIMultimodallib] = `${process.env.GENAI_MULTILIB_HOST}`;
    _allUrls[KMicroServices.ONESTAgent] = `${process.env.ONEST_AGENT_URL}`;
    _allUrls[KMicroServices.VideoAgent] = `${process.env.VIDEO_AGENT_URL}`;
    _allUrls[KMicroServices.WeatherAgent] = `${process.env.WEATHER_AGENT_URL}`;
}

function prepareNLPInfo(request)
{
    const nlpInfo = {};
    nlpInfo.transactionId = request.body.transactionId;
    nlpInfo.messageId = request.body.messageId;
    nlpInfo.text = request.body.text;
    nlpInfo.prompt = KNLPPrompt;
    nlpInfo.endpointId = KEndpointId;
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
        const translateResponseList = processTranslationResponse(response);
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
        const translateResponseList = processTranslationResponse(response);
        return translateResponseList[0];        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function searchONDCAgent(nlpResponse, nlpInfo)
{
    return {};
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
        const networkResponse = processVideoResponse(response);
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
        const networkResponse = processWeatherResponse(response);
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
            httpStatusCode = 501;
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
