projectInfo = {    
    project = ""
    region = "asia-southeast1"
    serviceAccount = "-sa@.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "genai-imagelib"
    spec = {
        image = "<repo-name>/genai-imagelib:v1.0"
        ingress = "all"
        minCount = "1"
        maxCount = "10"
        traffic = 100
        requests = {
            cpu = "500m"
            memory = "256Mi"
        }
        limits = {
            cpu = "1000m"
            memory = "512Mi"
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
        value = "genai-imagelib:v1.0"
    },
    {
        name = "GENAI_LOCATION"
        value = "us-central1"
    },
    {
        name = "GENAI_PUBLISHER"
        value = "google"
    },
    {
        name = "GENAI_API_ENDPOINT"
        value = "us-central1-aiplatform.googleapis.com"
    },
    {
        name = "PROJECT_ID"
        value = ""
    }]
    members = ["allUsers"]
}