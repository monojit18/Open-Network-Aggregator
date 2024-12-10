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

variable "serviceAccountInfo" {
    type = object({
        id =  string        
    })

    default = {
        id =  ""
    }
}

variable "networkInfo" {
    type = object({
        name =  string
        subnet = string
    })

    default = {
        name =  ""
        subnet = ""
    }
}

variable "clusterInfo" {
    type = object({
        name = string
        initial_node = number
        deletion_protection = bool
        networking_mode = string
        release_channel = string
        remove_default_pool = bool
        network_policy = bool
        pod_autoscale = bool
        http_load_balancing = bool
        gcs_fuse_csi_driver_config = bool
        gateway_api_channel = string
        nodepool_config = list(object({
            name = string
            machine_type = string
            initial_node = number
            min_node = number
            max_node = number
            max_pods_per_node = number            
        }))
    })

    default = {
        name = ""
        initial_node = 1
        deletion_protection = false
        networking_mode = "VPC_NATIVE"
        release_channel = "STABLE"
        remove_default_pool = true
        network_policy = true
        pod_autoscale = true
        http_load_balancing = true
        gcs_fuse_csi_driver_config = true
        gateway_api_channel = ""
        nodepool_config = [
        {
            name = "" 
            machine_type = ""
            initial_node = 1
            max_node = 2
            max_pods_per_node = 30
            min_node = 1
        },
        {
            name = ""
            machine_type = ""
            initial_node = 1
            max_node = 5
            max_pods_per_node = 50
            min_node = 1
        }]
     }
}