projectInfo = {    
    project = "<project_id>"
    region = "asia-southeast1"
    serviceAccount = "apps-project-sa@<project_id>.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "onest-middleware"
    spec = {
        image = "<repo-name>/onest-middleware:v1.0"
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
        value = "onest-middleware:v1.0"
    },
    {
        name = "STORAGELIB_HOST"
        value = "https://storagelib-"
    },
    {
        name = "TRANSLATELIB_HOST"
        value = "https://translatelib-"
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
        name = "ONEST_LEARNING_SEEKER_ADAPTER_URL"
        value = "https://seeker-dev.<dns>/seeker"
    },
    {
        name = "PROJECT_ID"
        value = "<project_id>"
    }]
    members = ["allUsers"]
}