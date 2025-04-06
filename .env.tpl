STORAGE_DIR_PATH="<path>storage/data"
TRANSLATION_DIR_PATH="<path>translation/data"
VISION_DIR_PATH="<path>vision/data"
SPEECH_DIR_PATH="<path>speech/data"
VIDEO_DIR_PATH="<path>video/data"
DOCAI_DIR_PATH="<path>documentai/data"
PROJECT_ID="<PROJECT_ID>"
MODEL_PROJECT_ID="<PROJECT_ID>"
PUBSUB_PROJECT_ID="<PROJECT_ID>"
BIG_QUERY_LOCATION="asia-southeast1"
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
DOCAI_PROJECT_ID="<PROJECT_ID>"
DATASTORE_PROJECT_ID="<DATASTORE_PROJECT_ID>"
VECTOR_SEARCH_TEXT_EMBEDDING_MODEL="text-embedding-005"
VECTOR_SEARCH_IMAGE_EMBEDDING_MODEL="multimodalembedding@001"
VECTOR_SEARCH_MULTILINGUAL_EMBEDDING_MODEL="text-multilingual-embedding-002"
GENAI_API_ENDPOINT="us-central1-aiplatform.googleapis.com"
GENAI_GEMINI_TEXT_MODEL="gemini-1.5-flash-002"
GENAI_GEMINI_VISION_MODEL="gemini-1.5-pro"

STORAGELIB_HOST="http://localhost:6060"
TRANSLATELIB_HOST="http://localhost:6061"
VISIONLIB_HOST="http://localhost:6062"
SPEECHLIB_HOST="http://localhost:6063"
GENAI_VECTORSEARCHLIB_HOST="http://localhost:6064"

GENAI_TEXTLIB_HOST="http://localhost:6065"

GENAI_IMAGELIB_HOST="http://localhost:6066"
GENAI_MULTILIB_HOST="http://localhost:6067"
DISCOVERY_ENGINELIB_HOST="http://localhost:6071"
DATA_STORELIB_HOST="http://localhost:6072"

AGENTIC_VERSION="1.0.0"
AGENTIC_DOMAIN_PREFIX="domain:"

AGENTIC_TEXT_EMBEDDING="onix_agentic_text_embedding_model"
AGENTIC_TEXT_EMBEDDING_DISTANCE="COSINE"
AGENTIC_BQ_DATASET="onix_agentic_ds"
AGENTIC_BQ_TABLE="agri_bazar_commodity_embd_tbl"
AGENTIC_BQ_SEARCH_COLUMN="embedding"
AGENTIC_BQ_QUERY_COLUMN="ml_generate_embedding_result"
AGENTIC_BQ_MAX_RESULTS="1"

# ONDC
AGENTIC_NLP_PROMPT="Convert the following sentence into a JSON object and return as a proper JSON. Do not add any new items into the response.\nConditions:\nDomain for any Search or Transactional query on Learning, Courses, Skills, Jobs, Scholarships and Work Experiences will be \"ONEST\"\nDomain for any Search or Transactional query on Retail, Online Shopping and Booking will be \"ONDC\"\nDomain for search query on Weather Forecast will be \"WEATHER\"\nDomain for search query on Videos and Webinars will be \"VIDEO\"\nDomain for search query on the price of any Agriculture Products or Commodities in a Mandi or Market will be \"ENAM\"\nDomain for any Generic query on any topic asking for suggestions, guidance and help will be \"LLM\"\nDomain for any negative, irrelevant, abusive query which is out of any of the aboev contexts will be \"LLM\""

# AGRI
# AGENTIC_NLP_PROMPT="Convert the following sentence into a JSON object and return as a proper JSON.\nDo not add any new items into the response.\nConditions:\nDomain for any query on Agricultural Loan for Farmers will be \"AGRI\"\nDomain for search query on Weather Forecast will be \"WEATHER\"\nDomain for search query on Videos and Webinars will be \"VIDEO\"\nDomain for search query on the price of any Agriculture Products or Commodities in a Mandi or Market will be \"ENAM\"\nDomain for any Generic query on Agriculture asking for suggestions, guidance, help or queries on Farming Advisory etc. will be \"LLM\"\nDomain for any transactional query on Agriculture asking for Buying, Viewing of agricultural products will be \"AGRI\" with \"type\" as \"agri-commerce\"\nDomain for any transactional query on Retail Commerce asking for Buying, Viewing, Selling of non-agricultural products etc. will be \"AGRI\" with \"type\" as \"retail-commerce\"\nDomain for any transactional query on Agriculture asking for Selling of agricultural products or queries on Market Linkage will be \"AGRI\" with \"type\" as \"market-linkage\"\nDomain for any negative, irrelevant, abusive query which is out of any of the aboev contexts will be \"LLM\""

# ONDC
PLANNER_EXTRACT_ONDC_PROMPT="Divide the following query into multiple relevant segments - \"ONDC\", \"VIDEO\" and \"LLM\" and respond with a list of useful alternate suggestions.\nDo not use the name of any particular outlet or brand; each suggestion should be generic.\nAvoid using any special characters in the response.\nEach query should be an alternate suggestion to the original query.\nInclude exactly one query of type \"ONDC\" which should  include options which are somehow related to the original query or product e.g. ingredients, raw materials, close by locations etc.\nInclude exactly one suggestion of type \"LLM\" which should be query to ask for suggestions or guidance on some advanced or enhanced action of the original product or query.\nTreat all query to have a domain \"VIDEO\" and return exactly one video suggestions.\nExample:\nQuery: It's again time for a marriage in the family. My niece is going to get married to a Punjabi guy. I would like to buy some really cool Kurtas with Brown colour and White border. Please suggest.\nResponse:\n[{\"domain\": \"ONDC\", \"relevant_text\": \"show me some nice fabric options for Kurtas with Brown colour\"},\n{\"domain\": \"ONDC\", \"relevant_text\": \"suggest some different design options for Kurtas with White border\"},\n{\"domain\": \"ONDC\", \"relevant_text\": \"show me some options for the raw materials for Kurtas\"},\n{\"domain\": \"VIDEO\", \"relevant_text\": \"Give me some suggestions of Marriage halls for Punjabi wedding\"},\n{\"domain\": \"LLM\", \"relevant_text\": \"Give me some suggestions of Honeymoon destinations in India\"}]"

# ONEST
PLANNER_EXTRACT_ONEST_PROMPT="Divide the following query into multiple relevant segments - \"VIDEO\" and \"LLM\" and respond with a list of useful alternate suggestions.\nDo not use the name of any particular outlet or brand; each suggestion should be generic.\nAvoid using any special characters in the response.\nEach query should be an alternate suggestion to the original query.\nInclude exactly one suggestion of type \"LLM\" which should be query to ask for suggestions or guidance on some advanced or enhanced action of the original product or query.\nTreat all query to have a domain \"VIDEO\" and return exactly one video suggestions.\nMake sure the responses are of Indian context.\nExample:\nQuery: I've just passed out of 12th standard in school. I love Physics and especially Electrical circuits. Please suggest some good vocational courses for me that might help me in my career growth.\nResponse:\n[{\"domain\": \"LLM\", \"relevant_text\": \"show good vocational training courses in Physics and Electeical circuits\"},\n{\"domain\": \"VIDEO\", \"relevant_text\": \"Videos on vocational training courses in Physics and Electeical circuits\"}]\n\nQuery: I have just completed my B.Tech course. I love to work in the field of Databases. Please suggest some good Beginner or Mid-level courses in Databases to help in my job search.\nResponse:\n[{\"domain\": \"LLM\", \"relevant_text\": \"show Beginner or Mid-level courses in Databases\"},\n{\"domain\": \"VIDEO\", \"relevant_text\": \"Videos on Beginner or Mid-level courses in Databases\"}]"

# ONDC & ONEST
PLANNER_ABUSIVE_NLP_PROMPT="Check the following query carefully for any negative, irrelevant or abusive content and return true otherwise false as in the following example.\nExample: {\"isAbusive\": \"<true or false>\"}\nCheck the following query carefully if it asks or talk about any person, celebrity, popular figure or any individual. If so then return true oherwise return false as in the following example.\nExample: {\"isIndividual\": \"<true or false>\"}"

# ONDC & AGRI
AGRI_ATTRIBUTES_PROMPT="Extract keywords related to Agriculture from the following sentence and return as a JSON response.Exclude all other types of keywords:\nExamples:\n\nQuery: Show me videos for rice farming\nResponse: {\"attributes\":[\"rice farming\"]}\n\nQuery: Show me videos for mango farming and C++ programming\nResponse: {\"attributes\":[\"mango farming\"]}\n\nQuery: Show me videos on Mango and Rice\nResponse: {\"attributes\":[\"mango\", \"rice\"]}\n\nQuery: Show me videos for Python programming\nResponse: {\"attributes\":[\"\"]}"

# ONDC & AGRI
LLM_CHAT_PROMPT = "Generate a detailed response to the following chat query.\nTry to provide a complete solution to the query which should provide a defnite answer without asking too many questions back to the user.\nThe response should strictly within 300 words.\nThe response should be in the form of a nicely formatetd paragraph with proper line breaks and spacing.\nThe query needs to be from any one of the following domains:\n\"Agriculture\", \"Agri Advisory\" or \"Agri Market Linkage\", \"Retail\", \"Education\", \"Skilling\", \"Jobs\", \"Travel\", \"Hospitality\", \"Health\"\n. If the query is outisde any one of the above mentioned domains or if the query is negative, irrleveant or abusive, then generate a polite, generous response informing your inability to respond to this query.\nIf the query is about any person, celebrity, popular figure or any individual then generate a polite, short, crisp, generous response informing your inability to respond to this query; do not mention the name of that individual in the response.\nIf the query contains a greeting gesture like \"Hi\", \"Hello\" etc. then reciprocate back with a very polite and helpful response to make the user more comfortable with the system."

# ONDC & AGRI
LLM_FOLLOW_UP_PROMPT = "Generate a set of 3 alternate questions for the following.\nThe original query is asked by end user to a conversational bot; the follow up questions should follow the same context and should be asked as if user is asking to the bot.\nOne of the alternate question should be related to Video relevant to the original question.\nEach Question should be short and concise.\nAvoid using any special characters in the response.\nReturn the response as a JSON in the following format:\n{\"follow_up\": {\"original_query\": \"I want to plan the marriage of my daughter.\", \"follow_ups\": [{\"follow_up\": \"I am looking for wedding planning advice and guidance for the upcoming marriage of my daughter.\"}, {\"follow_up\": \"What are the steps and resources needed to organize wedding?\"}, {\"follow_up\": \"Show me some videos giving ideas of marriage planning\"}]}}"

# ONDC
AGENTIC_MODEL_ENDPOINT_ID="2479997954472017920"

# AGRI
# AGENTIC_MODEL_ENDPOINT_ID="2960066721391575040"

# ONDC
PLANNER_LLM_SEARCH="true"

WEBSOCK_STREAMER_HTTP_HOST="https://streamer-server.<dns>"
# WEBSOCK_STREAMER_HTTP_HOST="http://localhost:8082"

EVENT_SERVER_HTTP_HOST="https://event-server.<dns>"
# EVENT_SERVER_HTTP_HOST="http://localhost:8081"

EVENT_RECEIVER_HTTP_HOST="http://localhost:8084"

# PLANNER_AGENT_URL=""
PLANNER_AGENT_URL="http://localhost:10002"

# BUYER_ADAPTER_URL=""
BUYER_ADAPTER_URL="http://localhost:10001"

# ONDC_AGENT_URL=""
ONDC_AGENT_URL="http://localhost:10002"

# ONEST_AGENT_URL=""
ONEST_AGENT_URL="http://localhost:10002"

# AGRI_ADAPTER_URL=""
AGRI_ADAPTER_URL="http://localhost:10001"

# AGRI_AGENT_URL=""
AGRI_AGENT_URL="http://localhost:10002"

# VIDEO_ADAPTER_URL=""
VIDEO_ADAPTER_URL="http://localhost:10001"

# VIDEO_AGENT_URL=""
VIDEO_AGENT_URL="http://localhost:10002"

# WEATHER_ADAPTER_URL=""
WEATHER_ADAPTER_URL="http://localhost:10001"

# WEATHER_AGENT_URL=""
WEATHER_AGENT_URL="http://localhost:10002"

# MANDI_ADAPTER_URL=""
MANDI_ADAPTER_URL="http://localhost:10001"

# MANDI_AGENT_URL=""
MANDI_AGENT_URL="http://localhost:10002"

# MANDI_VECTOR_SEARCH_URL=""
MANDI_VECTOR_SEARCH_URL="http://localhost:6076/bigquery"

# LLM_ADAPTER_URL=""
LLM_ADAPTER_URL="http://localhost:10001"

# LLM_AGENT_URL=""
LLM_AGENT_URL="http://localhost:10002"

VIDEO_API_KEY = "x-api-video-key"
YOUTUBE_NETWORK_KEY = "YOUTUBE"
WEATHER_API_KEY = "x-api-weather-key"
PARTNER_WEATHER_API_KEY = "x-partner-api-weather-key"
OPEN_WEATHER_NETWORK_KEY = "OPEN_WEATHER"
ENAM_MANDI_API_KEY = "x-api-mandi-key"
PARTNER_MANDI_API_KEY = "x-partner-api-mandi-key"
ENAM_NETWORK_KEY="ENAM"


YOUTUBE_DATA_V3_SEARCH_URL="https://youtube.googleapis.com/youtube/v3"
NINJA_CART_SEARCH_URL="https://apiv2.ninjacart.in/ninja-agri/onest-video-content"
# APNA_SEARCH_URL="https://api.production.infra.apna.co/campus-pulse/api/catalog"
WEATHER_SEARCH_URL="https://api.openweathermap.org/data/2.5/weather"
WEATHER_ICON_URL="https://openweathermap.org/img/wn"
ENAM_MANDI_SEARCH_URL="https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
#================================================================================================================================