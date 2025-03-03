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
const {TranslationServiceClient} = require("@google-cloud/translate").v3;

let _express = Express();
let _server = Http.createServer(_express);
const translationClient = new TranslationServiceClient();

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

function prepareLocationPath()
{
    const locationPath = translationClient.locationPath(process.env.PROJECT_ID, process.env.TRANSLATION_LOCATION);
    return locationPath;
}

function prepareGlossaryLocationPath()
{
    const locationPath = translationClient.locationPath(process.env.PROJECT_ID, process.env.GLOSSARY_LOCATION);
    return locationPath;
}

function prepareGlossaryResponse(glossaryResult)
{
    const responseList = [];
    if (glossaryResult == null)
        return responseList;

    const glossaryResponse = {};    
    glossaryResponse.name = glossaryResult.name;
    glossaryResponse.entryCount = glossaryResult.entryCount;
    glossaryResponse.inputUri = glossaryResult.inputConfig.gcsSource.inputUri;
    glossaryResponse.languages = [];

    for (const languageCode of glossaryResult.languageCodesSet.languageCodes)
    {
        const language = {};
        language.languageCode = languageCode;
        glossaryResponse.languages.push(language);        
    }
    responseList.push(glossaryResponse);
    return responseList;
}

async function getSupportedLanguages()
{    
    const request =
    {
      parent: prepareLocationPath(),
      displayLanguageCode: 'en'
    };

    try
    {
        const [supportedLanguages] = await translationClient.getSupportedLanguages(request);
        const responseList = [];

        for (const language of supportedLanguages.languages)
        {
            const languagesResponse = {};
            languagesResponse.languageCode = language.languageCode;
            languagesResponse.displayName = language.displayName;        
            responseList.push(languagesResponse);
        }
        return responseList;        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function getGlossary(glossaryInfo)
{
    const glossaryConfig = {};
    glossaryConfig.name = `projects/${process.env.PROJECT_ID}/locations/${process.env.GLOSSARY_LOCATION}/glossaries/${glossaryInfo.glossaryName}`;

    const request =
    {
        parent: `projects/${process.env.PROJECT_ID}/locations/${process.env.GLOSSARY_LOCATION}`,
        name: glossaryConfig.name,        
    };
    
    try
    {
        let glossariesList = await translationClient.getGlossary(request);
        const glossaryResult = glossariesList[0];
        const responseList = prepareGlossaryResponse(glossaryResult);
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function getGlossariesList()
{    
    const request =
    {
      parent: prepareGlossaryLocationPath()      
    };

    try
    {
        const [glossariesList] = await translationClient.listGlossaries(request);
        const glossaryResult = glossariesList[0];
        const responseList = prepareGlossaryResponse(glossaryResult);
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function detectLanguages(sourceText)
{    
    const request =
    {
      parent: prepareLocationPath(),
      content: sourceText
    };

    try
    {
        const detectedLanguagesList = await translationClient.detectLanguage(request);
        const detectedLanguages = detectedLanguagesList[0];
        const responseList = [];

        for (const language of detectedLanguages.languages)
        {
            const languagesResponse = {};
            languagesResponse.languageCode = language.languageCode;
            languagesResponse.confidence = language.confidence;        
            responseList.push(languagesResponse);
        }
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }    
}

async function translateText(textInfo)
{
    const request =
    {
        parent: prepareLocationPath(),
        contents: textInfo.sourceTextList,
        mimeType: textInfo.mimeType, 
        sourceLanguageCode: textInfo.sourceLanguage,
        targetLanguageCode: textInfo.targetLanguage,
    };

    try
    {
        let translatedList = await translationClient.translateText(request);
        const translations = translatedList[0].translations;
        const responseList = [];

        translations.forEach((translation, index) =>
        {
            const translatedResponse = {};
            translatedResponse.source = textInfo.sourceTextList[index];
            translatedResponse.target = translation.translatedText;        
            responseList.push(translatedResponse);
        });    
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function translateGlossaryText(textInfo)
{

    const glossaryConfig = {};
    glossaryConfig.glossary = `projects/${process.env.PROJECT_ID}/locations/${process.env.GLOSSARY_LOCATION}/glossaries/${textInfo.glossaryName}`;

    const request =
    {
        parent: prepareGlossaryLocationPath(),
        contents: textInfo.sourceTextList,
        mimeType: textInfo.mimeType, 
        sourceLanguageCode: textInfo.sourceLanguage,
        targetLanguageCode: textInfo.targetLanguage,
        glossaryConfig: glossaryConfig
    };

    try
    {
        let translatedList = await translationClient.translateText(request);
        const translations = translatedList[0].glossaryTranslations;
        const responseList = [];

        translations.forEach((translation, index) =>
        {
            const translatedResponse = {};
            translatedResponse.source = textInfo.sourceTextList[index];
            translatedResponse.target = translation.translatedText;        
            responseList.push(translatedResponse);
        });    
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function translateDocument(documentInfo)
{
    const documentInputConfig = {};
    documentInputConfig.gcsSource = {};
    documentInputConfig.gcsSource.inputUri = documentInfo.inputUri;

    const documentOutputConfig = {};
    documentOutputConfig.gcsDestination = {};
    documentOutputConfig.gcsDestination.outputUriPrefix = documentInfo.outputPrefix;

    const request =
    {
        parent: prepareLocationPath(),
        documentInputConfig: documentInputConfig,
        documentOutputConfig: documentOutputConfig,
        sourceLanguageCode: documentInfo.sourceLanguage,
        targetLanguageCode: documentInfo.targetLanguage,
    };

    try
    {
        await translationClient.translateDocument(request);
        return [];
    }
    catch(exception)
    {
        throw exception;
    }
}

async function translateBatchOfDocuments(documentInfo)
{
    const inputConfig = {};
    inputConfig.gcsSource = {};
    inputConfig.gcsSource.inputUri = documentInfo.inputUri;
    const inputConfigs = [inputConfig];

    const outputConfig = {};
    outputConfig.gcsDestination = {};
    outputConfig.gcsDestination.outputUriPrefix = documentInfo.outputPrefix;

    const request =
    {
        parent: prepareLocationPath(),        
        inputConfigs: inputConfigs,
        outputConfig: outputConfig,
        sourceLanguageCode: documentInfo.sourceLanguage,
        targetLanguageCodes: [documentInfo.targetLanguage],
    };

    try
    {
        const operationList = await translationClient.batchTranslateDocument(request);
        const operation = operationList[0];
        await operation.promise();
        return [];
    }
    catch(exception)
    {
        throw exception;
    }
}

async function createGlossary(glossaryInfo)
{
    const glossaryConfig = {};
    const languageCodesSet = {};
    languageCodesSet.languageCodes = glossaryInfo.languagesList;
    glossaryConfig.languageCodesSet = languageCodesSet;

    const inputConfig = {};
    inputConfig.gcsSource = {};
    inputConfig.gcsSource.inputUri = glossaryInfo.uri;
    glossaryConfig.inputConfig = inputConfig;
    glossaryConfig.name = `projects/${process.env.PROJECT_ID}/locations/${process.env.GLOSSARY_LOCATION}/glossaries/${glossaryInfo.glossaryName}`;    

    const request =
    {
        parent: prepareGlossaryLocationPath(),
        glossary: glossaryConfig,        
    };

    try
    {
        let glossaryList = await translationClient.createGlossary(request);
        let glossaryRespone = glossaryList[0];
        await glossaryRespone.promise();

        const glossaryOperation = glossaryList[1];
        glossaryRespone = {};
        glossaryRespone.done = glossaryOperation.done;
        glossaryRespone.name = glossaryOperation.name;

        const responseList = [];
        responseList.push(glossaryRespone);
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }    
}

async function deleteGlossary(glossaryInfo)
{
    const request =
    {
        parent: prepareGlossaryLocationPath(),
        name: `projects/${process.env.PROJECT_ID}/locations/us-central1/glossaries/${glossaryInfo.glossaryName}`
    };

    try
    {
        let glossaryList = await translationClient.deleteGlossary(request);
        const glossaryRespone = glossaryList[0];
        await glossaryRespone.promise();
        const responseList = [];
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
/**
 * @fires /healthz
 * @method GET
 * @description Service Healthcheck
 */
_express.get("/healthz", async (request, response) =>
{
    const results = {};
    response.status(200).send(results);
});

/**
 * @fires /languages
 * @method GET
 * @description List All Supported Languages
 */
_express.get("/languages", async (request, response) =>
{
    const results = {};
    try
    {
        const responseList = await getSupportedLanguages();        
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
 * @fires /translate/glossary/:glossaryId
 * @method GET
 * @description List All Glossaries
 */
_express.get("/translate/glossary/:glossaryId", async (request, response) =>
{
    const glossaryInfo = {};
    glossaryInfo.glossaryName = request.params.glossaryId;
    const results = {};

    try
    {
        const responseList = await getGlossary(glossaryInfo);
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
 * @fires /translate/glossary
 * @method GET
 * @description List a specific Glossary
 */
_express.get("/translate/glossary", async (request, response) =>
{
    const results = {};
    
    try
    {
        const responseList = await getGlossariesList();        
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
 * @fires /languages/detect
 * @method POST
 * @description Detect Language(s) for a list of source Text(s)
 */
_express.post("/languages/detect", async (request, response) =>
{    
    const sourceTextList = request.body;
    const responseList = [];
    const results = {};

    try
    {
        await Promise.all(sourceTextList.map(async(sourceText) =>
        {
            const detectLanguagesList = await detectLanguages(sourceText);
            const detectedResponse = {};
            detectedResponse.source = sourceText;
            detectedResponse.detections = detectLanguagesList;
            responseList.push(detectedResponse);
        }));        
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
 * @fires /translate/text
 * @method POST
 * @description Translate source Text(s) to a desired Language
 */
_express.post("/translate/text", async (request, response) =>
{
    const textInfo = {};
    textInfo.sourceLanguage = request.query.src;
    textInfo.targetLanguage = request.query.trg;
    textInfo.mimeType = request.headers["mime-type"];

    const sourceTextList = request.body;
    textInfo.sourceTextList = sourceTextList;
    const results = {};

    try
    {
        const responseList = await translateText(textInfo);
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
 * @fires /translate/glossary/text/:glossaryId
 * @method POST
 * @description Translate source Text(s) to a desired Language using a Glossary
 */
_express.post("/translate/glossary/text/:glossaryId", async (request, response) =>
{
    const textInfo = {};
    textInfo.glossaryName = request.params.glossaryId;
    textInfo.sourceLanguage = request.query.src;
    textInfo.targetLanguage = request.query.trg;
    textInfo.mimeType = request.headers["mime-type"];

    const sourceTextList = request.body;
    textInfo.sourceTextList = sourceTextList;
    const results = {};

    try
    {
        const responseList = await translateGlossaryText(textInfo);
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
 * @fires /translate/document
 * @method POST
 * @description Translate source Document to a desired Language and stores the result in Cloud Storage
 */
_express.post("/translate/document", async (request, response) =>
{
    const documentInfo = request.body;
    documentInfo.sourceLanguage = request.query.src;
    documentInfo.targetLanguage = request.query.trg;
    const results = {};

    try
    {
        const responseList = await translateDocument(documentInfo);    
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
 * @fires /translate/documents/batch
 * @method POST
 * @description Translate a batch of source Documents to a desired Language and stores the result in Cloud Storage
 */
 _express.post("/translate/documents/batch", async (request, response) =>
 {
     const documentInfo = request.body;
     documentInfo.sourceLanguage = request.query.src;
     documentInfo.targetLanguage = request.query.trg;
     const results = {};
 
     try
     {
         const responseList = await translateBatchOfDocuments(documentInfo);    
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
 * @fires /translate/glossary/:glossaryId
 * @method POST
 * @description Creates a Glossary
 */
_express.post("/translate/glossary/:glossaryId", async (request, response) =>
{
    const glossaryInfo = {};
    glossaryInfo.glossaryName = request.params.glossaryId;
    glossaryInfo.languagesList = request.body.lngs;
    glossaryInfo.uri = request.body.uri;
    const results = {};

    try
    {
        const responseList = await createGlossary(glossaryInfo);        
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
 * @fires /translate/glossary/:glossaryId
 * @method DELETE
 * @description Delets a Glossary
 */
_express.delete("/translate/glossary/:glossaryId", async (request, response) =>
{
    const glossaryInfo = {};
    glossaryInfo.glossaryName = request.params.glossaryId;
    const results = {};

    try
    {
        const responseList = await deleteGlossary(glossaryInfo);        
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

var port = process.env.port || process.env.PORT || 6061;
_server.listen(port);

console.log("Server running at http://localhost:%d", port);
