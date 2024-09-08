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

const KConnectionEvent = "connection";
const KConnectedvent = "connected";
const KEndConnectionEvent = "end";
const KDisconnectEvent = "disconnect";
const KRoomKey = "room";
const KOnSearchAction = "on_search";
const KOnSelectAction = "on_select";
const KOnInitAction = "on_init";
const KOnConfirmAction = "on_confirm";
const KOnStatusAction = "on_status";

const KCallbackActions =
{
    OnWeatherAction: "on_weather",
    OnVideoAction: "on_video",
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

function prepareSocketClient()
{
    _socketIOClient.on(KConnectionEvent, () =>
    {
        console.log(_socketIOClient.id);
    });

    _socketIOClient.on(KConnectedvent, (message) =>
    {
        console.log(message);
    });

    /*Callback functions from Adapter - START*/
    _socketIOClient.on(KOnSearchAction, (message) =>
    {
        console.log(message);
    });

    _socketIOClient.on(KOnSelectAction, (message) =>
    {
        console.log(message);
    });

    _socketIOClient.on(KOnInitAction, (message) =>
    {
        console.log(message);
    });

    _socketIOClient.on(KOnConfirmAction, (message) =>
    {
        console.log(message);
    });

    _socketIOClient.on(KOnStatusAction, (message) =>
    {
        console.log(message);
    });

    _socketIOClient.on(KCallbackActions.OnWeatherAction, (message) =>
    {
        console.log(message);
    });

    _socketIOClient.on(KCallbackActions.OnVideoAction, (message) =>
    {
        console.log(message);
    });

    _socketIOClient.on(KCallbackActions.OnErrorAction, (message) =>
    {
        console.log(message);
    });
    /*Callback functions from Adapter - END*/

    _socketIOClient.on(KEndConnectionEvent, (message) =>
    {
        console.log(message);
    });

    _socketIOClient.on(KDisconnectEvent, () =>
    {
        console.log(_socketIOClient.connected);
    });
}

/* Initialize SocketIO client by connecting to the SocketIO server */
async function initSocketClient(roomId)
{    
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });

    const socketQuery = {}
    socketQuery[KRoomKey] = roomId;
    _socketIOClient = io(`${process.env.SEEKER_RECEIVER_HTTP_HOST}`,
    {
        query: socketQuery
    });
}

/* SocketIO client joins a Room where Adapter will send the response from Open Network */
async function initSocketServerConnection()
{
    const requestOptions = {};
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
        console.log(exception);
        throw exception;
    }
}

/* API DEFINITIONS - START */
/* Call this endpoint every time a new Room is to be registered */
_express.post("/init/:transactionId", async (request, response) =>
{
    const transactionId = request.params.transactionId;    
    initSocketClient(transactionId);
    prepareSocketClient();

    try
    {
        const socketResponse =  await initSocketServerConnection();        
        response.status(socketResponse.status).send(socketResponse.data);
    }
    catch(exception)
    {        
        const errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10010;
_server.listen(port);

console.log("Server running at http://localhost:%d", port);
