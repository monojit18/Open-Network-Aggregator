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
const DotEnv = require("dotenv");
const Express = require("express");
const Cors = require("cors");
const SockertIO = require("socket.io");

const KSocketEvents =
{
    ConnectionEvent: "connection",
    ConnectedEvent: "connected",
    EndConnectionEvent: "end",
    CallbackEvent: "callback"
}

const KSocketRooms =
{
    RoomKey: "room",
    EventReceiverRoom: "receiver-room"
}

const KSocketStatus =
{
    AlreadyInitaited: "Already initiated\n",
    SuccessfullyInitaited: "Successfully initiated\n"
}

let _express = Express();
let _server = Http.createServer(_express);
let _socketIOServer = null;

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

DotEnv.config();

function prepareErrorMessage(exception)
{
    exception.code = ((exception.code == undefined)
                     ||
                     (exception.code < 100)) ? 500 : exception.code;
    return exception;
}

function prepareSocketServer()
{    
    _socketIOServer.on(KSocketEvents.ConnectionEvent, (socket) =>
    {
        socket.join(socket.handshake.query[KSocketRooms.RoomKey]);
        socket.emit(KSocketEvents.ConnectedEvent, `${socket.id} ${KSocketEvents.ConnectedEvent}`);
        socket.on(KSocketEvents.CallbackEvent, (eventData) =>
        {
            try
            {
                console.log(eventData);
                socket.to(eventData.room).emit(eventData.event, eventData.payload);
            }
            catch(exception)
            {
                throw exception;
            }  
        });
        
        socket.on(KSocketEvents.EndConnectionEvent, (endMessage) =>
        {
            socket.leave(socket.handshake.query[KSocketRooms.RoomKey]);            
            socket.to(socket.handshake.query[KSocketRooms.RoomKey])
                            .emit(KSocketEvents.EndConnectionEvent, endMessage);
        });
    });
}

function initSocketServer()
{
    const sockdetIOServer = {};

    try
    {
        if (_socketIOServer != null)
        {
            sockdetIOServer.socket = _socketIOServer;
            sockdetIOServer.alreadyExists = true;
            return sockdetIOServer;
        }        
    
        const options = {};
        options.connectionStateRecovery = {};
        options.maxHttpBufferSize = 1e8;

        const cors = {};
        cors.origin = "*";
        options.cors = cors;

        _socketIOServer = SockertIO(_server, options);

        sockdetIOServer.socket = _socketIOServer;
        sockdetIOServer.alreadyExists = false;
        return sockdetIOServer;
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
_express.get("/healthz", async (request, response) =>
{
    const results = {};
    response.status(200).send(results);
});

/**
 * @fires /event/init
 * @method POST
 * @description Initialize a SocketIO server
 */
_express.post("/event/init", async (request, response) =>
{
    try
    {
        const socketInfo = initSocketServer();
        if (socketInfo.alreadyExists == true)
        {
            response.status(200).send(KSocketStatus.AlreadyInitaited);
            return;
        }
        prepareSocketServer();
        response.status(200).send(KSocketStatus.SuccessfullyInitaited);
    }
    catch(exception)
    {
        const error = prepareErrorMessage(exception);
        response.status(error.code).send(`${error.message}\n`);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 8081;
_server.listen(port);

console.log("Server running at http://localhost:%d", port);
