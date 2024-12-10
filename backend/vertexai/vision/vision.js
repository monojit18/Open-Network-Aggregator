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
const Path = require("path");
const DotEnv = require("dotenv");
const Express = require("express");
const Cors = require("cors");
const Vision = require("@google-cloud/vision");

let _express = Express();
let _server = Http.createServer(_express);
const visionClient = new Vision.ImageAnnotatorClient();

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
    exception.code = ((exception.code == undefined) || (exception.code < 400)) ? 500 : exception.code;
    return exception;
}

function prepareContentInfo(request, type)
{
    const contentInfo = {};
    const fileName = request.body.fileName;
    const uri = request.body.uri;

    let folderName = "";
    if (type == "ocr")
        folderName = "ocrimages";
    else if (type == "vision")
        folderName = "visionimages";

    if (fileName != null)
    {
        const imagePath = Path.join(process.env.VISION_DIR_PATH, folderName, fileName);
        contentInfo.content = imagePath;
    }
    else if (uri != null)
        contentInfo.content = uri;
    
    return contentInfo;
}

function prepareLogoResponse(logo)
{
    const logoResponse = {};
    logoResponse.boundingPoly = logo.boundingPoly;
    logoResponse.description = logo.description;
    logoResponse.confidence = logo.score;
    return logoResponse;
}

function prepareLandmarkResponse(landmark)
{
    const landmarkResponse = {};
    landmarkResponse.boundingPoly = landmark.boundingPoly;
    landmarkResponse.locations = landmark.locations;
    landmarkResponse.description = landmark.description;
    landmarkResponse.confidence = landmark.score;
    return landmarkResponse;
}

function prepareFaceResponse(face)
{
    const faceResponse = {};
    faceResponse.description = face.description;
    faceResponse.confidence = face.detectionConfidence;
    faceResponse.panAngle = face.panAngle;
    faceResponse.rollAngle = face.rollAngle;
    faceResponse.tiltAngle = face.tiltAngle;
    faceResponse.boundingPoly = face.boundingPoly;
    faceResponse.fdBoundingPoly = face.fdBoundingPoly;
    faceResponse.angerLikelihood = face.angerLikelihood;
    faceResponse.blurredLikelihood = face.blurredLikelihood;
    faceResponse.headwearLikelihood = face.headwearLikelihood;
    faceResponse.joyLikelihood = face.joyLikelihood;
    faceResponse.sorrowLikelihood = face.sorrowLikelihood;
    faceResponse.surpriseLikelihood = face.surpriseLikelihood;
    faceResponse.underExposedLikelihood = face.underExposedLikelihood;
    return faceResponse;
}

function prepareHandwritingResponse(handwritingText)
{
    const textResponse = {};
    textResponse.text = handwritingText.text;
    textResponse.pages = [];
    handwritingText.pages.forEach((page) =>
    {
        const pageInfo = {};
        pageInfo.width = page.width;
        pageInfo.height = page.height;
        pageInfo.confidence = page.confidence;
        pageInfo.detectedLanguages = page.property?.detectedLanguages;
        textResponse.pages.push(pageInfo);

        pageInfo.blocks = [];
        page.blocks.forEach((block) =>
        {
            const blockInfo = {};
            blockInfo.blockType = block.blockType;
            blockInfo.confidence = block.confidence;
            blockInfo.boundingBox = block.boundingBox;
            pageInfo.blocks.push(blockInfo);

            blockInfo.paragraphs = [];
            block.paragraphs.forEach((paragraph) =>
            {
                const paragraphInfo = {};
                paragraphInfo.confidence = paragraph.confidence;
                paragraphInfo.boundingBox = paragraph.boundingBox;
                blockInfo.paragraphs.push(paragraphInfo);

                paragraphInfo.words = [];
                paragraph.words.forEach((word) =>
                {
                    const wordInfo = {};
                    wordInfo.confidence = word.confidence;
                    wordInfo.boundingBox = word.boundingBox;
                    wordInfo.detectedLanguages = word.property?.detectedLanguages;
                    paragraphInfo.words.push(wordInfo);

                    wordInfo.symbols = [];
                    word.symbols.forEach((symbol) =>
                    {
                        const symbolInfo = {};
                        symbolInfo.confidence = symbol.confidence;
                        symbolInfo.boundingBox = symbol.boundingBox;
                        symbolInfo.text = symbol.text;
                        wordInfo.symbols.push(symbolInfo);
                    });
                });
            });
        });
    });
    return textResponse;
}

async function detectLabels(imageInfo)
{
    try
    {
        const labelsList = await visionClient.labelDetection(imageInfo.content);
        const labels = labelsList[0];
        const responseList = [];

        for (const label of labels.labelAnnotations)
        {
            const labelResponse = {};
            labelResponse.description = label.description;
            labelResponse.confidence = label.score;        
            responseList.push(labelResponse);
        }    
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function detectProperties(imageInfo)
{
    try
    {
        const imagePropertiesList = await visionClient.imageProperties(imageInfo.content);
        const imageProperties = imagePropertiesList[0];
        const responseList = imageProperties.imagePropertiesAnnotation.dominantColors;
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function detectObjects(imageInfo)
{
    try
    {
        const objectsList = await visionClient.objectLocalization(imageInfo.content);
        const objects = objectsList[0];
        const responseList = objects.localizedObjectAnnotations;
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function detectSafeSearch(imageInfo)
{
    try
    {
        const objectsList = await visionClient.safeSearchDetection(imageInfo.content);
        const objects = objectsList[0];
        const responseList = objects.safeSearchAnnotation;
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function detectWebContents(imageInfo)
{
    try
    {
        const objectsList = await visionClient.webDetection(imageInfo.content);
        const objects = objectsList[0];
        const responseList = objects.webDetection;
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function detectLogos(imageInfo)
{
    try
    {
        const logosList = await visionClient.logoDetection(imageInfo.content);
        const logos = logosList[0];
        const responseList = [];

        for (const logo of logos.logoAnnotations)
        {
            const logoResponse = prepareLogoResponse(logo)
            responseList.push(logoResponse);
        }    
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function detectLandmarks(imageInfo)
{
    try
    {        
        const landmarksList = await visionClient.landmarkDetection(imageInfo.content);
        const landmarks = landmarksList[0];
        const responseList = [];

        for (const landmark of landmarks.landmarkAnnotations)
        {
            const landmarkResponse = prepareLandmarkResponse(landmark);
            responseList.push(landmarkResponse);
        }    
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function detectFaces(imageInfo)
{
    try
    {
        const facesList = await visionClient.faceDetection(imageInfo.content);
        const faces = facesList[0];
        const responseList = [];

        for (const face of faces.faceAnnotations)
        {
            const faceResponse = prepareFaceResponse(face);
            responseList.push(faceResponse);
        }    
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function detectTexts(textInfo)
{
    try
    {
        const textsList = await visionClient.textDetection(textInfo.content);
        const texts = textsList[0];
        const responseList = [];

        for (const text of texts.textAnnotations)
        {
            const textResponse = {};
            textResponse.description = text.description;
            textResponse.boundingPoly = text.boundingPoly;        
            responseList.push(textResponse);
        }    
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function detectHandwritings(textInfo)
{
    try
    {
        const textsList = await visionClient.documentTextDetection(textInfo.content);
        const texts = textsList[0];
        const responseList = [];
        const handwritingText = texts.fullTextAnnotation;
        const textResponse = prepareHandwritingResponse(handwritingText);
        responseList.push(textResponse);
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function detectFile(textInfo)
{
    try
    {
        const inputConfig = {};
        inputConfig.mimeType = textInfo.mimeType;
        inputConfig.gcsSource = {};
        inputConfig.gcsSource.uri = textInfo.inputUri;

        const outputConfig = {};    
        outputConfig.gcsDestination = {};
        outputConfig.gcsDestination.uri = textInfo.outputUri;

        const features = [{type: 'DOCUMENT_TEXT_DETECTION'}];
        const request =
        {
            requests:
            [{
                inputConfig: inputConfig,
                features: features,
                outputConfig: outputConfig,
            }]
        };

        const filesResponseList = await visionClient.asyncBatchAnnotateFiles(request);
        const filesResponse = filesResponseList[0];
        await filesResponse.promise();
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
 * @fires /vision/labels
 * @method POST
 * @description Detects Labels in an Image
 */
_express.post("/vision/labels", async (request, response) =>
{
    const imageInfo = prepareContentInfo(request, "vision");
    const results = {};

    try
    {
        const responseList = await detectLabels(imageInfo);
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
  * @fires /vision/properties
  * @method POST
  * @description Detects Properties in an Image
  */
_express.post("/vision/properties", async (request, response) =>
{
    const imageInfo = prepareContentInfo(request, "vision");
    const results = {};

    try
    {
        const responseList = await detectProperties(imageInfo);
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
  * @fires /vision/objects
  * @method POST
  * @description Detects Objects in an Image
  */
_express.post("/vision/objects", async (request, response) =>
{
    const imageInfo = prepareContentInfo(request, "vision");
    const results = {};

    try
    {
        const responseList = await detectObjects(imageInfo);
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
  * @fires /vision/safesearch
  * @method POST
  * @description Detects SafeSearch and Explicit contents in an Image
  */
_express.post("/vision/safesearch", async (request, response) =>
{
    const imageInfo = prepareContentInfo(request, "vision");
    const results = {};

    try
    {
        const responseList = await detectSafeSearch(imageInfo);
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
  * @fires /vision/webcontents
  * @method POST
  * @description Detects Web contents in an Image
  */
 _express.post("/vision/webcontents", async (request, response) =>
 {
     const imageInfo = prepareContentInfo(request, "vision");
     const results = {};
 
     try
     {
         const responseList = await detectWebContents(imageInfo);
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
 * @fires /vision/logos
 * @method POST
 * @description Detects Logos in an Image
 */
_express.post("/vision/logos", async (request, response) =>
{
    const imageInfo = prepareContentInfo(request, "vision");
    const results = {};

    try
    {
        const responseList = await detectLogos(imageInfo);
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
 * @fires /vision/landmarks
 * @method POST
 * @description Detects Landmarks in an Image
 */
_express.post("/vision/landmarks", async (request, response) =>
{
    const imageInfo = prepareContentInfo(request, "vision");
    const results = {};

    try
    {
        const responseList = await detectLandmarks(imageInfo);
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
 * @fires /vision/faces
 * @method POST
 * @description Detects Faces in an Image
 */
_express.post("/vision/faces", async (request, response) =>
{
    const imageInfo = prepareContentInfo(request, "vision");
    const results = {};

    try
    {
        const responseList = await detectFaces(imageInfo);
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
 * @fires /ocr/texts
 * @method POST
 * @description Detects Texts in an Image
 */
_express.post("/ocr/texts", async (request, response) =>
{
    const textInfo = prepareContentInfo(request, "ocr");
    const results = {};

    try
    {
        const responseList = await detectTexts(textInfo);
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
 * @fires /ocr/handwritings
 * @method POST
 * @description Detects Handwritings in an Image
 */
_express.post("/ocr/handwritings", async (request, response) =>
{
    const textInfo = prepareContentInfo(request, "ocr");
    const results = {};

    try
    {
        const responseList = await detectHandwritings(textInfo);
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
 * @fires /ocr/file
 * @method POST
 * @description Detects Texts in a File
 */
_express.post("/ocr/file", async (request, response) =>
{
    const textInfo = {};
    textInfo.mimeType = request.headers["mime-type"];
    textInfo.inputUri = request.body.inputUri;
    textInfo.outputUri = request.body.outputUri;
    const results = {};

    try
    {
        const responseList = await detectFile(textInfo);
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

var port = process.env.port || process.env.PORT || 6062;
_server.listen(port);

console.log("Server running at http://localhost:%d", port);
