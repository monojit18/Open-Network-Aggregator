projectInfo = {    
    project = ""
    region = "asia-southeast1"
    serviceAccount = "-sa@.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "chatgenie"
    spec = {
        image = "<repo-name>/chatgenie:v1.0"
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
        value = "chatgenie:v1.0"
    },
    {
        name = "STORAGELIB_HOST"
        value = "https://storagelib-.run.app"
    },    
    {
        name = "SPEECHLIB_HOST"
        value = "https://speechlib-.run.app"
    },
    {
        name = "TRANSLATELIB_HOST"
        value = "https://translatelib-.run.app"
    },    
    {
        name = "VISIONLIB_HOST"
        value = "https://visionlib-.run.app"
    },    
    {
        name = "GENAI_TEXTLIB_HOST"
        value = "https://genai-textlib-.run.app"
    },    
    {
        name = "PROJECT_ID"
        value = ""
    }]
    members = ["allUsers"]
}