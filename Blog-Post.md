# Breaking Walls in Open Commerce: Building a Gemini-Powered Multi-Agent Aggregator for Open Networks and Beyond

### Nomenclatures

| Terms                                             | Description                                                  |
| ------------------------------------------------- | ------------------------------------------------------------ |
| Beckn protocol                                    | An open protocol for commerce to help diverse businesses to come together<br />and re-imagine their business |
| Buyer App                                         | An Application platform or App for the Buyers.<br />In the context of Open Networks or Beckn protocol this is termed as **BAP** |
| Seller App                                        | An Application platform or App for the Sellers.<br />In the context of Open Networks or Beckn protocol this is termed as **BPP** |
| [Demand-side Affiliates](#Demand-side Affiliates) | Businesses, Organisations who are not part of Open Network(s)<br />but want their end users to leverage contents or services from multiple Open networks |
| [Supply-side Affiliates](#Supply-side Affiliates) | These are primarily Buyer Apps or BAPs who can fetch contents or services<br />from various Seller Apps. But please note, that the Agentic framework is open<br />for other types of content providers as well.<br />e.g. Seller Apps or BPPs in any Open Network can become a Supply-side Affiliate |
| [Integrator App](#Integrator App)                 | This is the Mobile and Web App that integrates with<br />the **Google Agentic framework**. This App is managed by partners of GCP and<br />provided as a SaaS solution or a Managed Service to end *Demand-side Affiliates* |



The promise of open networks like **ONDC (Open Network for Digital Commerce)** is massive: democratizing digital commerce, breaking up platform monopolies, and leveling the playing field for every small vendor, farmer, and independent service provider.

But for businesses trying to step onto this highway, the entrance ramp can be incredibly steep. Navigating onboarding complexities, connecting with fragmented seller apps, and wrestling with rigid UI forms often stall execution before it even starts.

What if we could replace traditional, button-clicking interfaces with natural human conversation? What if a user could type or say, *"Plan my daughter's summer wedding,"* or *"I have a huge harvest sitting in my godown, how do I clear it?"* and an intelligent network did the rest?

Enter the **Agentic Framework on GCP**—a headless, intelligent, multi-agent aggregator designed to turn complex open commerce transactions into fluid, intent-driven conversations.



## Logical View

![logical-view](./assets/logical-view.png)



## The Architectural Blueprint: Master & Sub-Agents

At its core, this solution abandons standard linear application structures in favor of a **Multi-Agent Architecture** built entirely on Google Cloud Platform (GCP) and Vertex AI. Instead of a single massive program handling everything, tasks are broken down dynamically among a specialized roster of AI agents.

![arch-blueprint](./assets/arch-blueprint.png)

### The Master Agent (The First Responder)

The gateway to the framework is the **Master Agent**. This agent is connected directly to a supervised, fine-tuned **Gemini base model** (such as `gemini-flash-2.5`). When an unstructured query enters via voice or text, the Master Agent extracts the actual structural intent and outputs a strictly formatted JSON payload defining:

- **Specific Intents:** Which micro-networks or domains need to be triggered?
- **Action Items:** Is it a search, a selection, or a checkout?
- **Payload Messages:** The precise parameters required by underlying nodes.

### Domain-Specific Sub-Agents (The Specialists)

Once the Master Agent defines the roadmap, it hands off execution to isolated **Sub-Agents**. Each Sub-Agent acts as an independent unit specializing in its own vertical:

- **ONDC Agent/Agri Agent:** Routes queries focused on retail commerce, food delivery, agri related queries or hyper-local logistics.
- **ONEST Agent:** Specializes in discovering education resources, public jobs, and skilling content.
- **Planner Agent:** Coordinates complex scenarios such as matching agricultural commerce requirements or generating multi-step alternative action plans.
- **Third-Party Integrators:** Agents tailored to non-network endpoints like OpenWeatherMap, ENAM Mandi pricing databases, and YouTube.

### The Adapter Layer (The Translators)

Sub-agents communicate with the physical world using **Adapters**. An adapter translates the internal semantic logic of the AI agents into standard, protocol-compliant API requests—such as standard **Beckn protocol** schema formats for ONDC and ONEST or specialized REST/gRPC structures for legacy web endpoints.

> [!NOTE]
>
> Think of the Master Agent as the ultimate traffic cop who actually answers with pristine JSON instead of blowing a whistle. It looks at a chaotic human sentence, nods wisely, and perfectly slices it up for the Sub-Agents who are waiting in line like caffeinated overachievers.



## The Dynamic Flow: Action-Driven vs. Intent-Driven

Traditional commerce platforms are entirely **Action-Driven**. A user clicks a category menu, inputs filter tags, selects items into a cart, and goes through checkout. This framework moves commerce into an **Intent-Driven** pattern using asynchronous streaming.

1. **Ingestion:** The user's intent is captured (e.g., *"Show me red colored leather handbags from local vendors"* ).
2. **Mapping:** The Master Agent returns a structured JSON routing path to the domain Sub-Agent.
3. **Fan-Out:** The Sub-Agent fans out asynchronous `/search` requests to various network Supply-Side Affiliates simultaneously.
4. **Streaming Return:** Rather than forcing the client interface to wait for every slow vendor node to respond, the system hooks into a high-performance **Socket.IO Event Streamer**. As independent vendor catalogs return verification data via the frame's secure callback URL (`/on_search`), the server streams individual result cards to the frontend user interface in real-time.

> [!NOTE]
>
> If you've ever waited 15 seconds for an older search engine to fetch entries from 40 different APIs while staring at a depressing loading spinner, congratulations: you have tech PTSD. We solved that. We stream data cards live using WebSockets the millisecond a vendor checks in, because nobody has the attention span for spinners anymore.



## Production Deployment: Blueprint Strategy

Moving from local prototype to enterprise-ready cluster requires a bulletproof infrastructure strategy. This architecture is built out-of-the-box using **Terraform for GCP** (infrastructure orchestration), **Helm charts** (Kubernetes packaging), and **Cloud Build wrappers** (CI/CD execution pipelines).

The entire deployment topology is engineered into a highly automated **3-Stage Lifecycle**:

### Stage 1: Pre-Config (The Foundation)

This stage builds the secure landing zone and foundational GCP API permissions. It initializes administrative state storage and sets up cloud-native boundaries before compute resources exist.

- **API Enablement:** Programmatically activates required endpoints including `container.googleapis.com` (GKE), `aiplatform.googleapis.com` (Vertex AI), `artifactregistry.googleapis.com`, and core data services.
- **State Storage:** Provisions isolated Google Cloud Storage (GCS) buckets configured specifically for backing up remote Terraform state tracking records and storing fine-tuned Gemini training weights.
- **Identity Mapping:** Generates a dedicated Google Service Account (GSA) bound with strict administrative security boundaries (`roles/owner`, `roles/iam.serviceAccountUser`) to act as the automated infrastructure executor.

### Stage 2: Setup (The Core Infrastructure)

Stage 2 kicks off the actual physical provisioning of structural resources over custom Virtual Private Clouds (VPC).

- **Network Topology:** Provisions a secure custom VPC with strictly bounded subnets for the application workload runtime, dedicated proxy allocation fields (`REGIONAL_MANAGED_PROXY`), and private endpoints mapping back to Google APIs via Private Service Connect (PSC).
- **Private GKE Provisioning:** Standardizes a GKE Private Cluster where the control plane is isolated from public internet exposure. The architecture disables node public IPs entirely, relying on Workload Identity (`svc.id.goog`) to tie Kubernetes workloads directly to Google GSAs without raw secret keys.
- **Pluggable Application Node Pool:** Attaches a specialized, scalable application node pool (`n2d-standard-4`) explicitly designed to isolate and run stateless web microservices, dynamically moving between 1 to 50 nodes as demand shifts.
- **Ingress Edge Routing:** Automates a global External Load Balancer backed by a Google Cloud DNS managed zone and provisions SSL certificates mapped to required application endpoints—ensuring encrypted routing directly through Cloud HTTP/HTTPS layers.

### Stage 3: Post-Config & Application Mesh (The Microservice Layer)

With infrastructure live, the final pipeline packs containers through Google Artifact Registry and distributes microservices into isolated GKE namespaces using Helm charts.

- **Kubernetes Gateway Integration:** Deploys a cloud-native K8s Gateway API configuration rather than traditional ingress controllers, binding unified external entry paths directly to backend route types.
- **Decoupled Namespace Deployments:**
  - `smoke`: Houses base testing charts (`smoke-tests-chart-apache`) to isolate health verifications.
  - `utilities`: Provisions core event-driven infrastructure including Socket.IO Streamer Servers, Event Receivers, and BigQuery data layer managers.
  - `vertexai` / `aggregator`: Houses the AI wrapper engines (Vision, Speech, Translate, Gemini Text/Multimodal blocks), domain Sub-Agents (ONDC, ONEST, Agri), and physical adapters (Buyer, Video, Weather).
- **Health and Resilience Control:** Binds explicit `HealthCheckPolicy` crds directly onto GKE services to govern target backend operational readiness parameters.

> [!NOTE]
>
> Welcome to Stage 2, where we lock down our GKE cluster tighter than Fort Knox. No public IPs, no open endpoints, and a Bastion host keeping watch. If a hacker wants to peek at our code, they'll have to deal with Workload Identity token creators first.



## Technical Execution: Complete Deployment Steps

The following steps match the exact setup commands, scripting workflows, and code blocks required to deploy the microservice architecture from the ground up.

### 1. Pre-requisites Installation

Before driving infrastructure tasks, your deployment machine requires the fundamental CLI binaries.

#### Install kubectl

```bash
sudo apt-get update
sudo apt-get install kubectl
kubectl version --client

sudo apt-get install google-cloud-sdk-gke-gcloud-auth-plugin
```

#### Install Helm

```bash
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null

sudo apt-get install apt-transport-https --yes

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list

sudo apt-get update
sudo apt-get install helm

helm version --client
```

#### Configure Cloud Build Helm Tool Builder (Optional Framework Automation)

```bash
# Clone Community Cloud Builder repository
git clone https://github.com/GoogleCloudPlatform/cloud-builders-community/tree/master/helm

# Build Helm package which would be used inside Cloud Build scripts
gcloud builds submit . --config=cloudbuild.yaml
```

### Setup CLI Environment Variables

Standardize regional environment definitions across your deployment environment:

```bash
BASEFOLDERPATH=<Root folder path>
DISTRIBUTION_PATH=$BASEFOLDERPATH/distribution
OWNER=<Project Owner ID>
PROJECT_ID=<Project ID>

(Note: This ideally should be same as PROJECT_ID; or any preferred name to identify the proejct)
PROJECT_NAME=<Project NAME>

(Note: Changing the below naming format for GSA_DISPLAY_NAME and GSA with need some change in the some of the deployment file(s) as explained later)
GSA_DISPLAY_NAME=$PROJECT_NAME-sa
GSA=$GSA_DISPLAY_NAME@$PROJECT_ID.iam.gserviceaccount.com

VPC_NAME=<Name of the VPC containing all subsequent resources>
CLUSTER_SUBNET_NAME=gke-subnet (Optional name; change accordingly)
PROXY_SUBNET_NAME=proxy-subnet (Optional name; change accordingly)
PSC_SUBNET_NAME=psc-subnet (Optional name; change accordingly)
MAINTENANCE_SUBNET_NAME=management_subnet (Optional name; change accordingly)
CLUSTER=<Name of the GKE cluster>
NODEPOOL=<Name of the Nodepool containing the application services>
REGION=<GCP Region of the PROJECT>
ZONE=<GCP Zone of the PROJECT>
IP_ADDRESS_NAME=dev-glb-lb-ip (Optional name; change accordingly)
CERTIFICATE_NAME=<Certificate to be used by GCP LB>

(Optional: Environments to be included in the same Certificate)
// DEV (Optional)
DOMAIN1_NAME=<dev environment to be exposed through GCP LB>

// STAGING (Optional)
DOMAIN2_NAME=<staging environment to be exposed through GCP LB>

// PROD
DOMAIN3_NAME=<prod environment to be exposed through GCP LB>

(Mandatory: event socket for receiving data asynchronously from various sub-agents)
DOMAIN4_NAME=<Event socket to be exposed through GCP LB>

(Mandatory: streaming socket for receiving strams asynchronously from genetrative AI components)
DOMAIN5_NAME=<Stream socket to be exposed through GCP LB>

(Note: As mentioend above - $DOMAIN1_NAME,$DOMAIN2_NAME,$DOMAIN3_NAME are otional but at least one environemnt should be included)
(Note: As mentioend above - $DOMAIN4_NAME,$DOMAIN5_NAME are mandatory)
DOMAIN_LIST=$DOMAIN1_NAME,$DOMAIN2_NAME,$DOMAIN3_NAME,$DOMAIN4_NAME,$DOMAIN5_NAME

DNS_ZONE=<Cloud DNS Zone>
AR_REPO=<Artifact Registry Repository>
JUMP_SERVER_NAME=<Name of the Jump Server or Bastion Host>
```

### Authenticate User and Activate APIs

Hand off configuration control to your operational project and spin up required cloud engines:

```bash
gcloud auth login
gcloud auth list
gcloud config set account $OWNER
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
gcloud services enable mesh.googleapis.com
gcloud services enable certificatemanager.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable secretmanager.googleapis.com

gcloud config set compute/region $REGION
gcloud config set compute/zone $ZONE
```

### Setup Service Account & Identity Access

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

### Create Infrastructure Cloud Storage Buckets

```bash
# Bucket to store Terraform remote state metrics
gcloud storage buckets create gs://$PROJECT_ID-terra-stg --location=us-central1

# Bucket to store fine-tuned models and runtime datasets
gcloud storage buckets create gs://open-network-aggr-stg-example-num --location=us-central1
```

> [!TIP]
>
> Before blindly blasting the commands below, remember to copy your `values.tpl` files into a live `/values/` directory. If you run Terraform with empty template parameters, the compiler will yell at you in bright red terminal text, and nobody wants that kind of bad energy on a Friday afternoon.  



## Approach A: Automated Terraform Deployment (Recommended)

If choosing automated execution, execute both the Pre-Config and Setup orchestration pipelines using Cloud Build scripts:

### Pre-Config Stage

```bash
PROJECT_NAME=your_project_name_here
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
```

### Setup Stage

```bash
PROJECT_NAME=your_project_name_here
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
```



## Approach B: Manual Step-by-Step gcloud CLI Deployment

If building the multi-tenant architecture elements step-by-step outside Terraform, implement the sequence below:

### Provision Artifact Registry

```Bash
gcloud artifacts repositories create $AR_REPO --repository-format=docker --location=$REGION
gcloud artifacts repositories list --location=$REGION
gcloud artifacts repositories describe $AR_REPO --location=$REGION
```

### Configure Bounded VPC Network Infrastructure

```bash
gcloud compute networks create $VPC_NAME --subnet-mode=custom --bgp-routing-mode=regional --mtu=1460

gcloud compute networks subnets create $CLUSTER_SUBNET_NAME --network=$VPC_NAME --range=10.0.0.0/22 --region=$REGION

gcloud compute networks subnets create $PSC_SUBNET_NAME --purpose=PRIVATE_SERVICE_CONNECT --role=ACTIVE \
--network=$VPC_NAME --range=10.0.4.0/24

gcloud compute networks subnets create $PROXY_SUBNET_NAME --purpose=REGIONAL_MANAGED_PROXY --role=ACTIVE \
--network=$VPC_NAME  --range=10.0.5.0/24

gcloud compute networks subnets update $CLUSTER_SUBNET_NAME \
--add-secondary-ranges=pods-range=10.1.0.0/16,services-range=10.2.0.0/16

gcloud compute networks subnets create $MAINTENANCE_SUBNET_NAME --network=$VPC_NAME --range=10.0.6.0/24

gcloud compute networks subnets list --network=$VPC_NAME
```

### Establish Core Firewall Policies

```bash
gcloud compute firewall-rules create allow-egress --allow=all --destination-ranges=0.0.0.0/0 \
--direction=EGRESS --network=$VPC_NAME --priority=100

gcloud compute firewall-rules create allow-http-ingress --allow=tcp:80,tcp:443 --source-ranges=0.0.0.0/0 \
--direction=INGRESS --network=$VPC_NAME --priority=100

gcloud compute firewall-rules create allow-ssh --allow=tcp:22 --source-ranges=0.0.0.0/0 \
--direction=INGRESS --network=$VPC_NAME --priority=101

gcloud compute firewall-rules create allow-gcp-health-check --network=$VPC_NAME \
--action=allow --direction=INGRESS --source-ranges=130.211.0.0/22,35.191.0.0/16 \
--rules=tcp --priority=103

gcloud compute firewall-rules create allow-gcp-proxies --network=$VPC_NAME \
--action=allow --direction=INGRESS --source-ranges=10.0.5.0/24 \
--rules=tcp:80,tcp:443,tcp:8080 --priority=104

gcloud compute firewall-rules list --format="table(name, network)" --filter="network=$VPC_NAME"
```

### Build Administrative Bastion Host (Jump Server)

```bash
gcloud compute addresses create jump-server-ip --region=$REGION
JUMPSERVER_IP=$(gcloud compute addresses describe jump-server-ip --format="get(address)")

gcloud compute addresses create jump-server-private-ip --subnet=$MAINTENANCE_SUBNET_NAME \
--addresses=10.0.6.100 --region=$REGION
JUMPSERVER_PRIVATE_IP=$(gcloud compute addresses describe jump-server-private-ip --format="get(address)")

gcloud compute instances create $JUMP_SERVER_NAME --machine-type=n2d-standard-2 \
--image-family=ubuntu-pro-2004-lts --image-project=ubuntu-os-pro-cloud \
--network=$VPC_NAME --subnet=$MAINTENANCE_SUBNET_NAME --address=$JUMPSERVER_IP \
--private-network-ip=$JUMPSERVER_PRIVATE_IP --zone=$ZONE --project=$PROJECT_ID
```

### Spin Up GKE Cluster Environment

Select between Private or Public cluster topology boundaries depending on your security architecture rules:

#### Private Cluster Topology (Recommended Production Setup)

```Bash
gcloud container clusters create $CLUSTER --release-channel=regular --region=$REGION \
--enable-ip-alias --machine-type=n2d-standard-2 --gateway-api=standard \
--num-nodes=1 --max-pods-per-node=40 \
--network=$VPC_NAME --subnetwork=$CLUSTER_SUBNET_NAME \
--cluster-secondary-range-name=pods-range --services-secondary-range-name=services-range \
--service-account=$GSA --workload-pool=$PROJECT_ID.svc.id.goog \
--enable-master-authorized-networks --enable-private-nodes --enable-private-endpoint \
--master-authorized-networks=$JUMPSERVER_PRIVATE_IP/32 --master-ipv4-cidr=10.0.7.0/28 \
--addons GcsFuseCsiDriver,HttpLoadBalancing
```

#### Public Cluster Topology (Testing Scenarios Only)

```bash
gcloud container clusters create $CLUSTER --release-channel=regular --region=$REGION \
--enable-ip-alias --machine-type=n2d-standard-2 --gateway-api=standard \
--num-nodes=1 --max-pods-per-node=40 \
--network=$VPC_NAME --subnetwork=$CLUSTER_SUBNET_NAME \
--cluster-secondary-range-name=pods-range --services-secondary-range-name=services-range \
--service-account=$GSA --workload-pool=$PROJECT_ID.svc.id.goog \
--addons GcsFuseCsiDriver,HttpLoadBalancing
```

### Attach Microservices Node Pool

```bash
gcloud container node-pools create $NODEPOOL --cluster=$CLUSTER --region=$REGION \
--num-nodes=1 --enable-autoscaling --machine-type=n2d-standard-4 \
--min-nodes=1 --max-nodes=50 --max-pods-per-node=30 \
--service-account=$GSA
```

### Configure Gateway Routing IPs and Certs

```bash
gcloud compute ssl-certificates create $CERTIFICATE_NAME --domains=$DOMAIN_LIST --global

gcloud compute addresses create $IP_ADDRESS_NAME --ip-version=IPV4 --global
GLB_IP=$(gcloud compute addresses describe $IP_ADDRESS_NAME --format="get(address)" --global)

# Inject routing reference inside Cloud DNS zones
gcloud dns record-sets create $DOMAIN1_NAME --rrdatas=$GLB_IP --type=A --ttl=60 --zone=$DNS_ZONE
```

> [!NOTE]
>
> Congratulations! Your production foundation is officially deployed. Grab a fresh cup of coffee, because we are about to push dozens of services up into Cloud Build. If the fans on your machine start sounding like a jet engine taking off, that means it's working.



## Compiling and Packaging Microservices Containers

With raw compute engines finalized, run Cloud Build steps across individual functional wrapper directories to compile application images up to Artifact Registry repositories.

### Utility Infrastructure Layer

```Bash
# Compile Streaming Server Container
cd $BASEFOLDERPATH/backend/utilities/websock-streamer/server
gcloud builds submit --config="$DISTRIBUTION_PATH/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="streamer-serverlib",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Compile Event Broadcasting Node
cd $BASEFOLDERPATH/backend/utilities/event-sockets/event-server
gcloud builds submit --config="$DISTRIBUTION_PATH/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="event-serverlib",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Compile Async Callback Receiver
cd $BASEFOLDERPATH/backend/utilities/event-sockets/event-receiver
gcloud builds submit --config="$DISTRIBUTION_PATH/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="event-receiverlib",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Compile Storage Wrapper API
cd $BASEFOLDERPATH/backend/utilities/storage
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="storagelib",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Compile BigQuery Search Optimization Driver
cd $BASEFOLDERPATH/backend/utilities/bigquery
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="bigquerylib",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

### Vertex AI Cognitive Integration Framework

```Bash
# Vision Wrapper Image
cd $BASEFOLDERPATH/backend/vertexai/vision
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="visionlib",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Speech-to-Text Container
cd $BASEFOLDERPATH/backend/vertexai/speech
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="speechlib",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Translation Engine Image
cd $BASEFOLDERPATH/backend/vertexai/translation
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="translatelib",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

### Generative Model Execution Nodes

```bash
# Imagen Container Build
cd $BASEFOLDERPATH/backend/genai/image
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="genai-imagelib",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Gemini Pro Base Core Text Module
cd $BASEFOLDERPATH/backend/genai/text
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="genai-textlib",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Gemini Multimodal Component Wrapper
cd $BASEFOLDERPATH/backend/genai/multimodal
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="genai-multimodallib",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

### Physical Endpoint Routing Adapters

```Bash
# Agri Procurement Adapter
cd $BASEFOLDERPATH/backend/aggregators/adapters/agri
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="agri-adapter",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Beckn Buyer-BAP Network Connector
cd $BASEFOLDERPATH/backend/aggregators/adapters/buyer
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="buyer-adapter",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Video Streaming Media Adapter
cd $BASEFOLDERPATH/backend/aggregators/adapters/video
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="video-adapter",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# OpenWeatherMap Integration Module
cd $BASEFOLDERPATH/backend/aggregators/adapters/weather
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="weather-adapter",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# ENAM Mandi Pricing Database Component
cd $BASEFOLDERPATH/backend/aggregators/adapters/mandi
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="mandi-adapter",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Gemini LLM Direct Fallback Core Adapter
cd $BASEFOLDERPATH/backend/aggregators/adapters/llm
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="llm-adapter",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

### Intelligent Multi-Agent Framework Core

```bash
# Deploy Master Router Layer
cd $BASEFOLDERPATH/backend/aggregators/agents/master
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="master-agent",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Deploy Isolated Agri Agent Node
cd $BASEFOLDERPATH/backend/aggregators/agents/networks/agri
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="agri-agent",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Deploy Bounded Retail ONDC Assistant Node
cd $BASEFOLDERPATH/backend/aggregators/agents/networks/ondc
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="ondc-agent",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Deploy ONEST Education/Skilling Sub-Agent
cd $BASEFOLDERPATH/backend/aggregators/agents/networks/onest
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="onest-agent",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Deploy Multi-Step Strategy Planner Module
cd $BASEFOLDERPATH/backend/aggregators/agents/networks/planner
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="planner-agent",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Deploy YouTube Media Query Agent Node
cd $BASEFOLDERPATH/backend/aggregators/agents/integrators/video
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="video-agent",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Deploy Environmental Status Sub-Agent
cd $BASEFOLDERPATH/backend/aggregators/agents/integrators/weather
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="weather-agent",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Deploy Mandi Value Validation Agent
cd $BASEFOLDERPATH/backend/aggregators/agents/integrators/mandi
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="mandi-agent",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg

# Deploy Conversational Fallback Processing Agent
cd $BASEFOLDERPATH/backend/aggregators/agents/integrators/llm
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="llm-agent",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

### Transaction Completion Handlers

```bash
# Order Placement and Settlement Callback Module
cd $BASEFOLDERPATH/backend/aggregators/agents/callbacks/order
gcloud builds submit --config="$BASEFOLDERPATH/distribution/builds/app/app-deployment.yaml" \
--project=$PROJECT_ID --substitutions=_PROJECT_ID_=$PROJECT_ID,_PROJECT_NAME_=$PROJECT_NAME,_REGION_=$REGION,\
_REPO_NAME_=$AR_REPO,_PACKAGE_NAME_="order-callback",_PACKAGE_VERSION_="v1.0",_LOG_BUCKET_=$PROJECT_ID-terra-stg
```

> [!TIP]
>
> That's a lot of YAML files running through `gcloud builds submit`. Take a quick stretching break while Google Cloud's supercomputers turn your microservices into production-ready images. Up next: rolling them into Kubernetes!



## Instantiating Component Pods Inside GKE Architecture

Once container compilation routines are clean, establish internal load balancers and publish microservice images inside targeted GKE partitions using standard Helm commands.

### External Edge Gateway Initialization

```bash
kubectl create ns gateway-ns
kubectl apply -f $BASEFOLDERPATH/k8s-gateway-api/gateway/gke-external-gateway.yaml -n gateway-ns
kubectl get Gateway -n gateway-ns
```

### Isolate and Launch Smoke Verification Charts

```bash
kubectl create ns smoke
kubectl create serviceaccount smoke-sa -n smoke

helm upgrade --install --create-namespace smoke-tests-chart-apache $DISTRIBUTION_PATH/gke/charts/smoke/smoke-tests-chart/ -n smoke \
-f $DISTRIBUTION_PATH/gke/charts/smoke/smoke-tests-chart/values/values-apache.yaml

# Establish underlying routing rules out to edge policies
kubectl apply -f $BASEFOLDERPATH/k8s-gateway-api/routes/smoke-route.yaml -n smoke
```

### Deploy Utility Ecosystem with Bounded Identities

```bash
kubectl create ns utilities
kubectl create serviceaccount utilities-sa -n utilities

# Map GKE Service Account back onto Google Service Account structures using Workload Identity
gcloud iam service-accounts add-iam-policy-binding $GSA \
    --role=roles/iam.workloadIdentityUser \
    --member="serviceAccount:$PROJECT_ID.svc.id.goog[utilities/utilities-sa]"

kubectl annotate serviceaccount utilities-sa -n utilities iam.gke.io/gcp-service-account=$GSA
```

### Execute Helm upgrades for tracking and streaming nodes:

```bash
helm upgrade --install --create-namespace utilities-chart-streamer-server $DISTRIBUTION_PATH/gke/charts/utilities/utilities-charts/ \
-n utilities -f $DISTRIBUTION_PATH/gke/charts/utilities/utilities-charts/values/values-streamer-server.yaml

helm upgrade --install --create-namespace utilities-chart-event-server $DISTRIBUTION_PATH/gke/charts/utilities/utilities-charts/ \
-n utilities -f $DISTRIBUTION_PATH/gke/charts/utilities/utilities-charts/values/values-event-server.yaml

helm upgrade --install --create-namespace utilities-chart-event-receiver $DISTRIBUTION_PATH/gke/charts/utilities/utilities-charts/ \
-n utilities -f $DISTRIBUTION_PATH/gke/charts/utilities/utilities-charts/values/values-event-receiver.yaml

helm upgrade --install --create-namespace utilities-chart-storage $DISTRIBUTION_PATH/gke/charts/utilities/utilities-charts/ \
-n utilities -f $DISTRIBUTION_PATH/gke/charts/utilities/utilities-charts/values/values-storage.yaml

helm upgrade --install --create-namespace utilities-chart-bigquery $DISTRIBUTION_PATH/gke/charts/utilities/utilities-charts/ \
-n utilities -f $DISTRIBUTION_PATH/gke/charts/utilities/utilities-charts/values/values-bigquery.yaml
```

### Bind mapping route paths and attach health verifications across individual backend nodes:

```Bash
kubectl apply -f $DISTRIBUTION_PATH/gke/k8s-gateway-api/routes/streamer-route.yaml -n utilities
kubectl apply -f $DISTRIBUTION_PATH/gke/k8s-gateway-api/routes/event-route.yaml -n utilities

kubectl apply -f $DISTRIBUTION_PATH/gke/k8s-gateway-api/policies/streamer-health-check.yaml -n utilities
kubectl apply -f $DISTRIBUTION_PATH/gke/k8s-gateway-api/policies/event-health-check.yaml -n utilities
```

### Deploy Vertex AI Cognitive Core Workloads

```bash
kubectl create ns vertexai
kubectl create serviceaccount vertexai-sa -n vertexai

gcloud iam service-accounts add-iam-policy-binding $GSA \
    --role=roles/iam.workloadIdentityUser \
    --member="serviceAccount:$PROJECT_ID.svc.id.goog[vertexai/vertexai-sa]"

kubectl annotate serviceaccount vertexai-sa -n vertexai iam.gke.io/gcp-service-account=$GSA
```

### Push Helm configurations to set up AI models:

```bash
helm upgrade --install --create-namespace vertexai-charts-translate $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/ \
-n vertexai -f $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/values/values-translate.yaml

helm upgrade --install --create-namespace vertexai-charts-vision $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/ \
-n vertexai -f $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/values/values-vision.yaml

helm upgrade --install --create-namespace vertexai-charts-speech $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/ \
-n vertexai -f $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/values/values-speech.yaml

helm upgrade --install --create-namespace vertexai-charts-genaitext $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/ \
-n vertexai -f $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/values/values-genaitext.yaml

helm upgrade --install --create-namespace vertexai-charts-genaimultimodal $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/ \
-n vertexai -f $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/values/values-genaimultimodal.yaml

helm upgrade --install --create-namespace vertexai-charts-genaiimage $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/ \
-n vertexai -f $BASEFOLDERPATH/distribution/gke/charts/vertexai/vertexai-charts/values/values-genaiimage.yaml
```

### Configure global routing visibility over AI modules:

```bash
kubectl apply -f $BASEFOLDERPATH/k8s-gateway-api/routes/vertexai-route.yaml -n vertexai
kubectl apply -f $DISTRIBUTION_PATH/gke/k8s-gateway-api/policy/translate-health-check.yaml -n vertexai
```

### Instantiating Orchestrator Component Nodes and Adapters

```Bash
kubectl create ns aggregator
kubectl create serviceaccount aggregator-sa -n aggregator

gcloud iam service-accounts add-iam-policy-binding $GSA \
    --role=roles/iam.workloadIdentityUser \
    --member="serviceAccount:$PROJECT_ID.svc.id.goog[aggregator/aggregator-sa]"

kubectl annotate serviceaccount aggregator-sa -n aggregator iam.gke.io/gcp-service-account=$GSA
```

### Distribute endpoints for your interface adapters:

```Bash
helm upgrade --install --create-namespace aggregator-charts-agri-adapter $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-agri-adapter.yaml

helm upgrade --install --create-namespace aggregator-charts-buyer-adapter $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-buyer-adapter.yaml

helm upgrade --install --create-namespace aggregator-charts-llm-adapter $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-llm-adapter.yaml

helm upgrade --install --create-namespace aggregator-charts-mandi-adapter $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-mandi-adapter.yaml

helm upgrade --install --create-namespace aggregator-charts-video-adapter $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-video-adapter.yaml

helm upgrade --install --create-namespace aggregator-charts-weather-adapter $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-weather-adapter.yaml
```

### Distribute cluster deployment specs for active AI worker agents:

```bash
helm upgrade --install --create-namespace aggregator-chart-planner-agent $DISTRIBUTION_PATH/gke/charts/aggregator/aggregator-charts/ \
-n aggregator -f $DISTRIBUTION_PATH/gke/charts/aggregator/aggregator-charts/values/values-planner-agent.yaml

helm upgrade --install --create-namespace aggregator-charts-agri-agent $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-agri-agent.yaml

helm upgrade --install --create-namespace aggregator-charts-ondc-agent $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-ondc-agent.yaml

helm upgrade --install --create-namespace aggregator-charts-llm-agent $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-llm-agent.yaml

helm upgrade --install --create-namespace aggregator-charts-mandi-agent $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-mandi-agent.yaml

helm upgrade --install --create-namespace aggregator-charts-video-agent $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-video-agent.yaml

helm upgrade --install --create-namespace aggregator-charts-weather-agent $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-weather-agent.yaml

helm upgrade --install --create-namespace aggregator-charts-master-agri-agent $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-master-agri-agent.yaml

helm upgrade --install --create-namespace aggregator-charts-master-retail-agent $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/ \
-n aggregator -f $BASEFOLDERPATH/distribution/gke/charts/aggregator/aggregator-charts/values/values-master-retail-agent.yaml

helm upgrade --install --create-namespace aggregator-chart-order-callback $DISTRIBUTION_PATH/gke/charts/aggregator/aggregator-charts/ \
-n aggregator -f $DISTRIBUTION_PATH/gke/charts/aggregator/aggregator-charts/values/values-order-callback.yaml
```

### Publish routing configurations and final traffic policing schemas across the active network layer:

```bash
kubectl apply -f $BASEFOLDERPATH/k8s-gateway-api/routes/aggregator-route.yaml -n aggregator

kubectl apply -f $DISTRIBUTION_PATH/gke/k8s-gateway-api/policies/master-agri-health-check.yaml -n aggregator
kubectl apply -f $DISTRIBUTION_PATH/gke/k8s-gateway-api/policies/master-retail-health-check.yaml -n aggregator
kubectl apply -f $DISTRIBUTION_PATH/gke/k8s-gateway-api/policies/master-order-callback-health-check.yaml -n aggregator
```

> [!TIP]
>
> Everything is live! All routes are linked and healthy. Let's fire a mock search query down the tubes to make sure our system doesn't accidentally order 500 chickens instead of a singular dinner delivery plate.



## Technical Verification: End-to-End Testing

With components deployed, run structural validation loops to ensure async payloads execute successfully.

### Initialize Test Sockets for Async Responses

```bash
cd backend/utilities/event-sockets/test-client
cp .env.tpl .env

# Verify targeted EVENT_SERVER_HTTP_HOST mapping matches your gateway deployment
# e.g., EVENT_SERVER_HTTP_HOST=https://event-server.yourdomain.com

# Formulate a baseline transaction string token
uuidgen
# Example Response Token: 110600C6-2A13-4BCC-AE8E-36EF992DFCD7

# Initialize your processing context room target
curl -X POST http://localhost:10010/init/110600C6-2A13-4BCC-AE8E-36EF992DFCD7
```

### Dispatch Sample Search Intent Request Payload

```bash
curl --location 'https://onix-dev.gcpwkshpdev.com/retail/search' \
--header 'Content-Type: application/json' \
--data '{
    "location": {
        "address": "mahadevpura; behind bagmane tech park.",
        "country": {
            "name": "India",
            "code": "IN"
        },
        "city": {
            "name": "Bangalore",
            "code": "BNG"
        },
        "zip": "560032"
    },
    "transaction_id": "110600C6-2A13-4BCC-AE8E-36EF992DFCD7",
    "message_id": "386e57d0-9054-44e7-a35e-4521b0495d6e",
    "query": "I would like to buy chicken biriyani",
    "preferred_networks": {
        "ONDC": [{
            "descriptor": {
                "name": "Products from Mystore"        
            },
            "url": "https://mystore3.devhippo.com/ms/utils/gsearch2"
        }],
        "ONEST": [],
        "AGRI": [],
        "WEATHER": {},
        "VIDEO": {},
        "MANDI": {}
    }
}'
```

## Real-World Impact Scenarios

What does this feel like when deployed in production? Let's look at the foundational use cases included out-of-the-box:

### Scenario A: Rural Agri-Commerce & Market Linkage

A farmer interacts with a local financial app utilizing this framework:

- *Query:* `"I need financial help for the upcoming monsoon season."*
- *AI Action:* The **Agri Sub-Agent** interfaces with the FinTech adapter to parse available micro-loan offerings across registered rural credit suppliers.
- *Query:* `"I have a massive inventory of potatoes in the warehouse, how do I clear it?"*
- *AI Action:* The **Agri Agent** uses a custom BigQuery semantic table to run a vector search on real-time Mandi market rates, routes a transaction to the ONDC retail network for institutional buyers, and pulls up helpful YouTube storage tutorial videos at the same time.

### Scenario B: Compound Conversational Planning

A user sets up a complex requirement:

- *Query:* `"Plan my daughter's wedding ceremony."*
- *AI Action:* The **Planner Sub-Agent** coordinates multiple parallel worker paths. It triggers the ONDC Agent to pull local catering menu cards, pulls weather forecasts from OpenWeatherMap to ensure outdoor conditions are viable, and asks Gemini to construct a creative party outline—all delivered inside a single unified dashboard view.

## Future Roadmap: Memory, Sentiment, and Empathy

While the current operational release successfully processes completely stateless commerce pipelines, the upcoming roadmap moves the agent framework from reactive tools to proactive advisors:

1. **Multi-Tiered Cognitive Memory:** Integrating episodic and procedural memory banks allows sub-agents to remember past search habits, budget ranges, and contextual preferences.
2. **Emotional Intelligence Tuning:** Modifying sub-agent prompt boundaries to sense user distress or urgency from input voice tones, allowing the assistant to respond with empathy and prioritize hyper-local emergency logistics.
3. **Standardized Cross-Catalog Mapping:** Moving away from loosely formatted custom JSON objects inside the `catalog.provider.items` arrays toward a uniform global open-network schema, rendering completely frictionless front-end application bindings.

The future of digital commerce isn't a complex maze of applications, forms, and search fields. The future is an open canvas where human language drives global networks.



## References

The Souece code along with Deployment stps of this entire proejct is available as a [Public Github Repository](https://github.com/monojit18/Open-Network-Aggregator).

- [Open Network Aggregator - General Overview](https://github.com/monojit18/Open-Network-Aggregator/blob/main/README.md)
- [Open Network Aggregator - Design Overview](https://github.com/monojit18/Open-Network-Aggregator/blob/main/Design-Overview.md)
- [Deployment](https://github.com/monojit18/Open-Network-Aggregator/blob/main/Deployment.md)
- [Vertex AI](https://cloud.google.com/vertex-ai/docs)
- [Generative AI on Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview)

