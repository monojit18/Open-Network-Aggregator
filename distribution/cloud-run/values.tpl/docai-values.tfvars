projectInfo = {    
    project = "<project_id>"
    region = "asia-southeast1"
    serviceAccount = "apps-project-sa@<project_id>.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "docailib"
    spec = {
        image = "<repo-name>/docailib:v1.0"
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
        value = "docailib:v1.0"
    },
    {
        name = "DOCAI_DIR_PATH"
        value = "/data"
    },
    {
        name = "DOCAI_LOCATION"
        value = "us"
    },
    {
        name = "PROJECT_ID"
        value = "<project_id>"
    }]
    members = ["allUsers"]
}