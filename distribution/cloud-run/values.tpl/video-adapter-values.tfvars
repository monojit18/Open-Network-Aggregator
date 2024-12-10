projectInfo = {    
    project = ""
    region = "asia-southeast1"
    serviceAccount = "-sa@.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "video-adapter"
    spec = {
        image = "<repo-name>/video-adapter:v1.0"
        ingress = "all"
        minCount = "1"
        maxCount = "10"
        traffic = 100
        requests = {
            cpu = "500m"
            memory = "512Mi"
        }
        limits = {
            cpu = "1000m"
            memory = "1Gi"
        }
    }
    ports = {
        name = "http1"
        protocol = "TCP"
        container_port = 80
    }
    envVars = [
    {
        name = "service"
        value = "video-adapter:v1.0"
    },
    {
        name = "EVENT_RECEIVER_HTTP_HOST"
        value = "https://event-receiverlib-<repo-name>.run.app"
    },
    {
        name = "YOUTUBE_DATA_V3_SEARCH_URL"
        value = "https://youtube.googleapis.com/youtube/v3"
    },
    {
        name = "PROJECT_ID"
        value = ""
    }]
    members = ["allUsers"]
}