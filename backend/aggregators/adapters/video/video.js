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

// const KYoutubeAPIKey = "AIzaSyAFqjVTw1CJs-kHY5G41NoV1Zq8M45nUa8";
const KYoutubeAPIKey = "x-api-video-key";
const KStatusACK = "ACK";

const KCallbackEvents =
{
    OnVideoAction: "on_video",
    OnCallbackAction: "callback",
    OnErrorAction: "on_error"
}

const KYoutubeSearchConfig =
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

function prepareParnerInfo(request)
{
    const videoInfo = {};
    videoInfo.context = request.body.context;
    videoInfo.message = request.body.message;
    videoInfo.apiKey = request.headers[KYoutubeAPIKey];
    videoInfo.preferred_network = request.body.preferred_network;
    videoInfo.query = videoInfo.message.network.filters.query;
    return videoInfo;
}

function prepareYoutubeInfo(request)
{
    const videoInfo = prepareParnerInfo(request);    
    videoInfo.part = `${KYoutubeSearchConfig.SNIPPET}`;
    videoInfo.maxResults = KYoutubeSearchConfig.MAX_RESULTS;
    return videoInfo;    
}

function prepareParnerRequest(videoInfo)
{
    const videoRequest = {};
    videoRequest.context = videoInfo.context;
    videoRequest.message = videoInfo.message;    
    return videoRequest;
}

function prepareAckResponse(videoInfo)
{
    const ackResponse = {};
    ackResponse.context = videoInfo.context;

    const message = {};
    const ack = {};
    ack.status = KStatusACK;
    message.ack = ack;
    ackResponse.message = message;
    return ackResponse;
}

function preapreYoutubeResponse(videoResult)
{
    const response = videoResult.data;

    const videoResponse = {};
    videoResponse.regionCode = response.regionCode;

    videoResponse.videos = [];
    videoResponse.playLists = [];
    for (const contentItem of response.items)
    {
        const videoItem = {};
        if (contentItem.id.kind == KYoutubeSearchConfig.VIDEO_TYPE)
        {            
            videoItem.videoId = contentItem.id.videoId;
            videoResponse.videos.push(videoItem);
        }
        else if (contentItem.id.kind == KYoutubeSearchConfig.PLAYLIST_TYPE)
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

function preaprePartnerResponse(videoResult)
{
    const videoResponse = videoResult.data;
    return videoResponse;
}

function initializeAdapter()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
}

async function firePartnerCallbackEvent(videoResponse, videoInfo)
{
    try
    {
        const videoData = {};
        videoData.room = videoInfo.context.transaction_id;
        videoData.event = KCallbackEvents.OnVideoAction;

        const payload = {};
        payload.context = videoInfo.context;
        payload.message = videoInfo.message;

        const catalog = {};
        const descriptor = videoInfo.preferred_network.descriptor;
        catalog.descriptor = descriptor;

        const provider = {};
        provider.descriptor = catalog.descriptor;        
        provider.items = videoResponse.catalog.videos;
        catalog.provider = provider;
        payload.message.catalog = catalog;
        videoData.payload = payload;
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, videoData);
    }
    catch(exception)
    {
        throw exception;
    }
}

async function fireCallbackEvent(videoResponse, videoInfo)
{
    try
    {
        const videoData = {};
        videoData.room = videoInfo.context.transaction_id;
        videoData.event = KCallbackEvents.OnVideoAction;

        const payload = {};
        payload.context = videoInfo.context;
        payload.message = videoInfo.message;

        const catalog = {};
        const descriptor = videoInfo.preferred_network.descriptor;
        catalog.descriptor = descriptor;

        const provider = {};
        provider.descriptor = catalog.descriptor;
        const items = videoResponse;
        provider.items = items;
        catalog.provider = provider;
        payload.message.catalog = catalog;
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
        videoData.room = videoInfo.context.transaction_id;
        videoData.event = KCallbackEvents.OnErrorAction;
        
        const payload = {};
        payload.context = videoInfo.context;
        payload.message = videoInfo.message;

        const errorResponse = {};
        errorResponse.code = errorInfo.response?.data?.error?.code;
        errorResponse.message = errorInfo.response?.data?.error?.message;
        payload.error = errorResponse;

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

async function getVideoDeatails(videoRef, videoInfo)
{
    try
    {
        let videoDetailsURL = `${process.env.YOUTUBE_DATA_V3_SEARCH_URL}`;            
        if (videoRef.videoId != null)
        {
            videoDetailsURL += `/videos?id=${videoRef.videoId}`;
            
        }
        else if (videoRef.playlistId != null)
        {
            videoDetailsURL += `/playlists?id=${videoRef.playlistId}`;
        }
        videoDetailsURL += `&part=${KYoutubeSearchConfig.PLAYER}&key=${videoInfo.apiKey}`;

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

async function performPartnerSearch(videoInfo)
{
    try
    {
        let videoURL = `${videoInfo.preferred_network.url}/search`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"            
        };

        // const requestBody = prepareParnerRequest(videoInfo);
        const requestBody = {};
        requestBody.text = videoInfo.query;

        const videoResult = await Axios.post(`${videoURL}`, requestBody, requestOptions);
        const videoResponse = preaprePartnerResponse(videoResult);        
        await firePartnerCallbackEvent(videoResponse, videoInfo);
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
        videoURL += `?part=${videoInfo.part}&maxResults=${videoInfo.maxResults}&q=${videoInfo.query}&key=${videoInfo.apiKey}`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"
        };

        const videoResult = await Axios.get(`${videoURL}`, requestOptions);
        const videoResponse = preapreYoutubeResponse(videoResult);
        const videos = videoResponse.videos;
        const playLists = videoResponse.playLists;

        if (videos.length > 0)
        {
            await Promise.all(videos.map(async (videoRef) =>
            {
                const videoDetailsResponse = await getVideoDeatails(videoRef, videoInfo);
                videoRef.player = videoDetailsResponse.player;
            }));
        }

        if (playLists.length > 0)
        {
            await Promise.all(playLists.map(async (playListRef) =>
            {
                const videoDetailsResponse = await getVideoDeatails(playListRef, videoInfo);
                playListRef.player = videoDetailsResponse.player;
            }));
        }
        
        await fireCallbackEvent(videoResponse, videoInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
_express.post("/videos/partner", async (request, response) =>
{
    const videoInfo = prepareParnerInfo(request);
    const results = {};

    try
    {
        const ackResponse = prepareAckResponse(videoInfo);
        results.results = ackResponse;
        response.send(results);
        await performPartnerSearch(videoInfo);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, videoInfo);
    }
});

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
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10001;
_server.listen(port);

initializeAdapter();

console.log("Server running at http://localhost:%d", port);
