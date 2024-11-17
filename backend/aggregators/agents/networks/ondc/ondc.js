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
    ONDCAdapter: "ondc-adapter"
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
    _allUrls[KMicroServices.ONDCAdapter] = `${process.env.ONDC_BUYER_ADAPTER_URL}`;
}

function prepareNLPInfo(request)
{
    const nlpInfo = {};
    nlpInfo.transactionId = request.body.transactionId;
    nlpInfo.messageId = request.body.messageId;
    nlpInfo.network = request.body.network;
    return nlpInfo;
}

function prepareNLPContentInfo(promptInfo)
{
    const contentInfo = {};
    const partInfo = {};
    partInfo.text = promptInfo.prompt;

    contentInfo.role = "user";
    contentInfo.parts = [];
    contentInfo.parts.push(partInfo);
    return [contentInfo];
}

function prepareShortHeaders()
{
    const genAIHeaders = {};
    genAIHeaders.temperature = 0.2;
    genAIHeaders.maxtokens = 1024;
    genAIHeaders.topk = 40;
    genAIHeaders.topp = 0.95;
    return genAIHeaders;
}

function prepareONDCMessage(nlpInfo)
{
    const ondcMessage = {};
    ondcMessage.domain = KONDCDomain;
    ondcMessage.transaction_id = nlpInfo.transactionId;
    ondcMessage.message_id = nlpInfo.messageId;
    ondcMessage.network = nlpInfo.network;    
    return ondcMessage;
}

async function extractRetailAttributes(ondcMessage)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};

    const promptInfo = {};
    promptInfo.prompt = `${KRetailAttributesPrompt}\n\n${ondcMessage.network?.intent[0]?.query}`;
    const contentsList = prepareNLPContentInfo(promptInfo);
    requestBody.contents = contentsList;

    const genAIHeaders = prepareShortHeaders();
    requestOptions.headers = genAIHeaders;

    try
    {
        let response = await Axios.post(`${_allUrls[KMicroServices.GenAITextlib]}/genai/text?type=json`,
                                                requestBody, requestOptions);
        const nlpResponsesList = processGenericResponse(response);
        const nlpResponse = nlpResponsesList[0];
        const attributesList = nlpResponse.formatted_response.attributes;
        return attributesList;
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
_express.post("/search", async (request, response) =>
{
    const nlpInfo = prepareNLPInfo(request);
    const ondcMessage = prepareONDCMessage(nlpInfo);

    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = ondcMessage;
    const results = {};
    
    try
    {
        const retailAttributesList = await extractRetailAttributes(ondcMessage);
        const searchString = retailAttributesList.join(",");
        ondcMessage.network.intent[0].query = searchString;
        
        const adapterResponse = await Axios.post(`${_allUrls[KMicroServices.ONDCAdapter]}/search`,
                                                requestBody, requestOptions);      
        results.results = processGenericResponse(adapterResponse);
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

var port = process.env.port || process.env.PORT || 10004;
_server.listen(port);
initializeAgent();

console.log("Server running at http://localhost:%d", port);