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
const { io } = require("socket.io-client");

let _express = Express();
let _server = Http.createServer(_express);
let _axiosAgent = null;

const KOrderSuffix = "ORDER";

const KCallbackEvents =
{
    OnOrderAction: "on_order",
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


async function fireCallbackEvent(orderDetails)
{
    try
    {
        const orderData = {};
        orderData.room = orderDetails.context.transaction_id;
        orderData.event = KCallbackEvents.OnOrderAction;

        const payload = {};
        payload.context = orderDetails.context;
        payload.context.domain = `${process.env.AGENTIC_DOMAIN_PREFIX}${KOrderSuffix}`;
        payload.message = orderDetails.message;
        orderData.payload = payload;        
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, orderData);
    }
    catch(exception)
    {        
        throw exception;
    }    
}

async function fireErrorEvent(errorInfo, orderDetails)
{
    try
    {
        const orderData = {};
        orderData.room = orderDetails.context.transaction_id;
        orderData.event = KCallbackEvents.OnErrorAction;
        
        const payload = {};
        payload.context = orderDetails.context;

        const message = {};
        const errorResponse = {};
        errorResponse.code = errorInfo.response?.data?.error?.code;
        errorResponse.message = errorInfo.response?.data?.error?.message;
        message.error = errorResponse;
        payload.message = message;
        orderData.payload = payload;
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, orderData);
    }
    catch(exception)
    {        
        throw exception;
    }    
}

async function processOrerDetails(orderDetails)
{
    const orderResponse = {};
    orderResponse.received = true;

    try
    {
        await fireCallbackEvent(orderDetails);
        return orderResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
/**
 * @fires /healthz
 * @method POST
 * @description Health API for the microservice; can be LBs/Gateways while checking the backend health status
 */
_express.get("/healthz", async (request, response) =>
{
    const results = {};
    response.status(200).send(results);
});

/**
 * @fires /order
 * @method POST
 * @description Callback from Affiliates after a completing a transaction
 */
_express.post("/order", async (request, response) =>
{
    const orderDetails = request.body;
    const results = {};

    try
    {
        const orderResponse =  await processOrerDetails(orderDetails);
        results.results = orderResponse;
        response.status(200).send(results);
    }
    catch(exception)
    {        
        const errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
        await fireErrorEvent(errorInfo, orderDetails);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10011;
_server.listen(port);

console.log("Server running at http://localhost:%d", port);
