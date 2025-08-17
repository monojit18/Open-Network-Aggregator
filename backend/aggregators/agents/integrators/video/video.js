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
    VideoAdapter: "video-adapter",
    GenAITextlib: "genai-textlib"
}

const KVideoNetwork =
{    
    Youtube: "youtube",
    Partner: "partner"
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
    _allUrls[KMicroServices.VideoAdapter] = `${process.env.VIDEO_ADAPTER_URL}`;
    _allUrls[KMicroServices.GenAITextlib] = `${process.env.GENAI_TEXTLIB_HOST}`;
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
    genAIHeaders.maxtokens = 2048;
    genAIHeaders.topk = 40;
    genAIHeaders.topp = 0.95;
    return genAIHeaders;
}

function prepareVideoMessage(request)
{
    const videoMessage = {};
    videoMessage.context = request.body.context;
    videoMessage.message = request.body.message;
    videoMessage.preferred_network = request.body.preferred_network;
    videoMessage.preferred_networks = request.body.preferred_networks;    
    return videoMessage;
}

function prepareVideoHeaders(request)
{
    const videoHeaders = {};
    videoHeaders[process.env.VIDEO_API_KEY] = request.headers[process.env.VIDEO_API_KEY];
    return videoHeaders;
}

async function extractAgriAttributes(videoMessage)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};

    const promptInfo = {};
    promptInfo.prompt = `${process.env.AGRI_ATTRIBUTES_PROMPT}\n\n${videoMessage.message.network.filters[0].query}`;
    console.log(promptInfo.prompt);
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

async function callVideoNetwork(networkName, videoHeaders, videoMessage)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;
    requestOptions.headers = videoHeaders;

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
/**
 * @fires /search
 * @method POST
 * @description Calls Search API of the either the Video Adapter
 */
_express.post("/search", async (request, response) =>
{    
    const videoMessage = prepareVideoMessage(request);
    const videHeaders = prepareVideoHeaders(request);

    const adapterResponseList = [];
    const results = {};
    
    try
    {
        const youtubeNetwork = videoMessage.preferred_network[process.env.YOUTUBE_NETWORK_KEY];
        if (youtubeNetwork != null)
        {
            const copiedVideoMessage = JSON.parse(JSON.stringify(videoMessage));
            copiedVideoMessage.preferred_network = youtubeNetwork;
            const adapterResponse = await callVideoNetwork(KVideoNetwork.Youtube, videHeaders,
                                                        copiedVideoMessage);
            adapterResponseList.push(adapterResponse);
        }

        const preferredNetworksList = videoMessage.preferred_network.partners;
        if ((preferredNetworksList != null) && (preferredNetworksList.length > 0))
        {
            await Promise.all(preferredNetworksList.map(async (preferredNetwork) =>
            {
                const copiedVideoMessage = JSON.parse(JSON.stringify(videoMessage));
                copiedVideoMessage.preferred_network = preferredNetwork;
    
                const agriAttributesList = await extractAgriAttributes(copiedVideoMessage);
                console.log(JSON.stringify(agriAttributesList));
                if (agriAttributesList?.length > 0)
                {
                    await Promise.all(agriAttributesList.map(async (attributeString) =>
                    {
                        const agriVideoMessage = JSON.parse(JSON.stringify(copiedVideoMessage));
                        agriVideoMessage.message.network.filters[0].query = attributeString;
                        const adapterResponse = await callVideoNetwork(KVideoNetwork.Partner, videHeaders,
                                                                    agriVideoMessage);
                        adapterResponseList.push(adapterResponse);
                    }));
                }
            }));
        }
                
        results.results = adapterResponseList;
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

var port = process.env.port || process.env.PORT || 10002;
_server.listen(port);
initializeAgent();

console.log("Server running at http://localhost:%d", port);