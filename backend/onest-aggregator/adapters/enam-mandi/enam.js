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
const KPriceAPIKey = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";

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

function preparePriceInfo(request)
{
    const priceInfo = {};
    priceInfo.context = request.body.context;
    priceInfo.message = request.body.message;

    const item = priceInfo.message.provider.item;    
    if (item.state != null)
    {
        priceInfo.state = item.state;
    }

    if (item.district != null)
    {
        priceInfo.district = item.district;
    }

    if (item.market != null)
    {
        priceInfo.market = item.market;
    }

    if (item.commodity != null)
    {
        priceInfo.commodity = item.commodity;
    }

    if (item.variety != null)
    {
        priceInfo.variety = item.variety;
    }

    if (item.grade != null)
    {
        priceInfo.grade = item.grade;
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

async function performPriceSearch(priceInfo)
{
    try
    {
        let priceURL = `${process.env.PRICE_SEARCH_URL}`;
        priceURL += `?format=json&api-key=${KPriceAPIKey}`;

        if (priceInfo.state != null)
        {
            priceURL += `&filters[state.keyword]=${priceInfo.state}`;
        }

        if (priceInfo.district != null)
        {
            priceURL += `&filters[district]=${priceInfo.district}`;
        }

        if (priceInfo.market != null)
        {
            priceURL += `&filters[market]=${priceInfo.market}`;
        }

        if (priceInfo.commodity != null)
        {
            priceURL += `&filters[commodity]=${priceInfo.commodity}`;
        }
        
        if (priceInfo.variety != null)
        {
            priceURL += `&filters[variety]=${priceInfo.variety}`;
        }

        if (priceInfo.grade != null)
        {
            priceURL += `&filters[grade]=${priceInfo.grade}`;
        }

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"            
        };

        const priceResult = await Axios.get(`${priceURL}`, requestOptions);
        const priceResponse = preaprePriceResponse(priceResult);        
        return priceResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
_express.post("/price", async (request, response) =>
{
    const priceInfo = preparePriceInfo(request);
    const results = {};

    try
    {
        const priceResponse = await performPriceSearch(priceInfo);
        results.results = priceResponse;
        response.send(results);
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

console.log("Server running at http://localhost:%d", port);
