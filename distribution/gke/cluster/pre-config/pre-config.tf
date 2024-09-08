provider "google" {
    project = var.projectInfo.project
    region = var.projectInfo.region   
}

resource "google_compute_network" "vpc" {
    name = var.networkInfo.name
    project = var.projectInfo.project
    auto_create_subnetworks = var.networkInfo.auto_create_subnetworks
    mtu = var.networkInfo.mtu  
}

resource "google_compute_subnetwork" "gke_subnet" {
    name = var.networkInfo.gke_subnet.name
    project = var.projectInfo.project
    region = var.projectInfo.region
    network = google_compute_network.vpc.id
    ip_cidr_range = var.networkInfo.gke_subnet.ip_cidr_range
    secondary_ip_range = [{
        range_name = var.networkInfo.gke_subnet.pods_ip_range.range_name
        ip_cidr_range = var.networkInfo.gke_subnet.pods_ip_range.ip_cidr_range      
    },
    {
        range_name = var.networkInfo.gke_subnet.services_ip_range.range_name
        ip_cidr_range = var.networkInfo.gke_subnet.services_ip_range.ip_cidr_range
    }]
    depends_on = [
        google_compute_network.vpc
    ]
}

resource "google_compute_subnetwork" "proxy_subnet" {
    name = var.networkInfo.proxy_subnet.name
    project = var.projectInfo.project
    region = var.projectInfo.region
    network = google_compute_network.vpc.id
    ip_cidr_range = var.networkInfo.proxy_subnet.ip_cidr_range
    depends_on = [
        google_compute_network.vpc
    ]
}

resource "google_compute_subnetwork" "psc_subnet" {
    name = var.networkInfo.psc_subnet.name
    project = var.projectInfo.project
    region = var.projectInfo.region
    network = google_compute_network.vpc.id
    ip_cidr_range = var.networkInfo.psc_subnet.ip_cidr_range
    depends_on = [
        google_compute_network.vpc
    ]
}

resource "google_compute_subnetwork" "operations_subnet" {
    name = var.networkInfo.operations_subnet.name
    project = var.projectInfo.project
    region = var.projectInfo.region
    network = google_compute_network.vpc.id
    ip_cidr_range = var.networkInfo.operations_subnet.ip_cidr_range
    depends_on = [
        google_compute_network.vpc
    ]
}

resource "google_compute_network_firewall_policy" "fw_policy" {
  name = var.firewallPolicyInfo.name
  project = var.projectInfo.project
  description = var.firewallPolicyInfo.description
}

resource "google_compute_network_firewall_policy_association" "fw_policy_assoc" {
  name = var.firewallPolicyAssocInfo.name
  project = var.projectInfo.project
  attachment_target = google_compute_network.vpc.id
  firewall_policy = google_compute_network_firewall_policy.fw_policy.name
}

resource "google_compute_network_firewall_policy_rule" "fw_rules" {
  count = 4
  action = var.firewallRuleInfo[count.index].action
  description = var.firewallRuleInfo[count.index].description
  direction = var.firewallRuleInfo[count.index].direction
  disabled = var.firewallRuleInfo[count.index].disabled
  enable_logging = var.firewallRuleInfo[count.index].enable_logging
  firewall_policy = google_compute_network_firewall_policy.fw_policy.name
  priority = var.firewallRuleInfo[count.index].priority
  rule_name = var.firewallRuleInfo[count.index].name

  match {
    src_ip_ranges = var.firewallRuleInfo[count.index].match.src_ip_ranges
    dest_ip_ranges = var.firewallRuleInfo[count.index].match.dest_ip_ranges
    layer4_configs {
        ip_protocol = var.firewallRuleInfo[count.index].match.layer4_configs.ip_protocol
        ports = var.firewallRuleInfo[count.index].match.layer4_configs.ports
    }
  }
}


resource "google_compute_global_address" "reserved_public_ip" {
  name = var.lbipInfo.name
}

resource "google_artifact_registry_repository" "artifact_registry" {
    location = var.projectInfo.region
    repository_id = var.artifactRegistryInfo.name
    description = var.artifactRegistryInfo.description
    format = var.artifactRegistryInfo.format
}
