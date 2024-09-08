projectInfo = {    
    project = "<project_id>"
    region = "asia-southeast1"
    serviceAccount = "apps-project-sa@<project_id>.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "genai-multimodallib"
    spec = {
        image = "<repo-name>/genai-multimodallib:v1.0"
        ingress = "all"
        minCount = "1"
        maxCount = "10"
        traffic = 100
        requests = {
            cpu = "1000m"
            memory = "2Gi"
        }
        limits = {
            cpu = "2000m"
            memory = "4Gi"
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
        value = "genai-multimodallib:v1.0"
    },
    {
        name = "GENAI_LOCATION"
        value = "us-central1"
    },
    {
        name = "WEBSOCK_STREAMER_HTTP_HOST"
        value = "https://streamer-serverlib-"
    },
    {
        name = "PROJECT_ID"
        value = "<project_id>"
    }]
    members = ["allUsers"]
}