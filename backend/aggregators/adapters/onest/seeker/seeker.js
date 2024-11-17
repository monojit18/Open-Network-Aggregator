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

const KPrivateKeyString = "as6cK5P4MKZeaPl2oyt1FqhclilLFs70YTf37EvcY2sWclxKa4HEeXQyK2HM73ZWQHJm/v/v4s//TPK5hO1zvw==";
const KCountry = "IND";
const KNPType = "BAP";

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
const KJobDomain = "onest:work-opportunities";
const KFinanceDomain = "onest:financial-support";
const KCallbackEvent = "callback";

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
    console.log(`prepareErrorMessage: ${exception.message}`);
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
            return KJobDomain;
        case "finance":
            return KFinanceDomain;
    }
}

function prepareNetworkUrls(actionString, requestBody)
{
    switch(actionString)
    {
        case KLookupAction:
            return `${process.env.SANDBOX_HOST}/onest/lookup`;
        case KSearchAction:
            return `${process.env.SANDBOX_HOST}/gateway/search`;
        case KSelectAction:
            return `${requestBody.context.bpp_uri}/select`;
        case KInitAction:
            return `${requestBody.context.bpp_uri}/init`;
        case KConfirmAction:
            return `${requestBody.context.bpp_uri}/confirm`;
        case KStatusAction:
            return `${requestBody.context.bpp_uri}/status`;
    }
}

function prepareNetworkRequest(request, domainString, actionString)
{
    try
    {
        const requestBody = request.body;
        const context = requestBody.context;
        context.domain = prepareDomainId(domainString);
        context.action = actionString;
        context.timestamp = new Date().toISOString();        
        context.bap_uri = _lookupResult.subscriber_url;
        context.bap_id = _lookupResult.subscriber_id;
        context.ttl = KTTL;

        const authHeaderString = createAuthorizationHeader(request);
        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        
        requestOptions.headers = {};
        requestOptions.headers =
        {
            "Content-Type": "application/json",
            "authorization": authHeaderString
        }

        const networkURL = prepareNetworkUrls(actionString, requestBody);
        return {requestBody, requestOptions, networkURL};
    }
    catch(exception)
    {
        throw exception;
    }
}

function processGenericResponse(response)
{
    const genaiResponse = response.data;
    return genaiResponse;
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
        const privateKeysArray = Sodium.from_base64(KPrivateKeyString, base64_variants.ORIGINAL);
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

async function fireCallbackEvent(requestBody, actionString)
{
    const callbackResponse = {};
    try
    {
        const seekerData = {};
        seekerData.room = requestBody.context.transaction_id;    
        seekerData.event = actionString;
        seekerData.payload = requestBody;        
        await emitAdapterEvent(KCallbackEvent, seekerData);
        
        callbackResponse.status = 200;
        callbackResponse.message = "";
        return callbackResponse;
    }
    catch (exception)
    {
        callbackResponse.status = exception.code;
        callbackResponse.message = exception.message;
        throw exception;
    }    
}

async function emitAdapterEvent(eventName, eventData)
{
    const requestOptions= {};
    requestOptions.httpsAgent = _axiosAgent;
    
    const requestBody = {};
    requestBody.eventName = eventName;
    requestBody.eventData = eventData;

    try
    {
        const socketResponse = await Axios.post(`${process.env.EVENT_RECEIVER_HTTP_HOST}/stream`,
                                                requestBody, requestOptions);
        console.log(socketResponse);
        return socketResponse;
    }
    catch(exception)
    {        
        throw exception;
    }
}

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
        const subscriberDetails = await performLookup(subscriberId, uniqueKeyId, "BPP");
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
    requestBody.subscriber_id = (subscriberId != null) ? subscriberId : process.env.BAP_SUBSCRIBER_ID;

    if (uniquekeyId != null)
        requestBody.unique_key_id = uniquekeyId;
    
    requestBody.country = KCountry;
    requestBody.type = (type != null) ? type : KNPType;

    try
    {
        const lookupURL = prepareNetworkUrls(KLookupAction);
        const response = await Axios.post(`${lookupURL}`, requestBody, requestOptions);
        const lookupList = processGenericResponse(response);
        return lookupList[0];
    }
    catch(exception)
    {
        throw exception;
    }
}

async function callNetwork(request, domainString, actionString)
{
    try
    {
        const {requestBody, requestOptions, networkURL} = prepareNetworkRequest(request, domainString, actionString);   
        const networkResponse = await Axios.post(`${networkURL}`, requestBody, requestOptions);
        let searchAckResponse = processGenericResponse(networkResponse);             
        searchAckResponse = processAckResponse(searchAckResponse, networkResponse);
        return searchAckResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function prepareCallbackResponse(request, actionString)
{
    try
    {       
        const isVerified = true; //await verifyHeader(request.headers["authorization"], request);
        if (isVerified == false)
        {
            const exception = createException(401, "UnAuthorized");
            console.log(`prepareCallbackResponse: ${isVerified}\n${exception.message}`);
            // throw exception;
        }

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        
        requestOptions.headers = {};
        requestOptions.headers =
        {
            "Content-Type": "application/json"
        }

        const requestBody = {};
        requestBody.context = request.body.context;
        requestBody.message = request.body.message;

        const callbackResponse = await fireCallbackEvent(requestBody, actionString);
        return callbackResponse;
    }
    catch(exception)
    {        
        throw exception;
    }
}

async function initializeSeeker()
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
_express.get("/seeker/keypair/create", async (request, response) =>
{
    const results = {};

    try
    {        
        const keyPair = createKeyPair();
        if (keyPair == null)
        {
            response.status(500).send(results);    
        }
        else
        {
            const keyInfo = {};
            keyInfo.publicKey = keyPair.publicKeyBase64;
            keyInfo.privateKey = keyPair.privateKeyBase64;
            results.results = keyInfo;
            response.status(200).send(results);
        }
        
    }
    catch(exception)
    {
        const errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

_express.post("/seeker/search/:domain", async (request, response) =>
{
    const results = {};

    try
    {
        const domainString = request.params.domain;
        const searchResponse = await callNetwork(request, domainString, KSearchAction);
        results.results = searchResponse;
        response.status(searchResponse.status).send(results);
    }
    catch(exception)
    {
        const errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

_express.post("/bap/on_search", async (request, response) =>
{
    const results = {};

    try
    {
        const onSearchResponse = await prepareCallbackResponse(request, KOnSearchAction);
        response.status(onSearchResponse.status).send(results);
    }
    catch(exception)
    {        
        const errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

_express.post("/seeker/select/:domain", async (request, response) =>
{
    const results = {};

    try
    {
        const domainString = request.params.domain;
        const selectResponse = await callNetwork(request, domainString, KSelectAction);
        results.results = selectResponse;
        response.status(selectResponse.status).send(results);
    }
    catch(exception)
    {
        const errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

_express.post("/bap/on_select", async (request, response) =>
{
    const results = {};

    try
    {
        const onSelectResponse = await prepareCallbackResponse(request, KOnSelectAction);
        response.status(onSelectResponse.status).send(results);
    }
    catch(exception)
    {
        const errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

_express.post("/seeker/init/:domain", async (request, response) =>
{
    const results = {};

    try
    {
        const domainString = request.params.domain;
        const initResponse = await callNetwork(request, domainString, KInitAction);
        results.results = initResponse;
        response.status(initResponse.status).send(results);
    }
    catch(exception)
    {
        const errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

_express.post("/bap/on_init", async (request, response) =>
{
    const results = {};

    try
    {
        const onInitResponse = await prepareCallbackResponse(request, KOnInitAction);
        response.status(onInitResponse.status).send(results);
    }
    catch(exception)
    {
        const errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

_express.post("/seeker/confirm/:domain", async (request, response) =>
{
    const results = {};

    try
    {
        const domainString = request.params.domain;
        const confirmResponse = await callNetwork(request, domainString, KConfirmAction);
        results.results = onConfirmResponse;
        response.status(confirmResponse.status).send(results);
    }
    catch(exception)
    {
        const errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

_express.post("/bap/on_confirm", async (request, response) =>
{
    const results = {};

    try
    {
        const onConfirmResponse = await prepareCallbackResponse(request, KOnConfirmAction);
        response.status(onConfirmResponse.status).send(results);
    }
    catch(exception)
    {
        const errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

_express.post("/seeker/status/:domain", async (request, response) =>
{
    const results = {};

    try
    {
        const domainString = request.params.domain;
        const statusResponse = await callNetwork(request, domainString, KStatusAction);
        results.results = statusResponse;
        response.status(statusResponse.status).send(results);
    }
    catch(exception)
    {
        const errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

_express.post("/bap/on_status", async (request, response) =>
{
    const results = {};

    try
    {
        const onStatusResponse = await prepareCallbackResponse(request, KOnStatusAction);
        response.status(onStatusResponse.status).send(results);
    }
    catch(exception)
    {
        const errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10001;
_server.listen(port);

initializeSeeker();
console.log("Server running at http://localhost:%d", port);
