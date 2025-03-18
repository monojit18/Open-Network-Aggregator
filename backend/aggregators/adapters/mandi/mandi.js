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

const KStatusACK = "ACK";

const KCallbackEvents =
{
    OnMandiAction: "on_enam_mandi",
    OnCallbackAction: "callback",
    OnErrorAction: "on_error"
}

const KMandiConstants =
{
    PKEY: "pKey",
    EMBEDDING: "embedding",
    DISTANCE: "distance",
    MAX_RESULTS: "max_results"
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

function processGenericResponse(response)
{
    const genericResponse = response.data.results;
    return genericResponse;
}

function prepareMandiPriceInfo(request)
{
    const priceInfo = {};    
    priceInfo.context = request.body.context;
    priceInfo.message = request.body.message;    
    priceInfo.preferred_network = request.body.preferred_network;
    
    const mandiPriceInfo = priceInfo.message.network.price;
    if (mandiPriceInfo.state != null)
    {
        priceInfo.state = mandiPriceInfo.state;
    }

    if (mandiPriceInfo.district != null)
    {
        priceInfo.district = mandiPriceInfo.district;
    }

    if (mandiPriceInfo.market != null)
    {
        priceInfo.market = mandiPriceInfo.market;
    }

    if (mandiPriceInfo.commodity != null)
    {
        priceInfo.commodity = mandiPriceInfo.commodity;
    }

    if (mandiPriceInfo.variety != null)
    {
        priceInfo.variety = mandiPriceInfo.variety;
    }

    if (mandiPriceInfo.grade != null)
    {
        priceInfo.grade = mandiPriceInfo.grade;
    }
    return priceInfo;
}

function prepareAckResponse(priceInfo)
{
    const ackResponse = {};
    ackResponse.context = priceInfo.context;

    const message = {};
    const ack = {};
    ack.status = KStatusACK;
    message.ack = ack;
    ackResponse.message = message;
    return ackResponse;
}

// function preparePartnerEnamPriceRequest(priceInfo)
// {
//     const priceRequest = {};
//     priceRequest.context = JSON.stringify(priceInfo.context);
//     priceRequest.message = priceInfo.message;    
//     return priceRequest;
// }

function preparePartnerEnamPriceRequest(priceInfo)
{
    const priceRequest = {};
    priceRequest.key = priceInfo.apiKey;
    priceRequest.commodityName = priceInfo.message.network.price.commodity;

    const market = priceInfo.message.network.price.market;
    const state = priceInfo.message.network.price.state;
    priceRequest.districtName = (market != null) ? market : state;
    priceRequest.context = JSON.stringify(priceInfo.context);
    priceRequest.message = priceInfo.message;    
    return priceRequest;
}

function preapreEnamPriceResponse(priceResult)
{    
    const response = priceResult.data;

    const priceResponse = {};
    priceResponse.records = response.records;
    return priceResponse;
}

function preaprePartnerEnamPriceResponse(priceResult)
{    
    const priceResponse = priceResult.data;    
    return priceResponse;
}

function initializeAdapter()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
}

async function firePartnerCallbackEvent(priceResponse, priceInfo)
{
    try
    {
        const priceData = {};
        priceData.room = priceInfo.context.transaction_id;
        priceData.event =  KCallbackEvents.OnMandiAction;
        
        const payload = {};
        payload.context = priceInfo.context;
        payload.message = priceInfo.message;

        const catalog = {};
        const descriptor = priceInfo.preferred_network.descriptor;
        catalog.descriptor = descriptor;

        const provider = {};
        provider.descriptor = catalog.descriptor;

        const items = priceResponse.results.message.catalog.items;
        provider.items = items;
        catalog.provider = provider;
        payload.message.catalog = catalog;

        priceData.payload = payload;
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, priceData);
    }
    catch(exception)
    {        
        throw exception;
    }    
}

async function fireCallbackEvent(priceResponse, priceInfo)
{
    try
    {
        const priceData = {};
        priceData.room = priceInfo.context.transaction_id;
        priceData.event =  KCallbackEvents.OnMandiAction;
        
        const payload = {};
        payload.context = priceInfo.context;
        payload.message = priceInfo.message;

        const catalog = {};
        const descriptor = priceInfo.preferred_network.descriptor;
        catalog.descriptor = descriptor;

        const provider = {};
        provider.descriptor = catalog.descriptor;

        const items = priceResponse;
        provider.items = items;
        catalog.provider = provider;
        payload.message.catalog = catalog;

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
        priceData.room = priceInfo.context.transaction_id;;
        priceData.event = KCallbackEvents.OnErrorAction;

        const payload = {};
        payload.context = priceInfo.context;
        payload.message = priceInfo.message;

        const errorResponse = {};
        errorResponse.code = errorInfo.code;
        errorResponse.message = errorInfo.message;
        payload.error = errorResponse;

        priceData.payload = payload;
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, priceData);                    
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
        const socketResponse = await Axios.post(`${process.env.EVENT_RECEIVER_HTTP_HOST}/message`,
                                                requestBody, requestOptions);
        console.log(socketResponse);
        return socketResponse;
    }
    catch(exception)
    {        
        throw exception;
    }
}

async function performSemanticSearchForCommodity(priceInfo)
{
    try
    {
        let vectorSearchURL = process.env.MANDI_VECTOR_SEARCH_URL;

        const datasetId = process.env.AGENTIC_BQ_DATASET;
        const tableId = process.env.AGENTIC_BQ_TABLE;
        const searchColumn = process.env.AGENTIC_BQ_SEARCH_COLUMN;
        const queryColumn = process.env.AGENTIC_BQ_QUERY_COLUMN;
        const maxResults = process.env.AGENTIC_BQ_MAX_RESULTS;
        const searchQuery = priceInfo.commodity;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"
        };
        requestOptions.headers[KMandiConstants.EMBEDDING] = process.env.AGENTIC_TEXT_EMBEDDING;
        requestOptions.headers[KMandiConstants.DISTANCE] = process.env.AGENTIC_TEXT_EMBEDDING_DISTANCE;
        requestOptions.headers[KMandiConstants.MAX_RESULTS] = maxResults;

        const requestBody = {};
        requestBody.query = searchQuery;

        const commodityResult = await Axios.post(`${vectorSearchURL}/datasets/${datasetId}/tables/${tableId}/search/query?scol=${searchColumn}&qcol=${queryColumn}`, requestBody, requestOptions);
        const commodityResponseList = processGenericResponse(commodityResult);
        const commodityResponse = commodityResponseList[0];
        return commodityResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performPartnerMandiPriceSearch(priceInfo)
{
    try
    {
        const commodityResponse = await performSemanticSearchForCommodity(priceInfo);
        priceInfo.message.network.price.commodity = commodityResponse.base.commodity;

        let enamMandiURL = `${priceInfo.preferred_network.url}`;        

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"
        };
        requestOptions.headers[KMandiConstants.PKEY] = priceInfo.apiKey;

        const requestBody = preparePartnerEnamPriceRequest(priceInfo);
        const priceResult = await Axios.post(`${enamMandiURL}`, requestBody, requestOptions);
        const priceResponse = preaprePartnerEnamPriceResponse(priceResult);        
        // await firePartnerCallbackEvent(priceResponse, priceInfo);
        await fireCallbackEvent(priceResponse, priceInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performMandiPriceSearch(priceInfo)
{
    try
    {
        let enamMandiURL = `${process.env.ENAM_MANDI_SEARCH_URL}`;
        enamMandiURL += `?format=json&api-key=${priceInfo.apiKey}`;

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
        const priceResponse = preapreEnamPriceResponse(priceResult);        
        await fireCallbackEvent(priceResponse, priceInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
/**
 * @fires /search
 * @method POST
 * @description In turn calls Search API of the partner Affiliate
 */
_express.post("/mandi/partner", async (request, response) =>
{
    const priceInfo = prepareMandiPriceInfo(request);
    priceInfo.apiKey = request.headers[process.env.PARTNER_MANDI_API_KEY];

    const results = {};

    try
    {
        const ackResponse = prepareAckResponse(priceInfo);
        results.results = ackResponse;
        response.send(results);
        await performPartnerMandiPriceSearch(priceInfo);        
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, priceInfo);
    }
});

/**
 * @fires /search
 * @method POST
 * @description In turn calls Search API of the default Affiliate (e.g. ENAM)
 */
_express.post("/mandi/enam", async (request, response) =>
{
    const priceInfo = prepareMandiPriceInfo(request);
    priceInfo.apiKey = request.headers[process.env.ENAM_MANDI_API_KEY];
    
    const results = {};

    try
    {
        const ackResponse = prepareAckResponse(priceInfo);
        results.results = ackResponse;
        response.send(results);
        await performMandiPriceSearch(priceInfo);        
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, priceInfo);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10001;
_server.listen(port);

initializeAdapter();

console.log("Server running at http://localhost:%d", port);
