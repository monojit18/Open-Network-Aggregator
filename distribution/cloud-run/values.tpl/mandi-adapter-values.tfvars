projectInfo = {    
    project = ""
    region = "asia-southeast1"
    serviceAccount = "-sa@.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "mandi-adapter"
    spec = {
        image = "<repo-name>/mandi-adapter:v1.0"
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
        value = "mandi-adapter:v1.0"
    },
    {
        name = "EVENT_RECEIVER_HTTP_HOST"
        value = "https://event-receiverlib-.run.app"
    },   
    {
        name = "ENAM_MANDI_SEARCH_URL"
        value = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    },
    {
        name = "PROJECT_ID"
        value = ""
    }]
    members = ["allUsers"]
}