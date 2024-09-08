variable "projectInfo"{
    type = object({
        project = string
        region = string
    })
    
    default = {
        project = "apps-project-3108449"
        region = "asia-southeast1"
    }
}

variable "serviceAccountInfo" {
    type = object({
        id =  string        
    })

    default = {
        id =  "test-terra-sa"
    }
}

variable "networkInfo" {
    type = object({
        name =  string
        subnet = string
    })

    default = {
        name =  "test-terra-vpc"
        subnet = "test-terra-gke-subnet"
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
        name = "test-terra-cluster"
        initial_node = 1
        deletion_protection = false
        networking_mode = "VPC_NATIVE"
        release_channel = "STABLE"
        remove_default_pool = true
        network_policy = true
        pod_autoscale = true
        nodepool_config = [
        {
            name = "system-pool"            
            machine_type = "e2-medium"
            initial_node = 1
            max_node = 2
            max_pods_per_node = 30
            min_node = 1
        },
        {
            name = "worker-pool"
            machine_type = "n2d-standard-2"
            initial_node = 1
            max_node = 5
            max_pods_per_node = 50
            min_node = 1
        }]
     }
}