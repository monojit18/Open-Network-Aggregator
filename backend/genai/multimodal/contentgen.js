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
var MarkdownIt = require('markdown-it');
const {VertexAI} = require('@google-cloud/vertexai');
const AIPlatform = require('@google-cloud/aiplatform');
const {PredictionServiceClient} = AIPlatform.v1;
const Axios = require('axios');
const { io } = require("socket.io-client");
const {helpers} = AIPlatform;

let _express = Express();
let _server = Http.createServer(_express);
let _vertexAIClient =  null;
let _predictionServiceClient = null;
let _generativeAIModel = null;
let _markDown = null;
let _axiosAgent = null;
let _socketIOClient = null;

// const KGeminiVisionModel = "gemini-1.0-pro-vision";
const KGeminiVisionModel = "gemini-1.5-pro";

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
    CallTypeImage: "image"
}

const KStreamInfo =
{
    StreamData: "stream",
    StreamRoom: "stream-room",
    BinaryStreamRoom: "binary-stream-room",
    StreamResponseType: "stream"
}

const KStreamData = "stream";
const KStreamRoom = "stream-room";
const KBinaryStreamRoom = "binary-stream-room";

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

function prepareErrorMessage(exception)
{
    exception.code = ((exception.code == undefined) || (exception.code < 400)) ? 500 : exception.code;
    return exception;
}

function prepareGenAIEndpoint(modelId)
{
    const endpoint = `projects/${process.env.PROJECT_ID}/locations/${process.env.GENAI_LOCATION}/publishers/${process.env.GENAI_PUBLISHER}/models/${modelId}`;
    return endpoint;
}

function prepareEmbeddingParameters(request)
{
    const imageInfo = {};
    imageInfo.modelId = request.headers.modelid;    
    imageInfo.instances = request.body.instances;

    const parameters = {};
    parameters.dimension = Number(request.headers.outputdimension);
    imageInfo.parameters = parameters;
    return imageInfo;
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

    _socketIOClient.on(KStreamInfo.StreamData, (stream) =>
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

function prepareContentGenClient()
{
    const vertexAIInfo = {};
    vertexAIInfo.project = `${process.env.PROJECT_ID}`;
    vertexAIInfo.location = `${process.env.GENAI_LOCATION}`;
    _vertexAIClient = new VertexAI(vertexAIInfo);
    _markDown = new MarkdownIt();

    const modelInfo = {};
    modelInfo.model = KGeminiVisionModel;
    _generativeAIModel = _vertexAIClient.getGenerativeModel(modelInfo);

    const clientOptions = {};
    clientOptions.apiEndpoint = process.env.GENAI_API_ENDPOINT;
    _predictionServiceClient = new PredictionServiceClient(clientOptions);

    initSocketClient();
    prepareSocketClient();
}

function prepareGenAIParameters(request)
{
    const parameters = {}    
    parameters.max_output_tokens = Number(request.headers.maxtokens);
    parameters.temperature = Number(request.headers.temperature);    
    parameters.top_p = Number(request.headers.topp);    
    return parameters;
}

function prepareContentParameters(request)
{
    const contentInfo = {};
    contentInfo.sessionId = request.params.sessionId;
    contentInfo.contents = request.body.contents;
    contentInfo.parameters = prepareGenAIParameters(request);
    contentInfo.type = (request.params.type == KStreamInfo.StreamResponseType)
                                               ? KCallTypes.CallTypeStream 
                                               : KCallTypes.CallTypeImage;
    contentInfo.expectJSON = (request.query.type == "json");    
    return contentInfo;
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

async function emitImageStream(streamingResult, metadataInfo)
{
    if (streamingResult.stream != null)
    {
        for await (const buffer of streamingResult.stream)
        {
            const streamData = {};            
            streamData.buffer = buffer;
            streamData.room = metadataInfo.sessionId;            
            _socketIOClient.emit(KStreamInfo.StreamData, streamData);            
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
    socketQuery[KStreamInfo.StreamRoom] = KStreamInfo.BinaryStreamRoom;
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

async function generateContent(contentInfo)
{
    const request =
    {        
        contents: contentInfo.contents,
        generation_config: contentInfo.parameters
    };

    try
    {
        let predictionResponse = await _generativeAIModel.generateContent(request);
        const prediction = predictionResponse.response;
        
        const predictionsList = [];
        const candidatesList = prediction.candidates;
        for (const candidateInfo of candidatesList)
        {
            const prediction = {};
            prediction.safetyRatings = candidateInfo.safetyRatings;
            prediction.role = candidateInfo.content.role;

            const parts = candidateInfo.content.parts;
            for (const part of parts)
            {                                                         
                prediction.part = part;
                const responseText = part.text;

                part.formatted_content = (contentInfo.expectJSON == true)
                                         ? formatResponseText(responseText) : "";
                predictionsList.push(prediction);
            }
            return predictionsList;
        };        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function generateStreamContent(contentInfo)
{
    const request =
    {        
        contents: contentInfo.contents,
        generationConfig: contentInfo.parameters
    };

    try
    {
        const streamingResult = await _generativeAIModel.generateContentStream(request);
        await emitImageStream(streamingResult, contentInfo);

        const aggregatedResponse = await streamingResult.response;
        return aggregatedResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performContentGeneration(contentInfo)
{
    try
    {
        let predictionContent = null;
        if (contentInfo.type == KStreamInfo.StreamResponseType)
        {
            await initSocketServerConnection();
            predictionContent = await generateStreamContent(contentInfo);
        }
        else
        {
            predictionContent = await generateContent(contentInfo);
        }
        return predictionContent;        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function generateEmbeddings(contentInfo)
{    
    const parameters = helpers.toValue(contentInfo.parameters);
    const instances = [];
    for (const instanceInfo of contentInfo.instances)
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
        const responsesList = await _predictionServiceClient.predict(request);
        const predictionResponse = responsesList[0];

        const predictionsList = [];
        for (const prediction of predictionResponse.predictions)
        {
            const protoPrediction = helpers.fromValue(prediction);
            predictionsList.push(protoPrediction);
        }
        return predictionsList;
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
/**
 * @fires /genai/content/:sessionId?/:type?
 * @method POST
 * @description Generate Description from Images and Videos
 * Query Param: type = 'json' to return as a JSON response
 * Request Param: type = 'stream' to get Response a stream
 * Request Param: sessionId = value or empty; mandatory for type = 'stream' to receive stream data to this specific sessionId
 */
_express.post("/genai/content/:sessionId?/:type?", async (request, response) =>
{
    const contentInfo = prepareContentParameters(request);
    const results = {};

    try
    {
        const predictionResponse = await performContentGeneration(contentInfo);
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
 * @fires /genai/embeddings/image
 * @method POST
 * @description Generate Embeddigns from a given Image
 */
_express.post("/genai/embeddings/image", async (request, response) =>
{
    const imageInfo = prepareEmbeddingParameters(request);
    const results = {};

    try
    {
        const embeddingsResponse = await generateEmbeddings(imageInfo);
        results.results = embeddingsResponse;
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

var port = process.env.port || process.env.PORT || 6067;
_server.listen(port);

prepareContentGenClient();

console.log("Server running at http://localhost:%d", port);
