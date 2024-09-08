projectInfo = {    
    project = "<project_id>"
    region = "asia-southeast1"
    serviceAccount = "apps-project-sa@<project_id>.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "retailgenie"
    spec = {
        image = "<repo-name>/retailgenie:v1.0"
        ingress = "all"
        minCount = "1"
        maxCount = "10"
        traffic = 100
        requests = {
            cpu = "100m"
            memory = "128Mi"
        }
        limits = {
            cpu = "1000m"
            memory = "256Mi"
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
        value = "retailgenie:v1.0"
    },
    {
        name = "STORAGELIB_HOST"
        value = "https://storagelib-"
    },    
    {
        name = "SPEECHLIB_HOST"
        value = "https://speechlib-"
    },
    {
        name = "TRANSLATELIB_HOST"
        value = "https://translatelib-"
    },    
    {
        name = "VISIONLIB_HOST"
        value = "https://visionlib-"
    },
    {
        name = "GENAI_IMAGELIB_HOST"
        value = "https://genai-imagelib-"
    },
    {
        name = "GENAI_VECTORSEARCHLIB_HOST"
        value = "https://vector-searchlib-"
    },
    {
        name = "GENAI_TEXTLIB_HOST"
        value = "https://genai-textlib-"
    },
    {
        name = "GENAI_MULTILIB_HOST"
        value = "https://genai-multimodallib-"
    },
    {
        name = "PROJECT_ID"
        value = "<project_id>"
    }]
    members = ["allUsers"]
}