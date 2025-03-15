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
// let _socketIOStreamClient = null;

const KSocketEvents =
{
    ConnectionEvent: "connect",
    ConnectedEvent: "connected",
    // StreamEvent: "stream",
    EndConnectionEvent: "end",
    DisconnectEvent: "disconnect"
}

const KSocketRooms =
{
    RoomKey: "room",
    EventReceiverRoom: "receiver-room"
}

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

function prepareEventSocketClient()
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
    socketQuery[KSocketRooms.RoomKey] = KSocketRooms.EventReceiverRoom;
    _socketIOClient = io(`${process.env.EVENT_SERVER_HTTP_HOST}`,
    {
        query: socketQuery
    });

    _socketIOStreamClient = io(`${process.env.WEBSOCK_STREAMER_HTTP_HOST}`,
    {
        query: socketQuery
    });

    await initEventServerConnection();
}

async function initEventServerConnection()
{
    const requestOptions= {};
    requestOptions.httpsAgent = _axiosAgent;
    const requestBody = {};

    try
    {
        const socketResponse = await Axios.post(`${process.env.EVENT_SERVER_HTTP_HOST}/event/init`,
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
 * @fires /message
 * @method POST
 * @description Send message to a SocketIO server
 */
_express.post("/message", async (request, response) =>
{
    try
    {
        const eventName = request.body.eventName;
        const eventData = request.body.eventData;
        _socketIOClient.emit(eventName, eventData);
        response.status(200).send("OK");
    }
    catch(exception)
    {
        const error = prepareErrorMessage(exception);
        response.status(error.code).send(`${error.message}\n`);
    }
});

/**
 * @fires /end
 * @method POST
 * @description Closes connection to a SocketIO server
 */
_express.post("/end", async (request, response) =>
{
    try
    {
        _socketIOClient.emit(KSocketEvents.EndConnectionEvent, request.body);
        response.status(200).send("OK");
    }
    catch(exception)
    {
        const error = prepareErrorMessage(exception);
        response.status(error.code).send(`${error.message}\n`);
    }    
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 8084;
_server.listen(port);

initSocketClient();
prepareEventSocketClient();

console.log("Server running at http://localhost:%d", port);
