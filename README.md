# Multi Agent Aggregator for Open Network -

## Api Specifications

# Introduction

**Google Agentic framework** aims to provide an easy to integrate interface for Buyers/Seekers wanting to connect to the various Open Networks and/or various Content providers like Video, Webcast, Podcasts, Online Tutorials, Digital Catalogs etc. to name a few.

Google Agentic framework will build a bridge between the Demand and Supply sides of the Network and allow a seamless, frictionless communication between the two.

This Document contains the specifications for the APIs exposed by **Google Agentic framework** on the Demand side (*Buyers/Seekers*) and also the specification for the APIs to be hosted on the Supply side (*Buyer Apps, Seeker Apps, Digital Content Providers etc*.)

# High-Level View

![high-level-view](./assets/high-level-view.png)

# High-Level Architecture

![high-level-arch](./assets/high-level-arch.png)

- Multi-agent architecture
- Bridge between Demand and Supply
  - **Demand side**: Buyers/Seekers
  - **Supply side**: BAPs on Open Network, various Digital Content providers who are not on any Open Networks
- User’s Voice command runs through an NLP to understand the Intent
- **Master Agent** is the first responder
  - **Master Agent** connects to Gemini 
  - Responses from Model will return a specific formatted JSON with **Specific Intents** (*which network to go to?*); **Action items** (*Search*) and **Messages** *(corresponding data points to send to the Open Network*)
  - Passes the JSON to Platform specific Sub-Agents
- Responses from each Network is sent back to the front end over a **Websocket connection**
- Each **Sub-agent** act like an independent unit capable to communicate with a specific Open Networks and for a specific domain
  - JSON data from **Master-agent** is processed to convert it into a request for a specific Open Network
  - **Sub-agents** can send the request to Open Networks e.g. ONEST (for *Education, Jobs, Skilling*) or ONDC (for *Retail*) based on the instruction from **Master Agent**
    - **Sub-agents** will send the request to a BAP interfaces in the Open Network like Buyer Apps or Seeker Apps; which in-turn will call the designated Open Network
    - **Providers** on the Open network would respond back to the BAPs as per [Beckn protocol](https://becknprotocol.io/); which in-turn sends the response back to the front end apps (*Buyers/Seekers*)
  - **Sub-agents** can send the request to Content providers outside of any Open Network e.g. Videos, Digital Catalogs, Web/Podcasts etc. based on the instruction from **Master Agent**
    - Each non-Network Content provider can send the digital contents directly to the front end apps (*Buyers/Seekers*)

# Logical View

![logical-view](./assets/logical-view.png)

# End to End Workflow

![workflow](./assets/workflow.png)

# Sequential Flow

## All Open Networks

![seqence-all-open-nw](./assets/seqence-all-open-nw.png)



## Integrator Networks (*Outside Open Network*)

![seqence-non-open-nw](./assets/seqence-non-open-nw.png)

# Integrator App

![integrator-app](./assets/integrator-app.png)

- Integrates with **Google Agentic framework**
- Maintains the state of entire application
- Manages end user preferences viz. Preferred Networks, Intended Verticals of Open Networketc.
- Logs all transactions in an Audit Database asynchronously
- Basic Analytics
- Future Plans
  - Advanced Analytics



# API Specifications

## Authentication

- The initial version proposes to use Key based security for APIs
- Key to be created and managed by Integrator app
- Key to be passed in the **X-API-Key** header with each API call
- Multiple Open network API might have their own version of api keys which the Demand side has to send while calling Master Agent API as explained below

# Master Agent

This api is hosted by **Google Agentic framework** and exposed to the Demand side of the Network - Buyers and Seekers.

Any Mobile or Web app integrating with this framework will call this single API to receive content as per Buyers request.

## Async Mode

### /search

```yaml
openapi: 3.0.0
info:
  title: Google Agentic Core API
  description: Google Agentic Core API specification
  version: 0.0.1

security:
- ApiKeyAuth: []  
paths:
  /search:
    post:
      tags:
      - Domain spaecific search
      - Google Agentic framework
      - Master Agent
      description: Master Agent of the Google Agentic framework to transform text query into actionable insights
      requestBody:
        description: Search service by Google Agentic framework.
        content:
          application/json:
            schema:
              type: object
              properties:                
                transaction_id:
                  type: string
                message_id:
                  type: string
                query:
                  type: string
                location:
                  type: object
                  description: Contains a reverse geocoded address from user's current location (*Mobile Device or Web*).
                  properties:
                    address:
                      type: string
                    country:
                      $ref: '#/components/schemas/Country/properties/code'
                    city:
                      $ref: '#/components/schemas/City/properties/code'
                    zip:
                      type: string
                preferred_networks:
                  type: object
                  description: Contains a list of target BAPs and/or Content providers.|
                    Google Agentic framework will route requests appropriately to these networks.
                  properties:                    
                    $ref: '#/components/schemas/PreferredNetwork'                  
                intended_verticals:
                  type: object
                  # For future use
                  description: Contains a list of verticals supported by Open Networks and intended by the end user.|
                    This field would be ignored for non-network Content providers viz. Video, Weather etc.
                  properties:
                    type: array
                    items:
                      type: string
              required:
              - transaction_id
              - message_id
              - query
              - preferred_networks
      responses:
        '200':
          description: Acknowledgement of message received.
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: object
                    properties:
                      ack:
                        $ref: '#/components/schemas/Ack'
                    required:
                    - ack
                  error:
                    $ref: '#/components/schemas/Error'
                required:
                - message
```



### Description

#### Request

| **Headers**           | **Type** | **Description**                                              |
| --------------------- | -------- | ------------------------------------------------------------ |
| **x-api-key**         | string   | This will be provided to the Demand side partner while integrating with the Integrator/Hosting App which stores the Key securely for each Demand side partner. Integrator/Hosting App will validate the key while processing the Master agent api call. |
| **x-api-video-key**   | string   | API key for Youtube videos                                   |
| **x-api-mandi-key**   | string   | API key for Mandi API                                        |
| **x-api-weather-key** | string   | API key for OpenWeatherMap API                               |

| **Fields**             | **Type** | **Description**                                              |
| ---------------------- | -------- | ------------------------------------------------------------ |
| **transaction_id**     | string   | Identifies a new Transaction in Buyer/Seeker Apps. Sent by Buyer/Seeker Apps. |
| **message_id**         | string   | Identifies a new message or action; e.g. Search. Sent by Buyer/Seeker Apps. |
| **query**              | string   | Query over Voice or Text to be used by Master Agent Sent by Buyer/Seeker Apps. |
| **location**           | object   | Reverse geocoded address from user's current location (*Mobile Device or Web*). *location:*         *type: object*         *description: Contains a reverse geocoded address from user's current location (\*Mobile Device or Web\*).*         *properties:*          *address:*           *type: string*          *country:*           *$ref: '#/components/schemas/Country/properties/code'*          *city:*           *$ref: '#/components/schemas/City/properties/code'*          *zip:*           *type: string* |
| **country**            | object   | *Country:*   *description: Describes a country.*   *type: object*   *properties:*    *name:*     *type: string*     *description: Name of the country.*    *code:*     *type: string*     *description: Country code as per ISO 3166-1 and ISO 3166-2 format.* |
| **city**               | object   | *City:*   *type: object*   *description: Describes a city.*   *properties:*    *name:*     *type: string*     *description: Name of the city.*    *code:*     *type: string*     *description: City code.* |
| **preferred_networks** | array    | List of target BAPs and/or Content providers. **Google Agentic framework** will route requests appropriately to these networks. *preferred_networks:*         *type: object*         *description: Contains a list of target BAPs and/or Content providers.\|*          *Google Agentic framework will route requests appropriately to these networks.*         *properties:*          *type: array*          *items:*           *$ref: '#/components/schemas/PreferredNetwork'* |
| **intended_verticals** | array    | List of verticals supported by **Open Networks** and intended by the end user. This field would be ignored for non-network Content providers viz. Video, Weather etc. *intended_verticals:*         *type: object*         *description: Contains a list of verticals supported by Open Networks and intended by the end user.\|*          *This field would be ignored for non-network Content providers viz. Video, Weather etc.*         *properties:*          *type: array*          *items:*           *type: string* |

#### Response

| **Fields**  | **Type** | **Description**                                              |
| ----------- | -------- | ------------------------------------------------------------ |
| **message** | object   | *Ack:*   *description: Describes the ACK response.*   *type: object*   *properties:*    *status:*     *type: string*     *description: Describe the status of the ACK response. If schema validation passes, status is ACK else it is NACK.*     *enum:*     *- ACK*     *- NACK*   *required:*   *- status* |
| **error**   | object   | *Error:*   *description: Describes an error object*   *type: object*   *properties:*    *type:*     *type: string*     *enum:*      *- CONTEXT_ERROR*      *- CORE_ERROR*      *- DOMAIN_ERROR*            *- JSON_SCHEMA_ERROR*    *code:*     *type: string*     *description: Error code from a list of error codes from Google Agentic framework.*    *path:*     *type: string*     *description: Path to json schema generating the error. Used only during json schema validation errors.*    *message:*     *type: string*     *description: Human readable message describing the error.*   *required:*   *- type*   *- code* |



# BAP and Content Provider APIs

## Retail 

This API will be hosted by the Supply side of the Network - Buyer Apps and Seeker Apps on the ONDC network.

- Buyer Apps and Seeker Apps would bring content from Sellers on the Network
- Communication between Buyer/Seekers and Sellers/Providers would be strictly beckon protocol
  - Although the **Google Agentic framework** does not enforce any restriction on the same; but is strongly expected.
- Modes
  - **Asynchronous Mode**
    - ONDC Sub-agents calls **/search** API hosted by BAPs
    - BAPs return search content by **callback_url** hosted by **Google Agentic framework**
    - Framework return the search results back to the Demand side - Buyers and Seekers through a Websocket connection
  - **Synchronous Mode**
    - ONDC Sub-agents calls **/search** API hosted by BAPs
    - Wait for the BAPs to return the search result. **callback_url** is ignored by BAPs in this case
    - Framework return the search results back to the Demand side - Buyers and Seekers through a Websocket connection

## Async Mode

### /search

```yaml
openapi: 3.0.0
info:
  title: Google Agentic Core API
  description: Google Agentic Core API specification
  version: 0.0.1

security:
- ApiKeyAuth: []  
paths:
  /search:
    post:
      tags:
      - Domain spaecific search
      - Google Agentic framework
      - Open Networks      
      description: Domain spaecific search by Google Agentic framework in the Open Networks through BAP interfaces.
      requestBody:
        description: Search service by Google Agentic framework.
        content:
          application/json:
            schema:
              type: object
              properties:
                context:
                  $ref: '#/components/schemas/Context'
                message:
                  type: object
                  properties:
                    network:
                      $ref: '#/components/schemas/Network'
              required:
              - context
              - message
      responses:
        '200':
          description: Acknowledgement of message received.
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: object
                    properties:
                      ack:
                        $ref: '#/components/schemas/Ack'
                    required:
                    - ack
                  error:
                    $ref: '#/components/schemas/Error'
                required:
                - message
```



### Description

#### Request

| **Fields**     | **Type** | **Description**                                              |
| -------------- | -------- | ------------------------------------------------------------ |
| **context**    | string   | Context set by **Google Agentic framework** Provides contextual information that can help BAPs while searching on the network **location**:Contains a reverse geocoded address from user's current location (*Mobile Device or Web*). **address**: Free Text**country**: Country code as per ISO 3166-1 and ISO 3166-2 format.**city**: City code.**zip**: Zip/PIN code. **version**: Version of **Google Agentic framework** API specs. **transaction_id**: This is a unique value which persists across all API calls from search through confirm. **message_id**: This is a unique value which persists during a request / callback cycle. **timestamp**: date-time. Time of request generation in RFC3339 format.    **callback_url**: URL to be called by BAPs in response to the search() function call. This is only needed for the Async mode. |
| **message**    | string   | **network:** Contains parameters for performing Search query by BAPs **name**: Name of the target Network; viz. **ONDC**      **Action**: Action be performed by the BAP. Currently set to only *search* **relevant_text**: Meaningful extract from original Text by end User - Buyers or Seekers.BAPs can use this to perform a semantic search on their backend and filter out the results. **filters**: An Array of **SearchItem** objectsBAPs who do not support semantic search can use this to filter their search. |
| **SearchItem** |          | **SearchItem**: filter criteria for Search in the ONDC network.     merchant: Name of the Merchant or Business to include in the Search     **colours**: List Colors to include in the Search     price: This will be used in sorting the search results e,g. Low to High     product: Producti to search for     category: Category to include in the Search |

#### Response

| **Fields**  | **Type** | **Description**                                              |
| ----------- | -------- | ------------------------------------------------------------ |
| **message** | object   | *Ack:*   *description: Describes the ACK response.*   *type: object*   *properties:*    *status:*     *type: string*     *description: Describe the status of the ACK response. If schema validation passes, status is ACK else it is NACK.*     *enum:*     *- ACK*     *- NACK*   *required:*   *- status* |
| **error**   | object   | *Error:*   *description: Describes an error object*   *type: object*   *properties:*    *type:*     *type: string*     *enum:*      *- CONTEXT_ERROR*      *- CORE_ERROR*      *- DOMAIN_ERROR*            *- JSON_SCHEMA_ERROR*    *code:*     *type: string*     *description: Error code from a list of error codes from Google Agentic framework.*    *path:*     *type: string*     *description: Path to json schema generating the error. Used only during json schema validation errors.*    *message:*     *type: string*     *description: Human readable message describing the error.*   *required:*   *- type*   *- code* |



### /on_search

This API is hosted by **Google Agentic framework** and is called by BAPs in the Asynchronous mode.

```yaml
/on_search:
    post:
      tags:
      - Domain spaecific search
      - Google Agentic framework
      - Open Networks      
      description: Receive Search results from BAP Interfaces.
      requestBody:
        description: Payload to be sent by BAP interfaces to the Google Agentic framework.
        content:
          application/json:
            schema:
              type: object
              properties:
                context:
                  $ref: '#/components/schemas/Context'
                message:
                  type: object
                  properties:
                    catalog:
                      $ref: '#/components/schemas/Catalog'
                    network:
                      $ref: '#/components/schemas/Network'
                    next_page_token:
                      type: string                    
                  required:
                  - catalog
                  - network
                error:
                  $ref: '#/components/schemas/Error'
              required:
              - context
      responses:
        '200':
          description: Acknowledgement of message received.
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: object
                    properties:
                      ack:
                        $ref: '#/components/schemas/Ack'
                    required:
                    - ack
                  error:
                    $ref: '#/components/schemas/Error'
                required:
                - context
```



### Description

#### **Request**

| **Fields**  | **Type** | **Description**                                              |
| ----------- | -------- | ------------------------------------------------------------ |
| **context** | string   | Context set by **Google Agentic framework** Provides contextual information that can help BAPs while searching on the network **location**:*Contains a reverse geocoded address from user's current location (\*Mobile Device or Web\*).* **address**: Free Text**country**: Country code as per ISO 3166-1 and ISO 3166-2 format.**city**: City code.**zip**: Zip/PIN code. **version**: Version of **Google Agentic framework** API specs. **transaction_id**: This is a unique value which persists across all API calls from search through confirm. **message_id**: This is a unique value which persists during a request / callback cycle. **timestamp**: date-time. Time of request generation in RFC3339 format.    **callback_url**: URL to be called by BAPs in response to the search() function call. This is hosted by **Google Agentic framework** for receiving teh on_seach() callback.This is only needed for the Async mode. |
| **message** | string   | **catalog:** Contains Search results returned by BAPs**descriptor:** **Name:** Catalog description. Free text. **embedding_url:** AN Url to be sent by every BAP. This url will be opened by Integrator app (*Mobile or Web*) hosting the **Google Agentic framework** in an embedded Webview in the Front end UI. This url should allow the end user to complete all subsequent transactions on the ONDC Network viz. *Select, Init, Confirm* and finally the *Payment.* **items:** List of any type of objects describing the data from ONDC networkBAPs should return this as an array of JSON objects containing the search results. **network:** Contains parameters for performing Search query by BAPs **name**: Name of the target Network; viz. **ONDC**      **Action**: Action be performed by the BAP. Currently set to only *search* **relevant_text**: Meaningful extract from original Text by end User - Buyers or Seekers.BAPs can use this to perform a semantic search on their backend and filter out the results. **filters**: An Array of **SearchItem** objectsBAPs who do not support semantic search can use this to filter their search. **next_page_token:** BAPs supporting pagination in their response can use this field to send the next page token. Agentic framework will use this token to call subsequent pages asynchronously. |

#### **Response**

| **Fields**  | **Type** | **Description**                                              |
| ----------- | -------- | ------------------------------------------------------------ |
| **message** | object   | *Ack:*   *description: Describes the ACK response.*   *type: object*   *properties:*    *status:*     *type: string*     *description: Describe the status of the ACK response. If schema validation passes, status is ACK else it is NACK.*     *enum:*     *- ACK*     *- NACK*   *required:*   *- status* |
| **error**   | object   | *Error:*   *description: Describes an error object*   *type: object*   *properties:*    *type:*     *type: string*     *enum:*      *- CONTEXT_ERROR*      *- CORE_ERROR*      *- DOMAIN_ERROR*            *- JSON_SCHEMA_ERROR*    *code:*     *type: string*     *description: Error code from a list of error codes from Google Agentic framework.*    *path:*     *type: string*     *description: Path to json schema generating the error. Used only during json schema validation errors.*    *message:*     *type: string*     *description: Human readable message describing the error.*   *required:*   *- type*   *- code* |

### components

```yam
components:
  ...

    SearchItem:
      description: Item to Search for in the ONDC network.
      type: object
      properties:
        merchant:
          type: string
        colours:
          type: array
          items:
            type: string
        price:
          type: string
        product:
          type: string
        category:
          type: string
    
    Catalog:
      description: Item containing Search response from the BAPs or Content providers.
      type: object
      properties:
        descriptor:
          type: object
          properties:
            name:
              type: string
        provider:
          type: object
          properties:
            descriptor:
              type: object
              properties:
                name:
                  type: string
            embedding_url:
              type: string
            items:
              type: array
              items:
                type: object
                description: This can be a list of any type of objects as per the network or domain BAP belongs to;|
                  and supported by Google Agentic framework e.g. ONDC, ONEST etc.
          required:
          - descriptor
          - embedding_url
      required:
      - descriptor
      - provider

    Error:
      ...
```



## Sync Mode

### /search

```yaml
openapi: 3.0.0
info:
  title: Google Agentic Core API
  description: Google Agentic Core API specification
  version: 0.0.1

security:
- ApiKeyAuth: []  
paths:
  /search:
    post:
      tags:
      - Domain spaecific search
      - Google Agentic framework
      - Open Networks      
      description: Domain spaecific search by Google Agentic framework in the Open Networks through BAP interfaces.
      requestBody:
        description: Search service by Google Agentic framework.
        content:
          application/json:
            schema:
              type: object
              properties:
                context:
                  $ref: '#/components/schemas/Context'
                message:
                  type: object
                  properties:
                    network:
                      $ref: '#/components/schemas/Network'
              required:
              - context
              - message
      responses:
        '200':          
          description: Receive Search results from BAP Interfaces.
          content:
              application/json:
                schema:
                  type: object
                  properties:
                    context:
                      $ref: '#/components/schemas/Context'
                    message:
                      type: object
                      properties:
                        catalog:
                          $ref: '#/components/schemas/Catalog'
                        network:
                          $ref: '#/components/schemas/Network'
                        next_page_token:
                          type: string
                      required:
                      - catalog
                      - network
                    error:
                      $ref: '#/components/schemas/Error'
                  required:
                  - context
```



### Description

#### **Request**

| **Fields**     | **Type** | **Description**                                              |
| -------------- | -------- | ------------------------------------------------------------ |
| **context**    | string   | Context set by **Google Agentic framework** Provides contextual information that can help BAPs while searching on the network **location**:Contains a reverse geocoded address from user's current location (*Mobile Device or Web*). **address**: Free Text**country**: Country code as per ISO 3166-1 and ISO 3166-2 format.**city**: City code.**zip**: Zip/PIN code. **version**: Version of **Google Agentic framework** API specs. **transaction_id**: This is a unique value which persists across all API calls from search through confirm. **message_id**: This is a unique value which persists during a request / callback cycle. **timestamp**: date-time. Time of request generation in RFC3339 format.    **callback_url**: URL to be called by BAPs in response to the search() function call. This is only needed for the Async mode. |
| **message**    | string   | **network:** Contains parameters for performing Search query by BAPs **name**: Name of the target Network; viz. **ONDC**      **Action**: Action be performed by the BAP. Currently set to only *search* **relevant_text**: Meaningful extract from original Text by end User - Buyers or Seekers.BAPs can use this to perform a semantic search on their backend and filter out the results. **filters**: An Array of **SearchItem** objectsBAPs who do not support semantic search can use this to filter their search. |
| **searchItem** |          | **SearchItem**: filter criteria for Search in the ONDC network.     **merchant**: Name of the Merchant or Business to include in the Search     **colours**: List Colors to include in the Search     **price**: This will be used in sorting the search results e,g. Low to High     **product**: Producti to search for     **category**: Category to include in the Search |

#### **Response**

| **Fields**  | **Type** | **Description**                                              |
| ----------- | -------- | ------------------------------------------------------------ |
| **context** | string   | Context set by **Google Agentic framework** Provides contextual information that can help BAPs while searching on the network **location**:Contains a reverse geocoded address from user's current location (*Mobile Device or Web*). **address**: Free Text**country**: Country code as per ISO 3166-1 and ISO 3166-2 format.**city**: City code.**zip**: Zip/PIN code. **version**: Version of **Google Agentic framework** API specs. **transaction_id**: This is a unique value which persists across all API calls from search through confirm. **message_id**: This is a unique value which persists during a request / callback cycle. **timestamp**: date-time. Time of request generation in RFC3339 format. |
| **message** | string   | **catalog:** Contains Search results returned by BAPs**descriptor:** **Name:** Catalog description. Free text. **embedding_url:** AN Url to be sent by every BAP. This url will be opened by Integrator app (*Mobile or Web*) hosting the **Google Agentic framework** in an embedded Webview in the Front end UI. This url should allow the end user to complete all subsequent transactions on the ONDC Network viz. *Select, Init, Confirm* and finally the *Payment.* **items:** List of any type of objects describing the data from ONDC networkBAPs should return thai as an array of JSON objects containing the search results. **network:** Contains parameters for performing Search query by BAPs **name**: Name of the target Network.**enum**:     - ONDC      **Action**: Action be performed by the BAP. Currently set to only *search* **relevant_text**: Meaningful extract from original Text by end User - Buyers or Seekers.BAPs can use this to perform a semantic search on their backend and filter out the results. **filters**: An Array of **searchItem** Object sent to the BAPs in the request bodyBAPs will send this as-is in the response. **next_page_token:** BAPs supporting pagination in their response can use this field to send next page token. Agentic framework will use this token to call subsequent pages asynchronously. |



## Education & Skilling

## Async Mode

### /search

```yaml
openapi: 3.0.0
info:
  title: Google Agentic Core API
  description: Google Agentic Core API specification
  version: 0.0.1

security:
- ApiKeyAuth: []  
paths:
  /search:
    post:
      tags:
      - Domain spaecific search
      - Google Agentic framework
      - Open Networks      
      description: Domain spaecific search by Google Agentic framework in the Open Networks through BAP interfaces.
      requestBody:
        description: Search service by Google Agentic framework.
        content:
          application/json:
            schema:
              type: object
              properties:
                context:
                  $ref: '#/components/schemas/Context'
                message:
                  type: object
                  properties:
                    network:
                      $ref: '#/components/schemas/Network'
              required:
              - context
              - message
      responses:
        '200':
          description: Acknowledgement of message received.
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: object
                    properties:
                      ack:
                        $ref: '#/components/schemas/Ack'
                    required:
                    - ack
                  error:
                    $ref: '#/components/schemas/Error'
                required:
                - message
```

### Description

#### **Request**

| **Fields**     | **Type** | **Description**                                              |
| -------------- | -------- | ------------------------------------------------------------ |
| **context**    | string   | Context set by **Google Agentic framework** Provides contextual information that can help BAPs while searching on the network **location**:Contains a reverse geocoded address from user's current location (*Mobile Device or Web*). **address**: Free Text**country**: Country code as per ISO 3166-1 and ISO 3166-2 format.**city**: City code.**zip**: Zip/PIN code. **version**: Version of **Google Agentic framework** API specs. **transaction_id**: This is a unique value which persists across all API calls from search through confirm. **message_id**: This is a unique value which persists during a request / callback cycle. **timestamp**: date-time. Time of request generation in RFC3339 format.    **callback_url**: URL to be called by BAPs in response to the search() function call. This is only needed for the Async mode. |
| **message**    | string   | **network:** Contains parameters for performing Search query by BAPs **name**: Name of the target Network; viz. **ONEST** **Action**: Action be performed by the BAP. Currently set to only *search* **relevant_text**: Meaningful extract from original Text by end User - Buyers or Seekers.BAPs can use this to perform a semantic search on their backend and filter out the results. **filters**: An Array of **SearchItem** from original Text by end User - Buyers or Seekers.BAPs who do not support semantic search can use this to filter their search. |
| **SearchItem** | object   | **type**: ONEST domain typeenum:     - learning     - jobs     - scholarships **item**: ONEST specific content **provider**: Provider of the content **location**: Address for the ONEST job search; Free Text **std**: STD code for the ONEST job search **state**: State code for the ONEST job search **country**: Country code for the ONEST job search **industry**: Industry name for the ONEST job search; Free Text **employment**: Employment Type for the ONEST job search; Free Text **gender**: gender for which the ONEST content is searched for.**user**:**age**          **gender**      **skills**           **Items**: List of Skills; Free Text |

#### **Response**

| **Fields**  | **Type** | **Description**                                              |
| ----------- | -------- | ------------------------------------------------------------ |
| **message** | object   | *Ack:*   *description: Describes the ACK response.*   *type: object*   *properties:*    *status:*     *type: string*     *description: Describe the status of the ACK response. If schema validation passes, status is ACK else it is NACK.*     *enum:*     *- ACK*     *- NACK*   *required:*   *- status* |
| **error**   | object   | *Error:*   *description: Describes an error object*   *type: object*   *properties:*    *type:*     *type: string*     *enum:*      *- CONTEXT_ERROR*      *- CORE_ERROR*      *- DOMAIN_ERROR*            *- JSON_SCHEMA_ERROR*    *code:*     *type: string*     *description: Error code from a list of error codes from Google Agentic framework.*    *path:*     *type: string*     *description: Path to json schema generating the error. Used only during json schema validation errors.*    *message:*     *type: string*     *description: Human readable message describing the error.*   *required:*   *- type*   *- code* |

### /on_search

This API is hosted by **Google Agentic framework** and is called by BAPs in the Asynchronous mode.

```yaml
/on_search:
    post:
      tags:
      - Domain spaecific search
      - Google Agentic framework
      - Open Networks      
      description: Receive Search results from BAP Interfaces.
      requestBody:
        description: Payload to be sent by BAP interfaces to the Google Agentic framework.
        content:
          application/json:
            schema:
              type: object
              properties:
                context:
                  $ref: '#/components/schemas/Context'
                message:
                  type: object
                  properties:
                    catalog:
                      $ref: '#/components/schemas/Catalog'
                    network:
                      $ref: '#/components/schemas/Network'
                    next_page_token:
                      type: string
                  required:
                  - catalog
                  - network
                error:
                  $ref: '#/components/schemas/Error'
              required:
              - context
      responses:
        '200':
          description: Acknowledgement of message received.
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: object
                    properties:
                      ack:
                        $ref: '#/components/schemas/Ack'
                    required:
                    - ack
                  error:
                    $ref: '#/components/schemas/Error'
                required:
                - context
```

### Description

#### **Request**

| **Fields**  | **Type** | **Description**                                              |
| ----------- | -------- | ------------------------------------------------------------ |
| **context** | string   | Context set by **Google Agentic framework** Provides contextual information that can help BAPs while searching on the network **location**:Contains a reverse geocoded address from user's current location (*Mobile Device or Web*). **address**: Free Text**country**: Country code as per ISO 3166-1 and ISO 3166-2 format.**city**: City code.**zip**: Zip/PIN code. **version**: Version of **Google Agentic framework** API specs. **transaction_id**: This is a unique value which persists across all API calls from search through confirm. **message_id**: This is a unique value which persists during a request / callback cycle. **timestamp**: date-time. Time of request generation in RFC3339 format.    **callback_url**: URL to be called by BAPs in response to the search() function call. This is hosted by **Google Agentic framework** for receiving teh on_seach() callback.This is only needed for the Async mode. |
| **message** | string   | **catalog:** Contains Search results returned by BAPs**descriptor:** **Name:** Catalog description. Free text. **embedding_url:** AN Url to be sent by every BAP. This url will be opened by Integrator app (*Mobile or Web*) hosting the **Google Agentic framework** in an embedded Webview in the Front end UI. This url should allow the end user to complete all subsequent transactions on the ONDC Network viz. *Select, Init, Confirm* and finally the *Payment.* **items:** List of any type of objects as per the network or domain BAP belongs to and supported by **Google Agentic framework**BAPs should return thai as an array of JSON objects containing the search results. **network:** Contains parameters for performing Search query by BAPs **name**: Name of the target Network; viz. **ONEST**      **Action**: Action be performed by the BAP. Currently set to only *search* **relevant_text**: Meaningful extract from original Text by end User - Buyers or Seekers.BAPs can use this to perform a semantic search on their backend and filter out the results. **filters**: An Array of **SearchItem** from original Text by end User - Buyers or Seekers.BAPs who do not support semantic search can use this to filter their search. **next_page_token:** BAPs supporting pagination in their response can use this field to send next page token. Agentic framework will use this token to call subsequent pages asynchronously. |

#### **Response**

| **Fields**  | **Type** | **Description**                                              |
| ----------- | -------- | ------------------------------------------------------------ |
| **message** | object   | *Ack:*   *description: Describes the ACK response.*   *type: object*   *properties:*    *status:*     *type: string*     *description: Describe the status of the ACK response. If schema validation passes, status is ACK else it is NACK.*     *enum:*     *- ACK*     *- NACK*   *required:*   *- status* |
| **error**   | object   | *Error:*   *description: Describes an error object*   *type: object*   *properties:*    *type:*     *type: string*     *enum:*      *- CONTEXT_ERROR*      *- CORE_ERROR*      *- DOMAIN_ERROR*            *- JSON_SCHEMA_ERROR*    *code:*     *type: string*     *description: Error code from a list of error codes from Google Agentic framework.*    *path:*     *type: string*     *description: Path to json schema generating the error. Used only during json schema validation errors.*    *message:*     *type: string*     *description: Human readable message describing the error.*   *required:*   *- type*   *- code* |

### components

```yaml
components:
  ...

    SearchItem:
      description: Item to Search for in the ONEST network.
      type: object
      properties:
        type:
          type: string
          enum:
          - learning
          - jobs
          - scholarships
        item:
          type: string
        provider:
          type: string
        location:
          type: string
        std:
          type: string
        state:
          type: string
        country:
          type: string
        industry:
          type: string
        employment:
          type: string
        gender:
          type: string
        user:
          type: object
          properties:
            age:
              type: integer
            gender:
              type: string
            skills:
              type: array
              items:
                type: string
        backgrouns:
          type: array
          items:
            $ref: '#/components/schemas/Background'
        academics:
          type: array
          items:
            $ref: '#/components/schemas/Academic'
      required:
      - type
    
    Academic:
      type: object
      properties:
        value:
          type: string
      required:
      - value

    Background:
      type: object
      properties:
        social:
          type: string
      required:
      - social

    Catalog:
      description: Item containing Search response from the BAPs or Content providers.
      type: object
      properties:
        descriptor:
          type: object
          properties:
            name:
              type: string
        provider:
          type: object
          properties:
            descriptor:
              type: object
              properties:
                name:
                  type: string
            embedding_url:
              type: string
            items:
              type: array
              items:
                type: object
                description: This can be a list of any type of objects as per the network or domain BAP belongs to;|
                  and supported by Google Agentic framework e.g. ONDC, ONEST etc.
          required:
          - descriptor
          - embedding_url
      required:
      - descriptor
      - provider

    Error:
      ...
```



## Sync Mode

### /search

```yaml
openapi: 3.0.0
info:
  title: Google Agentic Core API
  description: Google Agentic Core API specification
  version: 0.0.1

security:
- ApiKeyAuth: []  
paths:
  /search:
    post:
      tags:
      - Domain spaecific search
      - Google Agentic framework
      - Open Networks      
      description: Domain spaecific search by Google Agentic framework in the Open Networks through BAP interfaces.
      requestBody:
        description: Search service by Google Agentic framework.
        content:
          application/json:
            schema:
              type: object
              properties:
                context:
                  $ref: '#/components/schemas/Context'
                message:
                  type: object
                  properties:
                    network:
                      $ref: '#/components/schemas/Network'
              required:
              - context
              - message
      responses:
        '200':
          description: Acknowledgement of message received.
          content:
            application/json:
              schema:
                type: object
              properties:
                context:
                  $ref: '#/components/schemas/Context'
                message:
                  type: object
                  properties:
                    catalog:
                      $ref: '#/components/schemas/Catalog'
                    network:
                      $ref: '#/components/schemas/Network'
                    next_page_token:
                      type: string
                  required:
                  - catalog
                  - network
                error:
                  $ref: '#/components/schemas/Error'
              required:
              - context
```

### Description

#### **Request**

| **Fields**     | **Type** | **Description**                                              |
| -------------- | -------- | ------------------------------------------------------------ |
| **context**    | string   | Context set by **Google Agentic framework** Provides contextual information that can help BAPs while searching on the network **location**:Contains a reverse geocoded address from user's current location (*Mobile Device or Web*). **address**: Free Text**country**: Country code as per ISO 3166-1 and ISO 3166-2 format.**city**: City code.**zip**: Zip/PIN code. **version**: Version of **Google Agentic framework** API specs. **transaction_id**: This is a unique value which persists across all API calls from search through confirm. **message_id**: This is a unique value which persists during a request / callback cycle. **timestamp**: date-time. Time of request generation in RFC3339 format. |
| **message**    | string   | **network:** Contains parameters for performing Search query by BAPs **name**: Name of the target Network; viz. **ONEST**      **Action**: Action be performed by the BAP. Currently set to only *search* **relevant_text**: Meaningful extract from original Text by end User - Buyers or Seekers.BAPs can use this to perform a semantic search on their backend and filter out the results. **filters**: An Array of **SearchItem** from original Text by end User - Buyers or Seekers.BAPs who do not support semantic search can use this to filter their search. |
| **SearchItem** | object   | **type**: ONEST domain typeenum:     - learning     - jobs     - scholarships **item**: ONEST specific content **provider**: Provider of the content **location**: Address for the ONEST job search; Free Text **std**: STD code for the ONEST job search **state**: State code for the ONEST job search **country**: Country code for the ONEST job search **industry**: Industry name for the ONEST job search; Free Text **employment**: Employment Type for the ONEST job search; Free Text **gender**: gender for which the ONEST content is searched for.**user**:**age**          **gender**      **skills**           **Items**: List of Skills; Free Text |

#### **Response**

| **Fields**  | **Type** | **Description**                                              |
| ----------- | -------- | ------------------------------------------------------------ |
| **context** | string   | Context set by **Google Agentic framework** Provides contextual information that can help BAPs while searching on the network **location**:Contains a reverse geocoded address from user's current location (*Mobile Device or Web*). **address**: Free Text**country**: Country code as per ISO 3166-1 and ISO 3166-2 format.**city**: City code.**zip**: Zip/PIN code. **version**: Version of **Google Agentic framework** API specs. **transaction_id**: This is a unique value which persists across all API calls from search through confirm. **message_id**: This is a unique value which persists during a request / callback cycle. **timestamp**: date-time. Time of request generation in RFC3339 format. |
| **message** | string   | **catalog:** Contains Search results returned by BAPs**descriptor:** **Name:** Catalog description. Free text. **embedding_url:** AN Url to be sent by every BAP. This url will be opened by Integrator app (*Mobile or Web*) hosting the **Google Agentic framework** in an embedded Webview in the Front end UI. This url should allow the end user to complete all subsequent transactions on the ONDC Network viz. *Select, Init, Confirm* and finally the *Payment.* **items:** list of any type of objects as per the network or domain BAP belongs to and supported by **Google Agentic framework**BAPs should return thai as an array of JSON objects containing the search results. **network:** Contains parameters for performing Search query by BAPs **name**: Name of the target Network.**enum**:          - ONEST **Action**: Action be performed by the BAP. Currently set to only *search* **relevant_text**: Meaningful extract from original Text by end User - Buyers or Seekers.BAPs can use this to perform a semantic search on their backend and filter out the results. **filters**: An Array of **SearchItem** from original Text by end User - Buyers or Seekers.BAPs who do not support semantic search can use this to filter their search. **next_page_token:** BAPs supporting pagination in their response can use this field to send the next page token. Agentic framework will use this token to call subsequent pages asynchronously. |



## VIDEO

### /search

```yaml
openapi: 3.0.0
info:
  title: Google Agentic Core API
  description: Google Agentic Core API specification
  version: 0.0.1

security:
- ApiKeyAuth: []  
paths:
  /search:
    post:
      tags:
      - Domain spaecific search
      - Google Agentic framework
      - Video, Webcast, Podcasts
      description: Domain spaecific search by Google Agentic framework from various Content Providers |
        outside the Open Networks - Videos, Webcasts, Podcasts
      requestBody:
        description: Search service by Google Agentic framework.
        content:
          application/json:
            schema:
              type: object
              properties:
                context:
                  $ref: '#/components/schemas/Context'
                message:
                  type: object
                  properties:
                    network:
                      $ref: '#/components/schemas/Network'
              required:
              - context
              - message
      responses:
        '200':
          description: Acknowledgement of message received.
          content:
            application/json:
              schema:
                type: object
              properties:
                context:
                  $ref: '#/components/schemas/Context'
                message:
                  type: object
                  properties:
                    catalog:
                      $ref: '#/components/schemas/Catalog'
                    network:
                      $ref: '#/components/schemas/Network'
                  required:
                  - catalog
                  - network
                error:
                  $ref: '#/components/schemas/Error'
              required:
              - context  
```

### Description

#### **Request**

| **Fields**    | **Type** | **Description**                                              |
| ------------- | -------- | ------------------------------------------------------------ |
| **context**   | string   | Context set by **Google Agentic framework** Provides contextual information that can help BAPs while searching on the network **location**:Contains a reverse geocoded address from user's current location (*Mobile Device or Web*). **address**: Free Text**country**: Country code as per ISO 3166-1 and ISO 3166-2 format.**city**: City code.**zip**: Zip/PIN code. **version**: Version of **Google Agentic framework** API specs. **transaction_id**: This is a unique value which persists across all API calls from search through confirm. **message_id**: This is a unique value which persists during a request / callback cycle. **timestamp**: date-time. Time of request generation in RFC3339 format. |
| **message**   | string   | **network:** Contains parameters for performing Search query by BAPs **name**: Name of the target Network; viz. **VIDEO**      **Action**: Action be performed by the BAP. Currently set to only *search* **relevant_text**: Meaningful extract from original Text by end User - Buyers or Seekers.BAPs can use this to perform a semantic search on their backend and filter out the results. **filters**: An Array of **VideoItem** objects |
| **VideoItem** | object   | **VideoItem**: Item containing Video search query to the Video content providers.     **query**: Contains the relevant text to include in Video search query |

#### **Response**

| **Fields**  | **Type** | **Description**                                              |
| ----------- | -------- | ------------------------------------------------------------ |
| **context** | string   | Context set by **Google Agentic framework** Provides contextual information that can help BAPs while searching on the network **location**:Contains a reverse geocoded address from user's current location (*Mobile Device or Web*). **address**: Free Text**country**: Country code as per ISO 3166-1 and ISO 3166-2 format.**city**: City code.**zip**: Zip/PIN code. **version**: Version of **Google Agentic framework** API specs. **transaction_id**: This is a unique value which persists across all API calls from search through confirm. **message_id**: This is a unique value which persists during a request / callback cycle. **timestamp**: date-time. Time of request generation in RFC3339 format. |
| **message** | string   | **catalog:** Contains Search results returned by BAPs**descriptor:** **Name:** Catalog description. Free text. **items:** list of any type of objects as per the network or domain BAP belongs to and supported by **Google Agentic framework**BAPs should return thai as an array of JSON objects containing the search results. **network:** Contains parameters for performing Search query by BAPs **name**: Name of the target Network.**enum**:          - VIDEO      **Action**: Action be performed by the BAP. Currently set to only *search* **relevant_text**: Meaningful extract from original Text by end User - Buyers or Seekers.BAPs can use this to perform a semantic search on their backend and filter out the results. **filters**: An Array of **VideoItem** objects |

### components

```yaml
components:
  ...

    Network:      
      type: object
      description: Describes details of the target network.
      properties:
        name:
          type: string      
        relevant_text:
          type: string
        filters:
          type: array
          items:
            $ref: '#/components/schemas/VideoItem'
      required:
      - name    
      - relevant_text
      - filters

    Catalog:
      description: Item containing Search response from the BAPs or Content providers.
      type: object
      properties:
        descriptor:
          type: object
          properties:
            name:
              type: string
        provider:
          type: object
          properties:
            descriptor:
              type: object
              properties:
                name:
                  type: string          
            items:
              type: array
              items:
                type: object
                description: This can be a list of any type of objects describing the data from Video providers.
          required:
          - descriptor
          - embedding_url
      required:
      - descriptor
      - provider

    VideoItem:
      description: Item containing Video search query to the Video content providers.
      type: object
      properties:
        query:
          type: string
      required:
      - query

    Error:
      ...
```



## Weather

This Api will talk to various providers to fetch Weather details.

### /search

```yaml
openapi: 3.0.0
info:
  title: Google Agentic Core API
  description: Google Agentic Core API specification
  version: 0.0.1

security:
- ApiKeyAuth: []  
paths:
  /search:
    post:
      tags:
      - Domain spaecific search
      - Google Agentic framework
      - Weather
      description: Domain spaecific search by Google Agentic framework from various Weather data providers.
      requestBody:
        description: Search service by Google Agentic framework.
        content:
          application/json:
            schema:
              type: object
              properties:
                context:
                  $ref: '#/components/schemas/Context'
                message:
                  type: object
                  properties:
                    network:
                      $ref: '#/components/schemas/Network'
              required:
              - context
              - message
      responses:
        '200':
          description: Acknowledgement of message received.
          content:
            application/json:
              schema:
                type: object
              properties:
                context:
                  $ref: '#/components/schemas/Context'
                message:
                  type: object
                  properties:
                    catalog:
                      $ref: '#/components/schemas/Catalog'
                    network:
                      $ref: '#/components/schemas/Network'
                  required:                  
                  - network
                error:
                  $ref: '#/components/schemas/Error'
              required:
              - context
              - message
```

### Description

#### **Request**

| **Fields**      | **Type** | **Description**                                              |
| --------------- | -------- | ------------------------------------------------------------ |
| **context**     | string   | Context set by **Google Agentic framework** Provides contextual information that can help BAPs while searching on the network **location**:Contains a reverse geocoded address from user's current location (*Mobile Device or Web*). **address**: Free Text**country**: Country code as per ISO 3166-1 and ISO 3166-2 format.**city**: City code.**zip**: Zip/PIN code. **version**: Version of **Google Agentic framework** API specs. **transaction_id**: This is a unique value which persists across all API calls from search through confirm. **message_id**: This is a unique value which persists during a request / callback cycle. **timestamp**: date-time. Time of request generation in RFC3339 format. |
| **message**     | string   | **network:** Contains parameters for performing Search query by BAPs **name**: Name of the target Network; viz. **WEATHER**      **Action**: Action be performed by the BAP. Currently set to only *search* **relevant_text**: Meaningful extract from original Text by end User - Buyers or Seekers.BAPs can use this to perform a semantic search on their backend and filter out the results. **filters**: An Array of **AddressItem** containing the location details for which the Weather is requested. |
| **AddressItem** | object   | Address details for Weather content providers to get weather data. **address**: Address; Free text**city**: City code**zip**: Zip code |

#### **Response**

| **Fields**  | **Type** | **Description**                                              |
| ----------- | -------- | ------------------------------------------------------------ |
| **context** | string   | Context set by **Google Agentic framework** Provides contextual information that can help BAPs while searching on the network **location**:Contains a reverse geocoded address from user's current location (*Mobile Device or Web*). **address**: Free Text**country**: Country code as per ISO 3166-1 and ISO 3166-2 format.**city**: City code.**zip**: Zip/PIN code. **version**: Version of **Google Agentic framework** API specs. **transaction_id**: This is a unique value which persists across all API calls from search through confirm. **message_id**: This is a unique value which persists during a request / callback cycle. **timestamp**: date-time. Time of request generation in RFC3339 format. |
| **message** | string   | **catalog:** Contains Search results returned by BAPs**descriptor:** **Name:** Catalog description. Free text. **items:** List of any type of objects as per the network or domain BAP belongs to and supported by **Google Agentic framework.**BAPs should return thai as an array of JSON objects containing the search results. **network:** Contains parameters for performing Search query by BAPs **name**: Name of the target Network.**enum**:          - VIDEO      **Action**: Action be performed by the BAP. Currently set to only *search* **relevant_text**: Meaningful extract from original Text by end User - Buyers or Seekers.BAPs can use this to perform a semantic search on their backend and filter out the results. **filters**: An Array of **AddressItem** containing the location details for which the Weather is requested. |

### components

```yaml
components:
  ....

    Network:      
      type: object
      description: Describes deatils of the target network.
      properties:
        name:
          type: string
        filters:
          type: object          
          $ref: '#/components/schemas/AddressItem'
      required:
      - name
      - filters

    AddressItem:
      description: Address details for Weather content providers to get weather data.
      type: object
      properties:
        address:
          type: string        
    
    Catalog:
      description: Item containing Search response from the BAPs or Content providers.
      type: object
      properties:
        descriptor:
          type: object
          properties:
            name:
              type: string
        provider:
          type: object
          properties:                     
            items:
              type: array
              items:
                type: object
                description: This can be a list of any type of objects describing the data from Weather providers.
          required:
          - descriptor          
      required:
      - descriptor
      - provider

    Error:
      ...
```



## Order Placement

![order-flow](./assets/order-flow.png)

How can Agentic framework integrate Order placement flow and the subsequent payment?

- This is primarily done by Integrator or hosting app with Agentic facilitating the integration
- Integrator app Searches for an item
- Each search result contains an embedded url for that particular product
- Integrator app launches an embedded Webview to show the product details within Webview/IFrame
- Add-to-Cart and Check-out happens through the embedded webview
- Once Order is placed, Integrator app receives Order confirmation response along with details Order Info as JSON object



## Launch Webview

```bash
https://<Base-url-of-the-provider>?trid=<transaction_id>&msgid=<message_id>&actid=<action_id>&mob=<mobile_no>&zip=<zip_code>&cb=<payment_callback>
```

## Order Response

```JSON
{
    context:
    {
        transaction_id: <tr_id>,
        message_id: <msg_id>,
        action_id: <act_id>        
    },
    message:
    {
        orders:
        [{
            <order_info> object
            // structure will be decided and sent by Mystore
            // Integrator app will store this json as-is in the transaction log db    
           
        }]
    }  
}
```



# Points to Note

> - **Google Agentic framework** would completely **Stateless**
>   - Understand user’s intent from Text or Voice
>   - Break that into Actionable insights
>   - Route requests to appropriate BAPs and/or Content Providers(*Outside Network*)
> - Integrator App will be responsible for managing the configuration points for both Demand and Supply side of this application flow.
>   - **Demand side**
>     - The configuration options for Buyers and Seekers would be managed by Interator App in its own database
>     - Preferred Networks - Preferred target networks to connect from **Google Agentic framework**
>     - Intended Verticals - Preferred Verticals to support by **Google Agentic framework**
>     - Maintain API security by creating and managing API key which needs to be sent through API header
>
> - **Supply Side**
>   - Maintain a list of default BAPs and Content Providers(*Outside Network*)
>   - Log all transactions in an Audit DB
>
> - Implement Basic Analytics
> - Implement Advanced Analytics (*Future*)



## References

- [Open Network Aggregator - Specs](./Deployment.md)
- [Vertex AI](https://cloud.google.com/vertex-ai/docs)
- [Generative AI on Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview)
- [Source Code](https://github.com/monojit18/Open-Network-Aggregator)
  - This is a Private GH repo and hence is allow-listed
