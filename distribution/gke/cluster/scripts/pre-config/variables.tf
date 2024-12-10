variable "projectInfo"{    
    type = object({
        project = string
        region = string        
    })
    default = {
        project = ""
        region = ""
    }
}

variable "serviceAccountInfo"{
    type = object({
        name = string    
    })
    default = {
        name = ""
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
        management_subnet = object({
            name = string
            ip_cidr_range = string
        })
    })        
   
    default = {    
        name = ""
        auto_create_subnetworks = false
        mtu = 1460
        gke_subnet = {
            name = ""
            ip_cidr_range = ""
            pods_ip_range = {
                range_name = ""
                ip_cidr_range = ""
            }
            services_ip_range = {
                range_name = ""
                ip_cidr_range = ""
            }
        }
        psc_subnet = {
            name = ""
            ip_cidr_range = ""
            purpose = ""
        }
        proxy_subnet = {
            name = ""
            ip_cidr_range = ""
            purpose = ""
        }
        management_subnet = {
            name = "",
            ip_cidr_range = ""
        }
    }
}

variable "firewallPolicyInfo"{
    type = object({
        name = string
        description = string 
    })

    default = {
        name = ""
        description = ""
    }
}

variable "firewallPolicyAssocInfo"{
    type = object({
        name = string        
    })

    default = {
        name = ""
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
        name = ""
        action = ""
        description = ""
        direction = ""
        disabled = false
        enable_logging = false
        firewall_policy = ""
        priority = 100
        match = {
            src_ip_ranges = [""]
            layer4_configs = {
                ip_protocol = ""
                ports = [""]
            }
         }
    },
    {
        name = ""
        action = ""
        description = ""
        direction = ""
        disabled = false
        enable_logging = true
        firewall_policy = ""
        priority = 101
        match = {
            src_ip_ranges = [""]
            layer4_configs = {
                ip_protocol = ""
                ports = []
            }
         }
    },
    {
        name = ""
        action = ""
        description = ""
        direction = ""
        disabled = false
        enable_logging = true
        firewall_policy = ""
        priority = 102
        match = {
            src_ip_ranges = [""]
            layer4_configs = {
                ip_protocol = ""                
            }
         }
    },
    {
        name = ""
        action = ""
        description = ""
        direction = ""
        disabled = false
        enable_logging = false
        firewall_policy = ""
        priority = 103
        match = {
            dest_ip_ranges = [""]
            layer4_configs = {
                ip_protocol = ""
            }
         }
    }]
}

variable lbipInfo {
    type = object({
        name = string
    })

    default = {
        name = ""
    }
}

variable natipInfo {
    type = object({
        name = string
    })

    default = {
        name = ""
    }
}

variable routerInfo {
    type = object({
        name = string
        routerNAT = object({
          name = string
        })
    })

    default = {
        name = ""
        routerNAT = {
            name = ""
        }
    }
}

variable "artifactRegistryInfo"{
    type = object({
        name = string
        description = string        
        format = string
    })

    default = {
        name = ""
        description = ""
        format = ""
    }
}

variable "mgmtVMInfo"{
    type = object({
        name = string
        ip_name = string
        machine_type = string
        zone =  string
        boot_disk =  object({
          image = string
        })
    })    
}

