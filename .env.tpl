SA_KEY_PATH="<path>/dbs-project-sa.json"
STORAGE_DIR_PATH="<path>/storage/data"
TRANSLATION_DIR_PATH="<path>/translation/data"
VISION_DIR_PATH="<path>/vision/data"
SPEECH_DIR_PATH="<path>/speech/data"
VIDEO_DIR_PATH="<path>/video/data"
DOCAI_DIR_PATH="<path>/documentai/data"
PROJECT_ID=""
MODEL_PROJECT_ID=""
PUBSUB_PROJECT_ID=""
TRANSLATION_LOCATION="us-central1"
GLOSSARY_LOCATION="us-central1"
TRANSCODER_LOCATION="us-central1"
SPEECH_LOCATION="us-central1"
AUTOML_CUSTOM_MODEL_LOCATION="us-central1"
VECTOR_SEARCH_LOCATION="us-central1"
MODEL_LOCATION="us-central1"
# MODEL_LOCATION="asia-southeast1"
GENAI_LOCATION="us-central1"
# GENAI_LOCATION="asia-southeast1"
GENAI_PUBLISHER="google"
DOCAI_LOCATION="us"
DOCAI_PROJECT_ID=""
DATASTORE_PROJECT_ID="dbs-project-24022145"
VECTOR_SEARCH_TEXT_EMBEDDING_MODEL="text-embedding-005"
VECTOR_SEARCH_IMAGE_EMBEDDING_MODEL="multimodalembedding@001"
VECTOR_SEARCH_MULTILINGUAL_EMBEDDING_MODEL="text-multilingual-embedding-002"
GENAI_API_ENDPOINT="us-central1-aiplatform.googleapis.com"
GENAI_GEMINI_TEXT_MODEL="gemini-1.5-pro"
GENAI_GEMINI_VISION_MODEL="gemini-1.5-pro"

# STORAGELIB_HOST="http://localhost:6060"
STORAGELIB_HOST="https://storagelib-83053558111.<cr-url>"

# TRANSLATELIB_HOST="http://localhost:6061"
TRANSLATELIB_HOST="https://translatelib-83053558111.<cr-url>"

VISIONLIB_HOST="http://localhost:6062"
SPEECHLIB_HOST="http://localhost:6063"
GENAI_VECTORSEARCHLIB_HOST="http://localhost:6064"

# GENAI_TEXTLIB_HOST="http://localhost:6065"
GENAI_TEXTLIB_HOST="https://genai-textlib-83053558111.<cr-url>"

GENAI_IMAGELIB_HOST="http://localhost:6066"
GENAI_MULTILIB_HOST="http://localhost:6067"
DISCOVERY_ENGINELIB_HOST="http://localhost:6071"
DATA_STORELIB_HOST="http://localhost:6072"
WEBSOCK_ROOM_NAME="2870090141267285353"
WEBSOCK_STREAMER_HTTP_HOST="https://streamer-serverlib-4encm3loxa-as.a.run.app"
#WEBSOCK_STREAMER_HTTP_HOST="http://localhost:8081"

#Variables for Open Network
#================================================================================================================================
AGENTIC_VERSION="1.0.0"
AGENTIC_DOMAIN_PREFIX="domain:"

# AGENTIC_NLP_PROMPT="Convert the following sentence into a JSON object and return as a proper JSON. Do not add any new items into the response.\nConditions:\nDomain for any query on Agricultural Loan for Farmers will be \"AGRI\"\nDomain for search query on Weather Forecast will be \"WEATHER\"\nDomain for search query on Videos and Webinars will be \"VIDEO\"\nDomain for search query on the price of any Agriculture Products or Commodities in a Mandi or Market will be \"ENAM\"\nDomain for any Generic query on any Agriculture asking for suggestions, guidance, help or more information will be \"LLM\".Within \"LLM\" domain, any query that contains profanity, abusive, criminal or racist words or irrelevant to Agriculture domain should of type \"negative\""
# AGENTIC_MODEL_ENDPOINT_ID="8877985747756384256"

AGENTIC_NLP_PROMPT="Convert the following sentence into a JSON object and return as a proper JSON. Do not add any new items into the response.\nConditions:\nDomain for any Search or Transactional query on Learning, Courses, Skills, Jobs, Scholarships and Work Experiences will be \"ONEST\"\nDomain for any Search or Transactional query on Retail, Online Shopping and Booking will be \"ONDC\"nDomain for search query on Weather Forecast will be \"WEATHER\"\nDomain for search query on Videos and Webinars will be \"VIDEO\"\nDomain for search query on the price of any Agriculture Products or Commodities in a Mandi or Market will be \"ENAM\"\nDomain for any Generic query on any topic asking for suggestions, guidance and help will be \"LLM\""
AGENTIC_MODEL_ENDPOINT_ID="4193564836128358400"

EVENT_SERVER_HTTP_HOST="https://event-serverlib-83053558111.<cr-url>"
# EVENT_SERVER_HTTP_HOST="http://localhost:8081"

EVENT_RECEIVER_HTTP_HOST="https://event-receiverlib-83053558111.<cr-url>"
# EVENT_RECEIVER_HTTP_HOST="http://localhost:8084"

BUYER_ADAPTER_URL="https://buyer-adapter-83053558111.<cr-url>"
# BUYER_ADAPTER_URL="http://localhost:10001"

ONDC_AGENT_URL="https://ondc-agent-83053558111.<cr-url>"
# ONDC_AGENT_URL="http://localhost:10002"

AGRI_ADAPTER_URL="https://agri-adapter-83053558111.<cr-url>"
# AGRI_ADAPTER_URL="http://localhost:10001"

AGRI_AGENT_URL="https://agri-agent-83053558111.<cr-url>"
# AGRI_AGENT_URL="http://localhost:10002"

# ONEST_AGENT_URL="https://onest-agent-801148443625.<cr-url>"
# ONEST_AGENT_URL="http://localhost:10002"

VIDEO_ADAPTER_URL="https://video-adapter-83053558111.<cr-url>"
# VIDEO_ADAPTER_URL="http://localhost:10001"

VIDEO_AGENT_URL="https://video-agent-83053558111.<cr-url>"
# VIDEO_AGENT_URL="http://localhost:10002"

WEATHER_ADAPTER_URL="https://weather-adapter-83053558111.<cr-url>"
# WEATHER_ADAPTER_URL="http://localhost:10001"

WEATHER_AGENT_URL="https://weather-agent-83053558111.<cr-url>"
# WEATHER_AGENT_URL="http://localhost:10002"

MANDI_ADAPTER_URL="https://mandi-adapter-83053558111.<cr-url>"
# MANDI_ADAPTER_URL="http://localhost:10001"

MANDI_AGENT_URL="https://mandi-agent-83053558111.<cr-url>"
# MANDI_AGENT_URL="http://localhost:10002"

LLM_ADAPTER_URL="https://llm-adapter-83053558111.<cr-url>"
# LLM_ADAPTER_URL="http://localhost:10001"

LLM_AGENT_URL="https://llm-agent-83053558111.<cr-url>"
# LLM_AGENT_URL="http://localhost:10002"

YOUTUBE_DATA_V3_SEARCH_URL="https://youtube.googleapis.com/youtube/v3"
NINJA_CART_SEARCH_URL="https://apiv2.ninjacart.in/ninja-agri/onest-video-content"
# APNA_SEARCH_URL="https://api.production.infra.apna.co/campus-pulse/api/catalog"
WEATHER_SEARCH_URL="https://api.openweathermap.org/data/2.5/weather"
WEATHER_ICON_URL="https://openweathermap.org/img/wn"
ENAM_MANDI_SEARCH_URL="https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
#================================================================================================================================