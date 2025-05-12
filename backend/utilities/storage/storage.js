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
const FS = require("fs");
const Express = require("express");
const {Storage, TransferManager} = require("@google-cloud/storage");
const Stream = require("stream");

const KStorageConstants =
{
    ByteMultiplier: 1024
};

let _express = Express();
let _server = Http.createServer(_express);
const _storageClient = new Storage();

_express.use(Express.json
({
    extended: true,
    limit: '10000mb'
}));
    
_express.use(Express.urlencoded
({
    extended: true
}));

DotEnv.config();

function prepareErrorMessage(exception)
{
    exception.code = (exception.code == undefined) ? 500 : exception.code;
    return exception;
}

function prepareStorageInfo(request)
{
    const storageInfo = {};
    storageInfo.bucketName = request.params.bucketName;

    if (request.query.dest != null)
        storageInfo.destination = request.query.dest;

    if (request.query.folder != null)
        storageInfo.folderName = request.query.folder;

    if (request.params.fileName != null)
        storageInfo.fileName = request.params.fileName;

    if (request.body.contents != null)
        storageInfo.contents = request.body.contents;

    if (request.body.metadata != null)
        storageInfo.metaData = request.body.metadata;

    if (request.body.source != null)
        storageInfo.sourceFileName = request.body.source;
    
    if (request.headers != null)
        storageInfo.headers = request.headers;
    
    return storageInfo;
}

function getFilePath(fileName, folderName)
{
    let filePath = fileName;
    if (folderName != null)
        filePath = `${folderName}/${filePath}`;

    return filePath;
}

async function performRetrieveSigneUri(request)
{
    const storageInfo = prepareStorageInfo(request);    

    try
    {
        const results = await retrieveSignedURI(storageInfo);
        return results;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function retrieveSignedURI(storageInfo)
{  
    const storageConfig = {};
    storageConfig.action = storageInfo.headers["action"];
    storageConfig.expires = Number(storageInfo.headers["expires"]);

    const version = storageInfo.headers["version"];
    if (version != null)
        storageConfig.version = version;

    const cName = storageInfo.headers["cname"];
    if (cName != null)
        storageConfig.cname = cName;

    const extensionHeaders = storageInfo.headers["extensionHeaders"];
    if (extensionHeaders != null)
        storageConfig.extensionHeaders = extensionHeaders;

    try
    {
        const filePath = getFilePath(storageInfo.fileName, storageInfo.folderName);
        
        let responseList = null;
        if (storageInfo.fileName != null)
        {
            responseList = await _storageClient.bucket(storageInfo.bucketName)
                                              .file(filePath)
                                              .getSignedUrl(storageConfig);
        }
        else
        {
            responseList = await _storageClient.bucket(storageInfo.bucketName)
                                              .getSignedUrl(storageConfig);
        }
        
        const signedUri = responseList[0];
        return signedUri;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function retrieveMetaData(storageInfo)
{    
    try
    {
        const responseList = await _storageClient.bucket(storageInfo.bucketName)
                                                .file(storageInfo.fileName)
                                                .getMetadata();

        const metaDataResponse = responseList[0];        
        return metaDataResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function setMetaData(storageInfo)
{
    try
    {
        const metaData = {};
        metaData.metadata = storageInfo.metaData;        
        const responseList = await _storageClient.bucket(storageInfo.bucketName)
                                                .file(storageInfo.fileName)
                                                .setMetadata(metaData);
        const metaDataResponse = responseList[0];        
        return metaDataResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function listFiles(storageInfo)
{
    try
    {

        const options = {};
        if (storageInfo.folderName != null)
            options.prefix = storageInfo.folderName;        

        const responseList = await _storageClient.bucket(storageInfo.bucketName)
                                                 .getFiles(options);
        const fileListResponse = responseList[0];
        const fileListInfo = [];

        fileListResponse.forEach((fileResponse) =>
        {
            const fileInfo = {};
            fileInfo.metaData = fileResponse.metaData;
            fileInfo.name = fileResponse.name;

            const bucketInfo = {};
            bucketInfo.name = fileResponse.bucket.name;
            bucketInfo.metaData = fileResponse.bucket.metaData;
            fileInfo.bucket = bucketInfo;
            fileListInfo.push(fileInfo);
        });
        return fileListInfo;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function downloadFile(storageInfo)
{
    const storageConfig = {};
    storageConfig.destination = storageInfo.destination;    

    try
    {
        const filePath = getFilePath(storageInfo.fileName, storageInfo.folderName);
        await _storageClient.bucket(storageInfo.bucketName)
                           .file(filePath)
                           .download(storageConfig);
    }
    catch(exception)
    {
        throw exception;
    }
}

async function downloadFileIntoMemory(storageInfo)
{
    try
    {
        const filePath = getFilePath(storageInfo.fileName, storageInfo.folderName);
        const contents = await _storageClient.bucket(storageInfo.bucketName)
                                            .file(filePath)
                                            .download();
        const buffer = new Buffer.from(contents[0]);
        return buffer.toString("base64");
    }
    catch(exception)
    {
        throw exception;
    }
}

async function downloadFileComposite(storageInfo)
{
    try
    {
        const filePath = getFilePath(storageInfo.fileName, storageInfo.folderName);
        const transferManager = new TransferManager(_storageClient.bucket(storageInfo.bucketName));

        const chunkSize = storageInfo.headers["chunk"];
        const options = {};
        options.chunkSizeBytes = Number(chunkSize) * KStorageConstants.ByteMultiplier;
        options.destination = storageInfo.destination;

        await transferManager.downloadFileInChunks(filePath, options);
    }
    catch(exception)
    {
        throw exception;
    }
}

async function downloadFileCompositeIntoMemory(storageInfo)
{
    try
    {
        const filePath = getFilePath(storageInfo.fileName, storageInfo.folderName);
        const transferManager = new TransferManager(_storageClient.bucket(storageInfo.bucketName));

        const chunkSize = storageInfo.headers["chunk"];
        const options = {};
        options.chunkSizeBytes = Number(chunkSize) * KStorageConstants.ByteMultiplier;

        const contents = await transferManager.downloadFileInChunks(filePath, options);
        const buffer = new Buffer.from(contents[0]);
        return buffer.toString("base64");
    }
    catch(exception)
    {
        throw exception;
    }
}

async function uploadFile(storageInfo)
{
    try
    {
        let responselist = [];
        const contents = Buffer.from(storageInfo.contents, "base64");
        
        const filePath = getFilePath(storageInfo.fileName, storageInfo.folderName);
        responselist = await _storageClient.bucket(storageInfo.bucketName)
                                          .file(filePath)
                                          .save(contents);

        if (storageInfo.metaData != null)
        {
            responselist = await setMetaData(storageInfo);
        }    
        return responselist;
    }
    catch(exception)
    {
        throw exception;
    }
    
}

async function uploadFileComposite(storageInfo)
{
    try
    {
        let responselist = [];
        const contents = Buffer.from(storageInfo.contents, "base64");
        const srcFilePath = Path.join(__dirname, process.env.STORAGE_DIR_PATH, storageInfo.fileName);
        FS.writeFileSync(srcFilePath, contents);
        
        const filePath = getFilePath(storageInfo.fileName, storageInfo.folderName);
        const transferManager = new TransferManager(_storageClient.bucket(storageInfo.bucketName));

        const chunkSize = storageInfo.headers["chunk"];
        const options = {};
        options.chunkSizeBytes = Number(chunkSize) * KStorageConstants.ByteMultiplier * KStorageConstants.ByteMultiplier;
        options.uploadName = filePath;
        responselist = await transferManager.uploadFileInChunks(srcFilePath, options);

        if (storageInfo.metaData != null)
        {
            responselist = await setMetaData(storageInfo);
        }    
        return responselist;
    }
    catch(exception)
    {        
        throw exception;
    }
    
}

async function uploadFileStream(storageInfo, response)
{
    try
    {
        const contents = Buffer.from(storageInfo.contents, "base64");
        const srcFilePath = Path.join(__dirname, process.env.STORAGE_DIR_PATH, storageInfo.fileName);
        FS.writeFileSync(srcFilePath, contents);        
        
        const filePath = getFilePath(storageInfo.fileName, storageInfo.folderName);
        const bucketRef = _storageClient.bucket(storageInfo.bucketName);
        const file = bucketRef.file(filePath);

        const passthroughSteeam = new Stream.PassThrough();
        passthroughSteeam.write(contents);
        passthroughSteeam.end();

        await passthroughSteeam.pipe(file.createWriteStream()).on("finish", () =>
        {
            response.status(200).send({});
        });        
    }
    catch(exception)
    {
        throw exception;
    }
    
}

async function createBucket(storageInfo)
{
    const storageConfig = {};
    storageConfig.location = storageInfo.headers["location"];
    storageConfig.storageClass = storageInfo.headers["type"];

    const cors = storageInfo.headers["cors"];
    if (cors != null)
        storageConfig.cors = cors;

    const dra = storageInfo.headers["dra"];
    if (dra != null)
        storageConfig.dra = dra;

    const versioning = storageInfo.headers["versioning"];
    if (versioning != null)
        storageConfig.versioning = versioning;
    
    try
    {
        const responseList = await _storageClient.createBucket(storageInfo.bucketName, storageConfig);
        const bucketResponse = responseList[1];
        return bucketResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function deleteFile(storageInfo)
{
    try
    {
        const filePath = getFilePath(storageInfo.fileName, storageInfo.folderName);
        const storageConfig = {};
        storageConfig.preconditionOpts = {ifGenerationMatch: 0};
        await _storageClient.bucket(storageInfo.bucketName).file(filePath)
                                                          .delete(storageConfig);
    }
    catch(exception)
    {
        throw exception;
    }    
}

async function deleteBucket(storageInfo)
{
    try
    {
        await _storageClient.bucket(storageInfo.bucketName).delete();
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
/**
 * @fires /storage/bucket/:bucketName/signeduri/:fileName
 * @method GET
 * @description Retrieve SignedURI of the file within the bucket
 */
_express.get("/storage/bucket/:bucketName/signeduri/:fileName", async (request, response) =>
{
    const results = {};

    try
    {
        results.results = await performRetrieveSigneUri(request);
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

 /**
 * @fires /storage/bucket/:bucketName/signeduri
 * @method GET
 * @description Retrieve SignedURI of the bucket
 */
_express.get("/storage/bucket/:bucketName/signeduri", async (request, response) =>
{
    const results = {};

    try
    {
        results.results = await performRetrieveSigneUri(request);
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /storage/bucket/:bucketName/file/:fileName/metadata
 * @method GET
 * @description Get Metadata of the file within the bucket
 */
_express.get("/storage/bucket/:bucketName/file/:fileName/metadata", async (request, response) =>
{
    const storageInfo = prepareStorageInfo(request);
    const results = {};

    try
    {
        results.results = await retrieveMetaData(storageInfo);
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /storage/bucket/:bucketName/file/:fileName/metadata
 * @method POST
 * @description Set Metadata of the file within the bucket
 */
_express.post("/storage/bucket/:bucketName/file/:fileName/metadata", async (request, response) =>
{
    const storageInfo = prepareStorageInfo(request);
    const results = {};

    try
    {
        results.results = await setMetaData(storageInfo);
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /storage/bucket/:bucketName/files/list
 * @method GET
 * @description List of files in the bucket
 */
_express.get("/storage/bucket/:bucketName/files/list", async (request, response) =>
{    
    const storageInfo = prepareStorageInfo(request);
    const results = {};    

    try
    {
        const contents = await listFiles(storageInfo);
        results.contents = contents;
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /storage/bucket/:bucketName/file/:fileName
 * @method GET
 * @description Download the file from the bucket
 */
_express.get("/storage/bucket/:bucketName/file/:fileName", async (request, response) =>
{    
    const storageInfo = prepareStorageInfo(request);
    if (storageInfo.destination != null)
    {        
        const filePath = Path.join(__dirname, process.env.STORAGE_DIR_PATH, storageInfo.destination);
        storageInfo.destination = filePath;        
    }

    const results = {};
    let contents = null;

    try
    {
        if (storageInfo.destination != null)
            await downloadFile(storageInfo);
        else
        {
            contents = await downloadFileIntoMemory(storageInfo);
            results.contents = contents;
        }
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /storage/bucket/:bucketName/file/:fileName/composite
 * @method GET
 * @description Download the file from the bucket as parallel composite upload
 */
_express.get("/storage/bucket/:bucketName/file/:fileName/composite", async (request, response) =>
{    
    const storageInfo = prepareStorageInfo(request);
    if (storageInfo.destination != null)
    {        
        const filePath = Path.join(__dirname, process.env.STORAGE_DIR_PATH, storageInfo.destination);
        storageInfo.destination = filePath;        
    }

    const results = {};
    let contents = null;

    try
    {
        if (storageInfo.destination != null)
            await downloadFileComposite(storageInfo);
        else
        {
            contents = await downloadFileCompositeIntoMemory(storageInfo);
            results.contents = contents;
        }
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /storage/bucket/:bucketName/file/:fileName
 * @method POST
 * @description Upload the file to the bucket
 */
_express.post("/storage/bucket/:bucketName/file/:fileName", async (request, response) =>
{
    const storageInfo = prepareStorageInfo(request);
    const results = {};

    try
    {
        results.results = await uploadFile(storageInfo);
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /storage/bucket/:bucketName/file/:fileName/composite
 * @method POST
 * @description Upload the file to a bucket as parallel composite upload
 */
_express.post("/storage/bucket/:bucketName/file/:fileName/composite", async (request, response) =>
{
    const storageInfo = prepareStorageInfo(request);
    const results = {};

    try
    {
        results.results = await uploadFileComposite(storageInfo);
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /storage/bucket/:bucketName/file/:fileName/steam
 * @method POST
 * @description Upload the file to a bucket as steaming upload
 */
_express.post("/storage/bucket/:bucketName/file/:fileName/stream", async (request, response) =>
{
    const storageInfo = prepareStorageInfo(request);    

    try
    {
        await uploadFileStream(storageInfo, response);        
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /storage/bucket/:bucketName
 * @method POST
 * @description Create Storage bucket
 */
_express.post("/storage/bucket/:bucketName", async (request, response) =>
{
    const storageInfo = prepareStorageInfo(request);
    const results = {};

    try
    {
        results.results = await createBucket(storageInfo);        
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /storage/bucket/:bucketName/file/:fileName
 * @method DELETE
 * @description Delete the file from the bucket
 */
_express.delete("/storage/bucket/:bucketName/file/:fileName", async (request, response) =>
{
    const storageInfo = prepareStorageInfo(request);
    const results = {};

    try
    {
        results.results = await deleteFile(storageInfo);
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /storage/bucket/:bucketName
 * @method DELETE
 * @description Delete the bucket
 */
_express.delete("/storage/bucket/:bucketName", async (request, response) =>
{
    const storageInfo = prepareStorageInfo(request);
    const results = {};

    try
    {
        results.results = await deleteBucket(storageInfo);
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 6060;
_server.listen(port);

console.log("Server running at http://localhost:%d", port);
