projectInfo = {
        project = ""
        region = ""
}

serviceAccountInfo = {
    name = "@.iam.gserviceaccount.com"
}

networkInfo = {
    name = "dev-vpc"
    auto_create_subnetworks = false
    mtu = 1460
    gke_subnet = {
        name = "gke-subnet"
        ip_cidr_range = "10.0.0.0/22"
        pods_ip_range = {
            range_name = "pods-range"
            ip_cidr_range = "10.1.0.0/16"
        }
        services_ip_range = {
            range_name = "servicess-range"
            ip_cidr_range = "10.2.0.0/16"
        }
    },
    proxy_subnet = {
        name = "proxy-subnet"
        ip_cidr_range = "10.0.4.0/24"
        purpose = "REGIONAL_MANAGED_PROXY"
    },
    psc_subnet = {
        name = "psc-subnet"
        ip_cidr_range = "10.0.5.0/24"
        purpose = "PRIVATE_SERVICE_CONNECT"
    },    
    management_subnet = {
        name = "management-subnet",
        ip_cidr_range = "10.0.6.0/24"
    }
}

firewallPolicyInfo = {
    name = "nw-policy"
    description = ""
}

firewallPolicyAssocInfo = {
    name = "nw-policy-assoc"
}

firewallRuleInfo = [{
    name = "dev-allow-ssh"
    action = "allow"
    description = "allow ssh for the dev environment"
    direction = "INGRESS"
    disabled = false
    enable_logging = false
    firewall_policy = ""
    priority = 100
    match = {
        src_ip_ranges = ["0.0.0.0/0"]
        layer4_configs = {
            ip_protocol = "tcp"
            ports = ["22"]
        }
    }
},
{
    name = "dev-allow-http(s)"
    action = "allow"
    description = "allow http(s) for the dev environment"
    direction = "INGRESS"
    disabled = false
    enable_logging = true
    firewall_policy = ""
    priority = 101
    match = {
        src_ip_ranges = ["0.0.0.0/0"]
        layer4_configs = {
            ip_protocol = "tcp"
            ports = ["80", "443", "8080"]
        }
    }
},
{
    name = "dev-allow-health-check"
    action = "allow"
    description = "allow gcp health-check for the dev environment"
    direction = "INGRESS"
    disabled = false
    enable_logging = true
    firewall_policy = ""
    priority = 102
    match = {
        src_ip_ranges = ["130.211.0.0/22", "35.191.0.0/16"]
        layer4_configs = {
            ip_protocol = "tcp"
        }
    }
},
{
    name = "dev-allow-egress"
    action = "allow"
    description = "allow egress for the dev environment"
    direction = "EGRESS"
    disabled = false
    enable_logging = false
    firewall_policy = ""
    priority = 104
    match = {
        dest_ip_ranges = ["0.0.0.0/0"]
        layer4_configs = {
            ip_protocol = "tcp"
        }
    }
}]

lbipInfo = {
    name = "dev-glb-lb-ip"
}

natipInfo = {
    name = "dev-nat-gw-ip"
}

routerInfo  = {
    name = "dev-router"
    routerNAT = {
        name = "dev-router-nat-gw"
    }
}

artifactRegistryInfo = {
    name = "dev-repo"
    description = "A repository for containers for the dev environment"
    format = "DOCKER"
}

mgmtVMInfo = {
    name = "mgmt-vm"
    ip_name = "mgmt-pub-ip"
    machine_type = "n2d-standard-2"
    zone =  "-a"
    boot_disk =  {
        image = "ubuntu-os-cloud/ubuntu-2204-lts"
    }
}