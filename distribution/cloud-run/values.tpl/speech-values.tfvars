projectInfo = {    
    project = "<project_id>"
    region = "asia-southeast1"
    serviceAccount = "apps-project-sa@<project_id>.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "speechlib"
    spec = {
        image = "<repo-name>/speechlib:v1.0"
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
        value = "speechlib:v1.0"
    },
    {
        name = "SPEECH_LOCATION"
        value = "us-central1"
    },
    {
        name = "SPEECH_DIR_PATH"
        value = "/data"
    },
    {
        name = "PROJECT_ID"
        value = "<project_id>"
    }]
    members = ["allUsers"]
}