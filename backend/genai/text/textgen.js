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
const MarkdownIt = require('markdown-it');
const AIPlatform = require('@google-cloud/aiplatform');
const {GoogleAuth} = require('google-auth-library');
const {VertexAI} = require('@google-cloud/vertexai');
const {PredictionServiceClient} = AIPlatform.v1;
const {helpers} = AIPlatform;
const Axios = require('axios');
const { io } = require("socket.io-client");

let _express = Express();
let _server = Http.createServer(_express);
let _vertexAIClient =  null;
let _generativeAIModel = null;
let _generativeAIPreviewModel = null;
let _predictionServiceClient = null;
let _markDown = null;
let _axiosAgent = null;
let _socketIOClient = null;

const KSocketEvents =
{
    ConnectionEvent: "connect",
    ConnectedEvent: "connected",
    EndConnectionEvent: "end",
    DisconnectEvent: "disconnect"
}

const KCallTypes =
{
    CallTypeStream: "stream",
    CallTypeText: "text",
    CallTypeChat: "chat",
    CallTypeCode: "code"
}

const KGeminiTextModel = "gemini-1.5-pro";
const KStreamRoom = "stream-room";
const KStreamData = "stream";
const KTextStreamRoom = "text-stream-room";
const KStreamResponseType = "stream";
const KGoogleAuthScope = "https://www.googleapis.com/auth/cloud-platform";

DotEnv.config();

_express.use(Express.json
({
    extended: true
}));
    
_express.use(Express.urlencoded
({
    extended: true
}));

function prepareErrorMessage(exception)
{
    exception.code = ((exception.code == undefined) || (exception.code < 400)) ? 500 : exception.code;
    return exception;
}

function prepareRESTErrorMessage(exception)
{
    exception.code = ((exception.response.data.error?.code == undefined)
                        || (exception.response.data.error?.code < 400))
                        ? 500 : exception.response.data.error?.code;
    exception.message = exception.response.data.error?.message;
    return exception;
}

function prepareVertexAIDataStoreId(datastoreId)
{
    const fullDatastoreId = `projects/${process.env.PROJECT_ID}/locations/global/collections/default_collection/dataStores/${datastoreId}`;
    return fullDatastoreId;
}

function prepareGenAIEndpoint(modelId)
{
    const endpoint = `projects/${process.env.PROJECT_ID}/locations/${process.env.GENAI_LOCATION}/publishers/${process.env.GENAI_PUBLISHER}/models/${modelId}`;
    return endpoint;
}

function prepareCustomModelEndpoint(endpointId)
{
    const endpoint = `projects/${process.env.MODEL_PROJECT_ID}/locations/${process.env.MODEL_LOCATION}/endpoints/${endpointId}`;
    return endpoint;
}

function prepareSocketClient()
{
    _socketIOClient.on(KSocketEvents.ConnectionEvent, () =>
    {
        console.log(_socketIOClient.id);
    });

    _socketIOClient.on(KSocketEvents.Connectedvent, (message) =>
    {
        console.log(message);
    });

    _socketIOClient.on(KStreamData, (stream) =>
    {
        console.log(stream);
    });

    _socketIOClient.on(KSocketEvents.EndConnectionEvent, (message) =>
    {
        console.log(message);
    });

    _socketIOClient.on(KSocketEvents.DisconnectEvent, () =>
    {
        console.log(_socketIOClient.connected);
    });
}

function prepareTextGenClient()
{
    const vertexAIInfo = {};
    vertexAIInfo.project = `${process.env.PROJECT_ID}`;
    vertexAIInfo.location = `${process.env.GENAI_LOCATION}`;
    _vertexAIClient = new VertexAI(vertexAIInfo);
    _markDown = new MarkdownIt();
    
    const modelInfo = {};
    modelInfo.model = KGeminiTextModel;

    _generativeAIModel = _vertexAIClient.getGenerativeModel(modelInfo);
    _generativeAIPreviewModel = _vertexAIClient.preview.getGenerativeModel(modelInfo);

    const clientOptions = {};
    clientOptions.apiEndpoint = process.env.GENAI_API_ENDPOINT;
    _predictionServiceClient = new PredictionServiceClient(clientOptions);

    initSocketClient();
    prepareSocketClient();
}

function prepareGenAIParameters(request)
{
    const parameters = {}
    parameters.maxOutputTokens = Number(request.headers.maxtokens);
    parameters.temperature = Number(request.headers.temperature);
    parameters.topP = Number(request.headers.topp);

    if (request.headers.topk != null)
        parameters.topK = Number(request.headers.topk);

    return parameters;
}

function prepareTextParameters(request)
{
    const textInfo = {};
    textInfo.sessionId = request.params.sessionId;
    textInfo.contents = request.body.contents;
    textInfo.parameters = prepareGenAIParameters(request);
    textInfo.type = (request.params.type == KStreamResponseType) ? KCallTypes.CallTypeStream
                                                                 : KCallTypes.CallTypeText;
    textInfo.expectJSON = (request.query.type == "json");
    return textInfo;
}

function prepareChatParameters(request)
{
    const chatInfo = {};
    chatInfo.sessionId = request.params.sessionId;
    chatInfo.resultCount = request.body.resultcount;
    chatInfo.histories = request.body.histories;
    chatInfo.contents = request.body.contents;
    chatInfo.datastoreId = request.body.datastore;
    chatInfo.parameters = prepareGenAIParameters(request);
    chatInfo.type = (request.params.type == KStreamResponseType) ? KCallTypes.CallTypeStream
                                                                 : KCallTypes.CallTypeChat;
    return chatInfo;
}

function prepareCodeParameters(request)
{
    const codeInfo = {};
    codeInfo.sessionId = request.params.sessionId;
    codeInfo.contents = request.body.contents;
    codeInfo.parameters = prepareGenAIParameters(request);
    codeInfo.type = (request.params.type == KStreamResponseType) ? KCallTypes.CallTypeStream
                                                                 : KCallTypes.CallTypeCode;
    return codeInfo;
}

function prepareMedLMParameters(request)
{
    const medLMInfo = {};
    medLMInfo.modelId = request.headers.modelid;
    medLMInfo.instances = request.body.instances;
    medLMInfo.parameters = prepareGenAIParameters(request);    
    return medLMInfo;
}

function prepareEmbeddingParameters(request)
{
    const embeddingInfo = {};
    embeddingInfo.modelId = request.headers.modelid;
    embeddingInfo.instances = request.body.instances;

    embeddingInfo.parameters = {};
    const outputDimensionality = Number(request.headers.outputdimension);
    embeddingInfo.parameters.outputDimensionality = outputDimensionality;
    return embeddingInfo;

}

function prepareEndpointParameters(request)
{
    const endpointInfo = {};    
    endpointInfo.contents = request.body.contents;
    endpointInfo.endpointId = request.headers.endpointid;
    endpointInfo.parameters = prepareGenAIParameters(request);
    endpointInfo.expectJSON = (request.query.type == "json");
    return endpointInfo;

}

function preaprePredictionResponse(prediction, expectJSON)
{
    try
    {
        const predictionsList = [];
        const candidatesList = prediction.candidates;        
        candidatesList.forEach((candidateInfo) =>
        {
            const prediction = {};
            prediction.safetyRatings = candidateInfo.safetyRatings;
            prediction.role = candidateInfo.content.role;

            const parts = candidateInfo.content.parts;
            parts.forEach((part) =>
            {
                const responseText = part.text;
                const formattedContent = (expectJSON == true) ? formatResponseText(responseText): "";
                prediction.original_response = responseText;
                prediction.formatted_response = formattedContent;
                predictionsList.push(prediction);
            })
        });
        return predictionsList;
    }
    catch(exception)
    {
        throw exception;
    }
}

function prepareChatTools(chatInfo)
{
    const chatTools = [];
    const vertexAIRetrievalTool = {};
    vertexAIRetrievalTool.retrieval = {};
    vertexAIRetrievalTool.retrieval.vertexAiSearch = {};
    vertexAIRetrievalTool.retrieval.disableAttribution = false;
    vertexAIRetrievalTool.retrieval.vertexAiSearch.datastore = prepareVertexAIDataStoreId(chatInfo.datastoreId);
    chatTools.push(vertexAIRetrievalTool);
    return chatTools;
}

function formatResponseText(markedDownContent)
{
    let exceptionContent = null;

    try
    {
        const markedDownIndex = markedDownContent.indexOf("```");
        if ((markedDownIndex == -1))
        {
            let formattedContent = markedDownContent.trim();
            exceptionContent = formattedContent;
            return JSON.parse(formattedContent);
        }            

        const markDownList = _markDown.parse(markedDownContent);
        let predictionContent = null;
        markDownList.forEach ((markDown) =>
        {
            if (markDown.content != '')
            {                
                exceptionContent = markDown.content;
                predictionContent = JSON.parse(markDown.content);
                return;
            }
        });
        return predictionContent;
    }
    catch(exception)
    {        
        exceptionContent = exceptionContent.replaceAll("{\n", "{");
        exceptionContent = exceptionContent.replaceAll("\n}", "}");
        exceptionContent = exceptionContent.replaceAll("}\n", "}");
        exceptionContent = exceptionContent.replaceAll("\n", "\\n");

        const predictionContent = JSON.parse(exceptionContent);
        return predictionContent;        
    }
}

async function performAuthentication()
{
    try
    {
        const authScope = {};
        authScope.scopes = KGoogleAuthScope;
        const gAuth = new GoogleAuth(authScope);
        const accessToken = await gAuth.getAccessToken();
        return accessToken;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function emitTextStream(streamingResult, metadataInfo)
{
    if (streamingResult.stream != null)
    {
        for await (const buffer of streamingResult.stream)
        {
            const streamData = {};
            streamData.buffer = buffer;
            streamData.room = metadataInfo.sessionId;
            _socketIOClient.emit(KStreamData, streamData);
        }
    }
}

async function initSocketClient()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
    
    const socketQuery = {};
    socketQuery[KStreamRoom] = KTextStreamRoom;
    _socketIOClient = io(`${process.env.WEBSOCK_STREAMER_HTTP_HOST}`,
    {
        query: socketQuery
    });

    await initSocketServerConnection();
}

async function initSocketServerConnection()
{
    const requestOptions= {};
    requestOptions.httpsAgent = _axiosAgent;
    const requestBody = {};

    try
    {
        const socketResponse = await Axios.post(`${process.env.WEBSOCK_STREAMER_HTTP_HOST}/init`,
                                                requestBody, requestOptions);
        console.log(socketResponse);
        return socketResponse;
    }
    catch(exception)
    {
        console.log(exception.message);
        // throw exception;
    }
}

async function performDatastoreAsync(chatInfo)
{
    try
    {
        _generativeAIPreviewModel.generationConfig = chatInfo.parameters;
        const chatTools = prepareChatTools(chatInfo);

        const chatRequest = {};
        chatRequest.contents = chatInfo.contents;
        chatRequest.tools = chatTools;
        
        if (chatInfo.type == KStreamResponseType)
        {            
            const streamingResult = await _generativeAIPreviewModel.generateContentStream(chatRequest);
            await emitTextStream(streamingResult, chatInfo);

            const predictionContent = await streamingResult.response;            
            return predictionContent;
        }
        else
        {
            const chatResponse = await _generativeAIPreviewModel.generateContent(chatRequest);
            const predictionContent = chatResponse.response;
            return predictionContent;
        }
        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function generateEmbeddingContent(contentInfo)
{
    const parameters = helpers.toValue(contentInfo.parameters);
    const instances = [];
    for (instanceInfo of contentInfo.instances)
    {
        const protoInstance = helpers.toValue(instanceInfo);
        instances.push(protoInstance);
    }
    
    const request =
    {
        endpoint: prepareGenAIEndpoint(contentInfo.modelId),
        parameters: parameters,
        instances: instances
    };

    try
    {
        let responsesList = await _predictionServiceClient.predict(request);
        const predictionResponse = responsesList[0];
        const prediction = helpers.fromValue(predictionResponse.predictions[0]);        
        return prediction;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function generateCustomContent(endpointInfo)
{
    try
    {
        const accessToken = await performAuthentication();        
        const endpointURL = `https://${process.env.GENAI_LOCATION}-aiplatform.googleapis.com/v1/${prepareCustomModelEndpoint(endpointInfo.endpointId)}:generateContent`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        };

        const requestBody = {};
        requestBody.contents = endpointInfo.contents;

        const endpointResult = await Axios.post(`${endpointURL}`, requestBody, requestOptions);
        const predictionContent = preaprePredictionResponse(endpointResult.data,
                                                            endpointInfo.expectJSON);
        return predictionContent;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function generateContent(textInfo)
{
    const request =
    {
        contents: textInfo.contents,
        generationConfig: textInfo.parameters
    };

    try
    {
        let textResponse = await _generativeAIModel.generateContent(request);
        const predictionContent = preaprePredictionResponse(textResponse.response,
                                                            textInfo.expectJSON);
        return predictionContent;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function generateStreamContent(textInfo)
{
    const request =
    {
        contents: textInfo.contents,
        generationConfig: textInfo.parameters
    };

    try
    {
        const streamingResult = await _generativeAIModel.generateContentStream(request);
        await emitTextStream(streamingResult, textInfo);
        const textResponse = await streamingResult.response;
                
        const predictionContent = preaprePredictionResponse(textResponse, textInfo.expectJSON);
        return predictionContent;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performContentGeneration(textInfo)
{
    try
    {
        let predictionContent = null;
        if (textInfo.type == KStreamResponseType)
        {
            await initSocketServerConnection();
            predictionContent = await generateStreamContent(textInfo);
        }
        else
        {
            predictionContent = await generateContent(textInfo);
        }
        return predictionContent;        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function generateChatContent(chatInfo)
{
    let predictionContent = null;

    try
    {
        if (chatInfo.datastoreId != null)
        {
            predictionContent = performDatastoreAsync(chatInfo);
            return predictionContent;
        }

        const chatRequest =
        {
            candidateCount: chatInfo.resultCount,
            generationConfig: chatInfo.parameters,
            history: chatInfo.histories            
        };

        let chatRef = _generativeAIModel.startChat(chatRequest);
        const chatResponse = await chatRef.sendMessage(chatInfo.contents);
        predictionContent = preaprePredictionResponse(chatResponse.response, false);
        return predictionContent;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function generateStreamChatContent(chatInfo)
{
    let predictionContent = null;

    try
    {
        if (chatInfo.datastoreId != null)
        {
            predictionContent = performDatastoreAsync(chatInfo);
            return predictionContent;
        }

        const chatRequest =
        {
            candidateCount: chatInfo.resultCount,
            generationConfig: chatInfo.parameters,
            history: chatInfo.histories            
        };

        let chatRef = _generativeAIModel.startChat(chatRequest);
        const streamingResult = await chatRef.sendMessageStream(chatInfo.contents);
        await emitTextStream(streamingResult, chatInfo);

        const chatResponse = await streamingResult.response;
        predictionContent = preaprePredictionResponse(chatResponse, false);
        return predictionContent;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performChatContentGeneration(chatInfo)
{
    try
    {
        let predictionContent = null;
        if (chatInfo.type == KStreamResponseType)
        {
            await initSocketServerConnection();
            predictionContent = await generateStreamChatContent(chatInfo);
        }
        else
        {
            predictionContent = await generateChatContent(chatInfo);
        }
        return predictionContent;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function generateCodeContent(codeInfo)
{
    const codeRequest =
    {
        contents: codeInfo.contents,
        generationConfig: codeInfo.parameters
    };

    try
    {
        let codeResponse = await _generativeAIModel.generateContent(codeRequest);
        const predictionContent = preaprePredictionResponse(codeResponse.response, false);
        return predictionContent;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function generateMedLMContent(medLMInfo)
{
    try
    {
        const accessToken = await performAuthentication();        
        const medLMURL = `https://${process.env.GENAI_LOCATION}-aiplatform.googleapis.com/v1/${prepareGenAIEndpoint(medLMInfo.modelId)}:predict`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        };

        const requestBody = medLMInfo.instances;
        const medLMResult = await Axios.post(`${medLMURL}`, requestBody, requestOptions);
        const medLMContent = medLMResult.data;
        return medLMContent;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function generateStreamCodeContent(codeInfo)
{
    const codeRequest =
    {
        contents: codeInfo.contents,
        generationConfig: codeInfo.parameters
    };

    try
    {
        const streamingResult = await _generativeAIModel.generateContentStream(codeRequest);
        await emitTextStream(streamingResult, codeInfo);

        const codeResponse = await streamingResult.response;
        const predictionContent = preaprePredictionResponse(codeResponse, false);
        return predictionContent;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performCodeContentGeneration(codeInfo)
{
    try
    {
        let predictionContent = null;
        if (codeInfo.type == KStreamResponseType)
        {
            await initSocketServerConnection();
            predictionContent = await generateStreamCodeContent(codeInfo);
        }
        else
        {
            predictionContent = await generateCodeContent(codeInfo);
        }
        return predictionContent;        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performMedLMTextGeneration(medLMInfo)
{
    try
    {
        const medLMContent = await generateMedLMContent(medLMInfo);        
        return medLMContent;        
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
/**
 * @fires /
 * @method GET
 * @description Service Healthcheck
 */
_express.get("/", async (request, response) =>
{
    const results = {};
    response.status(200).send(results);
});

/**
 * @fires /genai/text/:sessionId?/:type?
 * @method POST
 * @description Generate Text from Prompts
 * Query Param: type = 'json' to return as a JSON response
 * Request Param: type = 'stream' to get Response a stream
 * Request Param: sessionId = value or empty; mandatory for type = 'stream' to receive stream data to this specific sessionId
 */
_express.post("/genai/text/:sessionId?/:type?", async (request, response) =>
{
    const textInfo = prepareTextParameters(request);
    const results = {};

    try
    {
        const predictionResponse = await performContentGeneration(textInfo);        
        results.results = predictionResponse;
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
 * @fires /genai/endpoint/text
 * @method POST
 * @description Generate Text from Prompts with reference to custom model
 */
_express.post("/genai/endpoint/text", async (request, response) =>
{
    const endpointInfo = prepareEndpointParameters(request);
    const results = {};

    try
    {
        const predictionResponse = await generateCustomContent(endpointInfo);        
        results.results = predictionResponse;
        response.send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareRESTErrorMessage(exception);        
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

 /**
 * @fires /genai/embeddings/text
 * @method POST
 * @description Generate embeddigns from a given Text
 */
_express.post("/genai/embeddings/text", async (request, response) =>
{
    const embeddingInfo = prepareEmbeddingParameters(request);
    const results = {};

    try
    {
        const predictionResponse = await generateEmbeddingContent(embeddingInfo);
        results.results = predictionResponse;
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
 * @fires /genai/chat/:sessionId?/:type?
 * @method POST
 * @description Generate Chat from Prompts
 * Query Param: type = 'json' to return as a JSON response
 * Request Param: type = 'stream' to get Response a stream
 * Request Param: sessionId = value or empty; mandatory for type = 'stream' to receive stream data to this specific sessionId
 */
_express.post("/genai/chat/:sessionId?/:type?", async (request, response) =>
{
    const chatInfo = prepareChatParameters(request);
    const results = {};

    try
    {
        const predictionResponse = await performChatContentGeneration(chatInfo);
        results.results = predictionResponse;
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
 * @fires /genai/code/:sessionId?/:type?
 * @method POST
 * @description Generate Code from  Prompts
 * Query Param: type = 'json' to return as a JSON response
 * Request Param: type = 'stream' to get Response a stream
 * Request Param: sessionId = value or empty; mandatory for type = 'stream' to receive stream data to this specific sessionId
 */
_express.post("/genai/code/:sessionId?/:type?", async (request, response) =>
{
    const codeInfo = prepareCodeParameters(request);
    const results = {};

    try
    {
        const predictionResponse = await performCodeContentGeneration(codeInfo);
        results.results = predictionResponse;
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
 * @fires /genai/medlm/chat
 * @method POST
 * @description Generate Medical suggestions from  Prompts
 */
_express.post("/genai/medlm/chat", async (request, response) =>
{
    const medLMInfo = prepareMedLMParameters(request);
    const results = {};

    try
    {
        const medLMResponse = await performMedLMTextGeneration(medLMInfo);
        results.results = medLMResponse;
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

var port = process.env.port || process.env.PORT || 6065;
_server.listen(port);

prepareTextGenClient();

console.log("Server running at http://localhost:%d", port);
