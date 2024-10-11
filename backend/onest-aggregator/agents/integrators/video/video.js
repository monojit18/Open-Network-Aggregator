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

const KAgriAttributesPrompt = "Context: Extract keywords related to Agriculture from the following sentence and return as a JSON response.Exclude all other types of keywords:\nExample:\nShow me videos for rice farming\n{\"attributes\":[\"rice farming\"]}\n\nShow me videos for mango farming and C++ programming\n{\"attributes\":[\"mango farming\"]}\n\nShow me videos on Mango and Rice\n{\"attributes\":[\"mango\", \"rice\"]}";
const KTechAttributesPrompt = "Context: Extract keywords related to Technical, Engineering, Medical, Machine Learning, Data Science, Career, Management, Marketting, Finance etc. courses from the following sentence and return as a JSON response.Exclude all other types of keywords:\nExample:\nShow me videos for web programming\n{\"attributes\":[\"web programming\"]}\n\nShow me videos for Rice farming and .NET programming\n{\"attributes\":[\".NET programming\"]}\n\nShow me videos on Data Science and Machine Learning\n{\"attributes\":[\"Data Science\", \"Machine Learning\"]}";

let _express = Express();
let _server = Http.createServer(_express);
let _axiosAgent = null;
let _allUrls = {};

const KMicroServices =
{    
    VideoAdapter: "video-adapter",
    GenAITextlib: "genai-textlib"
}

const KVideoDomain = "integrator:video";

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
    _allUrls[KMicroServices.VideoAdapter] = `${process.env.VIDEO_ADAPTER_URL}`;
    _allUrls[KMicroServices.GenAITextlib] = `${process.env.GENAI_TEXTLIB_HOST}`;
}

function prepareNLPInfo(request)
{
    const nlpInfo = {};
    nlpInfo.transactionId = request.body.transactionId;
    nlpInfo.messageId = request.body.messageId;
    nlpInfo.network = request.body.network;
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

function prepareLongHeaders()
{
    const genAIHeaders = {};
    genAIHeaders.temperature = 0.4;
    genAIHeaders.maxtokens = 8192;
    genAIHeaders.topk = 40;
    genAIHeaders.topp = 0.95;
    return genAIHeaders;
}

function prepareVideoMessage(nlpInfo)
{
    const videoMessage = {};
    videoMessage.domain = KVideoDomain;
    videoMessage.transaction_id = nlpInfo.transactionId;
    videoMessage.message_id = nlpInfo.messageId;
    videoMessage.network = nlpInfo.network;    
    return videoMessage;
}

async function extractAgriAttributes(videoMessage)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};

    const promptInfo = {};
    promptInfo.prompt = `${KAgriAttributesPrompt}\n\n${videoMessage.network.video.query}`;
    const contentsList = prepareNLPContentInfo(promptInfo);
    requestBody.contents = contentsList;

    const genAIHeaders = prepareLongHeaders();
    requestOptions.headers = genAIHeaders;

    try
    {
        let response = await Axios.post(`${_allUrls[KMicroServices.GenAITextlib]}/genai/text?type=json`,
                                                requestBody, requestOptions);
        const nlpResponsesList = processGenericResponse(response);
        const nlpResponse = nlpResponsesList[0];
        const attributesList = nlpResponse.formatted_response.attributes;
        return attributesList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function extractTechAttributes(videoMessage)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};

    const promptInfo = {};
    promptInfo.prompt = `${KTechAttributesPrompt}\n\n${videoMessage.network.video.query}`;
    const contentsList = prepareNLPContentInfo(promptInfo);
    requestBody.contents = contentsList;

    const genAIHeaders = prepareLongHeaders();
    requestOptions.headers = genAIHeaders;

    try
    {
        let response = await Axios.post(`${_allUrls[KMicroServices.GenAITextlib]}/genai/text?type=json`,
                                                requestBody, requestOptions);
        const nlpResponsesList = processGenericResponse(response);
        const nlpResponse = nlpResponsesList[0];
        const attributesList = nlpResponse.formatted_response.attributes;
        return attributesList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function callVideoNetwork(networkName, videoMessage)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = videoMessage;    
    
    try
    {
        let adapterResponse = await Axios.post(`${_allUrls[KMicroServices.VideoAdapter]}/videos/${networkName}`,
                                                    requestBody, requestOptions);
        adapterResponse = processGenericResponse(adapterResponse);
        return adapterResponse;
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
    const videoMessage = prepareVideoMessage(nlpInfo);

    const results = {};
    
    try
    {
        let adapterResponse = await callVideoNetwork("youtube", videoMessage);

        const agriAttributesList = await extractAgriAttributes(videoMessage);
        if (agriAttributesList?.length > 0)
        {
            await Promise.all(agriAttributesList.map(async (attributeString) =>
            {
                const agriVideoMessage = JSON.parse(JSON.stringify(videoMessage));
                agriVideoMessage.network.video.query = attributeString;
                adapterResponse = await callVideoNetwork("ninjacart", agriVideoMessage);
            }));
        }
        
        const techAttributesList = await extractTechAttributes(videoMessage);
        if (techAttributesList?.length > 0)
        {            
            await Promise.all(techAttributesList.map(async (attributeString) =>
            {
                const techVideoMessage = JSON.parse(JSON.stringify(videoMessage));
                techVideoMessage.network.video.query = attributeString;
                adapterResponse = await callVideoNetwork("apna", techVideoMessage);
            }));
        }

        results.results = adapterResponse;
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

var port = process.env.port || process.env.PORT || 10004;
_server.listen(port);
initializeAgent();

console.log("Server running at http://localhost:%d", port);