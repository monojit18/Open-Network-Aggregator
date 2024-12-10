projectInfo = {    
    project = ""
    region = "asia-southeast1"
    serviceAccount = "-sa@.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "storagelib"
    spec = {
        image = "<repo-name>/storagelib:v1.0"
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
        value = "storagelib:v1.0"
    },
    {
        name = "STORAGE_DIR_PATH"
        value = "/data"
    },
    {
        name = "PROJECT_ID"
        value = ""
    }]
    members = ["allUsers"]
}