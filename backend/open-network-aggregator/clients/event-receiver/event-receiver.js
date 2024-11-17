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
const Axios = require('axios');
const { io } = require("socket.io-client");

let _express = Express();
let _server = Http.createServer(_express);
let _axiosAgent = null;
let _socketIOClient = null;

const KSocketEvents =
{
    ConnectionEvent: "connect",
    ConnectedEvent: "connected",
    EndConnectionEvent: "end",
    DisconnectEvent: "disconnect"
}

const KStreamRoom = "stream-room";
const KEventReceiverRoom = "receiver-room";

_express.use(Express.json
({
    extended: true,
    limit: '10mb'
}));
    
_express.use(Express.urlencoded
({
    extended: true,
    limit: '10mb'
}));

DotEnv.config();

function prepareErrorMessage(exception)
{
    exception.code = ((exception.code == undefined) || (exception.code < 100)) ? 500 : exception.code;
    return exception;
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

    const socketQuery = {};
    socketQuery[KStreamRoom] = KEventReceiverRoom;
    _socketIOClient = io(`${process.env.SEEKER_RECEIVER_HTTP_HOST}`, {
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
        throw exception;
    }
}

/* API DEFINITIONS - START */
/**
 * @fires /stream
 * @method POST
 * @description Send stream to a SocketIO server
 */
_express.post("/stream", async (request, response) =>
{
    const eventName = request.body.eventName;
    const eventData = request.body.eventData;
    _socketIOClient.emit(eventName, eventData);
    response.status(200).send("OK");
});

/**
 * @fires /end
 * @method POST
 * @description Closes connection to a SocketIO server
 */
_express.post("/end", async (request, response) =>
{
    _socketIOClient.emit(KEndConnectionEvent, request.body);
    response.status(200).send("OK");
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 8084;
_server.listen(port);

initSocketClient();
prepareSocketClient();

console.log("Server running at http://localhost:%d", port);
