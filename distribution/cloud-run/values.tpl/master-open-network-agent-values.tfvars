projectInfo = {    
    project = ""
    region = "asia-southeast1"
    serviceAccount = "-sa@.iam.gserviceaccount.com"
}

cloudrunInfo = {
    name = "master-open-network-agent"
    spec = {
        image = "<repo-name>/master-agent:v1.0"
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
        value = "master-open-network-agent:v1.0"
    },
    {
        name = "AGENTIC_VERSION"
        value = "1.0.0"
    },
    {
        name = "AGENTIC_DOMAIN_PREFIX"
        value = "domain:"
    },
    {
        name = "AGENTIC_NLP_PROMPT"
        value = "Convert the following sentence into a JSON object and return as a proper JSON. Do not add any new items into the response.\nConditions:\nDomain for any Search or Transactional query on Learning, Courses, Skills, Jobs, Scholarships and Work Experiences will be \"ONEST\"\nDomain for any Search or Transactional query on Retail, Online Shopping and Booking will be \"ONDC\"nDomain for search query on Weather Forecast will be \"WEATHER\"\nDomain for search query on Videos and Webinars will be \"VIDEO\"\nDomain for search query on the price of any Agriculture Products or Commodities in a Mandi or Market will be \"ENAM\"\nDomain for any Generic query on any topic asking for suggestions, guidance and help will be \"LLM\""
    },
    {
        name = "AGENTIC_MODEL_ENDPOINT_ID"
        value = "4193564836128358400"
    },
    {
        name = "STORAGELIB_HOST"
        value = "https://storagelib-.run.app"
    },
    {
        name = "TRANSLATELIB_HOST"
        value = "https://translatelib-.run.app"
    },    
    {
        name = "GENAI_IMAGELIB_HOST"
        value = "https://genai-imagelib-.run.app"
    },
    {
        name = "GENAI_VECTORSEARCHLIB_HOST"
        value = "https://vector-searchlib-.run.app"
    },
    {
        name = "GENAI_TEXTLIB_HOST"
        value = "https://genai-textlib-.run.app"
    },
    {
        name = "GENAI_MULTILIB_HOST"
        value = "https://genai-multimodallib-.run.app"
    },
    {
        name = "ONDC_AGENT_URL"
        value = "https://ondc-agent-.run.app"
    },
    {
        name = "VIDEO_AGENT_URL"
        value = "https://video-agent-.run.app"
    },
    {
        name = "WEATHER_AGENT_URL"
        value = "https://weather-agent-.run.app"
    },
    {
        name = "MANDI_AGENT_URL"
        value = "https://mandi-agent-.run.app"
    },
    {
        name = "LLM_AGENT_URL"
        value = "https://llm-agent-.run.app"
    },
    {
        name = "PROJECT_ID"
        value = ""
    }]
    members = ["allUsers"]
}