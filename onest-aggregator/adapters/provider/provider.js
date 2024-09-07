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
const Path = require("path");
const DotEnv = require("dotenv");
const Express = require("express");
const Sodium = require("libsodium-wrappers");
const { base64_variants } = require("libsodium-wrappers");
const { sign } = require("crypto");
const Cors = require("cors");
const Axios = require('axios');

let _express = Express();
let _server = Http.createServer(_express);
let _axiosAgent = null;
let _lookupResult = null;

const KPrivateKeyString = "UdYx45nxzExcQCCzZmGLW+1SpolJfERKylbHcNHYiS5k3RqxwqCGY01wydGptoBwC58wqWkg+g3hQu7IeUuzeA==";
const KCountry = "IND";
const KNPType = "BPP";

const KTTL = "PT10M";
const KLookupAction = "lookup";
const KSearchAction = "search";
const KOnSearchAction = "on_search";
const KSelectAction = "select";
const KOnSelectAction = "on_select";
const KInitAction = "init";
const KOnInitAction = "on_init";
const KConfirmAction = "confirm";
const KOnConfirmAction = "on_confirm";
const KStatusAction = "status";
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
        case "learning":
            return KLearningDomain;
        case "job":
            return KWorkDomain;
        case "finance":
            return KFinanceDomain;
    }
}

function prepareProviderUrls(actionString)
{
    switch(actionString)
    {
        case KLookupAction:
            return `${process.env.SANDBOX_HOST}/onest/lookup`;
        case KSearchAction:
            return `${process.env.BPP_CLIENT_CALLBACK_URL}/search`;
        case KSelectAction:
            return `${process.env.BPP_CLIENT_CALLBACK_URL}/select`;
        case KInitAction:
            return `${process.env.BPP_CLIENT_CALLBACK_URL}/init`;
        case KConfirmAction:
            return `${process.env.BPP_CLIENT_CALLBACK_URL}/confirm`;
        case KStatusAction:
            return `${process.env.BPP_CLIENT_CALLBACK_URL}/status`;
    }
}

function prepareSeekerUrls(actionString, requestBody)
{
    switch(actionString)
    {        
        case KOnSearchAction:
            return `${requestBody.context.bap_uri}/on_search`;
        case KOnSelectAction:
            return `${requestBody.context.bap_uri}/on_select`;
        case KOnInitAction:
            return `${requestBody.context.bap_uri}/on_init`;
        case KOnConfirmAction:
            return `${requestBody.context.bap_uri}/on_confirm`;
        case KOnStatusAction:
            return `${requestBody.context.bap_uri}/on_status`;
    }
}

function prepareProviderRequest(request, actionString)
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

        const requestBody = request.body;
        const context = requestBody.context;        
        context.bpp_uri = _lookupResult.subscriber_url;
        context.bpp_id = _lookupResult.subscriber_id;        
        
        const providerURL = prepareProviderUrls(actionString);
        return {requestBody, requestOptions, providerURL};
    }
    catch(exception)
    {
        throw exception;
    }
}

function prepareSeekerRequest(request, domainString, actionString)
{
    try
    {
        const authHeaderString = createAuthorizationHeader(request);
        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        
        requestOptions.headers = {};
        requestOptions.headers =
        {
            "Content-Type": "application/json",
            "authorization": authHeaderString
        }

        const requestBody = request.body;

        const context = requestBody.context;
        context.domain = prepareDomainId(domainString);
        context.action = actionString;
        context.timestamp = new Date().toISOString();
        context.bpp_uri = _lookupResult.subscriber_url;
        context.bpp_id = _lookupResult.subscriber_id;

        console.log(authHeaderString);
        const seekerURL = prepareSeekerUrls(actionString, requestBody);
        return {requestBody, requestOptions, seekerURL};
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

function processAckResponse(ackResponse, originalResponse)
{    
    const cllabackAckResponse = ackResponse;
    cllabackAckResponse.status = originalResponse.status;
    cllabackAckResponse.statusText = originalResponse.statusText;
    return cllabackAckResponse;
}

function createException(code, message)
{
    const exception = {};
    exception.response = {};
    exception.response.status = code;
    exception.response.statusText = message;
    return exception;
}

function removeQuotes(value)
{
    if (value.length >= 2 && value.charAt(0) == '"' && value.charAt(value.length - 1) == '"')
    {
      value = value.substring(1, value.length - 1);
    }
    return value;
};

function splitAuthHeader(authHeaderString)
{
    const header = authHeaderString.replace("Signature ", "");
    let regex = /\s*([^=]+)=([^,]+)[,]?/g;
    let tokens;
    let partsArray = {};

    while ((tokens = regex.exec(header)) !== null)
    {
      if (tokens != null)
      {
        partsArray[tokens[1]] = removeQuotes(tokens[2]);
      }
    }
    return partsArray;
};

async function verifyHeader(header, request)
{
    try
    {
        const partsArray = splitAuthHeader(header);
        if (!partsArray || Object.keys(partsArray).length === 0)
        {
            const exception = createException(401, "UnAuthorized");
            throw exception;
        }
    
        const subscriberId = partsArray["keyId"].split("|")[0];
        const uniqueKeyId = partsArray["keyId"].split("|")[1];
        const signature = partsArray["signature"];
        const subscriberDetails = await performLookup(subscriberId, uniqueKeyId, "BAP");
        const publicKey = subscriberDetails.signing_public_key;
        const signingString = await prepareSigningString(request.body,
                                                         partsArray["created"],
                                                         partsArray["expires"]);
        const signedArray = Sodium.from_base64(signature, base64_variants.ORIGINAL);
        const publicKeyArray = Sodium.from_base64(publicKey, base64_variants.ORIGINAL);
        const isVerified = Sodium.crypto_sign_verify_detached(signedArray, signingString,
                                                              publicKeyArray);
        return isVerified;
    }
    catch (exception)
    {
        throw exception;
    }
}

function createKeyPair ()
{    
    let {publicKey, privateKey} = Sodium.crypto_sign_keypair();
    const publicKeyBase64 = Sodium.to_base64(publicKey, base64_variants.ORIGINAL);
    const privateKeyBase64 = Sodium.to_base64(privateKey, base64_variants.ORIGINAL);
    return {publicKeyBase64, privateKeyBase64}
};

function prepareSigningString(message, created, expires)
{    
    const digest = Sodium.crypto_generichash(64, Sodium.from_string(message));
    const digestBase64 = Sodium.to_base64(digest, base64_variants.ORIGINAL);
    const signingString = `(created): ${created}
    (expires): ${expires}
    digest: BLAKE-512=${digestBase64}`;
    return signingString;
}

function createSigningString(message)
{
    const created = Math.floor(new Date().getTime() / 1000 - 1 * 60).toString();
    const expires = (parseInt(created) + 1 * 60 * 60).toString();
    const digest = Sodium.crypto_generichash(64, Sodium.from_string(message));
    const digestBase64 = Sodium.to_base64(digest, base64_variants.ORIGINAL);
    const signingString = `(created): ${created}
    (expires): ${expires}
    digest: BLAKE-512=${digestBase64}`;
    return {signingString, created, expires};
}

function signPayload(request)
{    
    try
    {
        const signingResponse = createSigningString(request.body);
        let privateKeysArray = Sodium.from_base64(KPrivateKeyString, base64_variants.ORIGINAL);
        const signedMessage = Sodium.crypto_sign_detached(signingResponse.signingString, privateKeysArray, Sodium.StringOutputFormat);
        const signatureBase64 = Sodium.to_base64(signedMessage, base64_variants.ORIGINAL);
        return {signatureBase64, signingResponse};
    }
    catch(exception)
    {
        throw exception;
    }
}

function createAuthorizationHeader(request)
{
    try
    {        
        const {signatureBase64, signingResponse} = signPayload(request);
        const subscriberId = _lookupResult.subscriber_id;
        const uniqueId = _lookupResult.unique_key_id;
        const authHeaderString = `Signature keyId="${subscriberId}|${uniqueId}|ed25519",algorithm="ed25519",created="${signingResponse.created}",expires="${signingResponse.expires}",headers="(created) (expires) digest",signature="${signatureBase64}"`;
        return authHeaderString;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performLookup(subscriberId, uniquekeyId, type)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;
    
    requestOptions.headers = {};
    requestOptions.headers =
    {
       "Content-Type": "application/json"
    }

    const requestBody = {};
    requestBody.subscriber_id = (subscriberId != null)
                                ? subscriberId
                                : process.env.BPP_SUBSCRIBER_ID;

    if (uniquekeyId != null)
        requestBody.unique_key_id = uniquekeyId;

    requestBody.country = KCountry;
    requestBody.type = (type != null) ? type : KNPType;

    try
    {
        const lookupURL = prepareProviderUrls(KLookupAction);
        const response = await Axios.post(`${lookupURL}`, requestBody, requestOptions);
        const lookupList = processGenericResponse(response);
        return lookupList[0];
    }
    catch(exception)
    {
        throw exception;
    }
}

async function callProvider(request, actionString)
{
    try
    {
        const isVerified =  await verifyHeader(request.headers["authorization"], request);
        if (isVerified == false)
        {
            const exception = createException(401, "UnAuthorized");            
            throw exception;
        }

        const {requestBody, requestOptions, providerURL} = prepareProviderRequest(request, actionString);
        const providerResponse = await Axios.post(`${providerURL}`, requestBody, requestOptions);
        let searchAckResponse = processGenericResponse(providerResponse);
        searchAckResponse = processAckResponse(searchAckResponse, providerResponse)
        return searchAckResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function callSeekerCallback(request, domainString, actionString)
{
    try
    {
        const {requestBody, requestOptions, seekerURL} = prepareSeekerRequest(request, domainString, actionString);
        const seekerResponse = await Axios.post(`${seekerURL}`, requestBody, requestOptions);
        let searchAckResponse = processGenericResponse(seekerResponse);
        searchAckResponse = processAckResponse(searchAckResponse, seekerResponse)
        return searchAckResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function initializeProvider()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });

    if (_lookupResult == null)
    {
        _lookupResult = await performLookup();
    }
    await Sodium.ready;
}

/* API DEFINITIONS - START */
_express.get("/provider/keypair/create", async (request, response) =>
{
    try
    {        
        const keyPair = createKeyPair();
        if (keyPair == null)
        {
            response.status(500).send();    
        }
        else
        {
            const result = {};
            result.publicKey = keyPair.publicKeyBase64;
            result.privateKey = keyPair.privateKeyBase64;
            response.status(200).send(result);
        }
        
    }
    catch(exception)
    {
        const error = prepareErrorMessage(exception);
        response.status(error.code).send(`${error.message}\n`);
    }
});

_express.post("/search", async (request, response) =>
{
    try
    {
        const searchResponse = await callProvider(request, KSearchAction);
        response.status(searchResponse.status).send(searchResponse);        
    }
    catch(exception)
    {
        const error = prepareErrorMessage(exception);
        response.status(error.code).send(`${error.message}\n`);
    }
});

_express.post("/provider/on_search/:domain", async (request, response) =>
{
    try
    {
        const domainString = request.params.domain;
        const onSearchResponse = await callSeekerCallback(request, domainString, KOnSearchAction);
        response.status(onSearchResponse.status).send(onSearchResponse.statusText);
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
        const selectResponse = await callProvider(request, KSelectAction);
        response.status(selectResponse.status).send(selectResponse);
    }
    catch(exception)
    {
        const error = prepareErrorMessage(exception);
        response.status(error.code).send(`${error.message}\n`);
    }
});

_express.post("/provider/on_select/:domain", async (request, response) =>
{
    try
    {
        const domainString = request.params.domain;
        const onSelectResponse = await callSeekerCallback(request, domainString, KOnSelectAction);
        response.status(onSelectResponse.status).send(onSelectResponse.statusText);
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
        const initResponse = await callProvider(request, KInitAction);
        response.status(initResponse.status).send(initResponse);
    }
    catch(exception)
    {
        const error = prepareErrorMessage(exception);
        response.status(error.code).send(`${error.message}\n`);
    }
});

_express.post("/provider/on_init/:domain", async (request, response) =>
{
    try
    {
        const domainString = request.params.domain;
        const onInitResponse = await callSeekerCallback(request, domainString, KOnInitAction);
        response.status(onInitResponse.status).send(onInitResponse.statusText);
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
        const confirmResponse = await callProvider(request, KConfirmAction);
        response.status(confirmResponse.status).send(confirmResponse);
    }
    catch(exception)
    {
        const error = prepareErrorMessage(exception);
        response.status(error.code).send(`${error.message}\n`);
    }
});

_express.post("/provider/on_confirm/:domain", async (request, response) =>
{
    try
    {
        const domainString = request.params.domain;
        const onConfirmResponse = await callSeekerCallback(request, domainString, KOnConfirmAction);
        response.status(onConfirmResponse.status).send(onConfirmResponse.statusText);
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
        const statusResponse = await callProvider(request, KStatusAction);
        response.status(statusResponse.status).send(statusResponse);
    }
    catch(exception)
    {
        const error = prepareErrorMessage(exception);
        response.status(error.code).send(`${error.message}\n`);
    }
});

_express.post("/provider/on_status/:domain", async (request, response) =>
{
    try
    {
        const domainString = request.params.domain;
        const onStatusResponse = await callSeekerCallback(request, domainString, KOnStatusAction);
        response.status(onStatusResponse.status).send(onStatusResponse.statusText);
    }
    catch(exception)
    {
        const error = prepareErrorMessage(exception);
        response.status(error.code).send(`${error.message}\n`);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10002;
_server.listen(port);

initializeProvider();
console.log("Server running at http://localhost:%d", port);
