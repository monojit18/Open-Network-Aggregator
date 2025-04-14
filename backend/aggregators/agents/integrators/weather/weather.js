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

let _express = Express();
let _server = Http.createServer(_express);
let _axiosAgent = null;
let _allUrls = {};

const KMicroServices =
{
    WeatherAdapter: "weather-adapter"
}

const KWeatherConstants =
{
    OPENWEATHER: "openweather",
    PARTNER: "partner",
}

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
    exception.code = (exception.response.status == undefined) ? 500 : exception.response.status;
    exception.message = exception.response.statusText;
    return exception;
}

function processGenericResponse(response)
{
    const genericResponse = response.data.results;
    return genericResponse;
}

function prepareAllUrls()
{
    _allUrls[KMicroServices.WeatherAdapter] = `${process.env.WEATHER_ADAPTER_URL}`;
}

function prepareWeatherMessage(request)
{
    const weatherMessage = {};
    weatherMessage.context = request.body.context;
    weatherMessage.message = request.body.message;
    weatherMessage.preferred_network = request.body.preferred_network;    
    return weatherMessage;
}

function prepareWeatherHeders(request)
{
    const weatherheaders = {};
    weatherheaders[process.env.WEATHER_API_KEY] = request.headers[process.env.WEATHER_API_KEY];
    weatherheaders[process.env.PARTNER_WEATHER_API_KEY] = request.headers[process.env.PARTNER_WEATHER_API_KEY];
    return weatherheaders;
}

async function callWeatherAdapter(weatherMessage, weatherHeaders, urlPart)
{
    const requestOptions = {};
    requestOptions.httpsAgent = _axiosAgent;
    requestOptions.headers = weatherHeaders;

    const requestBody = weatherMessage;

    
    try
    {
        const adapterResponse = await Axios.post(`${_allUrls[KMicroServices.WeatherAdapter]}/weather/${urlPart}`,
                                                    requestBody, requestOptions);
        const adapterResult = processGenericResponse(adapterResponse);
        return adapterResult;        
    }
    catch(exception)
    {
        throw exception;
    }
}

async function initializeAgent()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
    prepareAllUrls();
}

/* API DEFINITIONS - START */
/**
 * @fires /search
 * @method POST
 * @description Calls Search API of the either the Weather Adapter
 */
_express.post("/search", async (request, response) =>
{    
    const weatherMessage = prepareWeatherMessage(request);
    const weatherHeaders = prepareWeatherHeders(request);
    const results = {};
    let adapterResponse = null;

    try    
    {
        const opendWeatherNetwork = weatherMessage.preferred_network[process.env.OPEN_WEATHER_NETWORK_KEY];
        if (opendWeatherNetwork != null)
        {
            const copiedWeatherMessage = JSON.parse(JSON.stringify(weatherMessage));
            copiedWeatherMessage.preferred_network = opendWeatherNetwork;
            adapterResponse = await callWeatherAdapter(copiedWeatherMessage, weatherHeaders,
                                                        KWeatherConstants.OPENWEATHER);            
        }

        const preferredNetworksList = weatherMessage.preferred_network.partners;
        if ((preferredNetworksList != null) && (preferredNetworksList.length > 0))
        {
            await Promise.all(preferredNetworksList.map(async(preferredNetwork) =>
            {
                const copiedWeatherMessage = JSON.parse(JSON.stringify(weatherMessage));
                copiedWeatherMessage.preferred_network = preferredNetwork;                
                adapterResponse = await callWeatherAdapter(copiedWeatherMessage, weatherHeaders,
                                                            KWeatherConstants.PARTNER);
            }));
        }
        results.results = adapterResponse;
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

var port = process.env.port || process.env.PORT || 10002;
_server.listen(port);
initializeAgent();

console.log("Server running at http://localhost:%d", port);