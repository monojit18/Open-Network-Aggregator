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
    PlannerAdapterlib: "planner-adapterlib"
}

const KCallbackEvents =
{
    OnBuyerAction: "on_buyer",
    OnCallbackAction: "callback",
    OnErrorAction: "on_error"
}

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
    exception.code = (exception.response.status == undefined) ? 500 : exception.response.status;
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
    _allUrls[KMicroServices.PlannerAdapterlib] = `${process.env.PLANNER_ADAPTER_URL}`;
}

function prepareBuyerInfo(request)
{
    const buyerInfo = {};
    buyerInfo.context = request.body.context;    
    buyerInfo.message = request.body.message;
    buyerInfo.preferred_network = request.body.preferred_network;
    buyerInfo.preferred_networks = request.body.preferred_networks;
    return buyerInfo;
}

function prepareBuyerRequest(buyerInfo)
{
    const buyerRequest = {};
    buyerRequest.context = buyerInfo.context;    
    buyerRequest.message = buyerInfo.message;
    buyerRequest.shouldRetry = buyerInfo.shouldRetry;
    return buyerRequest;
}

function prepareAckResponse(buyerInfo)
{
    const ackResponse = {};

    const context = buyerInfo.context;    
    ackResponse.context = context;

    const message = {};
    const ack = {};
    ack.status = KStatusACK;
    message.ack = ack;
    ackResponse.message = message;
    return ackResponse;
}

function initializeBuyer()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });

    prepareAllUrls();
}

async function fireCallbackEvent(buyerResponse, buyerInfo)
{
    try
    {
        const buyerData = {};
        buyerData.room = buyerInfo.context.transaction_id;
        buyerData.event = KCallbackEvents.OnBuyerAction;

        const payload = {};
        payload.context = buyerResponse.context;        
        payload.message = buyerResponse.message;
        buyerData.payload = payload;        
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, buyerData);
    }
    catch(exception)
    {
        throw exception;
    }    
}

async function fireErrorEvent(errorInfo, buyerInfo)
{
    try
    {
        const buyerData = {};
        buyerData.room = buyerInfo.context.transaction_id;
        buyerData.event = KCallbackEvents.OnErrorAction;
        
        const payload = {};
        payload.context = buyerInfo.context;

        const message = {};

        const errorMessage = {};
        errorMessage.code = (buyerInfo.shouldRetry == false) ? 404 : errorInfo.code;
        errorMessage.message = errorInfo.message;
        message.error = errorMessage;
        payload.message = message;

        buyerData.payload = payload;
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, buyerData);        
    }
    catch(exception)
    {        
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
        const socketResponse = await Axios.post(`${process.env.EVENT_RECEIVER_HTTP_HOST}/message`,
                                                requestBody, requestOptions);
        console.log(socketResponse);
        return socketResponse;
    }
    catch(exception)
    {        
        throw exception;
    }
}

async function performPlannerSearch(buyerInfo)
{
    try
    {        
        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"
        };
        requestOptions.headers[process.env.VIDEO_API_KEY] = buyerInfo.headers[process.env.VIDEO_API_KEY];
        
        const requestBody = buyerInfo;
        await Axios.post(`${_allUrls[KMicroServices.PlannerAdapterlib]}/search`, requestBody, requestOptions);        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performBuyerSearch(buyerInfo)
{
    try
    {
        let buyerURL = `${buyerInfo.preferred_network.url}`;
        
        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"            
        };        

        const requestBody = prepareBuyerRequest(buyerInfo);
        const buyerResult = await Axios.post(`${buyerURL}`, requestBody, requestOptions);
        const buyerResponse = processGenericResponse(buyerResult);        
        fireCallbackEvent(buyerResponse, buyerInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
_express.post("/search", async (request, response) =>
{
    const buyerInfo = prepareBuyerInfo(request);
    const results = {};

    try
    {        
        const ackResponse = prepareAckResponse(buyerInfo);
        results.results = ackResponse;
        response.send(results);                
        await performBuyerSearch(buyerInfo);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, buyerInfo);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10001;
_server.listen(port);

initializeBuyer();

console.log("Server running at http://localhost:%d", port);