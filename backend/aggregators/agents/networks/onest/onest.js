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
    StorageLib: "storagelib",
    TranslateLib: "translatelib",
    GenAIImagelib: "genai-imagelib",
    VectorSearchlib: "vector-searchlib",
    GenAITextlib: "genai-textlib",
    GenAIMultimodallib: "genai-multimodallib",
    LearningSeekerAdapterLib: "learning-seeker-adapter",
    JobsSeekerAdapterLib: "job-seeker-adapter",
    FinanceSeekerAdapterLib: "finance-seeker-adapter"
}


const KLearning = "learning";
const KJob = "job";
const KFinance = "finance";
const KLearningDomain = "onest:learning-experiences";
const KWorkDomain = "onest:work-opportunities";
const KFinanceDomain = "onest:financial-support";

const KAPIVersion = "1.1.0";
const KTTL = "PT10M";

const KNetworkActions =
{
    SearchAction: "search",
    SelectAction: "select",
    InitAction: "init",
    ConfirmAction: "confirm",
    StatusAction: "status"
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
    exception.code = (exception.status != null) ? exception.status : null;
    exception.message = (exception.message != null) ? exception.message : null;
    if (exception.message != null)
    {
        if (exception.code == null)
            exception.code = 500;

        return exception;
    }

    exception.code = (exception.response.status == undefined)
                        ? 500 : exception.response.status;
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
    _allUrls[KMicroServices.StorageLib] = `${process.env.STORAGELIB_HOST}`;
    _allUrls[KMicroServices.TranslateLib] = `${process.env.TRANSLATELIB_HOST}`;
    _allUrls[KMicroServices.GenAIImagelib] = `${process.env.GENAI_IMAGELIB_HOST}`;
    _allUrls[KMicroServices.VectorSearchlib] = `${process.env.GENAI_VECTORSEARCHLIB_HOST}`;
    _allUrls[KMicroServices.GenAITextlib] = `${process.env.GENAI_TEXTLIB_HOST}`;
    _allUrls[KMicroServices.GenAIMultimodallib] = `${process.env.GENAI_MULTILIB_HOST}`;
    _allUrls[KMicroServices.LearningSeekerAdapterLib] = `${process.env.ONEST_LEARNING_SEEKER_ADAPTER_URL}`;
    _allUrls[KMicroServices.JobsSeekerAdapterLib] = `${process.env.ONEST_JOB_SEEKER_ADAPTER_URL}`;
    _allUrls[KMicroServices.FinanceSeekerAdapterLib] = `${process.env.ONEST_FINANCE_SEEKER_ADAPTER_URL}`;
}

function prepareNLPInfo(request)
{
    const nlpInfo = {};
    nlpInfo.transactionId = request.body.transactionId;
    nlpInfo.messageId = request.body.messageId;
    nlpInfo.network = request.body.network;
    return nlpInfo;
}

function prepareNetworkInfo(request)
{
    const networkInfo = request.body;
    return networkInfo;
}

function extractDomainString(nlpNetworkInfo)
{
    if (nlpNetworkInfo.learnings != null)
        return KLearning;
    if (nlpNetworkInfo.works != null)
        return KJob;
    if (nlpNetworkInfo.scholarships != null)
        return KFinance;
}

function determineDomainString(domainInfo)
{
    switch(domainInfo)
    {
        case KLearningDomain:
            return KLearning;
        case KWorkDomain:
            return KJob;
        case KFinanceDomain:
            return KFinance;
    }
}

function prepareLearningMessage(networkInfo)
{
    const messagesList = [];
    for (const learning of networkInfo.learnings)
    {
        const message = {};
        const intent = {};
        const item = {};
        const descriptor = {};

        descriptor.name = learning.item;
        item.descriptor = descriptor;
        intent.item = item;
        message.intent = intent;
        messagesList.push(message);
    }
    return messagesList;
}

function prepareJobsMessage(networkInfo)
{
    const messagesList = [];
    for (const job of networkInfo.works)
    {
        const message = {};
        const intent = {};        
        
        if (job.industry != null)
        {
            const item = {};

            const descriptor = {};
            descriptor.name = job.industry;
            item.descriptor = descriptor;
            intent.item = item;
        }
        else if (job.provider != null)
        {
            const provider = {};

            const descriptor = {};
            descriptor.name = job.provider;
            provider.descriptor = descriptor;
            intent.provider = provider;
        }
        else if (job.user != null)
        {
            const fulfillment = {};
            const customer = {};

            const person = {};
            person.age = job.age;
            person.gender = job.genderage;
            person.skill = job.skills;
            customer.person = person;
            fulfillment.customer = customer;
        }
        else if (job.employemnt != null)
        {
            const item = {};            
            const tags = [];

            const tag = {};
            const employmentTypes = [];
            tag.display = true;

            const descriptor = {};
            descriptor.code = "listing-details";
            descriptor.name = "Listing details";
            tag.descriptor = descriptor;

            const employmentType = {};
            employmentType.descriptor = {};
            employmentType.descriptor.code = "employment-type";
            employmentType.descriptor.name = "Employment type";
            
            employmentType.value = job.employemnt;
            employmentType.display = true;
            employmentTypes.push(employmentType);
            tag.list = employmentTypes;
            tags.push(tag);
            item.tags = tags;
        }
        else if (job.location != null)
        {
            const provider = {};
            const location = {};

            const city = {};
            city.name = job.city;
            city.code = job.std;
            location.city = city;

            const state = {};
            state.name = job.state;
            state.code = job.state;
            location.state = state;

            const country = {};
            country.name = "India";
            country.code = job.country;
            location.country = country;

            locations.push(location);
            provider.locations = locations;
            intent.provider = provider;
        }
        
        message.intent = intent;
        messagesList.push(message);
    }
    return messagesList;
}

function prepareFinanceMessage(networkInfo)
{
    const messagesList = [];
    const scholarships = networkInfo.scholarships;
    for (const scholarship of scholarships)
    {
        const message = {};
        const intent = {};
        
        if (scholarship.item != null)
        {
            const item = {};

            const descriptor = {};
            descriptor.name = scholarship.item;
            item.descriptor = descriptor;
            intent.item = item;
        }
        else if (scholarship.gender != null)
        {
            const fulfillment = {};
            const customer = {};

            const person = {};
            person.gender = scholarship.gender;
            customer.person = person;
            fulfillment.customer = customer;
            intent.fulfillment = fulfillment;
        }
        else if (scholarship.location != null)
        {
            const provider = {};
            const location = {};

            const city = {};
            city.name = scholarship.city;
            city.code = scholarship.std;
            location.city = city;

            const state = {};
            state.name = scholarship.state;
            state.code = scholarship.state;
            location.state = state;

            const country = {};
            country.name = "India";
            country.code = scholarship.country;
            location.country = country;

            locations.push(location);
            provider.locations = locations;
            intent.provider = provider;
        }
        
        message.intent = intent;
        messagesList.push(message);
    }
    return messagesList;
}

function prepareONESTUrl(domainString)
{    
    let onestURLString = null;

    switch(domainString)
    {
        case KLearning:
        {
            onestURLString =  _allUrls[KMicroServices.LearningSeekerAdapterLib];
        }
        break;
        case KJob:
        {
            onestURLString =  _allUrls[KMicroServices.JobsSeekerAdapterLib];
        }
        break;
        case KFinance:
        {        
            onestURLString =  _allUrls[KMicroServices.FinanceSeekerAdapterLib];
        }
        break;
    }
    return onestURLString;
}

function prepareMessageInfo(nlpInfo)
{
    const nlpNetworkInfo = nlpInfo.network;
    const domainString = extractDomainString(nlpNetworkInfo);
    let messagesList = null;
    let onestURLString = null;

    switch(domainString)
    {
        case KLearning:
        {
            messagesList = prepareLearningMessage(nlpNetworkInfo);    
            onestURLString =  _allUrls[KMicroServices.LearningSeekerAdapterLib];
        }
        break;
        case KJob:
        {
            messagesList = prepareJobsMessage(nlpNetworkInfo);
            onestURLString =  _allUrls[KMicroServices.JobsSeekerAdapterLib];
        }
        break;
        case KFinance:
        {
            messagesList = prepareFinanceMessage(nlpNetworkInfo);
            onestURLString =  _allUrls[KMicroServices.FinanceSeekerAdapterLib];
        }
        break;
    }
    return {domainString, messagesList, onestURLString};
}

async function callONESTNetwork(networkInfo, domainString, onestURLString, actionString)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = networkInfo;    
    
    try
    {
        const response = await Axios.post(`${onestURLString}/${actionString}/${domainString}`,
                                            requestBody, requestOptions);
        const adapterResponse = processGenericResponse(response);
        return adapterResponse;
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
    const {domainString, messagesList, onestURLString} = prepareMessageInfo(nlpInfo);

    const results = {};
    const resultsList = [];
    try
    {
        await Promise.all(messagesList.map(async (message) =>
        {
            const networkInfo = {};
            const context = {};
            context.transaction_id = nlpInfo.transactionId;
            context.message_id = nlpInfo.messageId;
            context.version = KAPIVersion;
            networkInfo.context = context;
            networkInfo.message = message;    

            const networkResponse = await callONESTNetwork(networkInfo, domainString, onestURLString,
                                                            KNetworkActions.SearchAction);
            results.results = networkResponse;
            resultsList.push(results);
        }));        
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo;
        resultsList.push(results);
    }
    response.send(resultsList);
});

_express.post("/select", async (request, response) =>
{
    const networkInfo = prepareNetworkInfo(request);
    const domainString = determineDomainString(networkInfo.context.domain);
    const onestURLString = prepareONESTUrl(domainString);
    const results = {};

    try
    {
        const responseList = await callONESTNetwork(networkInfo, domainString, onestURLString, KNetworkActions.SelectAction);
        results.results = responseList;
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