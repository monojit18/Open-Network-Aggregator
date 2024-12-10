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
const FS = require("fs");
const DotEnv = require("dotenv");
const Express = require("express");
// const {TextToSpeechClient, TextToSpeechLongAudioSynthesizeClient} = require("@google-cloud/text-to-speech").v1beta1;
const {TextToSpeechClient} = require("@google-cloud/text-to-speech").v1;
const SpeechToText = require("@google-cloud/speech");
const Recorder = require('node-record-lpcm16');

let _express = Express();
let _server = Http.createServer(_express);
let kRecognizeStream = null;
let kRecordingClient = null;
let kStreamingResult = "";
const textToSpeechClient = new TextToSpeechClient();
// const texttospeechLongAudioClient = new TextToSpeechLongAudioSynthesizeClient();
const speechToTextClient = new SpeechToText.v1.SpeechClient();
// const speechToTextV2Client = new SpeechToText.v1p1beta1.SpeechClient();

DotEnv.config();

_express.use(Express.json
({
    extended: true
}));
    
_express.use(Express.urlencoded
({
    extended: true
}));

function prepareErrorMessage(exception)
{
    exception.code = ((exception.code == undefined) || (exception.code < 400)) ? 500 : exception.code;
    return exception;
}

function prepareTextToSpeechInput(request)
{
    const speechInfo = {};
    speechInfo.fileName = request.params.fileName;
    speechInfo.text = request.body.text;
    speechInfo.type = request.body.type;
    speechInfo.profiles = request.body.profiles;
    speechInfo.languageCode = request.headers["language"];
    speechInfo.gender = request.headers["gender"];
    speechInfo.encoding = request.headers["encoding"];
    return speechInfo;
}

function prepareSpeechToTextInput(request)
{
    const speechInfo = {};

    if (request.params.fileName != null)
    {
        const filePath = Path.join(process.env.SPEECH_DIR_PATH, request.params.fileName);
        const content = FS.readFileSync(filePath).toString('base64');        
        speechInfo.content = content;
    }
    else
        speechInfo.inputUri = request.body.uri;

    speechInfo.languageCode = request.headers["language"];
    speechInfo.frequency = request.headers["frequency"];
    speechInfo.encoding = request.headers["encoding"];
    speechInfo.model = request.headers["model"];
    speechInfo.profanityFilter = (request.headers["profanity"] === "true");
    speechInfo.enableWordTimeOffsets = (request.headers["words"] === "true");
    speechInfo.enableAutomaticPunctuation = (request.headers["punctuation"] === "true");

    const phraseSet = request.body.phraseSet;
    if (phraseSet != null)
    {
        const speechContext = {};
        speechContext.phrases = phraseSet.phrases;
        speechContext.boost = phraseSet.boost;
        speechInfo.speechContext = speechContext;
    }

    const channelCount = parseInt(request.headers["channel"], 10);
    if (channelCount > 1)
    {
        speechInfo.audioChannelCount = channelCount;
        speechInfo.enableSeparateRecognitionPerChannel = true;
    }

    const speakerCount = parseInt(request.headers["speaker"], 10);
    if (speakerCount > 1)
    {
        speechInfo.maxSpeakerCount = speakerCount;
        speechInfo.enableSpeakerDiarization = true;
    }
    return speechInfo;
}

function prepareStreamSpeechInput(request)
{
    const speechInfo = {};
    speechInfo.languageCode = request.headers["language"];
    speechInfo.frequency = request.headers["frequency"];
    speechInfo.encoding = request.headers["encoding"];
    if (request.headers["threshold"] != null)
        speechInfo.threshold = parseInt(request.headers["threshold"], 10);    
    if (request.headers["verbose"] != null)
        speechInfo.verbose = (request.headers["verbose"] === true);
    if (request.headers["record"] != null)
        speechInfo.recordProgram = request.headers["record"];
    if (request.headers["silence"] != null)
        speechInfo.silence = parseFloat(request.headers["silence"]);
    if (request.headers["interimresults"] != null)
        speechInfo.interimResults = (request.headers["interimresults"] === "true");
    return speechInfo;
}

async function listVoices()
{
    try
    {
        const request = {};
        const speechResponseList = await textToSpeechClient.listVoices(request);
        const speechResult = speechResponseList[0];
        const responseList = [];

        speechResult.voices.forEach((voice) =>
        {
            const speechResponse = {};
            speechResponse.name = voice.name;
            speechResponse.gender = voice.ssmlGender;
            speechResponse.frequency = voice.naturalSampleRateHertz;
            speechResponse.languages = voice.languageCodes;
            responseList.push(speechResponse);
        });
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function synthesizeSpeech(speechInfo)
{
    const inputConfig = {};
    if (speechInfo.type === "ssml")
        inputConfig.ssml = speechInfo.text;
    else if (speechInfo.type === "text")
        inputConfig.text = speechInfo.text;

    const voiceConfig = {};
    voiceConfig.languageCode = speechInfo.languageCode;
    voiceConfig.ssmlGender = speechInfo.gender;
    
    const audioConfig = {};
    audioConfig.audioEncoding = `${speechInfo.encoding}`;
    if (speechInfo.profiles != null)
        audioConfig.effectsProfileId = speechInfo.profiles;

    const request =
    {        
        input: inputConfig,
        voice: voiceConfig,        
        audioConfig: audioConfig
    };

    try
    {
        const speechResponseList = await textToSpeechClient.synthesizeSpeech(request);               
        const speechResponse = speechResponseList[0];

        const speechFile = Path.join(process.env.SPEECH_DIR_PATH, speechInfo.fileName);
        await FS.writeFileSync(`${speechFile}`, speechResponse.audioContent, 'binary');    
        const responseList = [];    
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function recognizeSpeech(speechInfo)
{
    const inputConfig = {};
    inputConfig.encoding = speechInfo.encoding;
    inputConfig.sampleRateHertz = speechInfo.frequency;
    inputConfig.languageCode = speechInfo.languageCode;
    inputConfig.model = speechInfo.model;
    inputConfig.profanityFilter = speechInfo.profanityFilter;
    inputConfig.enableWordTimeOffsets = speechInfo.enableWordTimeOffsets;
    inputConfig.enableAutomaticPunctuation = speechInfo.enableAutomaticPunctuation;

    inputConfig.audioChannelCount = speechInfo.audioChannelCount;
    inputConfig.enableSeparateRecognitionPerChannel = speechInfo.enableSeparateRecognitionPerChannel;

    if (speechInfo.maxSpeakerCount > 1)
    {
        const diarizationConfig = {};
        diarizationConfig.maxSpeakerCount = speechInfo.maxSpeakerCount;;
        diarizationConfig.enableSpeakerDiarization = speechInfo.enableSpeakerDiarization;
        inputConfig.diarizationConfig = diarizationConfig;
    }

    if (speechInfo.speechContext != null)
        inputConfig.speechContexts = [speechInfo.speechContext];

    const audioConfig = {};
    if (speechInfo.inputUri != null)
        audioConfig.uri = speechInfo.inputUri;
    else if (speechInfo.content != null)
        audioConfig.content = speechInfo.content;

    const request =
    {
        audio: audioConfig,
        config: inputConfig
    };

    try
    {
        let speechResponseList = await speechToTextClient.longRunningRecognize(request);
        let speechResult = speechResponseList[0];
        speechResponseList = await speechResult.promise();
        speechResult = speechResponseList[0];
        const responseList = [];

        speechResult.results.forEach((result) =>
        {
            const speechResponse = {};
            speechResponse.totalBilledTime = speechResult.totalBilledTime;
            speechResponse.resultEndTime = result.resultEndTime;
            speechResponse.languageCode = result.languageCode;
            speechResponse.confidence = result.alternatives[0].confidence;
            speechResponse.transcript = result.alternatives[0].transcript;
            speechResponse.channel = result.channelTag;

            const words = result.alternatives[0].words;
            speechResponse.words = [];
            words.forEach((word) =>
            {
                const wordResponse = {};
                wordResponse.word = word.word;
                wordResponse.startTime = `${word.startTime.seconds}` + "." +  `${(word.startTime.nanos / 1e8).toFixed(0)}s`;
                wordResponse.endtime = `${word.endTime.seconds}` + "." +  `${(word.endTime.nanos / 1e8).toFixed(0)}s`;
                speechResponse.words.push(wordResponse);
            });

            responseList.push(speechResponse);
        });
        return responseList;
    }
    catch(exception)
    {
        throw exception;
    }
}

async function processSpeechToTextRequest(request, response)
{
    const speechInfo = prepareSpeechToTextInput(request);
    const results = {};

    try
    {
        const responseList = await recognizeSpeech(speechInfo);
        results.results = responseList;
        response.send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);         
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
    return speechInfo;
}

async function recognizeStream(speechInfo)
{
    const inputConfig = {};
    inputConfig.encoding = speechInfo.encoding;
    inputConfig.sampleRateHertz = speechInfo.frequency;
    inputConfig.languageCode = speechInfo.languageCode;

    const request =
    {
        interimResults: speechInfo.interimResults,
        config: inputConfig
    };

    kRecognizeStream = speechToTextClient.streamingRecognize(request);
    kRecognizeStream.on("data", (data) =>
    {
        if (data.results[0] && data.results[0].alternatives[0])
            kStreamingResult = kStreamingResult + data.results[0].alternatives[0].transcript;
    });
    
    const audioConfig = {};
    audioConfig.sampleRateHertz = speechInfo.frequency;
    audioConfig.threshold = speechInfo.threshold;
    audioConfig.verbose = speechInfo.verbose;
    audioConfig.recordProgram = speechInfo.recordProgram;
    audioConfig.silence = speechInfo.silence;

    kRecordingClient = Recorder.record(audioConfig);
    kRecordingClient.stream().pipe(kRecognizeStream);

    const responseList = [];
    return responseList;
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
 * @fires /texttospeech/voices
 * @method GET
 * @description List All types of voices supported by the API
 */
 _express.get("/texttospeech/voices", async (request, response) =>
 {
     const results = {};

     try
     {
         const responseList = await listVoices();
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
 * @fires /texttospeech/synthesize/:fileName
 * @method POST
 * @description Converts text into an Audio file
 * @input Local FileName
 */
_express.post("/texttospeech/synthesize/:fileName", async (request, response) =>
{
    const speechInfo = prepareTextToSpeechInput(request);
    const results = {};

    try
    {
        const responseList = await synthesizeSpeech(speechInfo);
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
 * @fires /speechtotext/recognize/
 * @method POST
 * @description Recognizes various Textual components in Speech
 * @input Remote storage path: Request Body 
 */
 _express.post("/speechtotext/recognize/", async (request, response) =>
 {
    await processSpeechToTextRequest(request, response);
 });

 /**
 * @fires /speechtotext/recognize/:fileName
 * @method POST
 * @description Recognizes various Textual componennts in Speech
 * @input Local FileName
 */
  _express.post("/speechtotext/recognize/:fileName", async (request, response) =>
  {
      await processSpeechToTextRequest(request, response);
  });

 /**
 * @fires /speechtotext/stream/start
 * @method POST
 * @description Starts streaming in Audio Recorder
 */
  _express.post("/speechtotext/stream/start", async (request, response) =>
  {
      const speechInfo = prepareStreamSpeechInput(request);
      const results = {};
  
      try
      {
          const responseList = await recognizeStream(speechInfo);
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
 * @fires /speechtotext/stream/stop
 * @method POST
 * @description Stops streaming in Audio Recorder
 */
  _express.post("/speechtotext/stream/stop", async (request, response) =>
  {
      kRecordingClient.stop();
      const results = {};
      results.results = kStreamingResult;
      kStreamingResult = "";
      response.send(results);
  });

//   _express.post("/speechtotext/stream/:fileName", async (request, response) =>
//   {
//       const speechInfo = prepareFileStreamSpeechInput(request);
//       const results = {};
  
//       try
//       {
//           const responseList = await recognizeFileStream(speechInfo);
//           results.results = responseList;
//           response.send(results);
//       }
//       catch(exception)
//       {
//           let errorInfo = prepareErrorMessage(exception);         
//           results.results = errorInfo.message;
//           response.status(errorInfo.code).send(results);
//       }
//   });
/* API DEFINITIONS - END */

var port = process.env.port || process.env.PORT || 6063;
_server.listen(port);

console.log("Server running at http://localhost:%d", port);
