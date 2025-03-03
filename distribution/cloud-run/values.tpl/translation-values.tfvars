projectInfo = {    
    project = ""
    region = "asia-southeast1"
    serviceAccount = "-sa@.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "translatelib"
    spec = {
        image = "<repo-name>/translatelib:v1.0"
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
        value = "translatelib:v1.0"
    },
    {
        name = "TRANSCODER_LOCATION"
        value = "us-central1"
    },
    {
        name = "TRANSLATION_LOCATION"
        value = "us-central1"
    },
    {
        name = "GLOSSARY_LOCATION"
        value = "us-central1"
    },
    {
        name = "PROJECT_ID"
        value = ""
    }]
    members = ["allUsers"]
}