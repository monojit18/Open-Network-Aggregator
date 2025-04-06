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

const KRetailAttributesPrompt = "Context:Extract keywords related to Retail or Online shopping from the following sentence and return as a JSON response.\nExample:\nShow me benarasi sarees\n{\"attributes\":[\"benarasi sarees\"]}\n\nI want to buy Men's T-shirt.\n{\"attributes\":[\"Men's T-shirt\"]}\n\nCan you show me Laptop Bags and Laptop Covers of various brands and colours\n{\"attributes\":[\"Laptop Covers\", \"Laptop Bags\"]}\n\nI want to buy T-shirts from Reynolds.\n{\"attributes\":[\"T-shirts\", \"Reynolds\"]}\n\nShow me black forest from winnie.\n{\"attributes\":[\"black forest\", \"winnie\"]}";

let _express = Express();
let _server = Http.createServer(_express);
let _axiosAgent = null;
let _allUrls = {};

const KMicroServices =
{
    GenAITextlib: "genai-textlib",
    BuyerAdapter: "ondc-adapter"
}

const KONDCDomain = "integrator:ondc";

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
    _allUrls[KMicroServices.GenAITextlib] = `${process.env.GENAI_TEXTLIB_HOST}`;
    _allUrls[KMicroServices.BuyerAdapter] = `${process.env.BUYER_ADAPTER_URL}`;
}

function prepareONDCMessage(request)
{
    const ondcMessage = {};
    ondcMessage.context = request.body.context;
    ondcMessage.message = request.body.message;
    ondcMessage.preferred_network = request.body.preferred_network;
    ondcMessage.preferred_networks = request.body.preferred_networks;
    return ondcMessage;
}

async function callBuyerAdapter(ondcMessage)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = ondcMessage;
    
    try
    {
        const adapterResponse = await Axios.post(`${_allUrls[KMicroServices.BuyerAdapter]}/search`,
                                                    requestBody, requestOptions);
        const adapterResult = processGenericResponse(adapterResponse);
        return adapterResult;        
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
    const ondcMessage = prepareONDCMessage(request);
    const results = {};
    
    try
    {     
        const preferredNetworksList = ondcMessage.preferred_network;
        const adapterResponseList = [];
        if ((preferredNetworksList != null) && (preferredNetworksList.length > 0))
        {
            await Promise.all(preferredNetworksList.map(async(preferredNetwork) =>
            {
                const copiedONDCMessage = JSON.parse(JSON.stringify(ondcMessage));
                copiedONDCMessage.preferred_network = preferredNetwork;                
                const adapterResponse = await callBuyerAdapter(copiedONDCMessage);
                adapterResponseList.push(adapterResponse);
            }));
        }

        results.results = adapterResponseList;
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