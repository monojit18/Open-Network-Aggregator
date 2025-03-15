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
    MandiAdapter: "mandi-adapter"
}

const KEnamKey = "ENAM";

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
    _allUrls[KMicroServices.MandiAdapter] = `${process.env.MANDI_ADAPTER_URL}`;
}

function prepareMandiMessage(request)
{
    const mandiMessage = {};
    mandiMessage.context = request.body.context;
    mandiMessage.message = request.body.message;
    mandiMessage.preferred_network = request.body.preferred_network;
    return mandiMessage;
}

function prepareMandiHeaders(request)
{
    const mandiHeaders = {};
    mandiHeaders[process.env.ENAM_MANDI_API_KEY] = request.headers[process.env.ENAM_MANDI_API_KEY]; 
    mandiHeaders[process.env.PARTNER_MANDI_API_KEY] = request.headers[process.env.PARTNER_MANDI_API_KEY]; 
    return mandiHeaders;
}

async function initializeAgent()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
    prepareAllUrls();
}

async function callMandiAdapters(mandiMessage, mandiHeaders, urlPart)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;
    requestOptions.headers = mandiHeaders;

    const requestBody = mandiMessage;

    
    try
    {
        const adapterResponse = await Axios.post(`${_allUrls[KMicroServices.MandiAdapter]}/mandi/${urlPart}`,
                                                    requestBody, requestOptions);
        const adapterResult = processGenericResponse(adapterResponse);
        return adapterResult;        
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
 * @description In turn calls Search API of the corresponding Adapter
 */
_express.post("/search", async (request, response) =>
{    
    const mandiMessage = prepareMandiMessage(request);
    const mandiHeaders = prepareMandiHeaders(request);

    const results = {};
    let adapterResponse = null;
    
    try
    {
        const enamMandiNetwork = mandiMessage.preferred_network[process.env.ENAM_NETWORK_KEY];
        if (enamMandiNetwork != null)
        {
            const copiedMandiMessage = JSON.parse(JSON.stringify(mandiMessage));
            copiedMandiMessage.preferred_network = enamMandiNetwork;            
            adapterResponse = await callMandiAdapters(copiedMandiMessage, mandiHeaders, "enam");
        }

        const preferredNetworksList = mandiMessage.preferred_network.partners;
        if ((preferredNetworksList != null) && (preferredNetworksList.length > 0))
        {
            await Promise.all(preferredNetworksList.map(async(preferredNetwork) =>
            {
                const copiedMandiMessage = JSON.parse(JSON.stringify(mandiMessage));
                copiedMandiMessage.preferred_network = preferredNetwork;                
                adapterResponse = await callMandiAdapters(copiedMandiMessage, mandiHeaders,
                                                            "partner");
            }));
        }        
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