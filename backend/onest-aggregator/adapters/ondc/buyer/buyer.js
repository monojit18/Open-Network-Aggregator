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
let _socketIOClient = null;
let _allUrls = {};

const KMicroServices =
{   
    MyStoreSearch: "mystore-search"
}

const KStatusACK = "ACK";
const KRoomKey = "room";
const KONDCSeekerRoom = "ondc-seeker-room";

const KCallbackEvents =
{
    OnONDCAction: "on_ondc",
    OnCallbackAction: "callback",
    OnErrorAction: "on_error"
}

const KSocketEvents =
{
    ConnectionEvent: "connect",
    ConnectedEvent: "connected",
    EndConnectionEvent: "end",
    DisconnectEvent: "disconnect"
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
    const genericResponse = response.data;
    return genericResponse;
}

function prepareAllUrls()
{    
    _allUrls[KMicroServices.MyStoreSearch] = `${process.env.MYSTORE_SEARCH_URL}`;
}

function prepareONDCInfo(request)
{
    const ondcInfo = {};
    ondcInfo.domain = request.body.domain;
    ondcInfo.transaction_id = request.body.transaction_id;
    ondcInfo.message_id = request.body.message_id;
    ondcInfo.network = request.body.network;
    ondcInfo.query = ondcInfo.network?.intent[0]?.query;
    return ondcInfo;
}

function prepareAckResponse(ondcInfo)
{
    const ackResponse = {};

    const context = {};
    context.domain = ondcInfo.domain;
    context.transaction_id = ondcInfo.transaction_id;
    context.message_id = ondcInfo.message_id;
    ackResponse.context = context;

    const message = {};
    const ack = {};
    ack.status = KStatusACK;
    message.ack = ack;
    ackResponse.message = message;
    return ackResponse;
}

function fireCallbackEvent(ondcResponse, ondcInfo)
{
    const ondcData = {};
    ondcData.room = ondcInfo.transaction_id;
    ondcData.event = KCallbackEvents.OnONDCAction;
    
    const payload = {};
    const context = {};
    const message = {};

    context.domain = ondcInfo.domain;
    context.transaction_id = ondcInfo.transaction_id;
    context.message_id = ondcInfo.message_id;
    payload.context = context;

    message.network = ondcInfo.network;
    message.provider = ondcResponse;
    payload.message = message;

    ondcData.payload = payload;
    _socketIOClient.emit(KCallbackEvents.OnCallbackAction, ondcData);
}

function fireErrorEvent(errorInfo, ondcInfo)
{
    const ondcData = {};
    ondcData.room = ondcInfo.transaction_id;
    ondcData.event = KCallbackEvents.OnErrorAction;
    
    const payload = {};
    const context = {};
    const message = {};

    context.domain = ondcInfo.domain;
    context.transaction_id = ondcInfo.transaction_id;
    context.message_id = ondcInfo.message_id;
    payload.context = context;

    message.network = ondcInfo.network;

    const errorResponse = {};
    errorResponse.code = errorInfo.response?.data?.error?.code;
    errorResponse.message = errorInfo.response?.data?.error?.message;
    message.provider = errorResponse;
    payload.message = message;

    ondcData.payload = payload;
    _socketIOClient.emit(KCallbackEvents.OnCallbackAction, ondcData);
}

function prepareSocketClient()
{
    _socketIOClient.on(KSocketEvents.ConnectionEvent, () =>
    {
        console.log(_socketIOClient.id);
    });

    _socketIOClient.on(KSocketEvents.ConnectedEvent, (message) =>
    {
        console.log(message);
    });

    _socketIOClient.on(KSocketEvents.EndConnectionEvent, (message) =>
    {
        console.log(message);
    });

    _socketIOClient.on(KSocketEvents.DisconnectEvent, () =>
    {
        console.log(_socketIOClient.connected);
    });
}

async function initSocketClient()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
    prepareAllUrls();
    
    const socketQuery = {};
    socketQuery[KRoomKey] = KONDCSeekerRoom;
    _socketIOClient = io(`${process.env.SEEKER_RECEIVER_HTTP_HOST}`,
    {
        query: socketQuery
    });
    await initSocketServerConnection();
}

async function initSocketServerConnection()
{
    const requestOptions= {};
    requestOptions.httpsAgent = _axiosAgent;
    const requestBody = {};

    try
    {
        const socketResponse = await Axios.post(`${process.env.SEEKER_RECEIVER_HTTP_HOST}/init`,
                                                requestBody, requestOptions);
        console.log(socketResponse);
        return socketResponse;
    }
    catch(exception)
    {
        console.log(exception.message);
        // throw exception;
    }
}

async function performONDCSearch(ondcInfo)
{
    try
    {
        let ondcURL = `${process.env.MYSTORE_SEARCH_URL}`;        
        ondcURL += `&search=${ondcInfo.query}&vector_search=${ondcInfo.query}&limit=20`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"            
        };

        const ondcResult = await Axios.get(`${ondcURL}`, requestOptions);
        const ondcResponse = processGenericResponse(ondcResult);        
        fireCallbackEvent(ondcResponse, ondcInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
_express.post("/search", async (request, response) =>
{
    const ondcInfo = prepareONDCInfo(request);
    const results = {};

    try
    {        
        const ackResponse = prepareAckResponse(ondcInfo);
        results.results = ackResponse;
        response.send(results);
                
        await performONDCSearch(ondcInfo);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, ondcInfo);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10003;
_server.listen(port);
initSocketClient();
prepareSocketClient();

console.log("Server running at http://localhost:%d", port);