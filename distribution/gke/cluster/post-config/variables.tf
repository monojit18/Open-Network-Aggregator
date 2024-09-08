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

variable "sslCertInfo" {
    type = object({
        name = string
        domains = list(string)
    })

    default = {
        name = "test-terra-glb-lb-cert-03012024"
        domains = ["test-terra.gcpwkshpdev.com"]
     }
}

variable lbipInfo {
    type = object({
        name = string
    })

    default = {
        name = "test-terra-glb-lb-ip"
    }
}

variable "negInfo" {
    type = object({
        name = string
    })

    default = {
        name = "test-terra-ingress-nginx-80-neg"
     }
}

variable "negZoneInfo" {
    type = list(string)

    default = ["asia-southeast1-a", "asia-southeast1-b", "asia-southeast1-c"]
}

variable "bkendInfo" {
    type = object({
        name = string
        enable_cdn = bool
    })

    default = {
        name = "test-terra-bkend-service"
        enable_cdn = false
     }
}

variable "hcInfo" {
    type = object({
        name = string
        request_path = string
        port = number
        checkInterval = number
        timeout = number
    })

    default = {
        name = "test-terra-hcinfo"
        request_path = "/healthz"
        port = 10254
        checkInterval = 5
        timeout = 1
     }
}

variable "urlMapInfo" {
    type = object({
        name = string
        host_rules = list(object({
            hosts = list(string)
            path_matcher = string
        }))
        path_matchers = list(object({
            name = string
            path_rules = list(object({
                paths = list(string)                
            }))
        }))
    })

    default = {
        name = "test-terra-url-map"
        host_rules = [
        {
            hosts = ["test-terra.gcpwkshpdev.com"]
            path_matcher = "default"
        }]
        path_matchers = [
        {
            name = "default"
            path_rules = [
            {
                paths = ["/*"]
            }]
        }]
     }
}

variable "proxyInfo" {
    type = object({
        name = string
    })

    default = {
        name = "test-terra-https-proxy"
     }
}

variable "fwdRuleInfo" {
    type = object({
        name = string
    })

    default = {
        name = "test-terra-fwd-rule"
     }
}
