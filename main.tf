terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "devops-rg-test-2"
  location = "Canada Central"
}

resource "azurerm_service_plan" "plan" {
  name                = "devops-plan"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "app" {
  name                = "devops-alum-connect"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.plan.id

  site_config {
    always_on = false
    
application_stack {
      docker_image     = "ankit0903/devops-alum-connect"
      docker_image_tag = "latest"
    }
  }


  app_settings = {
    WEBSITES_PORT                       = "80"
    DOCKER_REGISTRY_SERVER_URL          = "https://index.docker.io"
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
    MONGO_URI                        = "mongodb+srv://asimdevcs:asimaftab786@alumconnectcluster.vdhrv.mongodb.net/AlumConnect?retryWrites=true&w=majority&appName=AlumConnectCluster"
    MONGODB_URI                        = "mongodb+srv://asimdevcs:asimaftab786@alumconnectcluster.vdhrv.mongodb.net/AlumConnect?retryWrites=true&w=majority&appName=AlumConnectCluster"
    DATABASE_URL                       = "mongodb+srv://asimdevcs:asimaftab786@alumconnectcluster.vdhrv.mongodb.net/AlumConnect?retryWrites=true&w=majority&appName=AlumConnectCluster"
  }
}

# Output the default hostname
output "app_service_default_hostname" {
  value = azurerm_linux_web_app.app.default_hostname
}
