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
const DotEnv = require("dotenv");
const Express = require("express");
const Cors = require("cors");
const Axios = require('axios');

let _express = Express();
let _server = Http.createServer(_express);
let _axiosAgent = null;

const KOnSearchAction = "on_search";
const KOnSelectAction = "on_select";
const KOnInitAction = "on_init";
const KOnConfirmAction = "on_confirm";
const KOnStatusAction = "on_status";

const KLearningDomain = "onest:learning-experiences";
const KWorkDomain = "onest:work-opportunities";
const KFinanceDomain = "onest:financial-support";

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

function prepareDomainId(domain)
{
    switch(domain)
    {
        case KLearningDomain:
            return "learning";
        case KWorkDomain:
            return "job";
        case KFinanceDomain:
            return "finance";
    }
}

function prepareAckResponse()
{
    const message = {};
    const ack = {};
    
    ack.status = 200;
    message.ack = ack;
    return exception;
}

function prepareGenericMockResponse(request)
{
    const mockResponse = {};
    mockResponse.context = request.body.context;
    mockResponse.message = {};    
    return mockResponse;

    // const catalog = {};

    // const descriptor = {};
    // descriptor.name = "Catalog for Advanced English courses";
    // catalog.descriptor = {};

    // const providers = [];

    // const provider = {};
    // provider.id = "INFOSYS";
    // const providerDescriptor = {};
    // providerDescriptor.name = "Infosys Springboard";
    // providerDescriptor.short_desc = "Infosys Springboard Digital literacy program";
    // providerDescriptor.images = [];

    // const providerDescriptorImage = {};
    // providerDescriptorImage.url = "https://infyspringboard.onwingspan.com/web/assets/images/infosysheadstart/app_logos/landing-new.png";
    // providerDescriptorImage.size_type = "sm";
    // providerDescriptorImage.images.push(image);
}

function prepareMockResponse(actionString, request)
{
    switch(actionString)
    {
        case KOnSearchAction:
            return prepareGenericMockResponse(request);
        case KOnSelectAction:
            return prepareGenericMockResponse(request);
        case KOnInitAction:
            return prepareGenericMockResponse(request);
        case KOnConfirmAction:
            return prepareGenericMockResponse(request);
        case KOnStatusAction:
            return prepareMockSearchResponse(request);
    }
}

function prepareCallbackUrls(actionString, domainString, requestBody)
{
    switch(actionString)
    {        
        case KOnSearchAction:
            return `${requestBody.context.bpp_uri}on_search/${domainString}`;
        case KOnSelectAction:
            return `${requestBody.context.bpp_uri}on_select/${domainString}`;
        case KOnInitAction:
            return `${requestBody.context.bpp_uri}on_init/${domainString}`;
        case KOnConfirmAction:
            return `${requestBody.context.bpp_uri}on_confirm/${domainString}`;
        case KOnStatusAction:
            return `${requestBody.context.bpp_uri}on_status/${domainString}`;
    }
}

async function prepareCallbackResponse(request, actionString)
{
    try
    {        
        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        
        requestOptions.headers = {};
        requestOptions.headers =
        {
            "Content-Type": "application/json"
        }

        const domainString = prepareDomainId(request.body.context.domain);
        const requestBody = prepareMockResponse(actionString, request.body);
        const callbackURL = prepareCallbackUrls(actionString, domainString, requestBody);
        const callbakcResponse = await Axios.post(`${callbackURL}`, requestBody, requestOptions);
        const callbackResponse = processGenericResponse(callbakcResponse);        
        return callbackResponse;        
    }
    catch(exception)
    {
        throw exception;
    }
}

function processGenericResponse(response)
{
    const genericResponse = response.data;
    return genericResponse;
}

async function initializeClient()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
}

/* API DEFINITIONS - START */
_express.post("/search", async (request, response) =>
{
    try
    {
        const ackResponse = prepareAckResponse();
        response.status(onSearchResponse.status).send(JSON.stringify(ackResponse));
        
        const callbackResponse = await prepareCallbackResponse(request, KOnSearchAction);
        console.log(JSON.stringify(callbackResponse));
    }
    catch(exception)
    {
        const error = prepareErrorMessage(exception);
        response.status(error.code).send(`${error.message}\n`);
    }
});

_express.post("/select", async (request, response) =>
{
    try
    {
        const ackResponse = prepareAckResponse();
        response.status(onSearchResponse.status).send(JSON.stringify(ackResponse));

        // const callbackResponse = await prepareCallbackResponse(request, KOnSelectAction);
        // console.log(JSON.stringify(callbackResponse));
        console.log(JSON.stringify(ackResponse));
    }
    catch(exception)
    {
        const error = prepareErrorMessage(exception);
        response.status(error.code).send(`${error.message}\n`);
    }
});

_express.post("/init", async (request, response) =>
{
    try
    {
        const ackResponse = prepareAckResponse();
        response.status(onSearchResponse.status).send(JSON.stringify(ackResponse));

        // const callbackResponse = await prepareCallbackResponse(request, KOnInitAction);
        // console.log(JSON.stringify(callbackResponse));
        console.log(JSON.stringify(ackResponse));
    }
    catch(exception)
    {
        const error = prepareErrorMessage(exception);
        response.status(error.code).send(`${error.message}\n`);
    }
});

_express.post("/confirm", async (request, response) =>
{
    try
    {
        const ackResponse = prepareAckResponse();
        response.status(onSearchResponse.status).send(JSON.stringify(ackResponse));

        // const callbackResponse = await prepareCallbackResponse(request, KOnConfirmAction);
        // console.log(JSON.stringify(callbackResponse));
        console.log(JSON.stringify(ackResponse));
    }
    catch(exception)
    {
        const error = prepareErrorMessage(exception);
        response.status(error.code).send(`${error.message}\n`);
    }
});

_express.post("/status", async (request, response) =>
{
    try
    {
        const ackResponse = prepareAckResponse();
        response.status(onSearchResponse.status).send(JSON.stringify(ackResponse));

        // const callbackResponse = await prepareCallbackResponse(request, KOnStatusAction);
        // console.log(JSON.stringify(callbackResponse));
        console.log(JSON.stringify(ackResponse));
    }
    catch(exception)
    {
        const error = prepareErrorMessage(exception);
        response.status(error.code).send(`${error.message}\n`);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10011;
_server.listen(port);
initializeClient();

console.log("Server running at http://localhost:%d", port);
