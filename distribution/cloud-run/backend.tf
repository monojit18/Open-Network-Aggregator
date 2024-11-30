terraform {
  backend "gcs" {
    bucket = "onix-agentic-151120240130-terra-stg"
    prefix = ""
  }
}