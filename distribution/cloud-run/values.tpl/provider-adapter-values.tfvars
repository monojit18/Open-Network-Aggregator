projectInfo = {    
    project = "<project_id>"
    region = "asia-southeast1"
    serviceAccount = "apps-project-sa@<project_id>.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "provider-adapter"
    spec = {
        image = "<repo-name>/provider-adapter:v1.0"
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
        value = "provider-adapter:v1.0"
    },
    {
        name = "SANDBOX_HOST"
        value = "https://sandbox.onest.network"
    },
    {
        name = "BPP_SUBSCRIBER_ID"
        value = "provider-dev.<dns>"
    },
    {
        name = "BPP_CLIENT_CALLBACK_URL"
        value = "https://provider-client-"
    },
    {
        name = "PROJECT_ID"
        value = "<project_id>"
    }]
    members = ["allUsers"]
}