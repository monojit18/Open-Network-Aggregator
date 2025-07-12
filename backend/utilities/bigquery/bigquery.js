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
const FS = require('fs');
const DotEnv = require("dotenv");
const Express = require("express");
const Cors = require("cors");
const {BigQuery} = require("@google-cloud/bigquery");

let _express = Express();
let _server = Http.createServer(_express);
let bigqueryClient = null;

_express.use(Express.json
({
    extended: true,
    limit: '100mb'
}));
    
_express.use(Express.urlencoded
({
    extended: true
}));

_express.use(Cors
({
    origin: "*"
}));

DotEnv.config();

function prepareBigQueryClient(location)
{
    const options = {};    
    options.location = location;

    bigqueryClient = new BigQuery(options);
    return bigqueryClient;
}

function prepareErrorMessage(exception)
{
    exception.code = ((exception.code == undefined) || (exception.code < 100)) ? 500 : exception.code;
    return exception;
}

function prepareBigQueryInfo(request)
{
    const bigqueryInfo = {};
    bigqueryInfo.datasetId = request.params.datasetId;
    bigqueryInfo.tableId = request.params.tableId;    
    bigqueryInfo.options = request.body;
    bigqueryInfo.condition = request.body.condition;
    bigqueryInfo.insertValues = request.body.values;
    bigqueryInfo.insertColumns = request.body.columns;
    return bigqueryInfo;
}

function prepareVectorSearchInfo(request)
{
    const bigqueryInfo = {};
    bigqueryInfo.datasetId = request.params.datasetId;
    bigqueryInfo.tableId = request.params.tableId;
    bigqueryInfo.vectorIndex = request.params.indexName;
    bigqueryInfo.queryColumn = request.query.qcol;
    bigqueryInfo.searchColumn = (request.query.scol != null)
                                ? request.query.scol : request.query.qcol;
    bigqueryInfo.embeddingModel = request.headers.embedding;
    bigqueryInfo.topK = request.headers.max_results;
    bigqueryInfo.distanceType = request.headers.distance;
    bigqueryInfo.indexType = request.headers.index_type;    
    bigqueryInfo.searchQuery = request.body.query;
    bigqueryInfo.searchVector = request.body.vector;
    return bigqueryInfo;
}

function prepareSQLQueryInfo(request)
{
    const sqlQueryInfo = {};
    sqlQueryInfo.datasetId = request.params.datasetId;
    sqlQueryInfo.tableId = request.params.tableId;
    sqlQueryInfo.fields = request.body.fields;
    sqlQueryInfo.match = request.body.match;
    return sqlQueryInfo;
}

function prepareDatasetResponse(datasetResponse)
{
    let dataset = {};
    // dataset.fullDatsetId = datasetResponse.metadata.id;
    dataset.datasetId = datasetResponse.metadata.datasetReference.datasetId;    
    dataset.location = datasetResponse.metadata.location;
    return dataset;
}

function prepareTableResponse(tableResponse)
{
    let table = {};
    // table.tableId = tableResponse.metadata.id;
    table.tableId = tableResponse.id;
    table.schema = tableResponse.metadata.schema;
    table.location = tableResponse.metadata.location;
    return table;
}

function prepareAllJobResponse(jobResponse)
{
    let job = {};
    // job.fullJobId = jobResponse.metadata.id;
    job.jobId = jobResponse.metadata.jobReference.jobId;
    job.location = jobResponse.metadata.jobReference.location;
    job.state = jobResponse.metadata.state;
    return job;
}

function prepareQueryJobResponse(jobResponseInfo, rows)
{
    let jobResponse = {};
    jobResponse.jobId = jobResponseInfo.id;

    const jobRows = [];

    const row1 = rows[1];
    const jobRow1 = {};
    jobRow1.query = row1.metadata.configuration.query.query;
    jobRow1.jobType = row1.metadata.configuration.jobType;
    jobRow1.status = row1.metadata.configuration.status;
    jobRow1.location = row1.metadata.jobReference.location;
    jobRows.push(jobRow1);

    const row2 = rows[2];
    const jobRow2 = {};
    jobRow2.schema = row2.schema;
    jobRow2.totalRows = row2.totalRows;
    jobRow2.totalBytesProcessed = row2.totalBytesProcessed;
    jobRow2.jobComplete = row2.jobComplete;
    jobRow2.location = row2.jobReference.location;
    jobRows.push(jobRow2);

    jobResponse.rows = jobRows;
    return jobResponse;
}

function prepareGetJobResponse(jobResult)
{
    let job = {};
    job.jobId = jobResult.metadata.id;
    job.query = jobResult.metadata.configuration.query.query;
    job.jobType = jobResult.metadata.configuration.jobType;
    job.status = jobResult.metadata.status;
    job.location = jobResult.metadata.jobReference.location;
    return job;
}

function prepareExecuteQueryResponse(queryResponse)
{
    let executeResponse = {};
    executeResponse.jobId = queryResponse.job.id;    
    executeResponse.location = queryResponse.job.location;
    return executeResponse;
}

function prepareInsertRowsResponse(rowsResponse, rows)
{
    let insertResponse = {};
    insertResponse.status = rowsResponse.status;
    insertResponse.kind = rowsResponse.kind;
    insertResponse.rows = rows;
    return insertResponse;
}

async function executeQuery(query, bigqueryInfo)
{
    try
    {
        let bqQuery = query;
        if (bigqueryInfo.condition != null)
        {
            bqQuery += ` WHERE ${bigqueryInfo.condition}`;
        }

        const queryResponseList = await bigqueryClient.query(bqQuery);
        const queryResponse = queryResponseList[1];
        const executeResponse = prepareExecuteQueryResponse(queryResponse);
        return executeResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function getAllDatasets()
{
    try
    {
        const responseList = await bigqueryClient.getDatasets();
        const datasetResponseList = responseList[0];

        const datasetList = [];
        datasetResponseList.forEach((datasetResponse) =>
        {
            const dataset = prepareDatasetResponse(datasetResponse);
            datasetList.push(dataset);
        });
        return datasetList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function getAllJobs()
{
    try
    {
        const responseList = await bigqueryClient.getJobs();
        const jobResponseList = responseList[0];

        const jobsList = [];
        jobResponseList.forEach((jobResponse) =>
        {
            const job = prepareAllJobResponse(jobResponse);
            jobsList.push(job);
        });

        return jobsList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function getJob(bigqueryInfo)
{
    try
    {
        const jobResponse = await bigqueryClient.job(bigqueryInfo.jobId);
        const jobResponseList = await jobResponse.get();
        const jobResult = jobResponseList[0];
        const job = prepareGetJobResponse(jobResult);
        return job;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function createDataset(bigqueryInfo)
{
    try
    {
        const responseList = await bigqueryClient.createDataset(bigqueryInfo.datasetId,
                                                                bigqueryInfo.options);
        const datasetResponse = responseList[0];
        const dataset = prepareDatasetResponse(datasetResponse);
        return dataset;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function createTable(bigqueryInfo)
{
    try
    {
        const responseList = await bigqueryClient.dataset(bigqueryInfo.datasetId)
                                                 .createTable(bigqueryInfo.tableId,
                                                              bigqueryInfo.options);
        const tableResponse = responseList[0];
        const table = prepareTableResponse(tableResponse);
        return table;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function createJob(bigqueryInfo)
{
    try
    {
        const configuration = {};
        configuration.query = bigqueryInfo.options;

        const jobOptions = {};
        jobOptions.configuration = configuration;

        const responseList = await bigqueryClient.createJob(jobOptions);
        const jobResponse = responseList[0];
        const rows = await jobResponse.getQueryResults(jobResponse);
        const job = prepareQueryJobResponse(jobResponse, rows);
        return job;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function createQueryJob(bigqueryInfo)
{
    try
    {
        const jobOptions = bigqueryInfo.options;
        const responseList = await bigqueryClient.createQueryJob(jobOptions);
        const jobResponse = responseList[0];
        const rows = await jobResponse.getQueryResults(jobResponse);
        const job = prepareQueryJobResponse(jobResponse, rows);
        return job;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function getRows(bigqueryInfo)
{
    try
    {
        let query = `SELECT * FROM \`${bigqueryInfo.datasetId}.${bigqueryInfo.tableId}\``;
        if (bigqueryInfo.condition != null)
        {
            query += ` WHERE ${bigqueryInfo.condition}`;
        }
        const responseList = await bigqueryClient.query(query);
        const rowsResponse = responseList[0];
        return rowsResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function insertRowsAsStream(bigqueryInfo)
{
    try
    {
        const responsesList = await bigqueryClient.dataset(bigqueryInfo.datasetId)
                                                  .table(bigqueryInfo.tableId)
                                                  .insert(bigqueryInfo.rows);
        const insertRowsResponse = responsesList[0];
        const insertResponse = prepareInsertRowsResponse(insertRowsResponse, bigqueryInfo.rows);
        return insertResponse;
    }
    catch(exception)
    {        
        throw exception;
    }
}

async function insertRowsAsBatch(bigqueryInfo)
{
    try
    {        
        const batchFilePath = Path.join(__dirname,
                                        process.env.BIG_QUERY_DATA_DIR_PATH,
                                        process.env.BIG_QUERY_BATCH_FILE_NAME);

        const option = {};
        option.flag = "a"; // append mode

        for (const row of bigqueryInfo.rows)
        {
            const rowString = JSON.stringify(row) + "\n";
            FS.writeFileSync(batchFilePath, rowString, option);            
        }

        const responsesList = await bigqueryClient.dataset(bigqueryInfo.datasetId)
                                         .table(bigqueryInfo.tableId)
                                         .load(batchFilePath);
        FS.unlinkSync(batchFilePath);

        const insertRowsResponse = responsesList[0];
        const insertResponse = prepareInsertRowsResponse(insertRowsResponse, bigqueryInfo.rows);
        return insertResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function insertRows(bigqueryInfo)
{
    try
    {
        let insertQuery = `INSERT INTO ${bigqueryInfo.datasetId}.${bigqueryInfo.tableId} values ${bigqueryInfo.insertValues}`;
        const insertResponse = await executeQuery(insertQuery, {});
        return insertResponse;
    }
    catch(exception)
    {        
        throw exception;
    }
}

async function createVectorIndex(vectorSearchInfo)
{
    try
    {
        const vectorIndexQuery = `CREATE OR REPLACE VECTOR INDEX ${vectorSearchInfo.vectorIndex} ON
        ${vectorSearchInfo.datasetId}.${vectorSearchInfo.tableId}(${vectorSearchInfo.queryColumn})
        OPTIONS(index_type = '${vectorSearchInfo.indexType}', distance_type = '${vectorSearchInfo.distanceType}',
        ivf_options='{"num_lists": ${vectorSearchInfo.topK}}')`;

        const responsesList = await bigqueryClient.query(vectorIndexQuery);
        const searchResponse = responsesList[0];
        return searchResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performSearchBySQL(sqlQueryInfo)
{
    try
    {
        const fieldsSring = sqlQueryInfo.fields.join(",");
        let searchQuery = `SELECT ${fieldsSring} FROM ${sqlQueryInfo.datasetId}.${sqlQueryInfo.tableId}`;
        if (sqlQueryInfo.match != null)
            searchQuery = searchQuery.concat(" ", `WHERE ${sqlQueryInfo.match}`);

        const responsesList = await bigqueryClient.query(searchQuery);
        const searchResponse = responsesList[0];       
        return searchResponse;
    }
    catch(exception)
    {
        throw exception;
    }    
}

async function performSearchByQuery(vectorSearchInfo)
{
    try
    {
        const vectorSearchQuery = `SELECT * from VECTOR_SEARCH(TABLE ${vectorSearchInfo.datasetId}.${vectorSearchInfo.tableId}, '${vectorSearchInfo.searchColumn}',
        (SELECT ${vectorSearchInfo.queryColumn} FROM ML.GENERATE_EMBEDDING(MODEL  ${vectorSearchInfo.datasetId}.${vectorSearchInfo.embeddingModel},
        (
            (SELECT '${vectorSearchInfo.searchQuery}' AS content)
        ))), '${vectorSearchInfo.queryColumn}', top_k => ${vectorSearchInfo.topK}, distance_type => '${vectorSearchInfo.distanceType}');`;

        const responsesList = await bigqueryClient.query(vectorSearchQuery);
        const searchResponse = responsesList[0];
        return searchResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performSearchByVector(vectorSearchInfo)
{
    try
    {        
        let searchVector = vectorSearchInfo.searchVector;
        if (Array.isArray(searchVector) == true)
        {
            searchVector = "[" + searchVector.toString() + "]";
        }

        const vectorSearchQuery = `SELECT * from VECTOR_SEARCH(TABLE ${vectorSearchInfo.datasetId}.${vectorSearchInfo.tableId}, '${vectorSearchInfo.searchColumn}',
        (SELECT ${searchVector} AS ${vectorSearchInfo.queryColumn}), top_k => ${vectorSearchInfo.topK}, distance_type => '${vectorSearchInfo.distanceType}');`;

        const responsesList = await bigqueryClient.query(vectorSearchQuery);
        const searchResponsesList = responsesList[0];
        return searchResponsesList;
    }
    catch(exception)
    {
        throw exception;
    }    
}

async function deleteRows(bigqueryInfo)
{
    try
    {
        let query = `DELETE FROM \`${bigqueryInfo.datasetId}.${bigqueryInfo.tableId}\``;
        const executeResponse = await executeQuery(query, bigqueryInfo);
        return executeResponse;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function deleteTable(bigqueryInfo)
{
    try
    {
        await bigqueryClient.dataset(bigqueryInfo.datasetId)
                            .table(bigqueryInfo.tableId)
                            .delete(bigqueryInfo.options);
    }
    catch(exception)
    {
        throw exception;
    }
}

async function deleteDataset(bigqueryInfo)
{
    try
    {
        await bigqueryClient.dataset(bigqueryInfo.datasetId)
                            .delete(bigqueryInfo.options);
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
_express.get("/healthz", async (request, response) =>
{
    const results = {};
    response.status(200).send(results);
});

/**
 * @fires /bigquery/datasets/all
 * @method GET
 * @description Get all Datasets in Bigquery
 */
_express.get("/bigquery/datasets/all", async (request, response) =>
{
    const results = {};

    try
    {
        const datasetsList = await getAllDatasets();
        results.results = datasetsList;
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = {};
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /bigquery/jobs/all
 * @method GET
 * @description Get all Jobs in Bigquery
 */
_express.get("/bigquery/jobs/all", async (request, response) =>
{    
    const results = {};

    try
    {
        const jobsList = await getAllJobs();
        results.results = jobsList;
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = {};
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /bigquery/jobs/:jobId
 * @method GET
 * @description Get a specific Job in Bigquery
 * Request Param: jobId = value; mandatory
 */
_express.get("/bigquery/jobs/:jobId", async (request, response) =>
{
    const bigqueryInfo = {};    
    bigqueryInfo.jobId = request.params.jobId;

    const results = {};
    let contents = null;

    try
    {
        const jobResponse = await getJob(bigqueryInfo);
        results.results = jobResponse;
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = {};
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /bigquery/jobs/:jobId
 * @method POST
 * @description Create a Job in Bigquery
 * Request Param: jobId = value; mandatory
 */
_express.post("/bigquery/jobs/:jobId", async (request, response) =>
{
    const bigqueryInfo = {};    
    bigqueryInfo.options = request.body;

    const results = {};    

    try
    {
        const jobResponse = await createJob(bigqueryInfo);
        results.results = jobResponse;
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = {};
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /bigquery/jobs/:jobId
 * @method POST
 * @description Create a Query Job in Bigquery
 * Request Param: jobId = value; mandatory
 */
_express.post("/bigquery/jobs/:jobId/query", async (request, response) =>
{
    const bigqueryInfo = {};    
    bigqueryInfo.options = request.body;

    const results = {};    

    try
    {
        const jobResponse = await createQueryJob(bigqueryInfo);
        results.results = jobResponse;
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = {};
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /bigquery/datasets/:datasetId
 * @method POST
 * @description Create a Dataset in Bigquery
 * Request Param: datasetId = value; mandatory
 */
_express.post("/bigquery/datasets/:datasetId", async (request, response) =>
{
    const bigqueryInfo = prepareBigQueryInfo(request);
    bigqueryInfo.options = request.body;

    const results = {};

    try
    {
        const createResponse = await createDataset(bigqueryInfo);
        results.results = createResponse;
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = {};
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /bigquery/datasets/:datasetId/tables/:tableId
 * @method POST
 * @description Create a Table inside a Dataset in Bigquery
 * Request Param: datasetId = value; mandatory
 * Request Param: tableId = value; mandatory
 */
_express.post("/bigquery/datasets/:datasetId/tables/:tableId", async (request, response) =>
{
    const bigqueryInfo = prepareBigQueryInfo(request);    
    bigqueryInfo.options = request.body;

    const results = {};   

    try
    {
        const createResponse = await createTable(bigqueryInfo);
        results.results = createResponse;
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = {};
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /bigquery/datasets/:datasetId/tables/:tableId/row
 * @method POST
 * @description Fetch all records of a Table inside a Dataset in Bigquery
 * Request Param: datasetId = value; mandatory
 * Request Param: tableId = value; mandatory
 */
_express.post("/bigquery/datasets/:datasetId/tables/:tableId/rows", async (request, response) =>
{
    const bigqueryInfo = prepareBigQueryInfo(request);

    const results = {};

    try
    {
        const getResponse = await getRows(bigqueryInfo);
        results.results = getResponse;
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
 * @fires /bigquery/datasets/:datasetId/tables/:tableId/rows/insert/stream
 * @method POST
 * @description Insert records as a stream in a Table in Bigquery (No Quota limit)
 * Request Param: datasetId = value; mandatory
 * Request Param: tableId = value; mandatory
 */
_express.post("/bigquery/datasets/:datasetId/tables/:tableId/rows/insert/stream", async (request, response) =>
{
    const bigqueryInfo = prepareBigQueryInfo(request);
    bigqueryInfo.rows = request.body.rows;

    const results = {};

    try
    {
        const insertResponse = await insertRowsAsStream(bigqueryInfo);
        results.results = insertResponse;
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
 * @fires /bigquery/datasets/:datasetId/tables/:tableId/rows/insert/stream
 * @method POST
 * @description Insert records as a stream in a Table in Bigquery (No Quota limit)
 * Request Param: datasetId = value; mandatory
 * Request Param: tableId = value; mandatory
 */
_express.post("/bigquery/datasets/:datasetId/tables/:tableId/rows/insert/batch", async (request, response) =>
    {
        const bigqueryInfo = prepareBigQueryInfo(request);
        bigqueryInfo.rows = request.body.rows;
    
        const results = {};
    
        try
        {
            const insertResponse = await insertRowsAsBatch(bigqueryInfo);
            results.results = insertResponse;
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
 * @fires /bigquery/datasets/:datasetId/tables/:tableId/rows/insert
 * @method POST
 * @description Insert records in a Table in Bigquery (Quota limit)
 * Request Param: datasetId = value; mandatory
 * Request Param: tableId = value; mandatory
 */
_express.post("/bigquery/datasets/:datasetId/tables/:tableId/rows/insert", async (request, response) =>
{
    const bigqueryInfo = prepareBigQueryInfo(request);
    const results = {};

    try
    {
        const insertResponse = await insertRows(bigqueryInfo);
        results.results = insertResponse;
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
 * @fires /bigquery/datasets/:datasetId/tables/:tableId/vector/indexes/:indexName/create
 * @method POST
 * @description Creates Vector Search Index in Bigquery
 * Request Param: datasetId = value; mandatory
 * Request Param: tableId = value; mandatory
 * Request Param: indexName = value; mandatory
 */
_express.post("/bigquery/datasets/:datasetId/tables/:tableId/vector/indexes/:indexName/create", async (request, response) =>
{
    const vectorSearchInfo = prepareVectorSearchInfo(request);
    const results = {};

    try
    {
        const createResponse = await createVectorIndex(vectorSearchInfo);
        results.results = createResponse;
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
 * @fires /bigquery/datasets/:datasetId/tables/:tableId/search/sql
 * @method POST
 * @description Perform Search by a SQL Query in a Bigquery Table
 * Request Param: datasetId = value; mandatory
 * Request Param: tableId = value; mandatory
 */
_express.post("/bigquery/datasets/:datasetId/tables/:tableId/search/sql", async (request, response) =>
{
    const sqlQueryInfo = prepareSQLQueryInfo(request);
    const results = {};

    try
    {
        const searchResponse = await performSearchBySQL(sqlQueryInfo);
        results.results = searchResponse;
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
 * @fires /bigquery/datasets/:datasetId/tables/:tableId/search/query
 * @method POST
 * @description Perform Search by Query in a Bigquery Table
 * Request Param: datasetId = value; mandatory
 * Request Param: tableId = value; mandatory
 */
_express.post("/bigquery/datasets/:datasetId/tables/:tableId/search/query", async (request, response) =>
{
    const vectorSearchInfo = prepareVectorSearchInfo(request);
    const results = {};

    try
    {
        const searchResponse = await performSearchByQuery(vectorSearchInfo);
        results.results = searchResponse;
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
 * @fires /bigquery/datasets/:datasetId/tables/:tableId/search/vector
 * @method POST
 * @description Perform Search by Vector in a Bigquery Table
 * Request Param: datasetId = value; mandatory
 * Request Param: tableId = value; mandatory
 */
_express.post("/bigquery/datasets/:datasetId/tables/:tableId/search/vector", async (request, response) =>
{
    const vectorSearchInfo = prepareVectorSearchInfo(request);
    const results = {};

    try
    {
        const searchResponse = await performSearchByVector(vectorSearchInfo);
        results.results = searchResponse;
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
 * @fires /bigquery/datasets/:datasetId/tables/:tableId/rows
 * @method DELETE
 * @description Delete records from a Bigquery Table
 * Request Param: datasetId = value; mandatory
 * Request Param: tableId = value; mandatory
 */
_express.delete("/bigquery/datasets/:datasetId/tables/:tableId/rows", async (request, response) =>
{
    const bigqueryInfo = prepareBigQueryInfo(request);

    const results = {};

    try
    {
        const deleteResponse = await deleteRows(bigqueryInfo);
        results.results = deleteResponse;
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = {};
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /bigquery/datasets/:datasetId/tables/:tableId
 * @method DELETE
 * @description Delete a Bigquery Table
 * Request Param: datasetId = value; mandatory
 * Request Param: tableId = value; mandatory
 */
_express.delete("/bigquery/datasets/:datasetId/tables/:tableId", async (request, response) =>
{
    const bigqueryInfo = prepareBigQueryInfo(request);
    bigqueryInfo.options = request.body;
    
    const results = {};    

    try
    {
        const deleteResponse = await deleteTable(bigqueryInfo);
        results.results = deleteResponse;
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = {};
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});

/**
 * @fires /bigquery/datasets/:datasetId
 * @method DELETE
 * @description Delete a Bigquery Dataset
 * Request Param: datasetId = value; mandatory
 */
_express.delete("/bigquery/datasets/:datasetId", async (request, response) =>
{
    const bigqueryInfo = prepareBigQueryInfo(request);

    const results = {};    

    try
    {
        const deleteResponse = await deleteDataset(bigqueryInfo);
        results.results = deleteResponse;
        response.status(200).send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = {};
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
});
/* API DEFINITIONS - END */

prepareBigQueryClient(process.env.BIG_QUERY_LOCATION);

var port = process.env.port || process.env.PORT || 6076;
_server.listen(port);

console.log("Server running at http://localhost:%d", port);
