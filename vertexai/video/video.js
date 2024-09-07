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
const Cors = require("cors");
const DotEnv = require("dotenv");
const Express = require("express");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const VideoIntel = require("@google-cloud/video-intelligence");
const {TranscoderServiceClient} = require('@google-cloud/video-transcoder').v1;
const {GoogleAuth} = require('google-auth-library');

let _express = Express();
let _server = Http.createServer(_express);
const videoIntelClient = new VideoIntel.VideoIntelligenceServiceClient();
const transcoderClient = new TranscoderServiceClient();

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

// async function performAuth()
// {
//     const auth = new GoogleAuth(
//     {
//       scopes: 'https://www.googleapis.com/auth/cloud-platform'
//     });
//     const client = await auth.getClient();
//     const projectId = await auth.getProjectId();
//     const url = `https://dns.googleapis.com/dns/v1/projects/${projectId}`;
//     const res = await client.request({ url });
//     console.log(res.data);
// }

// function calcOffsetNanoSec(offsetValueFractionalSecs)
// {
//     if (offsetValueFractionalSecs.toString().indexOf('.') !== -1) {
//       return
//       (
//         1000000000 *
//         Number('.' + offsetValueFractionalSecs.toString().split('.')[1])
//       );
//     }
//     return 0;
// }

function prepareErrorMessage(exception)
{
    exception.code = ((exception.code == undefined) || (exception.code < 400)) ? 500 : exception.code;
    return exception;
}

function prepareLocationPath()
{
    const locationPath = transcoderClient.locationPath(process.env.PROJECT_ID, process.env.TRANSCODER_LOCATION)
    return locationPath;
}

function prepareVideoInput(request)
{
    const videoInfo = {};

    if (request.params.fileName != null)
    {
        const filePath = Path.join(process.env.VIDEO_DIR_PATH, request.params.fileName);
        const content = FS.readFileSync(filePath).toString('base64');
        videoInfo.inputContent = content;
    }
    else
        videoInfo.inputUri = request.body.uri;

    videoInfo.features = request.body.features;
    return videoInfo;
}

function prepareJobTemplateResponse(jobTemplate)
{
    const jobTemplateResponse = {};
    jobTemplateResponse.name = jobTemplate.name;
    jobTemplateResponse.config = jobTemplate.config;
    jobTemplateResponse.labels = jobTemplate.labels;
    return jobTemplateResponse;
}

function prepareJobResponse(job)
{
    const jobResponse = {};
    jobResponse.name = job.name;
    jobResponse.config = job.config;
    jobResponse.labels = job.labels;
    jobResponse.createTime = job.createTime;
    jobResponse.endTime = job.endTime;
    jobResponse.startTime = job.startTime;

    jobResponse.error = {};
    if (job.error != null)
    {
        jobResponse.error.code = job.error.code;
        jobResponse.error.message = job.error.message;
    }
    
    jobResponse.inputUri = job.inputUri;
    jobResponse.outputUri = job.outputUri;
    jobResponse.state = job.state;
    return jobResponse;
}

function prepareJobOverlay(overlays)
{
    const overlayInfoList = [];
    overlays.forEach((overlay) =>
    {
        const overlayInfo = {};
        
        const imageInfo = {};
        imageInfo.uri = overlay.image;
        imageInfo.resolution = overlay.resolution;
        imageInfo.alpha = overlay.alpha;
        overlayInfo.image = imageInfo;
        
        const animationInfo = {};
        animationInfo.animations = [];
        overlay.animations.forEach((animation) =>
        {
            if (animation.type === "static")
            {
                const animationStartConfig = {};
                animationStartConfig.animationStatic = {};
                animationStartConfig.animationStatic.xy = {};
                animationStartConfig.animationStatic.xy.x = parseFloat(animation.start.x);
                animationStartConfig.animationStatic.xy.y = parseFloat(animation.start.y);
                animationStartConfig.animationStatic.startTimeOffset = {};
                animationStartConfig.animationStatic.startTimeOffset.seconds = parseInt(animation.start.time);
                animationInfo.animations.push(animationStartConfig);

                const animationEndConfig = {};
                animationEndConfig.animationEnd = {};
                animationEndConfig.animationEnd.startTimeOffset = {};
                animationEndConfig.animationEnd.startTimeOffset.seconds = parseInt(animation.end.time);
                animationInfo.animations.push(animationEndConfig);
            }
            else if (animation.type === "fade")
            {
                const animationInConfig = {};
                animationInConfig.animationFade = {};
                animationInConfig.animationFade.fadeType = "FADE_IN";
                animationInConfig.animationFade.xy = {};
                animationInConfig.animationFade.xy.x = parseFloat(animation.in.x);
                animationInConfig.animationFade.xy.y = parseFloat(animation.in.y);
                animationInConfig.animationFade.startTimeOffset = {};
                animationInConfig.animationFade.startTimeOffset.seconds = parseInt(animation.in.start_time);
                animationInConfig.animationFade.endTimeOffset = {};
                animationInConfig.animationFade.endTimeOffset.seconds = parseInt(animation.in.end_time);
                animationInfo.animations.push(animationInConfig);

                const animationOutConfig = {};
                animationOutConfig.animationFade = {};
                animationOutConfig.animationFade.fadeType = "FADE_OUT";
                animationOutConfig.animationFade.xy = {};
                animationOutConfig.animationFade.xy.x = parseFloat(animation.out.x);
                animationOutConfig.animationFade.xy.y = parseFloat(animation.out.y);
                animationOutConfig.animationFade.startTimeOffset = {};
                animationOutConfig.animationFade.startTimeOffset.seconds = parseInt(animation.out.start_time);
                animationOutConfig.animationFade.endTimeOffset = {};
                animationOutConfig.animationFade.endTimeOffset.seconds = parseInt(animation.out.end_time);
                animationInfo.animations.push(animationOutConfig);
            }
        });
        overlayInfo.animations = animationInfo.animations;        
        overlayInfoList.push(overlayInfo);
    });    
    return overlayInfoList;
}

async function getJobTemplates(jobTemplateInfo)
{
    const request = {};
    const templatePath = transcoderClient.jobTemplatePath(process.env.PROJECT_ID, process.env.TRANSCODER_LOCATION,
                                                          jobTemplateInfo.templateId);
    request.name = templatePath;
    const jobTemplateResponseList = await transcoderClient.getJobTemplate(request);
    const jobTemplateResult = jobTemplateResponseList[0];
    
    const jobTemplateResponse = prepareJobTemplateResponse(jobTemplateResult);    
    const responseList = [];
    responseList.push(jobTemplateResponse);
    return responseList;
}

async function getJob(jobInfo)
{
    const request = {};
    const jobPath = transcoderClient.jobPath(process.env.PROJECT_ID, process.env.TRANSCODER_LOCATION,
                                                  jobInfo.jobId);
    request.name = jobPath;
    const jobResponseList = await transcoderClient.getJob(request);
    const jobResult = jobResponseList[0];
    
    const jobResponse = prepareJobResponse(jobResult);
    const responseList = [];
    responseList.push(jobResponse);
    return responseList;
}

async function listJobTemplates()
{
    const request = {};
    request.parent = prepareLocationPath();

    const responseList = [];
    const jobTemplateIterator = await transcoderClient.listJobTemplatesAsync(request);
    for await (const jobTemplate of jobTemplateIterator)
    {
        const jobTemplateResponse = prepareJobTemplateResponse(jobTemplate);
        responseList.push(jobTemplateResponse);
    };
    return responseList;
}

async function listJobs()
{
    const request = {};
    request.parent = prepareLocationPath();

    const responseList = [];
    const jobIterator = await transcoderClient.listJobsAsync(request);
    for await (const job of jobIterator)
    {
        const jobResponse = prepareJobResponse(job);
        responseList.push(jobResponse);
    };
    return responseList;
}

async function createJobTemplate(jobTemplateInfo)
{
    const request = {};
    request.parent = prepareLocationPath();
    request.jobTemplateId = jobTemplateInfo.templateId;

    request.jobTemplate = {};
    request.jobTemplate.config = {};

    if (jobTemplateInfo.inputs != null)
        request.jobTemplate.config.inputs = jobTemplateInfo.inputs;
    if (jobTemplateInfo.editList != null)
        request.jobTemplate.config.editList = jobTemplateInfo.editList;
    
    request.jobTemplate.config.elementaryStreams = jobTemplateInfo.elementaryStreams;
    request.jobTemplate.config.muxStreams = jobTemplateInfo.muxStreams;

    if (jobTemplateInfo.overlays != null)
        request.jobTemplate.config.overlays = prepareJobOverlay(jobTemplateInfo.overlays);

    const responseList = [];
    const jobTemplateResponseList = await transcoderClient.createJobTemplate(request);
    const jobTemplateResult = jobTemplateResponseList[0];
    responseList.push(jobTemplateResult);    
    return responseList;
}

async function createJobFromTemplate(jobTemplateInfo)
{
    const request = {};
    request.parent = prepareLocationPath();
    request.job = {};
    request.job.inputUri = jobTemplateInfo.inputUri;
    request.job.outputUri = jobTemplateInfo.outputUri;
    request.job.templateId = jobTemplateInfo.templateId;

    const responseList = [];
    const jobTemplateResponseList = await transcoderClient.createJob(request);
    const jobTemplateResponse = jobTemplateResponseList[0];
    responseList.push(jobTemplateResponse);    
    return responseList;
}

async function createJob(jobTemplateInfo)
{
    const request = {};
    request.parent = prepareLocationPath();
    request.job = {};
    request.job.outputUri = jobTemplateInfo.outputUri;
    request.job.config = {};

    if (jobTemplateInfo.inputs != null)
        request.job.config.inputs = jobTemplateInfo.inputs;
    if (jobTemplateInfo.editList != null)
        request.job.config.editList = jobTemplateInfo.editList;
    
    request.job.config.elementaryStreams = jobTemplateInfo.elementaryStreams;
    request.job.config.muxStreams = jobTemplateInfo.muxStreams;
    request.job.config.spriteSheets = jobTemplateInfo.spriteSheets;

    const responseList = [];
    const jobTemplateResponseList = await transcoderClient.createJob(request);
    const jobTemplateResponse = jobTemplateResponseList[0];
    responseList.push(jobTemplateResponse);    
    return responseList;
}

async function deleteJobTemplates(jobTemplateInfo)
{
    const request = {};
    const templatePath = transcoderClient.jobTemplatePath(process.env.PROJECT_ID, process.env.TRANSCODER_LOCATION,
                                                          jobTemplateInfo.templateId);
    request.name = templatePath;
    await transcoderClient.deleteJobTemplate(request);
    const responseList = [];
    return responseList;
}

async function deleteJob(jobInfo)
{
    const request = {};
    const jobPath = transcoderClient.jobPath(process.env.PROJECT_ID, process.env.TRANSCODER_LOCATION,
                                             jobInfo.jobId);
    request.name = jobPath;
    await transcoderClient.deleteJob(request);
    const responseList = [];
    return responseList;
}

async function recognizeLabels(videoInfo)
{
    const request = videoInfo;
    let videoResponseList = await videoIntelClient.annotateVideo(request);
    let videoResult = videoResponseList[0];
    videoResponseList = await videoResult.promise();
    videoResult = videoResponseList[0];
    const annotations = videoResult.annotationResults[0];
    const labels = annotations.segmentLabelAnnotations;
    const responseList = [];
    
    labels.forEach((label) =>
    {
        const labelResponse = {};
        labelResponse.categoryEntities = label.categoryEntities;
        labelResponse.entity = label.entity;
        labelResponse.segments = [];
        label.segments.forEach((segment) =>
        {
            const labelSegment = {};
            labelSegment.confidence = segment.confidence;            
            labelSegment.startTime = `${segment.segment.startTimeOffset.seconds}` + "." + `${(segment.segment.startTimeOffset.nanos / 1e7).toFixed(0)}s`;
            labelSegment.endTime = `${segment.segment.endTimeOffset.seconds}` + "." + `${(segment.segment.endTimeOffset.nanos / 1e7).toFixed(0)}s`;            
            labelResponse.segments.push(labelSegment);
        });
        responseList.push(labelResponse);
    });
    return responseList;
}

async function processLabelRequest(request, response)
{
    const videoInfo = prepareVideoInput(request);
    const results = {};

    try
    {
        const responseList = await recognizeLabels(videoInfo);
        results.results = responseList;
        response.send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);         
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
}

async function recognizeLogos(videoInfo)
{
    const request = videoInfo;
    let videoResponseList = await videoIntelClient.annotateVideo(request);
    let videoResult = videoResponseList[0];
    videoResponseList = await videoResult.promise();
    videoResult = videoResponseList[0];
    const annotations = videoResult.annotationResults[0];
    const logos = annotations.logoRecognitionAnnotations;
    const responseList = [];
    
    logos.forEach((logo) =>
    {
        const logoResponse = {};        
        logoResponse.entity = logo.entity;
        logoResponse.tracks = [];
        logo.tracks.forEach((track) =>
        {
            const logoTrack = {};
            logoTrack.confidence = track.confidence;
            logoTrack.attribute = track.attributes;
            logoTrack.startTime = `${track.segment.startTimeOffset.seconds}` + "." + `${(track.segment.startTimeOffset.nanos / 1e7).toFixed(0)}s`;
            logoTrack.endTime = `${track.segment.endTimeOffset.seconds}` + "." + `${(track.segment.endTimeOffset.nanos / 1e7).toFixed(0)}s`;

            logoTrack.boundingBoxes = track.timestampedObjects.map((timestampedObject) =>
            {
                return timestampedObject.normalizedBoundingBox;
            });
            logoResponse.tracks.push(logoTrack);
        });
        responseList.push(logoResponse);
    });
    return responseList;
}

async function processLogoRequest(request, response)
{
    const videoInfo = prepareVideoInput(request);
    const results = {};

    try
    {
        const responseList = await recognizeLogos(videoInfo);
        results.results = responseList;
        response.send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);         
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
}

async function recognizeFaces(videoInfo)
{
    const request = videoInfo;
    let videoResponseList = await videoIntelClient.annotateVideo(request);
    let videoResult = videoResponseList[0];
    videoResponseList = await videoResult.promise();
    videoResult = videoResponseList[0];
    const annotations = videoResult.annotationResults[0];
    const faces = annotations.faceDetectionAnnotations;
    const responseList = [];
    
    faces.forEach((face) =>
    {
        const faceResponse = {};
        faceResponse.tracks = [];
        face.tracks.forEach((track) =>
        {
            const faceTrack = {};
            faceTrack.confidence = track.confidence;            
            faceTrack.startTime = `${track.segment.startTimeOffset.seconds}` + "." + `${(track.segment.startTimeOffset.nanos / 1e7).toFixed(0)}s`;
            faceTrack.endTime = `${track.segment.endTimeOffset.seconds}` + "." + `${(track.segment.endTimeOffset.nanos / 1e7).toFixed(0)}s`;
            faceTrack.proprties = track.timestampedObjects.map((timestampedObject) =>
            {
                const trackAttributes = {};
                trackAttributes.attributes = timestampedObject.attributes;
                trackAttributes.boundinBox = timestampedObject.normalizedBoundingBox;
                return trackAttributes;
            });
            faceResponse.tracks.push(faceTrack);
        });
        responseList.push(faceResponse);
    });
    return responseList;
}

async function processFaceRequest(request, response)
{
    const videoInfo = prepareVideoInput(request);

    const faceDetectionConfig = {};
    faceDetectionConfig.includeBoundingBoxes =  true;
    faceDetectionConfig.includeAttributes = true;
    videoInfo.videoContext = {};
    videoInfo.videoContext.faceDetectionConfig = faceDetectionConfig;

    const results = {};

    try
    {
        const responseList = await recognizeFaces(videoInfo);
        results.results = responseList;
        response.send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);         
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
}

async function processPeopleRequest(request, response)
{
    const videoInfo = prepareVideoInput(request);
    
    const peopleDetectionConfig = {};
    peopleDetectionConfig.includeBoundingBoxes =  true;
    peopleDetectionConfig.includePoseLandmarks = true;
    peopleDetectionConfig.includeAttributes = true;
    videoInfo.videoContext = {};
    videoInfo.videoContext.peopleDetectionConfig = peopleDetectionConfig;

    const results = {};

    try
    {
        const responseList = await recognizePeople(videoInfo);
        results.results = responseList;
        response.send(results);
    }
    catch(exception)
    {
        let errorInfo = prepareErrorMessage(exception);         
        results.results = errorInfo.message;
        response.status(errorInfo.code).send(results);
    }
}

async function recognizePeople(videoInfo)
{
    const request = videoInfo;
    let videoResponseList = await videoIntelClient.annotateVideo(request);
    let videoResult = videoResponseList[0];
    videoResponseList = await videoResult.promise();
    videoResult = videoResponseList[0];
    const annotations = videoResult.annotationResults[0];
    const people = annotations.personDetectionAnnotations;
    const responseList = [];
    
    people.forEach((person) =>
    {
        const personResponse = {};
        personResponse.tracks = [];
        person.tracks.forEach((track) =>
        {
            const personTrack = {};
            personTrack.confidence = track.confidence;            
            personTrack.startTime = `${track.segment.startTimeOffset.seconds}` + "." + `${(track.segment.startTimeOffset.nanos / 1e7).toFixed(0)}s`;
            personTrack.endTime = `${track.segment.endTimeOffset.seconds}` + "." + `${(track.segment.endTimeOffset.nanos / 1e7).toFixed(0)}s`;
            personTrack.properties = track.timestampedObjects.map((timestampedObject) =>
            {
                const trackAttributes = {};
                trackAttributes.attributes = timestampedObject.attributes;
                trackAttributes.boundinBox = timestampedObject.normalizedBoundingBox;
                return trackAttributes;
            });
            personResponse.tracks.push(personTrack);
        });
        responseList.push(personResponse);
    });
    return responseList;
}

/* API DEFINITIONS - START */
/**
 * @fires /video/annotate/labels
 * @method POST
 * @description Detects Labels in a Video
 * @input Remote storage path: Request Body
 */
 _express.post("/video/annotate/labels", async (request, response) =>
 {
    await processLabelRequest(request, response);
 });

/**
 * @fires /video/annotate/labels/:fileName
 * @method POST
 * @description Detects Labels in a Video
 * @input Local fileName
 */
 _express.post("/video/annotate/labels/:fileName", async (request, response) =>
 {
    await processLabelRequest(request, response);
 });

 /**
 * @fires /video/annotate/logos
 * @method POST
 * @description Detects Logos in a Video
 * @input Remote storage path: Request Body
 */
  _express.post("/video/annotate/logos", async (request, response) =>
  {
     await processLogoRequest(request, response);
  });

/**
 * @fires /video/annotate/logos/:fileName
 * @method POST
 * @description Detects Logos in a Video
 * @input Local fileName
 */
 _express.post("/video/annotate/logos/:fileName", async (request, response) =>
 {
    await processLogoRequest(request, response);
 });

 /**
 * @fires /video/annotate/faces
 * @method POST
 * @description Detects Faces in a Video
 * @input Remote storage path: Request Body
 */
  _express.post("/video/annotate/faces", async (request, response) =>
  {
     await processFaceRequest(request, response);
  });

  /**
 * @fires /video/annotate/faces/:fileName
 * @method POST
 * @description Detects Faces in a Video
 * @input Local fileName
 */
   _express.post("/video/annotate/faces/:fileName", async (request, response) =>
   {
      await processFaceRequest(request, response);
   });

 /**
 * @fires /video/annotate/people
 * @method POST
 * @description Detects People in a Video
 * @input Remote storage path: Request Body
 */
  _express.post("/video/annotate/people", async (request, response) =>
  {
     await processPeopleRequest(request, response);
  });

 /**
 * @fires /video/annotate/people/:fileName
 * @method POST
 * @description Detects People in a Video
 * @input Local fileName
 */
   _express.post("/video/annotate/people/:fileName", async (request, response) =>
   {
      await processPeopleRequest(request, response);
   });

  /**
  * @fires /video/job/template/:templateId
  * @method GET
  * @description Describes an existing Job Template
  */
   _express.get("/video/job/template/:templateId", async (request, response) =>
   {        
        const jobTemplateInfo = {};
        jobTemplateInfo.templateId = request.params.templateId;
        const results = {};

        try
        {
            const responseList = await getJobTemplates(jobTemplateInfo);
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
  * @fires /video/job/template
  * @method GET
  * @description Lists all Job Templates
  */
   _express.get("/video/job/template", async (request, response) =>
   {        
        const results = {};

        try
        {
            const responseList = await listJobTemplates();
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
  * @fires /video/job
  * @method GET
  * @description Describes an existing Job
  */
    _express.get("/video/job/:jobId", async (request, response) =>
    {
        const jobInfo = {};
        jobInfo.jobId = request.params.jobId;          
        const results = {};

        try
        {
            const responseList = await getJob(jobInfo);
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
  * @fires /video/job
  * @method GET
  * @description Lists all Jobs
  */
    _express.get("/video/job", async (request, response) =>
    {        
        const results = {};

        try
        {
            const responseList = await listJobs();
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
  * @fires /video/job/template/:templateId
  * @method POST
  * @description Creates a Job Template
  * @input Template Id
  * @input Job Template details: request body
  */
  _express.post("/video/job/template/:templateId", async (request, response) =>
  {
        const jobTemplateInfo = {};
        jobTemplateInfo.templateId = request.params.templateId;
        jobTemplateInfo.inputs = request.body.inputs;
        jobTemplateInfo.editList = request.body.editList;        
        jobTemplateInfo.elementaryStreams = request.body.elementaryStreams;
        jobTemplateInfo.muxStreams = request.body.muxStreams;
        jobTemplateInfo.overlays = request.body.overlays;
        const results = {};

        try
        {
            const responseList = await createJobTemplate(jobTemplateInfo);
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
  * @fires /video/job/:templateId
  * @method POST
  * @description Creates a Job from an existing Template
  * @input Template Id
  * @input Job details: request body
  */
   _express.post("/video/job/:templateId", async (request, response) =>
   {
         const jobTemplateInfo = {};
         jobTemplateInfo.templateId = request.params.templateId;
         jobTemplateInfo.inputUri = request.body.inputUri;
         jobTemplateInfo.outputUri = request.body.outputUri;
         const results = {};
 
         try
         {
             const responseList = await createJobFromTemplate(jobTemplateInfo);
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
  * @fires /video/job
  * @method POST
  * @description Create a Job
  * @input Job details: request body
  */
   _express.post("/video/job", async (request, response) =>
   {
         const jobTemplateInfo = {};         
         jobTemplateInfo.outputUri = request.body.outputUri;
         jobTemplateInfo.inputs = request.body.inputs;
         jobTemplateInfo.editList = request.body.editList;
         jobTemplateInfo.elementaryStreams = request.body.elementaryStreams;
         jobTemplateInfo.muxStreams = request.body.muxStreams;
         jobTemplateInfo.spriteSheets = request.body.spriteSheets;

         const results = {};
 
         try
         {
             const responseList = await createJob(jobTemplateInfo);
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
  * @fires /video/job/template/:templateId
  * @method POST
  * @description Deletes a Job
  * @input Job Template Id
  */
   _express.delete("/video/job/template/:templateId", async (request, response) =>
   {        
        const jobTemplateInfo = {};
        jobTemplateInfo.templateId = request.params.templateId;
        const results = {};

        try
        {
            const responseList = await deleteJobTemplates(jobTemplateInfo);
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
  * @fires /video/job/:jobId
  * @method POST
  * @description Deletes a Job
  * @input JobId
  */
   _express.delete("/video/job/:jobId", async (request, response) =>
   {        
        const jobInfo = {};
        jobInfo.jobId = request.params.jobId;
        const results = {};

        try
        {
            const responseList = await deleteJob(jobInfo);
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

var port = process.env.port || process.env.PORT || 6064;
_server.listen(port);

/*
try
{
    ffmpeg.setFfmpegPath(ffmpegPath);

    const inputPath = Path.join(process.env.VIDEO_DIR_PATH, 'ChromeCast.mp4');
    const outputPath = Path.join(process.env.VIDEO_DIR_PATH, 'ChromeCast_output.mp4');
    const outputPath1 = Path.join(process.env.VIDEO_DIR_PATH, 'ChromeCast_output1.mp4');

    ffmpeg(inputPath)
    .setStartTime('00:00:03')
    .setDuration('5')
    .output(outputPath)        
    .run();

    ffmpeg(inputPath)
    .setStartTime('00:00:10')
    .setDuration('5')
    .output(outputPath1)        
    .run();

}
catch(exception)
{
    console.log(exception.message);
}
*/

console.log("Server running at http://localhost:%d", port);
