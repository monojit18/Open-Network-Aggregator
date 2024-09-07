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

const KYoutubeAPIKey = "AIzaSyAFqjVTw1CJs-kHY5G41NoV1Zq8M45nUa8";
const KStatusACK = "ACK";
const KRoomKey = "room";
const KVideoRoom = "video-room";

const KCallbackEvents =
{
    OnVideoAction: "on_video",
    OnCallbackAction: "callback"
}

const KSocketEvents =
{
    ConnectionEvent: "connect",
    ConnectedEvent: "connected",
    EndConnectionEvent: "end",
    DisconnectEvent: "disconnect"
}

const KSearchConfig =
{
    SNIPPET: "snippet",
    PLAYER: "player",
    MAX_RESULTS: 10,
    VIDEO_TYPE: "youtube#video",
    PLAYLIST_TYPE: "youtube#playlist"
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

function prepareVideoInfo(request)
{
    const videoInfo = {};
    videoInfo.domain = request.body.domain;
    videoInfo.transaction_id = request.body.transaction_id;
    videoInfo.message_id = request.body.message_id;
    videoInfo.network = request.body.network;
    videoInfo.part = KSearchConfig.SNIPPET;
    videoInfo.maxResults = KSearchConfig.MAX_RESULTS;
    videoInfo.query = videoInfo.network.video.query;
    return videoInfo;
}

function prepareAckResponse(videoInfo)
{
    const ackResponse = {};

    const context = {};
    context.domain = videoInfo.domain;
    context.transaction_id = videoInfo.transaction_id;
    context.message_id = videoInfo.message_id;
    ackResponse.context = context;

    const message = {};
    const ack = {};
    ack.status = KStatusACK;
    message.ack = ack;
    ackResponse.message = message;
    return ackResponse;
}

function preapreVideoResponse(videoResult, videoInfo)
{
    const response = videoResult.data;

    const videoResponse = {};
    videoResponse.transactionId = videoInfo.transactionId;
    videoResponse.messageId = videoInfo.messageId;    
    videoResponse.regionCode = response.regionCode;
    videoResponse.videos = [];
    videoResponse.playLists = [];
    for (const contentItem of response.items)
    {
        const videoItem = {};
        if (contentItem.id.kind == KSearchConfig.VIDEO_TYPE)
        {            
            videoItem.videoId = contentItem.id.videoId;
            videoResponse.videos.push(videoItem);
        }
        else if (contentItem.id.kind == KSearchConfig.PLAYLIST_TYPE)
        {
            videoItem.playlistId = contentItem.id.playlistId;
            videoResponse.playLists.push(videoItem);
        }

        videoItem.publishedAt = contentItem.snippet.publishedAt;
        videoItem.channelId = contentItem.snippet.channelId;
        videoItem.title = contentItem.snippet.title;
        videoItem.description = contentItem.snippet.description;
        videoItem.thumbnails = contentItem.snippet.thumbnails;
        videoItem.channelTitle = contentItem.snippet.channelTitle;
        videoItem.publishTime = contentItem.snippet.publishTime;        
    }
    return videoResponse;
}

function preapreVideoDetailsResponse(videoDetailsResult)
{
    const videoDetailsResponse = {};
    const response = videoDetailsResult.data;
    videoDetailsResponse.player = response.items[0]?.player;
    return videoDetailsResponse;
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

function fireCallbackEvent(videoResponse, videoInfo)
{
    const videoData = {};
    videoData.room = videoInfo.transaction_id;
    videoData.event = KCallbackEvents.OnVideoAction;
    
    const payload = {};
    const context = {};
    const message = {};

    context.domain = videoInfo.domain;
    context.transaction_id = videoInfo.transaction_id;
    context.message_id = videoInfo.message_id;
    payload.context = context;

    message.network = videoInfo.network;
    message.provider = videoResponse;
    payload.message = message;

    videoData.payload = payload;
    _socketIOClient.emit(KCallbackEvents.OnCallbackAction, videoData);
}

async function initSocketClient()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
    
    const socketQuery = {};
    socketQuery[KRoomKey] = KVideoRoom;
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

async function getVideoDeatails(videoInfo)
{
    try
    {
        let videoDetailsURL = `${process.env.YOUTUBE_DATA_V3_SEARCH_URL}`;            
        if (videoInfo.videoId != null)
        {
            videoDetailsURL += `/videos?id=${videoInfo.videoId}`;
            
        }
        else if (videoInfo.playlistId != null)
        {
            videoDetailsURL += `/playlists?id=${videoInfo.playlistId}`;
        }
        videoDetailsURL += `&part=${KSearchConfig.PLAYER}&key=${KYoutubeAPIKey}`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"            
        };

        const videoDetailsResult = await Axios.get(`${videoDetailsURL}`, requestOptions);
        const videoDetailsResponse = preapreVideoDetailsResponse(videoDetailsResult);
        return videoDetailsResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performVideoSearch(videoInfo)
{
    try
    {
        let videoURL = `${process.env.YOUTUBE_DATA_V3_SEARCH_URL}/search`;
        videoURL += `?part=${videoInfo.part}&maxResults=${videoInfo.maxResults}&q=${videoInfo.query}&key=${KYoutubeAPIKey}`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"            
        };

        const videoResult = await Axios.get(`${videoURL}`, requestOptions);
        const videoResponse = preapreVideoResponse(videoResult, videoInfo);
        const videos = videoResponse.videos;
        const playLists = videoResponse.playLists;

        if (videos.length > 0)
        {
            await Promise.all(videos.map(async (videoInfo) =>
            {
                const videoDetailsResponse = await getVideoDeatails(videoInfo);
                videoInfo.player = videoDetailsResponse.player;
            }));
        }

        if (playLists.length > 0)
        {
            await Promise.all(playLists.map(async (playListInfo) =>
            {
                const videoDetailsResponse = await getVideoDeatails(playListInfo);
                playListInfo.player = videoDetailsResponse.player;
            }));
        }
        
        fireCallbackEvent(videoResponse, videoInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
_express.post("/videos", async (request, response) =>
{
    const videoInfo = prepareVideoInfo(request);
    const results = {};

    try
    {
        const ackResponse = prepareAckResponse(videoInfo);
        results.results = ackResponse;
        response.send(results);
        
        await performVideoSearch(videoInfo);        
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10003;
_server.listen(port);

initSocketClient();
prepareSocketClient();

console.log("Server running at http://localhost:%d", port);
