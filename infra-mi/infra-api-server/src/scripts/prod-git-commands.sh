#!/bin/bash

# Configuration
# GITEA_URL="http://44.204.172.122"  
# USERNAME="backend.mi"
REPO_NAME="$1"
NAMESPACE="$2"
# COMMIT_MESSAGE="$3"
WORKDIR="/Users/wilson/tech_journey/HNG_internship/backend_mi_infra/infra-mi"

if [ -z "$REPO_NAME" ] || [ -z "$NAMESPACE" ]; then
  echo "Usage: $0 <repo_name> <namespace> "
  exit 1
fi

# Get the pod name
POD_NAME=$(kubectl get pods -n $NAMESPACE --no-headers -o custom-columns=":metadata.name" | grep "^prod-deployment")

# Check if a pod matching the pattern was found
if [[ -n "$POD_NAME" ]]; then
    echo "Waiting for pod $POD_NAME to be ready..."

    # Wait for the pod to be in Ready condition (max timeout 180s)
    if kubectl wait --for=condition=Ready pod/"$POD_NAME" -n $NAMESPACE --timeout=180s; then

  
      kubectl exec -it "$POD_NAME" -n "$NAMESPACE" -- bash -c '
       REPO_NAME="'$REPO_NAME'";
        if [ -d "$REPO_NAME" ]; then
          echo "Repository exists. Pulling latest changes...";
          cd "$REPO_NAME" && git pull;
        else
          echo "Cloning repository...";
          git clone "http://44.204.172.122/backend.mi/$REPO_NAME";

        fi'

      kubectl exec -it $POD_NAME -n $NAMESPACE -- bash -c "
       REPO_NAME='$REPO_NAME'
       cd \$REPO_NAME
       pip install -r requirements.txt --only-binary=:all:
       uvicorn main:app
      "


      # kubectl exec -it  $POD_NAME -n $NAMESPACE -- bash -c "REPO_NAME="'$REPO_NAME'";  cd $REPO_NAME && pip install -r requirements.txt --only-binary=:all:
      # && pytest"
        


      # kubectl exec -it $POD_NAME -n $NAMESPACE -- bash -c "git clone http://44.204.172.122/backend.mi/$REPO_NAME && ls"

      # kubectl exec -it $POD_NAME -n $NAMESPACE -- bash -c "cd /tmp && ./pod-commands.sh $REPO_NAME"

      # echo $POD_NAME $NAMESPACE
    
      # kubectl exec -it  $POD_NAME -n $NAMESPACE -- bash -c "ls"
        
    else
        echo "Pod $POD_NAME did not become ready within the timeout."
        exit 1
    fi
else
    echo "No pod found matching prod-deployment pattern."
    exit 1
fi


#1
# get the pod in the namespace
# and check if the pod is running - ready is 1/1




# POD_NAME=kubectl get pods -n test-app --no-headers -o custom-columns=":metadata.name" | grep "^test-deployment"

# pod/test-deployment-5cc579c457-j74jz condition met


# kubectl wait --for=condition=Ready pod $POD_NAME --timeout=180s

# kubectl wait --for=condition=Ready pod test-deployment-5cc579c457-j74jz --timeout=180s

# pod/test-deployment-5cc579c457-j74jz condition met


# setting up WORKDIR for our dockerfile
# kubectl cp /Users/wilson/tech_journey/HNG_internbaship/backend_mi_infra/infra-mi/scripts/pod-commands.sh test-deployment-5cc579c457-j74jz:/tmp/pod-commands.sh -n test-app
# kubectl exec -it test-deployment-5cc579c457-j74jz -n test-app -- sh -c "cd /tmp && ./pod-commands.sh test-app"

# kubectl exec -it test-deployment-5cc579c457-j74jz -n test-app -- sh -c "cd test-app && ls"

# kubectl exec -it test-deployment-5cc579c457-j74jz -n test-app -- -sh -c  "tmp/pod-commands.sh test-app"




# kubectl delete daemonset fluentd -n kube-system
# kubectl delete configmap fluentd-config -n kube-system
# kubectl delete serviceaccount fluentd -n kube-system
# kubectl delete clusterrole fluentd-clusterrole
# kubectl delete clusterrolebinding fluentd-clusterrolebinding



 # <match kubernetes.**>
 #      @type websocket
 #      host 172.20.10.4
 #      port 4000
 #      ssl false
 #      reconnect_interval 5s
 # </match>
