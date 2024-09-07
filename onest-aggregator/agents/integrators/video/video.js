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
    VideoAdapter: "video-adapter"
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
}

function prepareNLPInfo(request)
{
    const nlpInfo = {};
    nlpInfo.transactionId = request.body.transactionId;
    nlpInfo.messageId = request.body.messageId;
    nlpInfo.network = request.body.network;
    return nlpInfo;
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

    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = videoMessage;
    const results = {};
    
    try
    {
        const adapterResponse = await Axios.post(`${_allUrls[KMicroServices.VideoAdapter]}/videos`,
                                            requestBody, requestOptions);
        results.results = processGenericResponse(adapterResponse);
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