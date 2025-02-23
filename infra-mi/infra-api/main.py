from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import json
import os
import pathlib

app = FastAPI()

# Define the schema for the payload
class Payload(BaseModel):
    action: str
    repo_name: str
    project_name: str
    user: str

@app.post("/api/infra")
async def infra(payload: Payload):
    # Validate the payload
    if not payload:
        raise HTTPException(status_code=400, detail="Missing or invalid body content")

    # Action to be executed
    if payload.action == "test":
        try:
            # Execute the script with proper arguments
            subprocess.run(
                ['../../../scripts/git-commands', payload.repo_name, payload.project_name],
                check=True
            )
            return {"message": "Script triggered successfully!"}
        except subprocess.CalledProcessError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to execute script: {str(e)}"
            )
    elif payload.action == "deploy":
        # Implement your deployment logic here
        pass
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid action specified"
        )

    # Returning the payload data for reference
    return {"status": "deployment started with passed data", "data": payload.dict()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
