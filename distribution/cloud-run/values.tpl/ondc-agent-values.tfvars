projectInfo = {    
    project = ""
    region = "asia-southeast1"
    serviceAccount = "-sa@.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "ondc-agent"
    spec = {
        image = "<repo-name>/ondc-agent:v1.0"
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
        value = "ondc-agent:v1.0"
    },
    {
        name = "GENAI_TEXTLIB_HOST"
        value = "https://genai-textlib-.run.app"
    },
    {
        name = "BUYER_ADAPTER_URL"
        value = "https://buyer-adapter-.run.app"
    },
    {
        name = "PROJECT_ID"
        value = ""
    }]
    members = ["allUsers"]
}