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

const KPriceAPIKey = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
const KStatusACK = "ACK";

const KCallbackEvents =
{
    OnEnamMandiAction: "on_enam_mandi",
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

function prepareAckResponse(priceInfo)
{
    const ackResponse = {};

    const context = {};
    context.domain = priceInfo.domain;
    context.transaction_id = priceInfo.transaction_id;
    context.message_id = priceInfo.message_id;
    ackResponse.context = context;

    const message = {};
    const ack = {};
    ack.status = KStatusACK;
    message.ack = ack;
    ackResponse.message = message;
    return ackResponse;
}

async function fireCallbackEvent(weatherResponse, priceInfo)
{
    try
    {
        const priceData = {};
        priceData.room = priceInfo.transaction_id;
        priceData.event = KCallbackEvents.OnEnamMandiAction;
        
        const payload = {};
        const context = {};
        const message = {};

        context.domain = priceInfo.domain;
        context.transaction_id = priceInfo.transaction_id;
        context.message_id = priceInfo.message_id;
        payload.context = context;

        message.network = priceInfo.network;
        message.provider = weatherResponse;
        payload.message = message;

        priceData.payload = payload;        
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, priceData);
    }
    catch(exception)
    {        
        throw exception;
    }    
}

async function fireErrorEvent(errorInfo, priceInfo)
{
    try
    {
        const priceData = {};
        priceData.room = priceInfo.transaction_id;
        priceData.event = KCallbackEvents.OnErrorAction;
        
        const payload = {};
        const context = {};
        const message = {};

        context.domain = priceInfo.domain;
        context.transaction_id = priceInfo.transaction_id;
        context.message_id = priceInfo.message_id;
        payload.context = context;

        message.network = priceInfo.network;

        const errorResponse = {};
        errorResponse.code = errorInfo.response?.data?.error?.code;
        errorResponse.message = errorInfo.response?.data?.error?.message;
        message.provider = errorResponse;
        payload.message = message;

        priceData.payload = payload;
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, priceData);
    }
    catch(exception)
    {        
        throw exception;
    }
}

function preparePriceInfo(request)
{
    const priceInfo = {};
    priceInfo.domain = request.body.domain;
    priceInfo.transaction_id = request.body.transaction_id;
    priceInfo.message_id = request.body.message_id;
    priceInfo.network = request.body.network;
    
    const enamMandiInfo = priceInfo.network.price;    
    if (enamMandiInfo.state != null)
    {
        priceInfo.state = enamMandiInfo.state;
    }

    if (enamMandiInfo.district != null)
    {
        priceInfo.district = enamMandiInfo.district;
    }

    if (enamMandiInfo.market != null)
    {
        priceInfo.market = enamMandiInfo.market;
    }

    if (enamMandiInfo.commodity != null)
    {
        priceInfo.commodity = enamMandiInfo.commodity;
    }

    if (enamMandiInfo.variety != null)
    {
        priceInfo.variety = enamMandiInfo.variety;
    }

    if (enamMandiInfo.grade != null)
    {
        priceInfo.grade = enamMandiInfo.grade;
    }
    return priceInfo;
}

function preaprePriceResponse(priceResult)
{
    const priceResponse = {};
    const response = priceResult.data;
    priceResponse.records = response.records;
    return priceResponse;
}

function initializeAdapter()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
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

async function performPriceSearch(priceInfo)
{
    try
    {
        let enamMandiURL = `${process.env.ENAM_MANDI_SEARCH_URL}`;
        enamMandiURL += `?format=json&api-key=${KPriceAPIKey}`;

        if (priceInfo.state != null)
        {
            enamMandiURL += `&filters[state.keyword]=${priceInfo.state}`;
        }

        if (priceInfo.district != null)
        {
            enamMandiURL += `&filters[district]=${priceInfo.district}`;
        }

        if (priceInfo.market != null)
        {
            enamMandiURL += `&filters[market]=${priceInfo.market}`;
        }

        if (priceInfo.commodity != null)
        {
            enamMandiURL += `&filters[commodity]=${priceInfo.commodity}`;
        }
        
        if (priceInfo.variety != null)
        {
            enamMandiURL += `&filters[variety]=${priceInfo.variety}`;
        }

        if (priceInfo.grade != null)
        {
            enamMandiURL += `&filters[grade]=${priceInfo.grade}`;
        }

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"            
        };

        const priceResult = await Axios.get(`${enamMandiURL}`, requestOptions);
        const priceResponse = preaprePriceResponse(priceResult);        
        await fireCallbackEvent(priceResponse, priceInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
_express.post("/enam", async (request, response) =>
{
    const priceInfo = preparePriceInfo(request);
    const results = {};

    try
    {
        const ackResponse = prepareAckResponse(priceInfo);
        results.results = ackResponse;
        response.send(results);
        await performPriceSearch(priceInfo);        
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, priceInfo);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10003;
_server.listen(port);

initializeAdapter();

console.log("Server running at http://localhost:%d", port);
