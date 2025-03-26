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
let _allUrls = {};

const KMicroServices =
{
    GenAITextlib: "genai-textlib",
    AgriAdapter: "agri-adapter"
}

const KMessageTypes =
{
    Loan: "loan",    
    MarketLinkage: "market-linkage"
}

const KNetworkType =
{
    MarketLinkage: "MARKET_LINKAGE"
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
    const genericResponse = response.data.results;
    return genericResponse;
}

function prepareAllUrls()
{
    _allUrls[KMicroServices.AgriAdapter] = `${process.env.AGRI_ADAPTER_URL}`;
}

function prepareAgriInfo(request)
{
    const agriInfo = {};    
    agriInfo.context = request.body.context;
    agriInfo.message = request.body.message;
    agriInfo.preferred_network = request.body.preferred_network;
    agriInfo.preferred_networks = request.body.preferred_networks;
    return agriInfo;
}

async function callAgriAdapter(agriInfo, urlPart)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = agriInfo;    
    
    try
    {
        const adapterResponse = await Axios.post(`${_allUrls[KMicroServices.AgriAdapter]}${urlPart}`,
                                                    requestBody, requestOptions);
        const adapterResult = processGenericResponse(adapterResponse);
        return adapterResult;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performLoanSearch(request)
{
    const agriInfo = prepareAgriInfo(request);
    let adapterResponse = {};
    
    try
    {
        const preferredNetworksList = agriInfo.preferred_network;
        if ((preferredNetworksList != null) && (preferredNetworksList.length > 0))
        {
            await Promise.all(preferredNetworksList.map(async(preferredNetwork) =>
            {
                const copiedAgriMessage = JSON.parse(JSON.stringify(agriInfo));
                copiedAgriMessage.preferred_network = preferredNetwork;                
                adapterResponse = await callAgriAdapter(copiedAgriMessage, "/loan/search");
            }));
        }
        return adapterResponse;
    }
    catch(exception)
    {        
        throw exception;
    }
}

async function performMarketLinkageSearch(request)
{
    const agriInfo = prepareAgriInfo(request);
    let adapterResponse = {};
    
    try
    {
        const preferredNetworksList = agriInfo.preferred_networks[KNetworkType.MarketLinkage];
        if ((preferredNetworksList != null) && (preferredNetworksList.length > 0))
        {
            await Promise.all(preferredNetworksList.map(async(preferredNetwork) =>
            {
                const copiedAgriMessage = JSON.parse(JSON.stringify(agriInfo));
                copiedAgriMessage.preferred_network = preferredNetwork;                
                adapterResponse = await callAgriAdapter(copiedAgriMessage, "/market-linkage/search");
            }));
        }
        return adapterResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performByMessageType(request)
{
    try
    {
        const messageType = request.body.message.network.filters[0].type;
        console.log(`messageType: ${messageType}`);
        let searchResponse = {};

        switch (messageType)
        {
            case KMessageTypes.Loan:
                {
                    searchResponse = await performLoanSearch(request);
                }
                break;           
            case KMessageTypes.MarketLinkage:
                {
                    searchResponse = await performMarketLinkageSearch(request);
                }
                break;
        }
        return searchResponse;
    }
    catch(exception)
    {        
        throw exception;
    }
}

async function initializeAgent()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
    prepareAllUrls();
}

/* API DEFINITIONS - START */
/**
 * @fires /search
 * @method POST
 * @description In turn calls Search API of the corresponding Adapter
 */
_express.post("/search", async (request, response) =>
{
    const results = {};
    
    try
    {
        const adapterResponse = await performByMessageType(request);
        results.results = adapterResponse;
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

var port = process.env.port || process.env.PORT || 10002;
_server.listen(port);
initializeAgent();

console.log("Server running at http://localhost:%d", port);