provider "google" {
    project = var.projectInfo.project
    region = var.projectInfo.region   
}

data "google_service_account" "test_terra_sa" {
    account_id = var.serviceAccountInfo.id
}

data "google_compute_network" "test_terra_vpc" {
  name = var.networkInfo.name
}

data "google_compute_subnetwork" "gke_subnet" {
  name = var.networkInfo.subnet
}

resource "google_container_cluster" "test_terra_cluster" {
    name = var.clusterInfo.name
    project = var.projectInfo.project
    location = var.projectInfo.region
    release_channel {
      channel = var.clusterInfo.release_channel
    }
    initial_node_count = var.clusterInfo.initial_node
    deletion_protection = false
    remove_default_node_pool = var.clusterInfo.remove_default_pool
    networking_mode = var.clusterInfo.networking_mode
    network = data.google_compute_network.test_terra_vpc.name
    subnetwork = data.google_compute_subnetwork.gke_subnet.name    
    ip_allocation_policy {
      cluster_secondary_range_name = data.google_compute_subnetwork.gke_subnet.secondary_ip_range[0].range_name
      services_secondary_range_name = data.google_compute_subnetwork.gke_subnet.secondary_ip_range[1].range_name
    }
    network_policy {
      enabled = var.clusterInfo.network_policy
    }
    workload_identity_config {
      workload_pool = "${var.projectInfo.project}.svc.id.goog"
    }
    addons_config {
      horizontal_pod_autoscaling {
        disabled = !var.clusterInfo.pod_autoscale
      }
    }    
}

resource "google_container_node_pool" "test_terra_system_pool" {
    name = var.clusterInfo.nodepool_config[0].name
    project = var.projectInfo.project
    cluster = google_container_cluster.test_terra_cluster.id
    initial_node_count = var.clusterInfo.nodepool_config[0].initial_node
    node_config {
      service_account = data.google_service_account.test_terra_sa.email
      machine_type = var.clusterInfo.nodepool_config[0].machine_type
    }    
    autoscaling {
      min_node_count = var.clusterInfo.nodepool_config[0].min_node
      max_node_count = var.clusterInfo.nodepool_config[0].max_node  
    }
    max_pods_per_node = var.clusterInfo.nodepool_config[0].max_pods_per_node
}

resource "google_container_node_pool" "test_terra_worker_pool" {
    name = var.clusterInfo.nodepool_config[1].name
    project = var.projectInfo.project
    cluster = google_container_cluster.test_terra_cluster.id
    initial_node_count = var.clusterInfo.nodepool_config[1].initial_node
    node_config {
      service_account = data.google_service_account.test_terra_sa.email
      machine_type = var.clusterInfo.nodepool_config[1].machine_type
    }
    autoscaling {
      min_node_count = var.clusterInfo.nodepool_config[1].min_node
      max_node_count = var.clusterInfo.nodepool_config[1].max_node  
    }
    max_pods_per_node = var.clusterInfo.nodepool_config[1].max_pods_per_node
}