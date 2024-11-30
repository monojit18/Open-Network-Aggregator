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
const Path = require("path");
const DotEnv = require("dotenv");
const Express = require("express");
const Sodium = require("libsodium-wrappers");
const { base64_variants } = require("libsodium-wrappers");
const { sign } = require("crypto");
const Cors = require("cors");
const Axios = require('axios');

let _express = Express();
let _server = Http.createServer(_express);
let _axiosAgent = null;

const KLearningDomain = "onest:learning-experiences";
const KJobDomain = "onest:work-opportunities";
const KFinanceDomain = "onest:financial-support";
const KCallbackEvent = "callback";
const KNotImplemented = "Not Implemented";

DotEnv.config();

_express.use(Express.json
({
    extended: true
}));
    
_express.use(Express.urlencoded
({
    extended: true,
    limit: '10mb'
}));

_express.use(Cors
({
    origin: "*"
}));

function prepareErrorMessage(exception)
{
    console.log(`prepareErrorMessage: ${exception.message}`);
    exception.code = (exception.response.status == undefined) ? 500 : exception.response.status;
    exception.message = exception.response.statusText;
    return exception;
}

function processGenericResponse(response)
{
    const genaiResponse = response.data;
    return genaiResponse;
}

function createException(code, message)
{
    const exception = {};    
    exception.status = code;
    exception.statusText = message;
    return exception;
}

async function fireCallbackEvent(requestBody, actionString)
{
    const callbackResponse = {};
    try
    {
        const seekerData = {};
        seekerData.room = requestBody.context.transaction_id;    
        seekerData.event = actionString;
        seekerData.payload = requestBody;        
        await emitAdapterEvent(KCallbackEvent, seekerData);
        
        callbackResponse.status = 200;
        callbackResponse.message = "";
        return callbackResponse;
    }
    catch (exception)
    {
        callbackResponse.status = exception.code;
        callbackResponse.message = exception.message;
        throw exception;
    }    
}

async function emitAdapterEvent(eventName, eventData)
{
    const requestOptions= {};
    requestOptions.httpsAgent = _axiosAgent;
    
    const requestBody = {};
    requestBody.eventName = eventName;
    requestBody.eventData = eventData;

    try
    {
        const socketResponse = await Axios.post(`${process.env.EVENT_RECEIVER_HTTP_HOST}/stream`,
                                                requestBody, requestOptions);
        console.log(socketResponse);
        return socketResponse;
    }
    catch(exception)
    {        
        throw exception;
    }
}

async function initializeSeeker()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
}

/* API DEFINITIONS - START */
_express.post("/seeker/search/:domain", async (request, response) =>
{
    const results = {};

    try
    {
        // const domainString = request.params.domain;
        const searchResponse = createException(501, KNotImplemented);
        results.results = searchResponse;
        response.status(searchResponse.status).send(results);
    }
    catch(exception)
    {
        const errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10001;
_server.listen(port);

initializeSeeker();
console.log("Server running at http://localhost:%d", port);
