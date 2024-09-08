
projectInfo = {    
    project = "<project_id>"
    region = "asia-southeast1"
    serviceAccount = "apps-project-sa@<project_id>.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "streamer-clientlib"
    spec = {
        image = "<repo-name>/streamer-clientlib:v1.0"
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
        value = "streamer-clientlib:v1.0"
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