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

const KStorageLib = "storagelib";
const KVisionLib = "visionlib";
const KSpeechib = "speechlib";
const KSTranslateLib = "translatelib";
const KGenAIImagelib = "genai-imagelib";
const KVectorSearchlib = "vector-searchlib";
const KGenAITextlib = "genai-textlib";
const KGenAIMultimodallib = "genai-multimodallib";
const KDiscoveryEnginelib = "discovery-enginelib";
const KStreamResponseType = "stream";

DotEnv.config();

_express.use(Express.json
({
    extended: true,
    limit: '10mb'
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
    const code = exception.response.status;
    const message = exception.response.data.results;

    const errorInfo = {};
    errorInfo.message = message;
    errorInfo.code = ((code == undefined) || (code < 400)) ? 500 : code;;
    return errorInfo;
}

function prepareAllUrls()
{
    _allUrls[KStorageLib] = `${process.env.STORAGELIB_HOST}`;
    _allUrls[KVisionLib] = `${process.env.VISIONLIB_HOST}`;
    _allUrls[KSpeechib] = `${process.env.SPEECHLIB_HOST}`;
    _allUrls[KSTranslateLib] = `${process.env.TRANSLATELIB_HOST}`;    
    _allUrls[KGenAIImagelib] = `${process.env.GENAI_IMAGELIB_HOST}`;
    _allUrls[KVectorSearchlib] = `${process.env.GENAI_VECTORSEARCHLIB_HOST}`;
    _allUrls[KGenAITextlib] = `${process.env.GENAI_TEXTLIB_HOST}`;
    _allUrls[KGenAIMultimodallib] = `${process.env.GENAI_MULTILIB_HOST}`;
    _allUrls[KDiscoveryEnginelib] = `${process.env.DISCOVERY_ENGINELIB_HOST}`;
}

function prepareChatInfo(request)
{
    const chatInfo = {};
    chatInfo.type = request.params.type;
    chatInfo.next = request.params.next;
    chatInfo.text = request.body.text;
    chatInfo.texts = request.body.texts;
    chatInfo.histories = request.body.histories;
    chatInfo.sourceLanguage = request.body.language;
    chatInfo.targetLanguage = "en-US";
    chatInfo.prompt = request.body.prompt;
    chatInfo.aggregationInfoList = request.body.aggregation;
    chatInfo.datastoreId = request.body.datastore;
    chatInfo.sessionId = request.params.sessionId;
    chatInfo.aggregationInfoList = request.body.aggregation;
    chatInfo.endpointId = request.headers.endpointid;
    chatInfo.query = request.query;
    chatInfo.expectJSON = (request.query.type == "json");
    return chatInfo;
}

function prepareTextContentInfo(promptInfo)
{
    const contentInfo = {};
    const partInfo = {};
    partInfo.text = promptInfo.prompt;

    contentInfo.role = "user";
    contentInfo.parts = [];
    contentInfo.parts.push(partInfo);
    return [contentInfo];
}

function prepareShortHeaders(chatInfo)
{
    const genAIHeaders = {};
    genAIHeaders.temperature = 0.4;
    genAIHeaders.maxtokens = 2048;
    genAIHeaders.topp = 1.0;
    genAIHeaders.endpointid = chatInfo.endpointId;
    return genAIHeaders;
}

// function prepareLongHeaders()
// {
//     const genAIHeaders = {};
//     genAIHeaders.temperature = 0.7;
//     genAIHeaders.maxtokens = 8192;
//     genAIHeaders.topp = 1.0;
//     return genAIHeaders;
// }

function initializeAIGenie()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });

    prepareAllUrls();
}

function processTranslationResponse(response)
{
    const translateResponseList = response.data.results;
    return translateResponseList;
}

function processGenericResponse(response)
{
    const genaiResponse = response.data.results;
    return genaiResponse;
}

function prepareAggrgatedResponse(splitChatResponseList, consolidatedResponseList)
{
    for (const chatResponseList of splitChatResponseList)
    {
        for (const chatResponse of chatResponseList)
        {
            const chatMessagesList = chatResponse.conversation.messages;
            const latestChatMessage = chatMessagesList[chatMessagesList.length - 1];
            if (latestChatMessage.message == "reply")
            {
                const aggregate = {};
                aggregate.original_response = consolidatedResponseList[0].original_response;
                aggregate.translatedContent = consolidatedResponseList[0].translatedContent;
                latestChatMessage.reply.aggregate = aggregate;
            }
        }
    }
}

function extractSummaryText(aggregatedResponsesList)
{
    const summaryTextsList = [];

    try
    {
        for (const chatResponseList of aggregatedResponsesList)
        {
            for (const chatResponse of chatResponseList)
            {
                const chatMessagesList = chatResponse.conversation.messages;
                const chatMessage = chatMessagesList[chatMessagesList.length -1];
                if (chatMessage.message == "reply")
                {
                    const summary = chatMessage.reply.summary;
                    summaryTextsList.push(summary.summaryText);
                }                      
            };
        }
        return summaryTextsList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function prepareDatastoreResponse(genaiResponse, chatInfo)
{
    try
    {
        const predictionsList = [];
        const candidatesList = genaiResponse.candidates;        
        for (const candidateInfo of candidatesList)
        {
            const prediction = {};
            prediction.safetyRatings = candidateInfo.safetyRatings;
            prediction.role = candidateInfo.content.role;            

            const parts = candidateInfo.content.parts;
            for (const part of parts)
            {                
                if (part.text != null)
                {
                    const translatedContent = await translateAIResponse(part.text,
                                                                        chatInfo.sourceLanguage);
                    part.translated_text = translatedContent;
                }                                           
                prediction.part = part;
            }
            predictionsList.push(prediction);
        };
        return predictionsList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function preaprePredictionResponse(genaiResponseList, chatInfo)
{
    try
    {
        const predictionsList = [];
        for (const prediction of genaiResponseList)
        {
            if (prediction.original_response != null)
            {
                const translatedContent = await translateAIResponse(prediction.original_response,
                                                                    chatInfo.sourceLanguage);
                prediction.original_translatedContent = translatedContent;
            }

            if ((prediction.formatted_response != null) && (prediction.formatted_response != ''))
            {
                const translatedContent = await translateAIResponse(prediction.formatted_response,
                                                                    chatInfo.sourceLanguage);
                prediction.formatted_translatedContent = translatedContent;
            }
            predictionsList.push(prediction);
        };
        return predictionsList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function prepareChatSessionResponse(chatResponsesList, chatInfo)
{
    try
    {        
        for (const chatResponse of chatResponsesList)
        {
            const chatMessagesList = chatResponse.conversation.messages;
            for (const chatMessage of chatMessagesList)
            {
                if (chatMessage.message == "reply")
                {
                    const summary = chatMessage.reply.summary;
                    const translatedContent = await translateAIResponse(summary.summaryText,
                                                                        chatInfo.sourceLanguage);
                    summary.translatedContent = translatedContent;
                }
            }                        
        };        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function prepareConsolidatedResponse(chatResponsesList, chatInfo)
{
    try
    {        
        for (const chatResponse of chatResponsesList)
        {            
            const translatedContent = await translateAIResponse(chatResponse.original_response,
                                                                chatInfo.sourceLanguage);
            chatResponse.translatedContent = translatedContent;
        };
        return chatResponsesList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function translateAIResponse(originalContent, targetLanguage)
{
    const chatInfo = {};
    chatInfo.text = originalContent;
    chatInfo.sourceLanguage = "en-US";
    chatInfo.targetLanguage = targetLanguage;

    let translatedContent = "";
    if (chatInfo.targetLanguage != "en-US")
    {
        const translatedResponse = await translateText(chatInfo);
        translatedContent = translatedResponse.target;        
    }
    return translatedContent;
}

async function translateText(chatInfo)
{
    const requestOptions= {};
    requestOptions.httpsAgent = _axiosAgent;
    
    requestOptions.headers = {};
    requestOptions.headers =
    {        
       "content-type": "application/json",
       "mime-type": "text/plain"
    }

    const requestBody = [];
    requestBody.push(chatInfo.text);

    try
    {
        const response = await Axios.post(`${_allUrls[KSTranslateLib]}/translate/text?src=${chatInfo.sourceLanguage}&trg=${chatInfo.targetLanguage}`,
                                            requestBody, requestOptions);
        const translateResponseList = processTranslationResponse(response);
        return translateResponseList[0];        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function getChatResponse(translatedResponse, chatInfo)
{
    const requestOptions= {};
    requestOptions.httpsAgent = _axiosAgent;
    requestOptions.params = chatInfo.query;

    const requestBody = {};
    const contentInfo = {};
    if ((chatInfo.datastoreId != null) || (chatInfo.endpointId != null))
    {
        contentInfo.role = "user";
        contentInfo.parts = [];
        const part  = {};
        part.text = `${chatInfo.prompt}\n\n${translatedResponse.target}`;
        contentInfo.parts.push(part);
        requestBody.datastore = chatInfo.datastoreId;
    }    
    else
    {
        requestBody.histories = chatInfo.histories;
        contentInfo.text = `${chatInfo.prompt}\n\n${translatedResponse.target}`;        
    }

    requestBody.contents = [contentInfo];
    const genAIHeaders = prepareShortHeaders(chatInfo);
    requestOptions.headers = genAIHeaders;

    try
    {
        let urlPart = null;
        if (chatInfo.endpointId != null)
        {
            urlPart = `${_allUrls[KGenAITextlib]}/genai/endpoint/text`;
        }
        else
        {
            urlPart = (chatInfo.type == KStreamResponseType)
            ? `${_allUrls[KGenAITextlib]}/genai/chat/${chatInfo.sessionId}/${KStreamResponseType}`
            : `${_allUrls[KGenAITextlib]}/genai/chat`;
        }
        
        const response = await Axios.post(urlPart, requestBody, requestOptions);
        const genaiResponseList = processGenericResponse(response);
        
        let predictionResponse = null;
        if (chatInfo.datastoreId != null)
        {
            predictionResponse = prepareDatastoreResponse(genaiResponseList, chatInfo);
            return predictionResponse;
        }

        if (chatInfo.sourceLanguage != "en-US")
        {
            predictionResponse = preaprePredictionResponse(genaiResponseList, chatInfo);
            return predictionResponse;
        }
        return genaiResponseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function createSession(chatInfo)
{
    const requestOptions= {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};
    requestBody.datastore = chatInfo.datastoreId;

    try
    {
        const response = await Axios.post(`${_allUrls[KDiscoveryEnginelib]}/agent/conversation/create`,
                                                requestBody, requestOptions);
        const sessionResponse = processGenericResponse(response);        
        return sessionResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function listSessions(chatInfo)
{
    const requestOptions= {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};    
    requestBody.datastore = chatInfo.datastoreId;
    
    try
    {
        const response = await Axios.post(`${_allUrls[KDiscoveryEnginelib]}/agent/conversations/list`,
                                                requestBody, requestOptions);
        const sessionListResponse = processGenericResponse(response);        
        return sessionListResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performGroundedChat(translatedResponse, chatInfo)
{
    const requestOptions= {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};
    requestBody.datastore = chatInfo.datastoreId;
    requestBody.prompt = chatInfo.prompt;
    requestBody.text = `${translatedResponse.target}`;

    const urlPart = (chatInfo.sessionId != null)
                    ? `/agent/conversations/${chatInfo.sessionId}/chat`
                    : `/agent/conversations/chat`;
    
    try
    {
        const response = await Axios.post(`${_allUrls[KDiscoveryEnginelib]}${urlPart}`,
                                                requestBody, requestOptions);
        const chatResponsesList = processGenericResponse(response);
        if (chatInfo.sourceLanguage != "en-US")        
            await prepareChatSessionResponse(chatResponsesList, chatInfo);

        return chatResponsesList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performConsolidatedChat(consolidateChatInfo, chatInfo)
{
    const requestOptions= {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};
    const promptInfo = {};
    promptInfo.prompt = `${consolidateChatInfo.prompt}`;

    for (const text of consolidateChatInfo.texts)
    {
        promptInfo.prompt += `\n${text}`
    }
    
    const contentsList = prepareTextContentInfo(promptInfo);
    requestBody.contents = contentsList;

    const genAIHeaders = prepareShortHeaders(chatInfo);
    requestOptions.headers = genAIHeaders;
    
    try
    {
        const urlPart = (chatInfo.type == KStreamResponseType)
                    ? `${_allUrls[KGenAITextlib]}/genai/text/${chatInfo.sessionId}/${KStreamResponseType}`
                    : `${_allUrls[KGenAITextlib]}/genai/text`;
        
        const response = await Axios.post(urlPart, requestBody, requestOptions);
        let chatResponsesList = processGenericResponse(response);
        if (consolidateChatInfo.sourceLanguage != "en-US")
        {
            chatResponsesList = await prepareConsolidatedResponse(chatResponsesList, chatInfo);
        }
        return chatResponsesList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performAggregatedChat(chatInfo)
{
    const requestOptions= {};
    requestOptions.httpsAgent = _axiosAgent;

    const consolidateChatInfo = {};
    consolidateChatInfo.prompt = `${chatInfo.prompt}`;
    consolidateChatInfo.sourceLanguage = chatInfo.sourceLanguage;

    const splitChatResponseList = [];

    try
    {
        await Promise.all(chatInfo.aggregationInfoList.map(async (aggregationInfo) =>
        {
            const aggregationChatInfo = {};
            aggregationChatInfo.datastoreId = aggregationInfo.datastore;
            aggregationChatInfo.sessionId = aggregationInfo.sessionId;
            aggregationChatInfo.prompt = aggregationInfo.prompt;
            aggregationChatInfo.text = aggregationInfo.text;
            aggregationChatInfo.sourceLanguage = aggregationInfo.language;
            aggregationChatInfo.targetLanguage = "en-US";

            let translatedResponse = {};
            if (aggregationChatInfo.sourceLanguage == "en-US")
            {
                translatedResponse.source = `${aggregationChatInfo.text}`;
                translatedResponse.target = `${aggregationChatInfo.text}`;
            }
            else
                translatedResponse = await translateText(aggregationChatInfo);

            const splitChatResponse = await performGroundedChat(translatedResponse,
                                                                aggregationChatInfo);
            splitChatResponseList.push(splitChatResponse);
        }));

        const summaryTextsList = extractSummaryText(splitChatResponseList);
        consolidateChatInfo.texts = summaryTextsList;

        const consolidatedResponseList = await performConsolidatedChat(consolidateChatInfo,
                                                                       chatInfo);
        prepareAggrgatedResponse(splitChatResponseList, consolidatedResponseList);
        return splitChatResponseList;
    }
    catch(exception)
    {
        throw exception;
    }    
}

async function deleteSessions(chatInfo)
{
    const requestOptions= {};
    requestOptions.httpsAgent = _axiosAgent;

    const requestBody = {};
    requestBody.data = {};
    requestBody.data.datastore = chatInfo.datastoreId;

    const urlPart = (chatInfo.sessionId != null)
                    ? `/agent/conversations/${chatInfo.sessionId}/delete`
                    : `/agent/conversations/delete`;

    try
    {
        const response = await Axios.delete(`${_allUrls[KDiscoveryEnginelib]}${urlPart}`,
                                                requestBody, requestOptions);
        const sessionResponse = processGenericResponse(response);        
        return sessionResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performChatAction(chatInfo)
{
    try
    {
        let translateResponse = {};
        if (chatInfo.sourceLanguage == "en-US")
        {
            translateResponse.source = `${chatInfo.text}`;
            translateResponse.target = `${chatInfo.text}`;
        }
        else
            translateResponse = await translateText(chatInfo);
        
        const genAIResponse = await getChatResponse(translateResponse, chatInfo);
        return genAIResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performCreateSession(chatInfo)
{
    try
    {
        const createResponse = await createSession(chatInfo);
        return createResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performListSessions(chatInfo)
{
    try
    {
        const listResponse = await listSessions(chatInfo);
        return listResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performChatSessions(chatInfo)
{
    try
    {
        let translateResponse = {};
        if (chatInfo.sourceLanguage == "en-US")
        {
            translateResponse.source = `${chatInfo.text}`;
            translateResponse.target = `${chatInfo.text}`;
        }
        else
            translateResponse = await translateText(chatInfo);

        let chatResponse = null;
        if (chatInfo.next == "consolidate")
        {
            const consolidateChatInfo = {};
            consolidateChatInfo.prompt = chatInfo.prompt;
            consolidateChatInfo.texts = chatInfo.texts;
            chatResponse = await performConsolidatedChat(consolidateChatInfo,
                                                         chatInfo);
        }
        else
        {
            chatResponse = await performGroundedChat(translateResponse, chatInfo);
        }            
        return chatResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performDeleteSessions(chatInfo)
{
    try
    {
        const deleteResponse = await deleteSessions(chatInfo);
        return deleteResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
/**
 * @fires /chat/:sessionId?/:type?
 * @method POST
 * @description Performs multi-turn Chat Q&A from text prompts
 * Request Param: type = 'stream' or empty
 * Request Param: sessionId = value or empty; mandatory for type = 'stream' to receive stream data to this specific sessionId
 */
_express.post("/chat/:sessionId?/:type?", async (request, response) =>
{
    const chatInfo = prepareChatInfo(request);
    const results = {};

    try
    {
        const responseList = await performChatAction(chatInfo);
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

/**
 * @fires /chat/endpoint/content
 * @method POST
 * @description Performs multi-turn Chat Q&A from text prompts based on a custom model
 */
_express.post("/chat/endpoint/content", async (request, response) =>
{
    const chatInfo = prepareChatInfo(request);
    const results = {};

    try
    {
        const responseList = await performChatAction(chatInfo);
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

/**
 * @fires /agent/session/create
 * @method POST
 * @description Creates a new chat session for the Agent and for the selected Data Store. This ensures multi-turn chat
 */
_express.post("/agent/session/create", async (request, response) =>
{
    const chatInfo = prepareChatInfo(request);
    const results = {};

    try
    {
        const responseList = await performCreateSession(chatInfo);
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

/**
 * @fires /agent/sessions/list
 * @method POST
 * @description Lists all chat sessions of the Agent for the selected Data Store
 */
_express.post("/agent/sessions/list", async (request, response) =>
{
    const chatInfo = prepareChatInfo(request);
    const results = {};

    try
    {
        const responseList = await performListSessions(chatInfo);
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

/**
 * @fires /agent/sessions/:sessionId?/chat/:next?/:type?
 * @method POST
 * @description Performs advanced LLM search with follow-ups and answers
 * Can consolidate search results from two diffrent data sources. This is more like a conversation but with a flavour of search
 * Request Param: type = 'stream' or empty
 * Request Param: next = 'consolidate' or empty
 * Request Param: sessionId = value or empty; mandatory for type = 'stream' to receive stream data to this specific sessionId
 */
_express.post("/agent/sessions/:sessionId?/chat/:next?/:type?", async (request, response) =>
{
    const chatInfo = prepareChatInfo(request);
    const results = {};

    try
    {
        const responseList = await performChatSessions(chatInfo);
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

/**
 * @fires /agent/chat/aggregate/:sessionId?/:type?
 * @method POST
 * @description Performs advanced LLM search with follow ups and answers. This is more like a conversation but with a flavour of search
 * Request Param: type = 'stream' or empty. Response can be streamed or non-streamed
 * Request Param: sessionId = value or empty; mandatory for type = 'stream' to receive stream data to this specific sessionId
 */
 _express.post("/agent/chat/aggregate/:sessionId?/:type?", async (request, response) =>
 {
     const chatInfo = prepareChatInfo(request);
     const results = {};
 
     try
     {            
         const responseList = await performAggregatedChat(chatInfo);
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

/**
 * @fires /agent/sessions/:sessionId?/delete
 * @method DELETE
 * @description Deletes chat session(s) of the Agent for the selected Data Store
 * Request Param: sessionId = value or empty; empty => delete all sessions
 */
_express.delete("/agent/sessions/:sessionId?/delete", async (request, response) =>
{
    const chatInfo = prepareChatInfo(request);
    const results = {};

    try
    {
        const responseList = await performDeleteSessions(chatInfo);
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

var port = process.env.port || process.env.PORT || 6069;
_server.listen(port);

initializeAIGenie();

console.log("Server running at http://localhost:%d", port);
