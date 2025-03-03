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
    LLMAdapter: "llm-adapter"
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
    _allUrls[KMicroServices.LLMAdapter] = `${process.env.LLM_ADAPTER_URL}`;
}

function prepareLLMMessage(request)
{
    const llmMessage = {};    
    llmMessage.context = request.body.context;
    llmMessage.message = request.body.message;      
    return llmMessage;
}

async function callLLMNetwork(llmMessage)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = llmMessage;
    
    try
    {
        let llmURL = `${_allUrls[KMicroServices.LLMAdapter]}/llm/chat`;
        let adapterResponse = await Axios.post(`${llmURL}`, requestBody, requestOptions);
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
 * @description In turn calls Search API of the corresponding Adapter
 */
_express.post("/search", async (request, response) =>
{    
    const llmMessage = prepareLLMMessage(request);
    const results = {};
    
    try
    {
        let adapterResponse = await callLLMNetwork(llmMessage);
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

var port = process.env.port || process.env.PORT || 10002;
_server.listen(port);
initializeAgent();

console.log("Server running at http://localhost:%d", port);