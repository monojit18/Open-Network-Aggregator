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

const KStatusACK = "ACK";

const KCallbackEvents =
{
    OnAgriLoanAction: "on_agri_loan",
    OnAgriMarketLinkageAction: "on_agri_market_linkage",
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

function prepareAgriInfo(request)
{
    const agriInfo = {};
    agriInfo.context = request.body.context;    
    agriInfo.message = request.body.message;
    agriInfo.preferred_network = request.body.preferred_network;
    return agriInfo;
}

function prepareAgriRequest(agriInfo)
{
    const agriRequest = {};
    agriRequest.context = agriInfo.context;
    agriRequest.message = agriInfo.message;    
    return agriRequest;
}

function prepareAckResponse(agriInfo)
{
    const ackResponse = {};

    const context = agriInfo.context;    
    ackResponse.context = context;

    const message = {};
    const ack = {};
    ack.status = KStatusACK;
    message.ack = ack;
    ackResponse.message = message;
    return ackResponse;
}

function initializeAgri()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });    
}

async function fireAdvriskCallbackEvent(agriResponse, agriInfo)
{
    try
    {
        const agriData = {};
        agriData.room = agriInfo.context.transaction_id;
        agriData.event = KCallbackEvents.OnAgriLoanAction;

        const payload = {};
        payload.context = agriInfo.context;
        payload.message = agriInfo.message;

        const catalog = {};
        catalog.descriptor = agriInfo.preferred_network.descriptor;        

        const provider = {};
        provider.descriptor = catalog.descriptor;
        provider.items = agriResponse;
        catalog.provider = provider;
        payload.message.catalog = catalog;
        agriData.payload = payload;
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, agriData);
    }
    catch(exception)
    {        
        throw exception;
    }    
}

async function fireCallbackEvent(agriResponse, agriInfo)
{
    try
    {
        const agriData = {};
        agriData.room = agriInfo.context.transaction_id;
        agriData.event = agriInfo.callbackEvent;

        const payload = {};
        payload.context = agriResponse.context;

        const message = {};
        message.network = agriInfo.message.network;
        
        const catalog = {};
        catalog.descriptor = agriResponse.message.catalog.descriptor;
        catalog.provider = agriResponse.message.catalog.provider;
        // catalog.provider.items = agriResponse.message.catalog.items;
        catalog.provider.items.forEach((item) =>
        {
            item.embedding_url = agriResponse.message.catalog.provider.embedding_url;
        });
        message.catalog = catalog;
        payload.message = message;
        agriData.payload = payload;
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, agriData);
    }
    catch(exception)
    {        
        throw exception;
    }    
}

async function fireErrorEvent(errorInfo, agriInfo)
{
    try
    {
        const agriData = {};
        agriData.room = agriInfo.context.transaction_id;
        agriData.event = KCallbackEvents.OnErrorAction;
        
        const payload = {};
        payload.context = agriInfo.context;

        const message = {};
        const errorResponse = {};
        errorResponse.code = errorInfo.code;
        errorResponse.message = errorInfo.message;
        message.error = errorResponse;
        payload.message = message;

        agriData.payload = payload;
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, agriData);
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

async function performAdveriskSearch(agriInfo)
{
    try
    {
        const agriResponseList = [];
        const agriResponse = {};
        agriResponse.embedding_url = "https://farmers.advarisk.com/"; 
        agriResponseList.push(agriResponse);
        fireAdvriskCallbackEvent(agriResponseList, agriInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performAgriSearch(agriInfo)
{
    try
    {
        let agriURL = `${agriInfo.preferred_network.url}`;
        if (agriURL.length == 0)
        {
            await performAdveriskSearch(agriInfo);
            return;
        }

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"            
        };

        const requestBody = prepareAgriRequest(agriInfo);        
        const agriResult = await Axios.post(`${agriURL}`, requestBody, requestOptions);
        const agriResponse = processGenericResponse(agriResult);
        fireCallbackEvent(agriResponse.results, agriInfo);        
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
/**
 * @fires /loan/search
 * @method POST
 * @description In turn calls Search API of each Loan provider Affiliate
 */
_express.post("/loan/search", async (request, response) =>
{
    const agriInfo = prepareAgriInfo(request);
    agriInfo.callbackEvent = KCallbackEvents.OnAgriLoanAction;
    const results = {};

    try
    {        
        const ackResponse = prepareAckResponse(agriInfo);
        results.results = ackResponse;
        response.send(results);                
        await performAgriSearch(agriInfo);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, agriInfo);
    }
});

/**
 * @fires /market-linkage/search
 * @method POST
 * @description In turn calls Search API of each Market-linkage Affiliate
 */
_express.post("/market-linkage/search", async (request, response) =>
{
    const agriInfo = prepareAgriInfo(request);
    agriInfo.callbackEvent = KCallbackEvents.OnAgriMarketLinkageAction;
    const results = {};

    try
    {
        const ackResponse = prepareAckResponse(agriInfo);
        results.results = ackResponse;
        response.send(results);                
        await performAgriSearch(agriInfo);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, agriInfo);
    }
});

/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10001;
_server.listen(port);

initializeAgri();

console.log("Server running at http://localhost:%d", port);