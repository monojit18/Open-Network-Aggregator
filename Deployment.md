# Multi Agent Aggregator for Open Network -

## Deployment Approach

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

# Deployment Approach

## Self Hosted

![self-hosted](./assets/self-hosted.png)

- Single Tenant deployment; separate instance for each customer(s) and their environment(s)
- Fully pluggable with the customer's existing workloads over a secure Private Service Connect endpoint
- Seamless integration with various Open networks (viz. *ONDC, ONEST* etc.) and 3rd party integrators (viz. *Youtube, Ninjacart* etc.)



## Deployment Architecture

![self-hosted-deploy-arch](./assets/self-hosted-deploy-arch.png)



## Prelude

Deployment uses the following tools:

- **Terraform for GCP** - Infrastructure deployment
- **Helm chart** - Application/Microservices deployment
- **Cloud Build** - YAML scripts which acts as a wrapper around Terraform Deployment scripts

The entrie Terraform deployment is divided into 3 stages -

- **Pre-Config** stage
  - Create the Landing Zone for the entie deployment
  - Deploy all resources and services that create the building blocks for the entire deployment
- **Setup** Stage
  - Deploy the Core infrastructure
- **Post-Config** Stage
  - Perform all post configurations
  - Deploy additional resouces for integation and end to end flow

### Pre-requisites

- ### [Install the gcloud CLI](https://cloud.google.com/sdk/docs/install)

- #### Alternate

  - #### [Run gcloud commands with Cloud Shell](https://cloud.google.com/shell/docs/run-gcloud-commands)

- [**Install kubectl**](https://cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl#apt)

  ```bash
  sudo apt-get update
  sudo apt-get install kubectl
  kubectl version --client
  
  sudo apt-get install google-cloud-sdk-gke-gcloud-auth-plugin
  ```

- [**Install Helm**](https://helm.sh/docs/intro/install/)

  ```bash
  curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
  
  sudo apt-get install apt-transport-https --yes
  
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
  
  sudo apt-get update
  sudo apt-get install helm
  
  helm version --client
  ```

- **Cloud Build - [Helm tool builder](https://github.com/GoogleCloudPlatform/cloud-builders-community/tree/master/helm)**

  - This is the helm builder for cloud build

  - Helps automating deployment of applications and other config files on the GKE cluster using Cloud Build

  - Each Cloud Build pipeline script can contain various **helm** commands as the build step

    ```bash
    # Clone Community Cloud Builder repository
    git clone https://github.com/GoogleCloudPlatform/cloud-builders-community/tree/master/helm
    
    # Build Helm package which would be used inside Cloud Build scripts
    gcloud builds submit . --config=cloudbuild.yaml
    ```

### Workspace - Folder structure

- **Open-Network-Aggregator (***Root Folder***)**
  - **assets**
    - images
    - architetcure diagrams
    - ...(more)
  - **backend**
    - **aggregator** - Containers Master Agent and Domain specific Sub-agents to connect to various Content providers
    - **genai** - Wrapper plugin for GCP Generative AI services
    - **vertexai** - Wrapper plugin for GCP VertexAI services
  - **data** - Contains YAML specification of the APIs shared with Content provider partners 
    - This is for internal references only
  - **distribution**
    - **builds**
      - **apps** - Scripts for Deploying/Removing **Application** services
        - Contains **Cloud Build** scripts which can be used from CLI or connected to an SCM for performing CI and CD
      - **cloud-run** - **Cloud Build** scripts for automating the deployment of **Cloud Run** services
      - **gke** - **Cloud Build** scripts for automating the deployment of **GKE** cluster and its subsequent update/deletion
    - **cloud-run** - Scripts for Deploying/Removing **Cloud Run** services
      - Contains Terraform scripts and corresponding variable values
    - **gke** - Scripts for Deploying/Removing/Configuring **GKE** cluster
      - This also contains helm charts for deploying micro-services within the GKE cluster
      - Deploying K8s gateway as Ingress
  - **frontend**
    - **mobile** - Source code for Mobile frontend
    - **web** - Source code for Web frontend
      - Also contains server code for hosting the frontend
  - **misc**
    - Miscellaneous files which are only locally maintained; should not be part of any source code commit ot checkin



## Step-by-Step guide

- Here is a step by step guide on how to deploy this entire infrastructure end to end

### Setup CLI environment variables

```bash
BASEFOLDERPATH=""
HELPERS_PATH=""
OWNER=
PROJECT_ID=
GSA_DISPLAY_NAME=
GSA=$GSA_DISPLAY_NAME@$PROJECT_ID.iam.gserviceaccount.com
VPC_NAME=
CLUSTER_SUBNET_NAME=gke-subnet
PROXY_SUBNET_NAME=proxy-subnet
PSC_SUBNET_NAME=psc-subnet
MAINTENANCE_SUBNET_NAME=management_subnet
CLUSTER=gke-dev-cluster
NODEPOOL=gkeappspool
REGION=
ZONE=
IP_ADDRESS_NAME=dev-glb-lb-ip
CERTIFICATE_NAME=
DOMAIN1_NAME=
DOMAIN2_NAME=
DOMAIN3_NAME=
DOMAIN_LIST=$DOMAIN1_NAME,$DOMAIN2_NAME,$DOMAIN3_NAME
DNS_ZONE=
AR_REPO=
JUMP_SERVER_NAME=
```

#### Authenticate user to gcloud

```bash
gcloud auth login
gcloud auth list
gcloud config set account $OWNER
```

#### Setup current project

```bash
gcloud config set project $PROJECT_ID

gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable translate.googleapis.com
gcloud services enable texttospeech.googleapis.com
gcloud services enable vision.googleapis.com
gcloud services enable apigee.googleapis.com
gcloud services enable servicenetworking.googleapis.com
gcloud services enable cloudkms.googleapis.com
gcloud services enable mesh.googleapis.com
gcloud services enable certificatemanager.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable secretmanager.googleapis.com

gcloud config set compute/region $REGION
gcloud config set compute/zone $ZONE
```

#### Setup Service Account

Current authenticated user will handover control to a **Service Account** which would be used for all subsequent resource deployment and management

```bash
gcloud iam service-accounts create $GSA_DISPLAY_NAME --display-name=$GSA_DISPLAY_NAME
gcloud iam service-accounts list

# Make SA as the owner
gcloud projects add-iam-policy-binding $PROJECT_ID --member=serviceAccount:$GSA --role=roles/owner

# ServiceAccountUser role for the SA
gcloud projects add-iam-policy-binding $PROJECT_ID --member=serviceAccount:$GSA --role=roles/iam.serviceAccountUser

# ServiceAccountTokenCreator role for the SA
gcloud projects add-iam-policy-binding $PROJECT_ID --member=serviceAccount:$GSA --role=roles/iam.serviceAccountTokenCreator
```

#### Create Storage Buckets

- Bucket to store **Terraform** state (*if terraform deployment is chosen, as explained later*)
- Bucket to store various VertexAI and Generative AI resources
  - Contains the fine tuned model for Master Agent which is the heart of Agentic framework

```bash
#This is just an xample; please feel free to chose any name here of your choice
gcloud storage buckets create gs://$PROJECT_ID-terra-stg --location=us-central1

#This is just an xample; please feel free to chose any name here of your choice
gcloud storage buckets create gs://open-network-aggr-stg-<some-random-no> --location=us-central1
```



### Deployment Methodology

- #### Manual

  - Deploy all **Infrastructure**  and **Service** components step by step using **gcloud CLI**

- #### Automated

  - Deploy all **Infrastructure**  and **Service** components step by step using **Terraform** scripts in just 2 steps
    - **Pre-Config**
    - **Setup**

### Step by Step guide for Manual Deployment

#### Artifact Registry

```bash
#Create Repository
gcloud artifacts repositories create $AR_REPO --repository-format=docker --location=$REGION

#List Repository
gcloud artifacts repositories list --location=$REGION

#Describe Repository
gcloud artifacts repositories describe $AR_REPO --location=$REGION

#gcloud artifacts repositories delete $AR_REPO --location=$REGION
```

#### Network

```bash
gcloud compute networks create $VPC_NAME --subnet-mode=custom --bgp-routing-mode=regional --mtu=1460
#gcloud compute networks delete $VPC_NAME

gcloud compute networks subnets create $CLUSTER_SUBNET_NAME --network=$VPC_NAME --range=10.0.0.0/22 --region=$REGION
#gcloud compute networks subnets delete $CLUSTER_SUBNET_NAME --region=$REGION

gcloud compute networks subnets create $PSC_SUBNET_NAME --purpose=PRIVATE_SERVICE_CONNECT --role=ACTIVE \
--network=$VPC_NAME --range=10.0.4.0/24
#gcloud compute networks subnets delete $PSC_SUBNET_NAME

gcloud compute networks subnets create $PROXY_SUBNET_NAME --purpose=REGIONAL_MANAGED_PROXY --role=ACTIVE \
--network=$VPC_NAME  --range=10.0.5.0/24
#gcloud compute networks subnets delete $PROXY_SUBNET_NAME

gcloud compute networks subnets update $CLUSTER_SUBNET_NAME \
--add-secondary-ranges=pods-range=10.1.0.0/16,services-range=10.2.0.0/16
#gcloud compute networks subnets delete $CLUSTER_SUBNET_NAME

gcloud compute networks subnets create $MAINTENANCE_SUBNET_NAME --network=$VPC_NAME --range=10.0.6.0/24
#gcloud compute networks subnets delete $MAINTENANCE_SUBNET_NAME

gcloud compute networks subnets list --network=$VPC_NAME
```

#### Firewall Rules

```bash
gcloud compute firewall-rules create allow-egress --allow=all --destination-ranges=0.0.0.0/0 \
--direction=EGRESS --network=$VPC_NAME --priority=100
gcloud compute firewall-rules delete allow-egress

gcloud compute firewall-rules create allow-http-ingress --allow=tcp:80,tcp:443 --source-ranges=0.0.0.0/0 \
--direction=INGRESS --network=$VPC_NAME --priority=100
#gcloud compute firewall-rules delete allow-http-ingress

gcloud compute firewall-rules create allow-ssh --allow=tcp:22 --source-ranges=0.0.0.0/0 \
--direction=INGRESS --network=$VPC_NAME --priority=101
#gcloud compute firewall-rules delete allow-ssh

gcloud compute firewall-rules create allow-gcp-health-check --network=$VPC_NAME \
--action=allow --direction=INGRESS --source-ranges=130.211.0.0/22,35.191.0.0/16 \
--rules=tcp --priority=103
#gcloud compute firewall-rules delete allow-gcp-health-check

gcloud compute firewall-rules create allow-gcp-proxies --network=$VPC_NAME \
--action=allow --direction=INGRESS --source-ranges=10.0.5.0/24 \
--rules=tcp:80,tcp:443,tcp:8080 --priority=104
#gcloud compute firewall-rules delete allow-gcp-proxies

gcloud compute firewall-rules  list --format="table(name, network)" --filter="network=$VPC_NAME"
```

#### Bastion Host

- This is primarily for Private GKE cluster where all access to the control plane is blocked
-  Bastion Host acts the single point entry to GKE cluster and also to other services/resources which are behind a private IP or endpoint
- Good practice to have Bastion host or Jump server for such an end to end deployment

```bash
gcloud compute addresses create jump-server-ip --region=$REGION
#gcloud compute addresses delete jump-server-ip
JUMPSERVER_IP=$(gcloud compute addresses describe jump-server-ip --format="get(address)")

gcloud compute addresses create jump-server-private-ip --subnet=$MAINTENANCE_SUBNET_NAME \
--addresses=10.0.6.100 --region=$REGION
JUMPSERVER_PRIVATE_IP=$(gcloud compute addresses describe jump-server-private-ip --format="get(address)")
#gcloud compute addresses delete jump-server-private-ip

gcloud compute instances create $JUMP_SERVER_NAME --machine-type=n2d-standard-2 \
--image-family=ubuntu-pro-2004-lts --image-project=ubuntu-os-pro-cloud \
--network=$VPC_NAME --subnet=$MAINTENANCE_SUBNET_NAME --address=$JUMPSERVER_IP \
--private-network-ip=$JUMPSERVER_PRIVATE_IP --zone=$ZONE --project=$PROJECT_ID
#gcloud compute instances delete $JUMP_SERVER_NAME --zone=$ZONE --project=$PROJECT_ID

gcloud compute instances describe $JUMP_SERVER_NAME --format="get(networkInterfaces[0].networkIP)" \
--project=$PROJECT_ID
gcloud compute instances describe $JUMP_SERVER_NAME --format="get(networkInterfaces[0].accessConfigs[0].natIP)" \
--project=$PROJECT_ID
```

#### Create GKE Cluster

#### Private Cluster

```bash
gcloud container clusters create $CLUSTER --release-channel=regular --region=$REGION \
--enable-ip-alias --machine-type=n2d-standard-2 --gateway-api=standard \
--num-nodes=1 --max-pods-per-node=40 \
--network=$VPC_NAME --subnetwork=$CLUSTER_SUBNET_NAME \
--cluster-secondary-range-name=pods-range --services-secondary-range-name=services-range \
--service-account=$GSA --workload-pool=$PROJECT_ID.svc.id.goog \
--enable-master-authorized-networks --enable-private-nodes --enable-private-endpoint \
--master-authorized-networks=$JUMPSERVER_PRIVATE_IP/32 --master-ipv4-cidr=10.0.7.0/28 \
--addons GcsFuseCsiDriver,HttpLoadBalancing
#gcloud container clusters delete $CLUSTER --region=$REGION
```

#### Public Cluster

```bash
gcloud container clusters create $CLUSTER --release-channel=regular --region=$REGION \
--enable-ip-alias --machine-type=n2d-standard-2 --gateway-api=standard \
--num-nodes=1 --max-pods-per-node=40 \
--network=$VPC_NAME --subnetwork=$CLUSTER_SUBNET_NAME \
--cluster-secondary-range-name=pods-range --services-secondary-range-name=services-range \
--service-account=$GSA --workload-pool=$PROJECT_ID.svc.id.goog \
--addons GcsFuseCsiDriver,HttpLoadBalancing
#gcloud container clusters delete $CLUSTER --region=$REGION
```

#### Create Application Node pool

- To host only application services

```bash
gcloud container node-pools create $NODEPOOL --cluster=$CLUSTER --region=$REGION \
--num-nodes=1 --enable-autoscaling --machine-type=n2d-standard-4 \
--min-nodes=1 --max-nodes=50 --max-pods-per-node=30 \
--service-account=$GSA
#gcloud container node-pools delete gkeappspool --cluster=$CLUSTER --region=$REGION
```



### Step by Step guide for Terraform based Deployment

- All steps of manual deployment is clubbed into only to steps

  - #### Pre-Config

    ```bash
    #This is used to refer the Google Service account by the Cloud Build script
    #GSA format - projects/${_PROJECT_ID_}/serviceAccounts/${_PROJECT_NAME_}-sa@${_PROJECT_ID_}.iam.gserviceaccount.com
    PROJECT_NAME=
    
    DISTRIBUTION_PATH="$BASEFOLDERPATH/distribution"
    WORKING_DIR="gke/cluster/scripts/pre-config"
    TFVARS_PATH="../../values/dev/pre-config"
    TFVARS_FILE_PATH=$TFVARS_PATH/pre-config.tfvars
    BACKEND_CONFIG=$TFVARS_PATH/backend.config
    
    cd $DISTRIBUTION_PATH
    
    gcloud builds submit --config="./builds/gke/gke-deployment.yaml" \
    --project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,\
    _WORKING_DIR_=$WORKING_DIR,_TFVARS_FILE_PATH_=$TFVARS_FILE_PATH,\
    _BACKEND_CONFIG_="$BACKEND_CONFIG",_LOG_BUCKET_=$PROJECT_ID-terra-stg
    
    #gcloud builds submit --config="./builds/gke/gke-destroy.yaml" \
    --project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,\
    _WORKING_DIR_=$WORKING_DIR,_TFVARS_FILE_PATH_=$TFVARS_FILE_PATH,\
    _BACKEND_CONFIG_="$BACKEND_CONFIG",_LOG_BUCKET_=$PROJECT_ID-terra-stg
    ```

  - #### Setup

    ```bash
    #This is used to refer the Google Service account by the Cloud Build script
    #GSA format - projects/${_PROJECT_ID_}/serviceAccounts/${_PROJECT_NAME_}-sa@${_PROJECT_ID_}.iam.gserviceaccount.com
    PROJECT_NAME=
    
    DISTRIBUTION_PATH="$BASEFOLDERPATH/distribution"
    WORKING_DIR="gke/cluster/scripts/setup"
    TFVARS_PATH="../../values/dev/setup"
    TFVARS_FILE_PATH=$TFVARS_PATH/setup.tfvars
    BACKEND_CONFIG=$TFVARS_PATH/backend.config
    
    cd $DISTRIBUTION_PATH
    
    gcloud builds submit --config="./builds/gke/gke-deployment.yaml" \
    --project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,\
    _WORKING_DIR_=$WORKING_DIR,_TFVARS_FILE_PATH_=$TFVARS_FILE_PATH,\
    _BACKEND_CONFIG_="$BACKEND_CONFIG",_LOG_BUCKET_=$PROJECT_ID-terra-stg
    
    #gcloud builds submit --config="./builds/gke/gke-destroy.yaml" \
    --project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,\
    _WORKING_DIR_=$WORKING_DIR,_TFVARS_FILE_PATH_=$TFVARS_FILE_PATH,\
    _BACKEND_CONFIG_="$BACKEND_CONFIG",_LOG_BUCKET_=$PROJECT_ID-terra-stg
    ```

  

  ### Post- Configuration steps

  - This is common for both Manual and Automated deployments

  

  #### Create SSL Certificate

  ```bash
  gcloud compute ssl-certificates create $CERTIFICATE_NAME --domains=$DOMAIN_LIST --global
  gcloud compute ssl-certificates list --global
  #gcloud compute ssl-certificates delete glb-$CERTIFICATE_NAME
  ```

  #### IP Address

  ```bash
  gcloud compute addresses create $IP_ADDRESS_NAME --ip-version=IPV4 --global
  gcloud compute addresses describe $IP_ADDRESS_NAME --format="get(address)" --global
  #gcloud compute addresses delete $IP_ADDRESS_NAME --global
  ```

  #### Add DNS Records

  ```bash
  #Add DNS Records
  GLB_IP=$(gcloud compute addresses describe $IP_ADDRESS_NAME --format="get(address)" --global)
  
  gcloud dns record-sets create $DOMAIN1_NAME --rrdatas=$GLB_IP \
  --type=A --ttl=60 --zone=$DNS_ZONE
  #gcloud dns record-sets delete $DOMAIN1_NAME --type=A --zone=$DNS_ZONE
  ```

  

  ### Build Micro-services

  - Following micro-services are coming out-of-the-box with this deployment

  - Customers are free to choose suitable replacement of these services

    

  #### Storage

  - Wrapper around **GCS** services

  ```bash
  cd $BASEFOLDERPATH/backend/vertexai/storage
  PROJECT_NAME=
  REPO_NAME=$AR_REPO
  PACKAGE_NAME=storagelib
  PACKAGE_VERSION="v1.0"
  
  gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
  --project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
  _REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
  _LOG_BUCKET_=$PROJECT_ID-terra-stg
  ```

  #### Vision

  - Wrapper around **VertexAI - Cloud Vision** services

  ```bash
  cd $BASEFOLDERPATH/backend/vertexai/storage
  PROJECT_NAME=
  REPO_NAME=$AR_REPO
  PACKAGE_NAME=storagelib
  PACKAGE_VERSION="v1.0"
  
  gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
  --project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
  _REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
  _LOG_BUCKET_=$PROJECT_ID-terra-stg
  ```

  #### Vision

  - Wrapper around **VertexAI - Cloud Vision** services

  ```bash
  cd $BASEFOLDERPATH/backend/vertexai/vision
  PROJECT_NAME=
  REPO_NAME=$AR_REPO
  PACKAGE_NAME=visionlib
  PACKAGE_VERSION=v1.0
  
  gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
  --project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
  _REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
  _LOG_BUCKET_=$PROJECT_ID-terra-stg
  ```

  #### Speech

  - Wrapper around **VertexAI - Cloud Speech-to-Text** services

  ```bash
  cd $BASEFOLDERPATH/backend/vertexai/speech
  PROJECT_NAME=
  REPO_NAME=$AR_REPO
  PACKAGE_NAME=speechlib
  PACKAGE_VERSION=v1.0
  
  gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
  --project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
  _REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
  _LOG_BUCKET_=$PROJECT_ID-terra-stg
  ```

  #### Translation

  - Wrapper around **VertexAI - Cloud Translation** services

  ```bash
  cd $BASEFOLDERPATH/backend/vertexai/translation
  PROJECT_NAME=
  REPO_NAME=$AR_REPO
  PACKAGE_NAME=translatelib
  PACKAGE_VERSION=v1.0
  
  gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
  --project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
  _REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
  _LOG_BUCKET_=$PROJECT_ID-terra-stg
  ```

  #### Imagegen

  - Wrapper around **Generative AI - Imagen** services

  ```bash
  cd $BASEFOLDERPATH/backend/genai/image
  PROJECT_NAME=
  REPO_NAME=$AR_REPO
  PACKAGE_NAME="genai-imagelib"
  PACKAGE_VERSION="v1.0"
  
  gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
  --project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
  _REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
  _LOG_BUCKET_=$PROJECT_ID-terra-stg
  ```

  #### Textgen

  - Wrapper around **Generative AI - Gemini-1.5 Pro** services

  ```bash
  cd $BASEFOLDERPATH/backend/genai/text
  PROJECT_NAME=
  REPO_NAME=$AR_REPO
  PACKAGE_NAME=genai-textlib
  PACKAGE_VERSION=v1.0
  
  gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
  --project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
  _REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
  _LOG_BUCKET_=$PROJECT_ID-terra-stg
  ```

  #### MultiModal

  - Wrapper around **Generative AI - Gemini Multimodal** services

  ```bash
  cd $BASEFOLDERPATH/backend/genai/multimodal
  PROJECT_NAME=
  REPO_NAME=$AR_REPO
  PACKAGE_NAME=genai-multimodallib
  PACKAGE_VERSION=v1.0
  
  gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
  --project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
  _REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
  _LOG_BUCKET_=$PROJECT_ID-terra-stg
  ```

  

### Domain specific Services

### Adapters

#### Agri Adapter

```bash
cd $BASEFOLDERPATH/backend/aggregators/adapters/agri
PROJECT_NAME=
REPO_NAME=$AR_REPO
PACKAGE_NAME=agri-adapter
PACKAGE_VERSION=v1.0

gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

#### Buyer Adapter

```bash
cd $BASEFOLDERPATH/backend/aggregators/adapters/buyer
PROJECT_NAME=
REPO_NAME=$AR_REPO
PACKAGE_NAME=buyer-adapter
PACKAGE_VERSION=v1.0

gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

#### Video Adapter

```bash
cd $BASEFOLDERPATH/backend/aggregators/adapters/video
PROJECT_NAME=
REPO_NAME=$AR_REPO
PACKAGE_NAME=video-adapter
PACKAGE_VERSION=v1.0

gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

#### Weather Adapter

```bash
cd $BASEFOLDERPATH/backend/aggregators/adapters/weather
PROJECT_NAME=
REPO_NAME=$AR_REPO
PACKAGE_NAME=weather-adapter
PACKAGE_VERSION=v1.0

gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

#### MANDI Adapter

```bash
cd $BASEFOLDERPATH/backend/aggregators/adapters/mandi
PROJECT_NAME=
REPO_NAME=$AR_REPO
PACKAGE_NAME=mandi-adapter
PACKAGE_VERSION=v1.0

gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

#### LLM Adapter

```bash
cd $BASEFOLDERPATH/backend/aggregators/adapters/llm
PROJECT_NAME=
REPO_NAME=$AR_REPO
PACKAGE_NAME=llm-adapter
PACKAGE_VERSION=v1.0

gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
_LOG_BUCKET_=$PROJECT_ID-terra-stg
```



### Agents

#### Agri Agent

```bash
cd $BASEFOLDERPATH/backend/aggregators/agents/networks/agri
PROJECT_NAME=
REPO_NAME=$AR_REPO
PACKAGE_NAME=agri-agent
PACKAGE_VERSION=v1.0

gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

#### ONDC Agent

```bash
cd $BASEFOLDERPATH/backend/aggregators/agents/networks/ondc
PROJECT_NAME=
REPO_NAME=$AR_REPO
PACKAGE_NAME=ondc-agent
PACKAGE_VERSION=v1.0

gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

#### Video Agent

```bash
cd $BASEFOLDERPATH/backend/aggregators/agents/integrators/video
PROJECT_NAME=
REPO_NAME=$AR_REPO
PACKAGE_NAME=video-agent
PACKAGE_VERSION=v1.0

gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

#### Weather Agent

```bash
cd $BASEFOLDERPATH/backend/aggregators/agents/integrators/weather
PROJECT_NAME=
REPO_NAME=$AR_REPO
PACKAGE_NAME=weather-agent
PACKAGE_VERSION=v1.0

gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

#### MANDI Agent

```bash
cd $BASEFOLDERPATH/backend/aggregators/agents/integrators/mandi
PROJECT_NAME=
REPO_NAME=$AR_REPO
PACKAGE_NAME=mandi-agent
PACKAGE_VERSION=v1.0

gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

#### LLM Agent

```bash
cd $BASEFOLDERPATH/backend/aggregators/agents/integrators/llm
PROJECT_NAME=
REPO_NAME=$AR_REPO
PACKAGE_NAME=llm-agent
PACKAGE_VERSION=v1.0

gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

#### Master Agent

```bash
cd $BASEFOLDERPATH/backend/aggregators/agents/master
PROJECT_NAME=
REPO_NAME=$AR_REPO
PACKAGE_NAME=master-agent
PACKAGE_VERSION=v1.0

gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
_LOG_BUCKET_=$PROJECT_ID-terra-stg
```



### Web socket Servers

#### Event Server

- Web socket Server that broadcasts messages from different Web Socket clients 

```bash
cd $BASEFOLDERPATH/backend/aggregators/websockets/event-server
PROJECT_NAME=
REPO_NAME=$AR_REPO
PACKAGE_NAME=event-serverlib
PACKAGE_VERSION=v1.0

gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

- Deploy Event Server as a **Cloud Run**

```bash
cd $BASEFOLDERPATH/distribution
WORKING_DIR=cloud-run
RESOURCE_NAME=event-serverlib

gcloud builds submit --config="./builds/cloud-run/run-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,\
_WORKING_DIR_="$WORKING_DIR",_TF_VARS_PATH_="./values/event-server-values.tfvars",\
_LOG_BUCKET_=$PROJECT_ID-terra-stg,_RESOURCE_NAME_=$RESOURCE_NAME

#gcloud builds submit --config="./builds/cloud-run/run-destroy.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,\
_WORKING_DIR_="$WORKING_DIR",_TF_VARS_PATH_="./values/event-server-values.tfvars",\
_LOG_BUCKET_=$PROJECT_ID-terra-stg,_RESOURCE_NAME_=$RESOURCE_NAME
```

#### Event Receiver

- Web socket Server that receives events from various micro-services over http
- Acts like a Web socket client for the [Event Server](#Event Server) for the entire suite of micro-services
- Sends the message to [Event Server](#Event Server)

```bash
cd $BASEFOLDERPATH/backend/aggregators/websockets/event-receiver
PROJECT_NAME=
REPO_NAME=$AR_REPO
PACKAGE_NAME=event-receiverlib
PACKAGE_VERSION=v1.0

gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$REPO_NAME,_PACKAGE_NAME_=$PACKAGE_NAME,_PACKAGE_VERSION_=$PACKAGE_VERSION,\
_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

- Deploy Event Receiver as a **Cloud Run**

```bash
cd $BASEFOLDERPATH/distribution
WORKING_DIR=cloud-run
RESOURCE_NAME=event-receiverlib

gcloud builds submit --config="./builds/cloud-run/run-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,\
_WORKING_DIR_="$WORKING_DIR",_TF_VARS_PATH_="./values/event-receiver-values.tfvars",\
_LOG_BUCKET_=$PROJECT_ID-terra-stg,_RESOURCE_NAME_=$RESOURCE_NAME

#gcloud builds submit --config="./builds/cloud-run/run-destroy.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,\
_WORKING_DIR_="$WORKING_DIR",_TF_VARS_PATH_="./values/event-receiver-values.tfvars",\
_LOG_BUCKET_=$PROJECT_ID-terra-stg,_RESOURCE_NAME_=$RESOURCE_NAME
```



### K8s Gateway API

- [What it is](https://gateway-api.sigs.k8s.io/)
- [Recommended approach](https://cloud.google.com/kubernetes-engine/docs/concepts/gateway-api)) for Ingress to GKE cluster instead of traditional Ingress Controller approach

### External Gateway

- Creates a Global External Load balancer on GCP; fully managed by GKE
- Check gateway class deployed by GKE while creating the cluster

```bash
k get Gatewayclass
```

```bash
#namespace for hosting K8s Gateway
k create ns gateway-ns

k apply -f $BASEFOLDERPATH/k8s-gateway-api/gateway/gke-external-gateway.yaml -n gateway-ns
#k delete -f $BASEFOLDERPATH/k8s-gateway-api/gateway/gke-external-gateway.yaml -n gateway-ns

#Check K8s Gateway deployment
k get Gateway -n gateway-ns
```



### Deploy Micro-services

#### Smoke Service

```bash
k create ns smoke
#k delete ns smoke

k create serviceaccount smoke-sa -n smoke
#k delete serviceaccount smoke-sa -n smoke

#Deploy Smoke Microservices
============================
helm upgrade --install --create-namespace smoke-tests-chart-apache $BASEFOLDERPATH/distribution/gke/charts/smoke/smoke-tests-chart/ -n smoke \
-f $BASEFOLDERPATH/distribution/gke/charts/smoke/smoke-tests-chart/values/values-apache.yaml

#helm uninstall smoke-tests-chart-apache -n smoke

#List all pods in the smoke namespace
k get po -n smoke
```

#### Add Routes

```bash
k apply -f $BASEFOLDERPATH/k8s-gateway-api/routes/smoke-route.yaml -n smoke
#k delete -f $BASEFOLDERPATH/k8s-gateway-api/routes/smoke-route.yaml -n smoke

#List HttpRoute in smoke namespace
k get HttpRoute -n smoke
```



### VertexAI Services

```bash
k create ns vertexai
#k delete ns vertexai

k create serviceaccount vertexai-sa -n vertexai
#k delete serviceaccount vertexai-sa -n vertexai

#Workload identity to allow pods communicating with GCP services
gcloud iam service-accounts add-iam-policy-binding $GSA \
    --role=roles/iam.workloadIdentityUser \
    --member="serviceAccount:$PROJECT_ID.svc.id.goog[vertexai/vertexai-sa]"
    
#gcloud iam service-accounts remove-iam-policy-binding $GSA \
    --role=roles/iam.workloadIdentityUser \
    --member="serviceAccount:$PROJECT_ID.svc.id.goog[vertexai/vertexai-sa]"

k annotate serviceaccount vertexai-sa -n vertexai iam.gke.io/gcp-service-account=$GSA
#k annotate serviceaccount vertexai-sa -n vertexai iam.gke.io/gcp-service-account-
```

```bash
#Deploy Storage service
=============================
helm upgrade --install --create-namespace vertexai-charts-storage $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/ \
-n vertexai -f $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/values/values-storage.yaml
#helm uninstall vertexai-charts-storage -n vertexai

#Deploy Transnlation service
================================
helm upgrade --install --create-namespace vertexai-charts-translate $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/ \
-n vertexai -f $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/values/values-translate.yaml
#helm uninstall vertexai-charts-translate -n vertexai

#Deploy Vision service
=============================
helm upgrade --install --create-namespace vertexai-charts-vision $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/ \
-n vertexai -f $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/values/values-vision.yaml
#helm uninstall vertexai-charts-vision -n vertexai

#Deploy Speech service
=============================
helm upgrade --install --create-namespace vertexai-charts-speech $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/ \
-n vertexai -f $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/values/values-speech.yaml
#helm uninstall vertexai-charts-speech -n vertexai

#Deploy GenAI - Text service
========================================
helm upgrade --install --create-namespace vertexai-charts-genaitext $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/ \
-n vertexai -f $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/values/values-genaitext.yaml
#helm uninstall vertexai-charts-genaitext -n vertexai

#Deploy GenAI - Multimodal service
=========================================
helm upgrade --install --create-namespace vertexai-charts-genaimultimodal $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/ \
-n vertexai -f $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/values/values-genaimultimodal.yaml
#helm uninstall vertexai-charts-genaimultimodal -n vertexai

#Deploy GenAI - Imagegen service
=========================================
helm upgrade --install --create-namespace vertexai-charts-genaiimage $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/ \
-n vertexai -f $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/values/values-genaiimage.yaml
#helm uninstall vertexai-charts-genaiimage -n vertexai

#Deploy GenAI - Vector Search service
=========================================
helm upgrade --install --create-namespace vertexai-charts-vectorsearch $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/ \
-n vertexai -f $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/values/values-vectorsearch.yaml
#helm uninstall vertexai-charts-vectorsearch -n vertexai

#List all pods in the vertexai namespace
k get po -n vertexai
```

#### Add Routes

```bash
k apply -f $BASEFOLDERPATH/k8s-gateway-api/routes/vertexai-route.yaml -n vertexai
#k delete -f $BASEFOLDERPATH/k8s-gateway-api/routes/vertexai-route.yaml -n vertexai

#List HttpRoute in vertexai namespace
k get HttpRoute -n vertexai
```



### Aggregator Services

#### Adapter Services

```bash
k create ns aggregator-dev
#k delete ns aggregator-dev

k create serviceaccount aggregator-dev-sa -n aggregator-dev
#k delete serviceaccount aggregator-dev-sa -n aggregator-dev

gcloud iam service-accounts add-iam-policy-binding $GSA \
    --role=roles/iam.workloadIdentityUser \
    --member="serviceAccount:$PROJECT_ID.svc.id.goog[aggregator-dev/aggregator-dev-sa]"
#gcloud iam service-accounts remove-iam-policy-binding $GSA \
    --role=roles/iam.workloadIdentityUser \
    --member="serviceAccount:$PROJECT_ID.svc.id.goog[aggregator-dev/aggregator-dev-sa]"

k annotate serviceaccount aggregator-dev-sa -n aggregator-dev iam.gke.io/gcp-service-account=$GSA
#k annotate serviceaccount aggregator-dev-sa -n aggregator-dev iam.gke.io/gcp-service-account-
```

```bash
#Deploy Agri Adapter service
================================
helm upgrade --install --create-namespace aggregator-charts-agri-adapter $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator-dev -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-agri-adapter.yaml
#helm uninstall aggregator-charts-agri-adapter -n aggregator-dev

#Deploy Buyer Adapter service
================================
helm upgrade --install --create-namespace aggregator-charts-buyer-adapter $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator-dev -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-buyer-adapter.yaml
#helm uninstall aggregator-charts-buyer-adapter -n aggregator-dev

#Deploy Buyer LLM service
================================
helm upgrade --install --create-namespace aggregator-charts-llm-adapter $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator-dev -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-llm-adapter.yaml
#helm uninstall aggregator-charts-llm-adapter -n aggregator-dev

#Deploy Mandi Adapter service
================================
helm upgrade --install --create-namespace aggregator-charts-mandi-adapter $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator-dev -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-mandi-adapter.yaml
#helm uninstall aggregator-charts-mandi-adapter -n aggregator-dev

#Deploy Video Adapter service
================================
helm upgrade --install --create-namespace aggregator-charts-video-adapter $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator-dev -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-video-adapter.yaml
#helm uninstall aggregator-charts-video-adapter -n aggregator-dev

#Deploy Weather Adapter service
================================
helm upgrade --install --create-namespace aggregator-charts-weather-adapter $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator-dev -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-weather-adapter.yaml
#helm uninstall aggregator-charts-weather-adapter -n aggregator-dev
```

#### Agent Services

```bash
#Deploy Agri Agent service
================================
helm upgrade --install --create-namespace aggregator-charts-agri-agent $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator-dev -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-agri-agent.yaml
#helm uninstall aggregator-charts-agri-agent -n aggregator-dev

#Deploy Buyer Agent service
================================
helm upgrade --install --create-namespace aggregator-charts-ondc-agent $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator-dev -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-ondc-agent.yaml
#helm uninstall aggregator-charts-ondc-agent -n aggregator-dev

#Deploy LLM Agent service
================================
helm upgrade --install --create-namespace aggregator-charts-llm-agent $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator-dev -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-llm-agent.yaml
#helm uninstall aggregator-charts-llm-agent -n aggregator-dev

#Deploy MANDI Agent service
================================
helm upgrade --install --create-namespace aggregator-charts-mandi-agent $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator-dev -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-mandi-agent.yaml
#helm uninstall aggregator-charts-mandi-agent -n aggregator-dev

#Deploy Video Agent service
================================
helm upgrade --install --create-namespace aggregator-charts-video-agent $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator-dev -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-video-agent.yaml
#helm uninstall aggregator-charts-video-agent -n aggregator-dev

#Deploy Weather Agent service
================================
helm upgrade --install --create-namespace aggregator-charts-weather-agent $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator-dev -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-weather-agent.yaml
#helm uninstall aggregator-charts-weather-agent -n aggregator-dev

#Deploy Master Agri Agent service
=========================================
helm upgrade --install --create-namespace aggregator-charts-master-agri-agent $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator-dev -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-master-agri-agent.yaml
#helm uninstall aggregator-charts-master-agri-agent -n aggregator-dev

#Deploy Master Retail Agent service
=========================================
helm upgrade --install --create-namespace aggregator-charts-master-retail-agent $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator-dev -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-master-retail-agent.yaml
#helm uninstall aggregator-charts-master-retail-agent -n aggregator-dev

#List all pods in the aggregator-dev namespace
k get po -n aggregator-dev
```

#### Add Routes

```bash
k apply -f $BASEFOLDERPATH/k8s-gateway-api/routes/aggregator-route.yaml -n aggregator-dev
#k delete -f $BASEFOLDERPATH/k8s-gateway-api/routes/aggregator-route.yaml -n aggregator-dev

#List HttpRoute in aggregator-dev namespace
k get HttpRoute -n aggregator-dev
```



### Additional steps for GKE Private cluster

#### Connect to the Jumper VM

```bash
gcloud compute ssh $JUMP_SERVER_NAME --project=$PROJECT_ID --tunnel-through-iap
mkdir csm
exit
```

#### Copy necessary files to Jumper VM

```bash
gcloud compute scp --recurse <local-path> <Jump-server-name-user-name>@jumper-server:<remote-path>
```

#### Connect to the Jumper VM (again)

```bash
gcloud compute ssh $JUMP_SERVER_NAME --project=$PROJECT_ID --tunnel-through-iap
```

#### Configure Jumper VM

```bash
#Install Docker
=========================
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo groupadd docker
sudo usermod -aG docker $USER
#Log out and log back in so that your group membership is re-evaluated
docker run hello-world

#Install Kubectl
=========================
sudo snap install kubectl --classic
kubectl version --client

#Install Helm
=========================
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
sudo apt-get install apt-transport-https --yes
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm

#Install gcloud CLI
====================
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates gnupg curl
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
sudo apt-get update && sudo apt-get install google-cloud-cli
gcloud init
sudo apt-get install google-cloud-sdk-gke-gcloud-auth-plugin
```

#### Operate Private GKE Cluster

```bash
#Set Local Varaibles (inside Jumper VM)
================================================
BASEFOLDERPATH="./csm"
OWNER=
PROJECT_ID=
GSA_DISPLAY_NAME=
GSA=$GSA_DISPLAY_NAME@$PROJECT_ID.iam.gserviceaccount.com
VPC_NAME=
CLUSTER_SUBNET_NAME=
PROXY_SUBNET_NAME=
PSC_SUBNET_NAME=
CLUSTER=gke-private-cluster
NODEPOOL=gkeappspool
REGION=
ZONE=
IP_ADDRESS_NAME=
CERTIFICATE_NAME=
DOMAIN1_NAME=
DOMAIN2_NAME=
DOMAIN3_NAME=
DOMAIN_LIST=$DOMAIN1_NAME,$DOMAIN2_NAME,$DOMAIN3_NAME
DNS_ZONE=
AR_REPO=$PROJECT_ID-repo
JUMP_SERVER_NAME=
MAINTENANCE_SUBNET_NAME=
JUMPSERVER_IP=$(gcloud compute addresses describe jump-server-ip --format="get(address)")
JUMPSERVER_PRIVATE_IP=$(gcloud compute addresses describe jump-server-private-ip --format="get(address)")

#gcloud auth login
gcloud auth list

gcloud config set project $PROJECT_ID
gcloud config set compute/region $REGION
gcloud config set compute/zone $ZONE
```

- Rest of the services are same as in the section [K8s Gateway API](#K8s Gateway API) and onwards.



## References

- [Open Network Aggregator](./README.md)
- [Vertex AI](https://cloud.google.com/vertex-ai/docs)
- [Generative AI on Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview)
- [Source Code](https://github.com/monojit18/Open-Network-Aggregator)
  - This is a Private GH repo and hence is allow-listed

