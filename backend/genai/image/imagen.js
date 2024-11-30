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
const AIPlatform = require('@google-cloud/aiplatform');
const {GoogleAuth} = require('google-auth-library');
const {PredictionServiceClient} = AIPlatform.v1;
const {JobServiceClient} = AIPlatform.v1;
const {helpers} = AIPlatform;

let _express = Express();
let _server = Http.createServer(_express);
let _predictionServiceClient = null;
let _axiosAgent = null;

const KAllowAdults = "allow_adult";
const KDoNotAllow = "dont_allow";
const KEditModeInsert = "inpainting-insert";
const KEditModeRemove = "inpainting-remove";
const KEditOutpaint = "outpainting";
const KEditProductImage = "product-image";
const KEditTypeSemantic = "semantic";
const KSafetyBlockFew = "block_few";
const KSafetyBlockSome = "block_some";
const KSafetyBlockMost = "block_most";

DotEnv.config();

const KGoogleAuthScope = "https://www.googleapis.com/auth/cloud-platform";

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

function initializeAxios()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
}

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

function prepareCustomModelEndpoint(endpointId)
{
    const endpoint = `projects/${process.env.MODEL_PROJECT_ID}/locations/${process.env.MODEL_LOCATION}/endpoints/${endpointId}`;
    return endpoint;
}

function prepareGenAIEndpoint(modelId)
{
    const endpoint = `projects/${process.env.PROJECT_ID}/locations/${process.env.GENAI_LOCATION}/publishers/${process.env.GENAI_PUBLISHER}/models/${modelId}`;
    return endpoint;
}

function prepareImageGenClient()
{
    const clientOptions = {};
    clientOptions.apiEndpoint = process.env.GENAI_API_ENDPOINT;
    _predictionServiceClient = new PredictionServiceClient(clientOptions);    
    _jobServiceClient = new JobServiceClient(clientOptions);
}

function deriveEditMode(editMode)
{
    switch(editMode)
    {
        case "insert":
            return KEditModeInsert;
        case "remove":
            return KEditModeRemove;
        case "outpaint":
            return KEditOutpaint;
        case "product":
            return KEditProductImage;
        default:
            return KEditModeInsert;
    }
}

function prepareGenerateParameters(request)
{
    const parameters = {};
    if (request.headers.samplecount != null)
    {
        parameters.sampleCount = Number(request.headers.samplecount);
    }

    if (request.headers.watermark != null)
    {
        parameters.addWatermark = (request.headers.watermark.toLowerCase() === "true") ? true : false;
    }
    
    if (request.headers.human != null)
    {
        parameters.personGeneration = (request.headers.human.toLowerCase() === "true") ? KAllowAdults : KDoNotAllow;
    }

    if (request.headers.safety != null)
    {
        parameters.safetySetting = (request.headers.safety.toLowerCase() === "true") ? KSafetyBlockSome : KSafetyBlockFew;
    }

    if (request.headers.aspect != null)
    {
        parameters.aspectRatio = request.headers.aspect;
    }

    return parameters;
}

function prepareEditParameters(request)
{
    const editConfig = {};
    const parameters = prepareGenerateParameters(request);

    if (request.params.editMode != null)
    {
        editConfig.editMode = deriveEditMode(request.params.editMode);
    }        

    if (request.headers.position != null)
    {
        editConfig.productPosition = request.headers.position;
    }
    
    if (request.headers.samplesize != null)
    {
        editConfig.sampleImageSize = request.headers.samplesize;
    }        

    editConfig.guidanceScale = Number(request.headers.guidance);
    const editType = request.params.editType;    
    if (editType != null)
    {        
        const maskMode = {};
        maskMode.maskType = editType;

        if (editType == KEditTypeSemantic)
            maskMode.classes = request.headers.classes.split(',').map(Number);

        editConfig.maskMode = maskMode;        
    }

    const avatarStyle = request.headers.avatarstyle;
    if (avatarStyle != null)
    {
        const avatarConfig = {};
        avatarConfig.style = avatarStyle;
        avatarConfig.enableSharpening = request.headers.avatarsharp;
        editConfig.avatar = avatarConfig;
    }

    parameters.editConfig = editConfig;
    return parameters;
}

function preparePersonalizeParameters(request)
{
    const parameters = prepareGenerateParameters(request);
    if (request.headers.samplesize != null)
    {
        parameters.sampleImageSize = request.headers.samplesize;
    }
    
    const avatarConfig = {};
    avatarConfig.enableSharpening = request.headers.avatarsharp;

    const avatarStyle = request.headers.avatarstyle;
    if (avatarStyle != null)
    {        
        avatarConfig.style = avatarStyle;
    }

    parameters.avatarConfig = avatarConfig;
    return parameters;
}

function prepareControlledParameters(request)
{
    const parameters = prepareGenerateParameters(request);

    const controlPluginConfig = {};
    const conditions = [];
    const condition = {};

    const conditionName = request.headers.condition;
    if (conditionName != null)
    {        
        condition.conditionName = conditionName;
        conditions.push(condition);
    }
    controlPluginConfig.conditions = conditions;
    parameters.controlPluginConfig = controlPluginConfig;
    return parameters;
}

function prepareUpscaleParameters(request)
{
    const parameters = prepareGenerateParameters(request);
    parameters.mode = "upscale";
    parameters.sampleCount = 1;

    const upscaleConfig = {};    
    if (request.headers.upscale != null)
    {        
        upscaleConfig.upscaleFactor = request.headers.upscale;
    }

    parameters.upscaleConfig = upscaleConfig;    
    return parameters;
}

function prepareImageInfo(request)
{
    const imageInfo = {};
    imageInfo.modelId = request.headers.modelid;
    imageInfo.endpointId = request.headers.endpointid;
    imageInfo.instances = request.body.instances;
    imageInfo.parameters = prepareEditParameters(request);
    return imageInfo;
}

function preparePersonalizeImageInfo(request)
{
    const imageInfo = {};
    imageInfo.modelId = request.headers.modelid;    
    imageInfo.instances = request.body.instances;
    imageInfo.parameters = preparePersonalizeParameters(request);
    return imageInfo;
}

function prepareControlledImageInfo(request)
{
    const imageInfo = {};
    imageInfo.modelId = request.headers.modelid;    
    imageInfo.instances = request.body.instances;
    imageInfo.parameters = prepareControlledParameters(request);
    return imageInfo;
}

function prepareUpscaleImageInfo(request)
{
    const imageInfo = {};    
    imageInfo.modelId = request.headers.modelid;
    imageInfo.instances = request.body.instances;
    imageInfo.parameters = prepareUpscaleParameters(request);
    return imageInfo;
}

function prepareCaptionParameters(request)
{
    const parameters = {};
    parameters.sampleCount = Number(request.headers.samplecount);
    parameters.language = request.headers.languagecode;
    return parameters;
}

function prepareVQAParameters(request)
{
    const parameters = {};
    parameters.sampleCount = Number(request.headers.samplecount);
    return parameters;
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

async function generateImage(contentInfo)
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
        endpoint: (contentInfo.modelId != null) ? prepareGenAIEndpoint(contentInfo.modelId)
                                                : prepareCustomModelEndpoint(contentInfo.endpointId),
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

async function editImage(contentInfo)
{
    try
    {
        const accessToken = await performAuthentication();        
        const endpointURL = `https://${process.env.GENAI_LOCATION}-aiplatform.googleapis.com/v1/${prepareGenAIEndpoint(contentInfo.modelId)}:predict`;        

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        };

        const requestBody = {};
        requestBody.instances = contentInfo.instances;
        requestBody.parameters = contentInfo.parameters;

        const endpointResult = await Axios.post(`${endpointURL}`, requestBody, requestOptions);
        const predictionContent = endpointResult.data?.predictions;
        return predictionContent;        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function generateCaption(contentInfo)
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

        let prediction = {};
        prediction.deployedModelId = predictionResponse.deployedModelId;
        prediction.predictions = [];        
        for (const protoPrediction of predictionResponse.predictions)
            prediction.predictions.push(protoPrediction.stringValue);
            
        return prediction;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performVQA(contentInfo)
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

        let prediction = {};
        prediction.deployedModelId = predictionResponse.deployedModelId;
        prediction.model = predictionResponse.model;
        prediction.modelDisplayName = predictionResponse.modelDisplayName;
        prediction.modelVersionId = predictionResponse.modelVersionId;
        prediction.predictions = [];        
        for (const protoPrediction of predictionResponse.predictions)
            prediction.predictions.push(protoPrediction.stringValue);
            
        return prediction;
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
/**
 * @fires /genai/image/gen
 * @method POST
 * @description Generate Image from Prompts
 */
_express.post("/genai/image/gen", async (request, response) =>
{
    const imageInfo = {};
    imageInfo.modelId = request.headers.modelid;
    imageInfo.endpointId = request.headers.endpointid;
    imageInfo.instances = request.body.instances;
    imageInfo.parameters = prepareGenerateParameters(request);

    const results = {};

    try
    {
        const predictionResponse = await generateImage(imageInfo);
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
 * @fires /genai/image/edit/:editMode/:editType?
 * @method POST
 * @description Edit an existing Image from Prompts and configurable parameters
 * Request Param: editType = 'foreground', 'backgeround', 'semantic'
 * Request Param: editMode = 'insert', 'remove', 'product'
 */
_express.post("/genai/image/edit/:editMode/:editType?", async (request, response) =>
{
    const imageInfo = prepareImageInfo(request);
    const results = {};

    try
    {
        const predictionResponse = await editImage(imageInfo);
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
 * @fires /genai/image/personalize/edit
 * @method POST
 * @description Edit an existing Image with configurable personalization parameters
 */
_express.post("/genai/image/personalize/edit", async (request, response) =>
{
    const imageInfo = preparePersonalizeImageInfo(request);
    const results = {};

    try
    {
        const predictionResponse = await editImage(imageInfo);
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
 * @fires /genai/image/control/edit
 * @method POST
 * @description Edit an existing Image with configurable control parameters
 */
_express.post("/genai/image/control/edit", async (request, response) =>
{
    const imageInfo = prepareControlledImageInfo(request);
    const results = {};

    try
    {
        const predictionResponse = await editImage(imageInfo);
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
 * @fires /genai/image/upscale
 * @method POST
 * @description Edit an existing Image with configurable upscale parameters
 */
_express.post("/genai/image/upscale", async (request, response) =>
{
    const imageInfo = prepareUpscaleImageInfo(request);
    const results = {};

    try
    {
        const predictionResponse = await editImage(imageInfo);
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
 * @fires /genai/image/caption
 * @method POST
 * @description Generate Text description from an Image
 */
_express.post("/genai/image/caption", async (request, response) =>
{
    const imageInfo = {};
    imageInfo.modelId = request.headers.modelid;
    imageInfo.instances = request.body.instances;
    imageInfo.parameters = prepareCaptionParameters(request);

    const results = {};

    try
    {
        const predictionResponse = await generateCaption(imageInfo);        
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
 * @fires /genai/image/vqa
 * @method POST
 * @description Get Image information through Visual Question Answering
 */
_express.post("/genai/image/vqa", async (request, response) =>
{
    const imageInfo = {};
    imageInfo.modelId = request.headers.modelid;
    imageInfo.instances = request.body.instances;
    imageInfo.parameters = prepareVQAParameters(request);

    const results = {};

    try
    {
        const predictionResponse = await performVQA(imageInfo);        
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
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 6066;
_server.listen(port);

prepareImageGenClient();
initializeAxios();

console.log("Server running at http://localhost:%d", port);
