#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

# Accept variables as arguments
NAMESPACE="$1"
APP_NAME="$2"
REPO_NAME="$3"

# Check if arguments are provided
if [ -z "$NAMESPACE" ] || [ -z "$APP_NAME" ] || [ -z "$REPO_NAME" ]; then
  echo "Usage: $0 <namespace> <app_name> <repo_name>"
  exit 1
fi

# Input and temporary output file
template_file="../test-deployment/test-pod.yaml"
temp_file="temp-deployment.yaml"

#Production temp files
prod_file="../test-deployment/prod-pod.yaml"
temp_prod_file="tmp-prod.yaml"


# Check if the template file exists
if [ ! -f "$template_file" ]; then
  echo "Error: Template file '$template_file' not found."
  exit 1
fi


# Check if the template file exists
if [ ! -f "$prod_file" ]; then
  echo "Error: Template file '$prod_file' not found."
  exit 1
fi

# Escape special characters in variables for sed
namespace_escaped=$(printf '%s\n' "$NAMESPACE" | sed 's/[&/\]/\\&/g')
app_name_escaped=$(printf '%s\n' "$APP_NAME" | sed 's/[&/\]/\\&/g')

# Replace placeholders and create a new file
sed "s#\${NAMESPACE}#$namespace_escaped#g; s#\${APP_NAME}#$app_name_escaped#g" "$template_file" > "$temp_file"

# Replace placeholders and create a new file
sed "s#\${NAMESPACE}#$namespace_escaped#g; s#\${APP_NAME}#$app_name_escaped#g" "$prod_file" > "$temp_prod_file"

# Apply the generated YAML file

kubectl create namespace $NAMESPACE --dry-run=client 

# set the config to this namesapce so all commands run under this name space
kubectl config set-context --current --namespace=$NAMESPACE

kubectl apply -f "$temp_file"

kubectl apply -f "$temp_prod_file"

# Delete the temporary file
rm -rf "$temp_file"

rm -rf "$temp_prod_file"

echo "Deployment applied and temporary file deleted."







