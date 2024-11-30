projectInfo = {    
    project = ""
    region = "asia-southeast1"
    serviceAccount = "-sa@.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "weather-adapter"
    spec = {
        image = "<repo-name>/weather-adapter:v1.0"
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
        value = "weather-adapter:v1.0"
    },
    {
        name = "WEATHER_SEARCH_URL"
        value = "https://api.openweathermap.org/data/2.5/weather"
    },
    {
        name = "WEATHER_ICON_URL"
        value = "https://openweathermap.org/img/wn"
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