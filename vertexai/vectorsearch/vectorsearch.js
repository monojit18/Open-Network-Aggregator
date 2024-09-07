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
const Axios = require('axios');
const {GoogleAuth} = require('google-auth-library');
const {IndexServiceClient} = require("@google-cloud/aiplatform").v1;
const {IndexEndpointServiceClient} = require("@google-cloud/aiplatform").v1;
// const {MatchServiceClient} = require("@google-cloud/aiplatform").v1;

let _express = Express();
let _server = Http.createServer(_express);
let _axiosAgent = null;
let _allUrls = {};

DotEnv.config();

const KGoogleAuthScope = "https://www.googleapis.com/auth/cloud-platform";
const KMinDimenstions = 256;
const KTextDimenstions = 768;
const KImageDimenstions = 1408;
const KEmbeddingsCount = 1000;
const KSearchPercent = 10;

const KImageDocType = "image";
const KStreamIndexType = "stream";
const KBatchUpdate = "BATCH_UPDATE";
const KStreamUpdate = "STREAM_UPDATE";
const KGenAITextlib = "genai-textlib";
const KGenAIMultimodallib = "genai-multimodallib";
const KTextEmbeddingsModel = "text-embedding-004";
const KImageEmbeddingsModel = "multimodalembedding@001";

const KIndexTypeEnum =
{
    Batch: 0,
    Stream: 1
};

const KDocTypeEnum =
{
    Text: 0,
    Image: 1
};

const KOpsTypeEnum =
{
    Create: 0,
    Update: 1
};

const clientOptions =
{    
    apiEndpoint: `${process.env.VECTOR_SEARCH_LOCATION}-aiplatform.googleapis.com`
};

const indexClient = new IndexServiceClient(clientOptions);
const indexEndpointClient = new IndexEndpointServiceClient(clientOptions);
// const searchNeighbourClient = new MatchServiceClient(clientOptions);

_express.use(Express.json
({
    extended: true,
    limit: '10mb'
}));
    
_express.use(Express.urlencoded
({
    extended: true
}));

function prepareAllUrls()
{    
    _allUrls[KGenAITextlib] = `${process.env.GENAI_TEXTLIB_HOST}`;
    _allUrls[KGenAIMultimodallib] = `${process.env.GENAI_MULTILIB_HOST}`;
}

function prepareErrorMessage(exception)
{
    exception.code = ((exception.code == undefined) || (exception.code < 400)) ? 500 : exception.code;
    return exception;
}

function prepareRESTErrorMessage(exception)
{
    exception.code = ((exception.response.data.error?.code == undefined) || (exception.response.data.error?.code < 400)) ? 500 : exception.response.data.error?.code;
    exception.message = exception.response.data.error?.message;
    return exception;
}

function prepareDefaultException()
{
    const exception = new Error();                
    const response = {};
    response.status = 500;
    response.message = "NoOPS";
    exception.response = response;    
    return exception;
}

function prepareLocationPath(client)
{
    const locationPath = client.locationPath(process.env.PROJECT_ID, process.env.VECTOR_SEARCH_LOCATION);
    return locationPath;
}

function prepareIndexInfo(request, opsType)
{
    const indexInfo = {};
    indexInfo.name = request.body.name;
    indexInfo.displayName = request.body.indexName;
    indexInfo.id = request.params.id;
    indexInfo.indexId = request.params.indexId;
    indexInfo.endpointId = request.params.endpointId;
    indexInfo.deployIndexId = request.body.deployIndexId;
    indexInfo.deployedIndexId = request.body.deployedIndexId;
    indexInfo.configurl = request.body.configurl;
    indexInfo.overwrite = request.body.overwrite;
    indexInfo.opsType = opsType;
    indexInfo.docType = (request.params.docType == KImageDocType) ? KDocTypeEnum.Image : KDocTypeEnum.Text ;
    indexInfo.indexType = (request.params.indexType == KStreamIndexType) ? KIndexTypeEnum.Stream : KIndexTypeEnum.Batch;
    indexInfo.dimensions = request.body.dimensions;
    indexInfo.datapoints = request.body.datapoints;    
    return indexInfo;
}

function prepareEndpointInfo(request)
{
    const endpointInfo = {};
    endpointInfo.name = request.body.name;
    endpointInfo.endpointId = request.params.endpointId;
    endpointInfo.public = request.body.public;
    return endpointInfo;
}

function prepareTextEmbeddingInfo(request)
{
    const embeddingInfo = {};
    embeddingInfo.text = request.body.text;
    embeddingInfo.dimensions = request.body.dimensions;
    embeddingInfo.datapointId = request.body.datapointId;
    embeddingInfo.indexId = request.body.indexId;    
    return embeddingInfo;
}

function prepareImageEmbeddingInfo(request)
{
    const embeddingInfo = {};
    embeddingInfo.image = request.body.image;
    embeddingInfo.dimensions = request.body.dimensions;
    embeddingInfo.datapointId = request.body.datapointId;
    embeddingInfo.indexId = request.body.indexId;    
    return embeddingInfo;
}

function prepareNeighbourInfo(request)
{
    const neighbourInfo = {}; 
    neighbourInfo.deployedIndexId = request.body.deployedIndexId;
    neighbourInfo.indexEndpointId = request.body.indexEndpointId;
    neighbourInfo.queries = request.body.queries;
    return neighbourInfo;
}

function prepareIndexConfig(indexInfo)
{
    const requestBody = {};
    const metadata = {};

    requestBody.display_name = indexInfo.name;
    if (indexInfo.indexType == KIndexTypeEnum.Stream)
    {
        requestBody.indexUpdateMethod = KStreamUpdate;
    }
    else if (indexInfo.indexType == KIndexTypeEnum.Batch)
    {
        metadata.contentsDeltaUri = indexInfo.configurl;
        requestBody.indexUpdateMethod = KBatchUpdate;
    }

    const config = {};
    config.dimensions = (indexInfo.dimensions < KMinDimenstions) ? KMinDimenstions : indexInfo.dimensions;

    switch(indexInfo.docType)
    {
        case KDocTypeEnum.Text:
            config.dimensions = (config.dimensions > KTextDimenstions) ? KTextDimenstions : config.dimensions;
            break;
        case KDocTypeEnum.Image:
            config.dimensions = (config.dimensions > KImageDimenstions) ? KImageDimenstions : config.dimensions;
            break;
        default:
        {
            const exception = prepareDefaultException();
            throw exception;
        }
    }

    const annCount = Math.floor(config.dimensions * 1.2);
    config.approximateNeighborsCount = annCount;
    config.distanceMeasureType = "DOT_PRODUCT_DISTANCE";
    
    if (config.dimensions < KMinDimenstions)
    {
        config.shardSize = "SHARD_SIZE_SMALL";
    }
    else if (config.dimensions <= annCount)
    {
        config.shardSize = "SHARD_SIZE_MEDIUM";
    }
    else if (config.dimensions > annCount)
    {
        config.shardSize = "SHARD_SIZE_LARGE";
    }
    
    const algorithm_config = {};    
    const treeAhConfig = {};
    treeAhConfig.leafNodeEmbeddingCount = KEmbeddingsCount;
    treeAhConfig.leafNodesToSearchPercent = KSearchPercent;
    algorithm_config.treeAhConfig = treeAhConfig;
    config.algorithm_config = algorithm_config;
    metadata.config = config;
    requestBody.metadata = metadata;
    return requestBody;
}

function prepareBatchUpdateIndexConfig(indexInfo)
{
    const requestBody = {};
    const metadata = {};
    metadata.contentsDeltaUri = indexInfo.configurl;
    metadata.isCompleteOverwrite = indexInfo.overwrite;
    requestBody.metadata = metadata;
    return requestBody;
}

function prepareStreamUpdateIndexConfig(indexInfo)
{
    const requestBody = {};
    const datapoints = indexInfo.datapoints;
    requestBody.datapoints = datapoints;
    return requestBody;
}

function prepareIndexEndpointConfig(endpointInfo)
{
    const requestBody = {};
    requestBody.display_name = endpointInfo.name;
    requestBody.publicEndpointEnabled = endpointInfo.public;
    return requestBody;
}

function prepareDeployIndexConfig(deployIndexInfo)
{
    const requestBody = {};

    const deployedIndex = {};
    deployedIndex.id = deployIndexInfo.deployIndexId;
    deployedIndex.displayName = deployIndexInfo.displayName;
    deployedIndex.index = `${prepareLocationPath(indexEndpointClient)}/indexes/${deployIndexInfo.indexId}`;
    requestBody.deployedIndex = deployedIndex;
    return requestBody;
}

function prepareUndeployIndexConfig(deployedIndexInfo)
{
    const requestBody = {};
    requestBody.deployed_index_id = deployedIndexInfo.deployedIndexId;
    return requestBody;
}

function processIndexResponse(indexResult)
{
    const indexResponse = {};
    indexResponse.deployedIndexes = indexResult.deployedIndexes;
    indexResponse.name = indexResult.name;
    indexResponse.displayName = indexResult.displayName;
    indexResponse.labels = indexResult.labels;
    indexResponse.indexStats = indexResult.indexStats;
    indexResponse.indexUpdateMethod = indexResult.indexUpdateMethod;
    return indexResponse;
}

function processEndpointResponse(endpointResult)
{
    const endpointResponse = {};
    endpointResponse.name = endpointResult.name;
    endpointResponse.displayName = endpointResult.displayName;
    endpointResponse.description = endpointResult.description;
    endpointResponse.labels = endpointResult.labels;
    endpointResponse.publicEndpointEnabled = endpointResult.publicEndpointEnabled;
    endpointResponse.publicEndpointDomainName = endpointResult.publicEndpointDomainName;
    
    const deployedIndexes = [];
    endpointResult.deployedIndexes.forEach((itemIndex) =>
    {
        const deployedIndex = {};
        deployedIndex.id = itemIndex.id;
        deployedIndex.index = itemIndex.index;
        deployedIndex.displayName = itemIndex.displayName;
        deployedIndexes.push(deployedIndex);
    });
    endpointResponse.deployedIndexes = deployedIndexes;
    return endpointResponse;
}

function processGenericIndexResponse(indexResult)
{
    const indexResponse = indexResult.data;
    return indexResponse;
}

function processEmbeddingResponse(embeddingResult)
{
    const embeddingResponse = embeddingResult.data.results;
    return embeddingResponse;
}

function processSearchResponse(searchResult)
{
    const searchResponse = searchResult.data.nearestNeighbors;
    return searchResponse;
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

async function getIndex(indexInfo)
{
    try
    {
        const request = {};
        request.name = `${prepareLocationPath(indexClient)}/indexes/${indexInfo.id}`;

        const indexResultsList = await indexClient.getIndex(request);
        const indexResult =  indexResultsList[0];
        const indexResponse = processIndexResponse(indexResult);
        return indexResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function listIndexes()
{
    try
    {
        const request = {};
        request.parent = prepareLocationPath(indexClient);

        const indexResultsList = await indexClient.listIndexesAsync(request);
        const indexResponsesList = [];
        
        for await (const indexResult of indexResultsList)
        {
            const indexResponse = processIndexResponse(indexResult);
            indexResponsesList.push(indexResponse);
        };
        return indexResponsesList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function createOrUpdateIndex(indexInfo)
{
    try
    {
        const accessToken = await performAuthentication();
        const parent = prepareLocationPath(indexClient);

        const vectorLocation = process.env.VECTOR_SEARCH_LOCATION;
        let indexURL = `https://${vectorLocation}-aiplatform.googleapis.com/v1/${parent}/indexes`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        };

        let requestBody = {};
        let indexResult = null;

        switch(indexInfo.opsType)
        {
            case KOpsTypeEnum.Create:
                requestBody = prepareIndexConfig(indexInfo);
                indexResult = await Axios.post(`${indexURL}`, requestBody, requestOptions);
                break;
            case KOpsTypeEnum.Update:
                indexURL = `${indexURL}/${indexInfo.indexId}`
                if (indexInfo.indexType == KIndexTypeEnum.Batch)
                {                    
                    requestBody = prepareBatchUpdateIndexConfig(indexInfo);
                }
                else if (indexInfo.indexType == KIndexTypeEnum.Stream)
                {
                    indexURL = `${indexURL}:upsertDatapoints`
                    requestBody = prepareStreamUpdateIndexConfig(indexInfo);
                }
                indexResult = await Axios.post(`${indexURL}`, requestBody, requestOptions);
                break;
            default:
            {
                const exception = prepareDefaultException();
                throw exception;
            }               
        }

        const indexResponse = processGenericIndexResponse(indexResult);
        return indexResponse;        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function getIndexEndpoint(endpointInfo)
{
    try
    {
        const request = {};
        request.name = `${prepareLocationPath(indexEndpointClient)}/indexEndpoints/${endpointInfo.endpointId}`;

        const endpointResultsList = await indexEndpointClient.getIndexEndpoint(request);
        const endpointResult =  endpointResultsList[0];
        const endpointResponse = processEndpointResponse(endpointResult);
        return endpointResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function listEndpoints()
{
    try
    {
        const request = {};
        request.parent = prepareLocationPath(indexEndpointClient);

        const endpointsList = await indexEndpointClient.listIndexEndpointsAsync(request);
        const endpointResponsesList = [];

        for await (const endpointResult of endpointsList)
        {
            const endpointResponse = processEndpointResponse(endpointResult);
            endpointResponsesList.push(endpointResponse);
        };
        return endpointResponsesList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function createIndexEndpoint(endpointInfo)
{
    try
    {
        const accessToken = await performAuthentication();
        const parent = prepareLocationPath(indexClient);

        const vectorLocation = process.env.VECTOR_SEARCH_LOCATION;
        const endpointURL = `https://${vectorLocation}-aiplatform.googleapis.com/v1/${parent}/indexEndpoints`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        };

        const requestBody = prepareIndexEndpointConfig(endpointInfo);
        const endpointResult = await Axios.post(`${endpointURL}`, requestBody, requestOptions);
        const endpointResponse = processGenericIndexResponse(endpointResult);
        return endpointResponse;        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function deployIndexToEndpoint(deployIndexInfo)
{
    try
    {
        const accessToken = await performAuthentication();
        const parent = prepareLocationPath(indexEndpointClient);

        const vectorLocation = process.env.VECTOR_SEARCH_LOCATION;
        const endpointURL = `https://${vectorLocation}-aiplatform.googleapis.com/v1/${parent}/indexEndpoints/${deployIndexInfo.endpointId}:deployIndex`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        };

        const requestBody = prepareDeployIndexConfig(deployIndexInfo);

        const deployedIndexResult = await Axios.post(`${endpointURL}`, requestBody, requestOptions);
        const endpointResponse = processGenericIndexResponse(deployedIndexResult);
        return endpointResponse;        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function createTextEmbedding(embeddingInfo)
{
    try
    {
        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json",
            "modelid": KTextEmbeddingsModel,
            "outputdimension": embeddingInfo.dimensions
        };

        const requestBody = {};
        const instances = [];
        const contentinfo = {};
        contentinfo.content = embeddingInfo.text;
        instances.push(contentinfo);
        requestBody.instances = instances;

        const embeddingResult = await Axios.post(`${_allUrls[KGenAITextlib]}/genai/embeddings/text`,
                                                    requestBody, requestOptions);
        const embeddingResponse = processEmbeddingResponse(embeddingResult);
        return embeddingResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function addTextEmbedding(embeddingInfo)
{
    try
    {
        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"
        };

        const embeddingResponse = await createTextEmbedding(embeddingInfo);
        const datapointValues = embeddingResponse.embeddings.values;
        
        const datapoints = [];
        const datapoint = {};
        datapoint.datapoint_id = embeddingInfo.datapointId;
        datapoint.feature_vector = datapointValues;
        datapoints.push(datapoint);
        
        const indexInfo = {};        
        indexInfo.opsType = KOpsTypeEnum.Update;
        indexInfo.indexType = KIndexTypeEnum.Stream;
        indexInfo.indexId = embeddingInfo.indexId;
        indexInfo.datapoints = datapoints;

        const indexResponse = await createOrUpdateIndex(indexInfo);
        return indexResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function addImageEmbedding(embeddingInfo)
{
    try
    {
        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"
        };

        const embeddingResponse = await createImageEmbedding(embeddingInfo);
        const datapointValues = embeddingResponse.imageEmbedding;
        
        const datapoints = [];
        const datapoint = {};
        datapoint.datapoint_id = embeddingInfo.datapointId;
        datapoint.feature_vector = datapointValues;
        datapoints.push(datapoint);
        
        const indexInfo = {};        
        indexInfo.opsType = KOpsTypeEnum.Update;
        indexInfo.indexType = KIndexTypeEnum.Stream;
        indexInfo.indexId = embeddingInfo.indexId;
        indexInfo.datapoints = datapoints;

        const indexResponse = await createOrUpdateIndex(indexInfo);
        return indexResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function createImageEmbedding(embeddingInfo)
{
    try
    {
        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json",
            "modelid": KImageEmbeddingsModel,
            "outputdimension": embeddingInfo.dimensions
        };

        const requestBody = {};
        const instances = [];
        const contentinfo = {};

        const image = {};
        image.bytesBase64Encoded = embeddingInfo.image;
        contentinfo.image = image;

        instances.push(contentinfo);
        requestBody.instances = instances;
        const embeddingResult = await Axios.post(`${_allUrls[KGenAIMultimodallib]}/genai/embeddings/image`,
                                                    requestBody, requestOptions);
        const embeddingResultList = processEmbeddingResponse(embeddingResult);
        const embeddingResponse = embeddingResultList[0];
        return embeddingResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function searchNeighbours(neighbourInfo)
{
    try
    {
        const accessToken = await performAuthentication();

        const endpointInfo = {};
        endpointInfo.endpointId = neighbourInfo.indexEndpointId;
        const endpointResponse = await getIndexEndpoint(endpointInfo);
        const publicEndpointDomainName = (endpointResponse).publicEndpointDomainName;

        const parent = prepareLocationPath(indexEndpointClient);
        const searchURL = `https://${publicEndpointDomainName}/v1/${parent}/indexEndpoints/${neighbourInfo.indexEndpointId}:findNeighbors`

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            
            "content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }

        const requestBody = {};
        requestBody.deployed_index_id = neighbourInfo.deployedIndexId;
        requestBody.queries = neighbourInfo.queries;
        
        const searchResult = await Axios.post(`${searchURL}`, requestBody, requestOptions);
        const searchResponse = processSearchResponse(searchResult);
        return searchResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function undeployIndexEndpoint(deployedIndexInfo)
{
    try
    {
        const accessToken = await performAuthentication();
        const parent = prepareLocationPath(indexEndpointClient);

        const vectorLocation = process.env.VECTOR_SEARCH_LOCATION;
        const endpointURL = `https://${vectorLocation}-aiplatform.googleapis.com/v1/${parent}/indexEndpoints/${deployedIndexInfo.endpointId}:undeployIndex`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        };

        const requestBody = prepareUndeployIndexConfig(deployedIndexInfo);
        const undeployIndexResult = await Axios.post(`${endpointURL}`, requestBody, requestOptions);
        const endpointResponse = processGenericIndexResponse(undeployIndexResult);
        return endpointResponse;        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function deleteDatapointIndex(indexInfo)
{
    try
    {
        const accessToken = await performAuthentication();
        const parent = prepareLocationPath(indexEndpointClient);

        const vectorLocation = process.env.VECTOR_SEARCH_LOCATION;
        const endpointURL = `https://${vectorLocation}-aiplatform.googleapis.com/v1/${parent}/indexes/${indexInfo.indexId}:removeDatapoints`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        };
        
        const requestBody = {};
        requestBody.datapoint_ids = indexInfo.datapoints;

        const deleteResult = await Axios.post(`${endpointURL}`, requestBody, requestOptions);
        const deleteResponse = processGenericIndexResponse(deleteResult);
        return deleteResponse;        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function deleteIndex(indexInfo)
{
    try
    {
        const accessToken = await performAuthentication();
        const parent = prepareLocationPath(indexEndpointClient);

        const vectorLocation = process.env.VECTOR_SEARCH_LOCATION;
        const endpointURL = `https://${vectorLocation}-aiplatform.googleapis.com/v1/${parent}/indexes/${indexInfo.indexId}`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        };
        
        const deleteResult = await Axios.delete(`${endpointURL}`, requestOptions);
        const deleteResponse = processGenericIndexResponse(deleteResult);
        return deleteResponse;        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function deleteIndexEndpoint(endpointInfo)
{
    try
    {
        const accessToken = await performAuthentication();
        const parent = prepareLocationPath(indexEndpointClient);

        const vectorLocation = process.env.VECTOR_SEARCH_LOCATION;
        const endpointURL = `https://${vectorLocation}-aiplatform.googleapis.com/v1/${parent}/indexEndpoints/${endpointInfo.endpointId}`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        };

        const requestBody = {};
        
        const endpointResult = await Axios.delete(`${endpointURL}`, requestOptions);
        const endpointResponse = processGenericIndexResponse(endpointResult);
        return endpointResponse;        
    }
    catch(exception)
    {
        throw exception;
    }
}

function initializeVectorSearch()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
    prepareAllUrls();
}

/* API DEFINITIONS - START */
/**
 * @fires /vector/search/:docType/index/:indexType?/create
 * @method POST
 * @description Create a new Index
 * Request Param: indexType = 'batch' to create a set of Inddexes as batch job
 * Request Param: indexType = 'stream' to create an empty Index
 * Request Param: docType = 'text' to create an index for Text embedding
 * Request Param: docType = 'image' to create an index for Multimodal embedding
 */
_express.post("/vector/search/:docType/index/:indexType?/create", async (request, response) =>
{
    const indexInfo = prepareIndexInfo(request, KOpsTypeEnum.Create);
    const results = {};

    try
    {
        const indexResponse = await createOrUpdateIndex(indexInfo);        
        results.results = indexResponse;
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
 * @fires /vector/search/index/:indexId/:indexType?/update
 * @method PATCH
 * @description Update an existing Index
 * Request Param: indexType = 'batch' to update a set of Inddexes as batch job
 * Request Param: indexType = 'stream' to create an empty Index
 * Request Param: indexId = value; Update this Index
 */
_express.patch("/vector/search/index/:indexId/:indexType?/update", async (request, response) =>
{
    const indexInfo = prepareIndexInfo(request, KOpsTypeEnum.Update);
    const results = {};

    try
    {
        const indexResponse = await createOrUpdateIndex(indexInfo);        
        results.results = indexResponse;
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
 * @fires /vector/search/endpoint/create
 * @method POST
 * @description Create an Index Endpoint
 */
_express.post("/vector/search/endpoint/create", async (request, response) =>
{
    const endpointInfo = prepareEndpointInfo(request);
    const results = {};

    try
    {
        const endpointResponse = await createIndexEndpoint(endpointInfo);        
        results.results = endpointResponse;
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
 * @fires /vector/search/endpoint/:endpointId/index/:indexId/deploy
 * @method POST
 * @description Deploy an existing Index to an Endpoint
 * Request Param: indexId = value; Deply this Index to ans Endpoint
 * Request Param: endpointId = value; Deploy and Index to this Endpoint
 */
_express.post("/vector/search/endpoint/:endpointId/index/:indexId/deploy", async (request, response) =>
{
    const deployIndexInfo = prepareIndexInfo(request, null);
    const results = {};

    try
    {
        const endpointResponse = await deployIndexToEndpoint(deployIndexInfo);
        results.results = endpointResponse;
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
 * @fires /vector/search/index/:id
 * @method GET
 * @description Get details of a particular Index
 * Request Param: id = value; Get details of this Index
 */
_express.get("/vector/search/index/:id", async (request, response) =>
{
    const indexInfo = prepareIndexInfo(request, null);
    const results = {};

    try
    {
        const indexResponse = await getIndex(indexInfo);        
        results.results = indexResponse;
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
 * @fires /vector/search/indexes
 * @method GET
 * @description List all Indexes
 */
_express.get("/vector/search/indexes", async (request, response) =>
{
    const results = {};

    try
    {
        const indexResponsesList = await listIndexes();        
        results.results = indexResponsesList;
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
 * @fires /vector/search/endpoint/:endpointId
 * @method GET
 * @description Get details of a particular Index Endpoint
 * Request Param: endpointId = value; Get details of this Endpoint
 */
_express.get("/vector/search/endpoint/:endpointId", async (request, response) =>
{
    const endpointInfo = prepareEndpointInfo(request);
    const results = {};

    try
    {
        const endpointResponse = await getIndexEndpoint(endpointInfo);        
        results.results = endpointResponse;
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
 * @fires /vector/search/endpoints
 * @method GET
 * @description List all Index Endpoints
 */
_express.get("/vector/search/endpoints", async (request, response) =>
{
    const results = {};

    try
    {
        const endpointResponsesList = await listEndpoints();        
        results.results = endpointResponsesList;
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
 * @fires /vector/search/text/embedding/create
 * @method POST
 * @description Create new Text Embedding for a specific text conetnt
 */
_express.post("/vector/search/text/embedding/create", async (request, response) =>
{
    const embeddignInfo = prepareTextEmbeddingInfo(request);
    const results = {};

    try
    {
        const embeddingResponse = await createTextEmbedding(embeddignInfo);        
        results.results = embeddingResponse;
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
 * @fires /vector/search/text/embedding/add
 * @method POST
 * @description Add Text Embedding to a Streaming Index
 */
_express.post("/vector/search/text/embedding/add", async (request, response) =>
{
    const embeddignInfo = prepareTextEmbeddingInfo(request);
    const results = {};

    try
    {
        const addResponse = await addTextEmbedding(embeddignInfo);        
        results.results = addResponse;
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
 * @fires /vector/search/image/embedding/create
 * @method POST
 * @description Create new Text Embedding for a specific text content
 */
_express.post("/vector/search/image/embedding/create", async (request, response) =>
{
    const embeddignInfo = prepareImageEmbeddingInfo(request);
    const results = {};

    try
    {
        const embeddingResponse = await createImageEmbedding(embeddignInfo);
        results.results = embeddingResponse;
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
 * @fires /vector/search/image/embedding/add
 * @method POST
 * @description Add Text Embedding to a Streaming Index
 */
_express.post("/vector/search/image/embedding/add", async (request, response) =>
{
    const embeddignInfo = prepareImageEmbeddingInfo(request);
    const results = {};

    try
    {
        const addResponse = await addImageEmbedding(embeddignInfo);        
        results.results = addResponse;
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
 * @fires /vector/search/neighbour
 * @method POST
 * @description Search a new vector for a neighbouring vector with a specific Index
 */
_express.post("/vector/search/neighbour", async (request, response) =>
{
    const neighbourInfo = prepareNeighbourInfo(request);
    const results = {};

    try
    {
        const neighbourResponsesList = await searchNeighbours(neighbourInfo);        
        results.results = neighbourResponsesList;
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
 * @fires /vector/search/endpoint/:endpointId/undeploy
 * @method POST
 * @description Undeploy an Index from an existing Endpoint
 * Request Param: endpointId = value; Undeploy a particular Index from this Endpoint
 */
_express.post("/vector/search/endpoint/:endpointId/undeploy", async (request, response) =>
{
    const deployedIndexInfo = prepareIndexInfo(request, null);    
    const results = {};

    try
    {
        const endpointResponse = await undeployIndexEndpoint(deployedIndexInfo);
        results.results = endpointResponse;
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
 * @fires /vector/search/index/:indexId/datapoints/delete
 * @method DELETE
 * @description Delete a set of Datapoints from an existing Index
 * Request Param: indexId = value; Delete specific Datapoints from this Index
 */
_express.delete("/vector/search/index/:indexId/datapoints/delete", async (request, response) =>
{
    const indexInfo = prepareIndexInfo(request, null);
    const results = {};

    try
    {
        const deleteResponse = await deleteDatapointIndex(indexInfo);        
        results.results = deleteResponse;
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
 * @fires /vector/search/index/:indexId/delete
 * @method DELETE
 * @description Delete an Index
 * Request Param: indexId = value; Delete this Index
 */
_express.delete("/vector/search/index/:indexId/delete", async (request, response) =>
{
    const indexInfo = prepareIndexInfo(request, null);
    const results = {};

    try
    {
        const deleteResponse = await deleteIndex(indexInfo);        
        results.results = deleteResponse;
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
 * @fires /vector/search/endpoint/:endpointId/delete
 * @method DELETE
 * @description Delete an Index Endpoint
 * Request Param: endpointId = value; Delete this Endpoint
 */
_express.delete("/vector/search/endpoint/:endpointId/delete", async (request, response) =>
{
    const endpointInfo = prepareEndpointInfo(request);
    const results = {};

    try
    {
        const endpointResponse = await deleteIndexEndpoint(endpointInfo);        
        results.results = endpointResponse;
        response.send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareRESTErrorMessage(exception);        
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 6064;
_server.listen(port);

initializeVectorSearch();

console.log("Server running at http://localhost:%d", port);
