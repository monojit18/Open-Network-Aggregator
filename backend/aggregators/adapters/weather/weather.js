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

// const KWeatherAPIKey = "5901703212373e462f51de78f4efc4f7";
const KWeatherAPIKey = "x-api-weather-key";
const KStatusACK = "ACK";

const KCallbackEvents =
{
    OnWeatherAction: "on_weather",
    OnCallbackAction: "callback",
    OnErrorAction: "on_error"
}

const KWeatherConfig =
{
    UNITS: "metric"
}

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

function preparePartnerWeatherInfo(request)
{
    const weatherInfo = {};
    weatherInfo.context = request.body.context;
    weatherInfo.message = request.body.message;
    weatherInfo.apiKey = (request.headers != null) ? request.headers[KWeatherAPIKey] : null;
    weatherInfo.preferred_network = request.body.preferred_network;
    weatherInfo.address = weatherInfo.message.network.filters.address;    
    return weatherInfo;
}

function prepareOpenWeatherInfo(request)
{
    const weatherInfo = preparePartnerWeatherInfo(request);
    weatherInfo.units = KWeatherConfig.UNITS;
    return weatherInfo;
}

function preparePartnerWeatherRequest(weatherInfo)
{
    const weatherRequest = {};
    weatherRequest.context = weatherInfo.context;
    weatherRequest.message = weatherInfo.message;      
    return weatherRequest;
}

function prepareAckResponse(weatherInfo)
{
    const ackResponse = {};
    ackResponse.context = weatherInfo.context;

    const message = {};
    const ack = {};
    ack.status = KStatusACK;
    message.ack = ack;
    ackResponse.message = message;
    return ackResponse;
}

function preaprePartnerWeatherResponse(weatherResult)
{
    const weatherResponse = weatherResult.data;
    return weatherResponse;
}

function preapreOpenWeatherResponse(weatherResult)
{
    const response = weatherResult.data;

    const weatherResponse ={};
    weatherResponse.coord = response.coord;
    weatherResponse.weather = response.weather[0];
    weatherResponse.weather.icon = `${process.env.WEATHER_ICON_URL}/${response.weather[0].icon}@2x.png`;
    weatherResponse.main = response.main;
    weatherResponse.visibility = `${Number(response.visibility)/1000} km`;

    if (response.dt != null)
    {        
        const weatherDate = new Date(response.dt * 1000);
        weatherResponse.date = `${weatherDate.toLocaleString()}`;
    }

    if (response.wind != null)
    {
        weatherResponse.windSpeed = `${response.wind.speed} meter/sec`;
    }

    if (response.clouds != null)
    {
        weatherResponse.clouds = `${response.clouds.all} %`;
    }

    if (response.rain != null)
    {
        if (response.rain.rain1h != null)
        {
            weatherResponse.rain1h = `${response.rain.rain1h} mm`;
        }

        if (response.rain.rain3h != null)
        {
            weatherResponse.rain3h = `${response.rain.rain3h} mm`;
        }
    }

    if (response.snow != null)
    {
        if (response.snow.snow1h != null)
        {
            weatherResponse.snow1h = `${response.snow.snow1h}mm`;
        }

        if (response.snow.snow3h != null)
        {
            weatherResponse.snow3h = `${response.snow.snow3h}mm`;
        }
    }

    weatherResponse.name = response.name;
    return weatherResponse;
}

function initializeAdapter()
{
    _axiosAgent = new Https.Agent
    ({
        rejectUnauthorized: false
    });
}

async function firePartnerCallbackEvent(weatherResponse)
{
    try
    {
        const weatherData = {};
        weatherData.room = weatherResponse.context.transaction_id;
        weatherData.event = KCallbackEvents.OnWeatherAction;
        
        const payload = {};
        payload.context = weatherResponse.context;
        payload.message = weatherResponse.message;
        weatherData.payload = payload;
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, weatherData);
    }
    catch(exception)
    {
        throw exception;
    }
}

async function fireCallbackEvent(weatherResponse, weatherInfo)
{
    try
    {
        const weatherData = {};
        weatherData.room = weatherInfo.context.transaction_id;
        weatherData.event = KCallbackEvents.OnWeatherAction;
        
        const payload = {};
        payload.context = weatherInfo.context;
        payload.message = weatherInfo.message;

        const catalog = {};
        const descriptor = weatherInfo.preferred_network.descriptor;
        catalog.descriptor = descriptor;

        const provider = {};
        provider.descriptor = catalog.descriptor;
        const items = weatherResponse;
        provider.items = items;
        catalog.provider = provider;
        payload.message.catalog = catalog;

        weatherData.payload = payload;
        await emitAdapterEvent(KCallbackEvents.OnCallbackAction, weatherData);
    }
    catch(exception)
    {
        throw exception;
    }
}

async function fireErrorEvent(errorInfo, weatherInfo)
{
    try
    {
        const weatherData = {};
        weatherData.room = weatherInfo.context.transaction_id;
        weatherData.event = KCallbackEvents.OnErrorAction;
        
        const payload = {};
        payload.context = weatherInfo.context;
        payload.message = weatherInfo.message;

        const errorResponse = {};
        errorResponse.code = errorInfo.response?.data?.error?.code;
        errorResponse.message = errorInfo.response?.data?.error?.message;
        payload.error = errorResponse;

        weatherData.payload = payload;
        await emitAdapterEvent(KCallbackEvents.OnErrorAction, weatherData);
    }
    catch(exception)
    {
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

async function performPartnerWeatherSearch(weatherInfo)
{
    try
    {
        let weatherURL = `${weatherInfo.preferred_network.url}`;
        
        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"            
        };

        const requestBody = preparePartnerWeatherRequest(weatherInfo);
        const weatherResult = await Axios.post(`${weatherURL}`, requestBody, requestOptions);
        const weatherResponse = preaprePartnerWeatherResponse(weatherResult);        
        await firePartnerCallbackEvent(weatherResponse);
    }
    catch(exception)
    {
        throw exception;
    }
}

async function performOpenWeatherSearch(weatherInfo)
{
    try
    {
        let weatherURL = `${process.env.WEATHER_SEARCH_URL}`;
        weatherURL += `?units=${weatherInfo.units}&q=${weatherInfo.address}&appId=${weatherInfo.apiKey}`;

        const requestOptions = {};
        requestOptions.httpsAgent = _axiosAgent;
        requestOptions.headers =
        {
            "content-type": "application/json"            
        };

        const weatherResult = await Axios.get(`${weatherURL}`, requestOptions);
        const weatherResponse = preapreOpenWeatherResponse(weatherResult);        
        await fireCallbackEvent(weatherResponse, weatherInfo);
    }
    catch(exception)
    {
        throw exception;
    }
}

/* API DEFINITIONS - START */
_express.post("/weather/partner", async (request, response) =>
{
    const weatherInfo = preparePartnerWeatherInfo(request);
    const results = {};

    try
    {
        const ackResponse = prepareAckResponse(weatherInfo);
        results.results = ackResponse;
        response.send(results);        
        await performPartnerWeatherSearch(weatherInfo);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, weatherInfo);
    }
});

_express.post("/weather/openweather", async (request, response) =>
{
    const weatherInfo = prepareOpenWeatherInfo(request);
    const results = {};

    try
    {        
        const ackResponse = prepareAckResponse(weatherInfo);
        results.results = ackResponse;
        response.send(results);        
        await performOpenWeatherSearch(weatherInfo);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);
        results.results = errorInfo.message;
        await fireErrorEvent(errorInfo, weatherInfo);
    }
});
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 10001;
_server.listen(port);

initializeAdapter();

console.log("Server running at http://localhost:%d", port);
