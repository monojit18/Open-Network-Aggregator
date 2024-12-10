projectInfo = {    
    project = ""
    region = "asia-southeast1"
    serviceAccount = "-sa@.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "vector-searchlib"
    spec = {
        image = "<repo-name>/vector-searchlib:v1.0"
        ingress = "all"
        minCount = "1"
        maxCount = "10"
        traffic = 100
        requests = {
            cpu = "100m"
            memory = "256Mi"
        }
        limits = {
            cpu = "1000m"
            memory = "512Mi"
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
        value = "vector-searchlib:v1.0"
    },
    {
        name = "VECTOR_SEARCH_LOCATION"
        value = "us-central1"
    },    
    {
        name = "PROJECT_ID"
        value = ""
    }]
    members = ["allUsers"]
}