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
    AgriAdapter: "agri-adapter",
    PlannerAgent: "planer-agent"
}

const KMessageTypes =
{
    Loan: "loan",
    AgriCommerce: "agri-commerce",
    RetailCommerce: "retail-commerce",
    MarketLinkage: "market-linkage"
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
    _allUrls[KMicroServices.PlannerAgent] = `${process.env.PLANNER_AGENT_URL}`;   
}

function prepareOnestInfo(request)
{
    const onestInfo = {};    
    onestInfo.context = request.body.context;
    onestInfo.message = request.body.message;
    onestInfo.preferred_network = request.body.preferred_network;
    onestInfo.preferred_networks = request.body.preferred_networks;
    return onestInfo;
}

function preparePlannerHeaders(request)
{
    const plannerHeaders = {};
    plannerHeaders[process.env.VIDEO_API_KEY] = request.headers[process.env.VIDEO_API_KEY];      
    return plannerHeaders;
}

function preparePlannerRequest(plannerInfo)
{
    const requestBody = {};
    requestBody.context = plannerInfo.context;
    requestBody.message = plannerInfo.message;
    requestBody.preferred_networks = plannerInfo.preferred_networks;
    requestBody.message.network.relevant_text = plannerInfo.message.network.relevant_text;

    const filters = [];
    const relevantText = plannerInfo.message.network.relevant_text;

    const query = {};
    query.query = relevantText;
    filters.push(query);    
    requestBody.message.network.filters = filters;    
    return requestBody;
}

async function performOnestPlannerSearch(request)
{
    const onestInfo = prepareOnestInfo(request);

    try
    {
        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers = preparePlannerHeaders(request);
        
        const requestBody = preparePlannerRequest(onestInfo);
        const plannerResponse = await Axios.post(`${_allUrls[KMicroServices.PlannerAgent]}/multi/onest/search`,
                                                    requestBody, requestOptions);
        const planerResult = processGenericResponse(plannerResponse);
        return planerResult;
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
 * @description Calls Search API of the Planner Agent
 */
_express.post("/search", async (request, response) =>
{
    const results = {};
    
    try
    {
        const adapterResponse = await performOnestPlannerSearch(request);
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