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

const KYoutubeAPIKey = "AIzaSyAFqjVTw1CJs-kHY5G41NoV1Zq8M45nUa8";
const KStatusACK = "ACK";
const KDescriptorYoutube = "Youtube Videos";
const KShortDescYoutube = "Videos from Youtube";
const KDescriptorApna = "Apna Videos";
const KShortDescApna = "Videos from Apna";

const KCallbackEvents =
{
    OnVideoAction: "on_video",
    OnCallbackAction: "callback",
    OnErrorAction: "on_error"
}

const KSearchConfig =
{
    SNIPPET: "snippet",
    CONTENT_DETAILS: "contentDetails",
    PLAYER: "player",
    MAX_RESULTS: 5,
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

function prepareYoutubeInfo(request)
{
    const videoInfo = {};
    videoInfo.domain = request.body.domain;
    videoInfo.transaction_id = request.body.transaction_id;
    videoInfo.message_id = request.body.message_id;
    videoInfo.network = request.body.network;
    videoInfo.part = `${KSearchConfig.SNIPPET}`;
    videoInfo.maxResults = KSearchConfig.MAX_RESULTS;
    videoInfo.query = videoInfo.network.video.query;
    return videoInfo;
}

function prepareParnerInfo(request)
{
    const videoInfo = {};
    videoInfo.domain = request.body.domain;
    videoInfo.transaction_id = request.body.transaction_id;
    videoInfo.message_id = request.body.message_id;
    videoInfo.network = request.body.network;
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

function preapreYoutubeResponse(videoResult, videoInfo)
{
    const response = videoResult.data;

    const videoResponse = {};
    videoResponse.transactionId = videoInfo.transactionId;
    videoResponse.messageId = videoInfo.messageId;    
    videoResponse.regionCode = response.regionCode;
    
    const descriptor = {};
    descriptor.name = KDescriptorYoutube;
    descriptor.short_desc = KShortDescYoutube;
    videoResponse.descriptor = descriptor;

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

function preapreNinjacartResponse(videoResult, videoInfo)
{
    const response = videoResult.data;

    const videoResponse = {};
    videoResponse.transactionId = videoInfo.transactionId;
    videoResponse.messageId = videoInfo.messageId;
    videoResponse.descriptor = response.catalog.descriptor;
    videoResponse.videos = response.catalog.videos;
    return videoResponse;
}

function preapreApnaResponse(videoResult, videoInfo)
{
    const responsesList = videoResult.data;
    const videoResposesList = [];
    
    const videoResponseInfo = {};
    videoResponseInfo.catalog = {};
    videoResponseInfo.catalog.descriptor = {};
    videoResponseInfo.catalog.descriptor.name = KDescriptorApna;
    videoResponseInfo.catalog.descriptor.short_desc = KShortDescApna;

    for (const response of responsesList)
    {
        const videoResponse = {};
        videoResponse.transactionId = videoInfo.transactionId;
        videoResponse.messageId = videoInfo.messageId;
        videoResponse.descriptor = response.descriptor;
        videoResponse.combinedInfo = response.combinedInfo;
        videoResponse.videos = response.videos;
        videoResposesList.push(videoResponse);        
    }
    videoResponseInfo.catalog.videos = videoResposesList;
    return videoResponseInfo;
}

function initializeAdapter()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
}

async function fireCallbackEvent(videoResponse, videoInfo)
{
    try
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
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, videoData);
    }
    catch(exception)
    {
        throw exception;
    }
}

async function fireErrorEvent(errorInfo, videoInfo)
{
    try
    {
        const videoData = {};
        videoData.room = videoInfo.transaction_id;
        videoData.event = KCallbackEvents.OnErrorAction;
        
        const payload = {};
        const context = {};
        const message = {};

        context.domain = videoInfo.domain;
        context.transaction_id = videoInfo.transaction_id;
        context.message_id = videoInfo.message_id;
        payload.context = context;

        message.network = videoInfo.network;

        const errorResponse = {};
        errorResponse.code = errorInfo.response?.data?.error?.code;
        errorResponse.message = errorInfo.response?.data?.error?.message;
        message.provider = errorResponse;
        payload.message = message;

        videoData.payload = payload;
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, videoData);
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

async function performYoutubeSearch(videoInfo)
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
        const videoResponse = preapreYoutubeResponse(videoResult, videoInfo);
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
        
        await fireCallbackEvent(videoResponse, videoInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performNinjacartSearch(videoInfo)
{
    try
    {
        let videoURL = `${process.env.NINJA_CART_SEARCH_URL}/search`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"            
        };

        const requestBody = {};
        requestBody.transactionId = videoInfo.transaction_id;
        requestBody.messageId = videoInfo.message_id;
        requestBody.text = videoInfo.query;

        const videoResult = await Axios.post(`${videoURL}`, requestBody, requestOptions);
        const videoResponse = preapreNinjacartResponse(videoResult, videoInfo);        
        await fireCallbackEvent(videoResponse, videoInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performApnaSearch(videoInfo)
{
    try
    {
        let videoURL = `${process.env.APNA_SEARCH_URL}/search`;
        videoURL += `?query=${videoInfo.query}`;
        
        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"            
        };

        const videoResult = await Axios.get(`${videoURL}`, requestOptions);
        const videoResponse = preapreApnaResponse(videoResult, videoInfo);        
        await fireCallbackEvent(videoResponse, videoInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
_express.post("/videos/youtube", async (request, response) =>
{
    const videoInfo = prepareYoutubeInfo(request);
    const results = {};

    try
    {
        const ackResponse = prepareAckResponse(videoInfo);
        results.results = ackResponse;
        response.send(results);        
        await performYoutubeSearch(videoInfo);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, videoInfo);
    }
});

_express.post("/videos/ninjacart", async (request, response) =>
{
    const videoInfo = prepareParnerInfo(request);
    const results = {};

    try
    {
        const ackResponse = prepareAckResponse(videoInfo);
        results.results = ackResponse;
        response.send(results);
        await performNinjacartSearch(videoInfo);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, videoInfo);
    }
});

_express.post("/videos/apna", async (request, response) =>
{
    const videoInfo = prepareParnerInfo(request);
    const results = {};

    try
    {
        const ackResponse = prepareAckResponse(videoInfo);
        results.results = ackResponse;
        response.send(results);
        await performApnaSearch(videoInfo);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, videoInfo);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10003;
_server.listen(port);

initializeAdapter();

console.log("Server running at http://localhost:%d", port);
