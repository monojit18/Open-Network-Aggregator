projectInfo = {    
    project = ""
    region = "asia-southeast1"
    serviceAccount = "-sa@.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "agri-adapter"
    spec = {
        image = "<repo-name>/agri-adapter:v1.0"
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
        value = "agri-adapter:v1.0"
    },
    {
        name = "EVENT_RECEIVER_HTTP_HOST"
        value = "https://event-receiverlib-.run.app"
    },        
    {
        name = "PROJECT_ID"
        value = ""
    }]
    members = ["allUsers"]
}