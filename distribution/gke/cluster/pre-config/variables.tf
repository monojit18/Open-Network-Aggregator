variable "projectInfo"{    
    type = object({
        project = string
        region = string
        user = string
        serviceAccount = string
    })
    default = {
        project = "apps-project-3108449"
        region = "asia-southeast1"
        user = "admin@monojitdatta.altostrat.com"
        serviceAccount = "apps-project-sa@apps-project-3108449.iam.gserviceaccount.com"
    }
}

variable "networkInfo"{
    type = object({
        name = string
        auto_create_subnetworks = bool
        mtu = number
        gke_subnet = object({
            name = string
            ip_cidr_range = string
            pods_ip_range = object({
                 range_name    = string
                 ip_cidr_range = string
            })
            services_ip_range = object({
                 range_name    = string
                 ip_cidr_range = string
            })
        })
        proxy_subnet = object({
            name = string
            ip_cidr_range = string
        })
        psc_subnet = object({
            name = string
            ip_cidr_range = string
        })
        operations_subnet = object({
            name = string
            ip_cidr_range = string
        })
    })        
   
    default = {    
        name = "test-terra-vpc"
        auto_create_subnetworks = false
        mtu = 1460
        gke_subnet = {
            name = "test-terra-gke-subnet"
            ip_cidr_range = "10.0.0.0/24"
            pods_ip_range = {
                range_name = "pods-range"
                ip_cidr_range = "10.2.0.0/16"
            }
            services_ip_range = {
                range_name = "servicess-range"
                ip_cidr_range = "10.3.0.0/16"
            }
        }
        psc_subnet = {
            name = "test-psc-subnet"
            ip_cidr_range = "10.0.1.0/24"
            purpose = "PRIVATE_SERVICE_CONNECT"
        }
        proxy_subnet = {
            name = "test-terra-proxy-subnet"
            ip_cidr_range = "10.0.2.0/24"
            purpose = "REGIONAL_MANAGED_PROXY"
        }
        operations_subnet = {
            name = "operations-subnet",
            ip_cidr_range = "10.0.3.0/24"
        }
    }
}

variable "firewallPolicyInfo"{
    type = object({
        name = string
        description = string 
    })

    default = {
        name = "test-terra-nw-policy"
        description = ""
    }
}

variable "firewallPolicyAssocInfo"{
    type = object({
        name = string        
    })

    default = {
        name = "test-terra-nw-policy-assoc"        
    }
}

variable "firewallRuleInfo"{
    type = list(object({
        name = string
        action = string
        description = string
        direction = string
        disabled = bool
        enable_logging = bool
        firewall_policy = string
        priority = number
        match = object({
            src_ip_ranges = optional(list(string))
            dest_ip_ranges = optional(list(string))
            layer4_configs = object({
                ip_protocol = string
                ports = optional(list(string))
            })
        })
    }))

    default = [
    {
        name = "allow-ssh"
        action = "allow"
        description = ""
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
        name = "allow-http(s)"
        action = "allow"
        description = ""
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
        name = "allow-health-check"
        action = "allow"
        description = ""
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
        name = "allow-egress"
        action = "allow"
        description = ""
        direction = "EGRESS"
        disabled = false
        enable_logging = false
        firewall_policy = ""
        priority = 103
        match = {
            dest_ip_ranges = ["0.0.0.0/0"]
            layer4_configs = {
                ip_protocol = "tcp"                
            }
         }
    }]
}

variable lbipInfo {
    type = object({
        name = string
    })

    default = {
        name = "test-terra-glb-lb-ip"   
    }
}

variable "artifactRegistryInfo"{
    type = object({
        name = string
        description = string        
        format = string
    })

    default = {
        name = "test-terra-repo"
        description = "test terra repo"        
        format = "DOCKER"
    }

}

