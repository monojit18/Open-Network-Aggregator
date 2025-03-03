projectInfo = {    
    project = ""
    region = "asia-southeast1"
    serviceAccount = "-sa@.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "agri-agent"
    spec = {
        image = "<repo-name>/agri-agent:v1.0"
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
        value = "agri-agent:v1.0"
    },
    {
        name = "AGRI_ADAPTER_URL"
        value = "https://agri-adapter-.run.app"
    },        
    {
        name = "PROJECT_ID"
        value = ""
    }]
    members = ["allUsers"]
}