// import express, { Router } from "express";
// import cors from "cors";
// import { payloadSchema } from "./model/payload";
// import { spawn } from "child_process";
// import path from "path";

// const app = express();
// app.use(cors());
// app.use(express.json());

// const router = Router();

// router.post("/api/infra", (req, res) => {
//   const body = req.body;

//   const payload = payloadSchema.parse(body);

//   if (!payload) {
//     res.status(400).json({ error: "missing or invalid body content" });
//     return;
//   }

//    // Path to git-commands.sh from src directory
//     const scriptPathGit = path.join(__dirname, "./scripts/git-commands.sh");
//     const scriptPathInit = path.join(__dirname, "./scripts/initial-setup.sh");

//     const namespace = `${body.user}-${body.project_name}`;
//     const app_name = `${body.project_name}`;
//     const repo_name = `${body.repo_name}`;

//     // argument
//     const args1: string[] = [namespace, app_name, repo_name];
//     const args2 = [repo_name, namespace];

//     const initialSetup = () => {
//       return new Promise<void>((resolve, reject) => {
//         const child1 = spawn("bash", [scriptPathInit, ...args1]);

//         child1.stdout.on("data", (data) => {
//           console.log(`stdout (init script): ${data}`);
//         });

//         child1.stderr.on("data", (data) => {
//           console.error(`stderr (init script): ${data}`);
//         });

//         child1.on("close", (code) => {
//           if (code === 0) {
//             console.log("First script completed successfully.");
//             resolve();
//           } else {
//             reject(`First script failed with exit code ${code}`);
//           }
//         });
//       });
//     };

//     const gitCommands = () => {
//       return new Promise<void>((resolve, reject) => {
//         const child2 = spawn("bash", [scriptPathGit, ...args2]);

//         child2.stdout.on("data", (data) => {
//           console.log(`stdout (git script): ${data}`);
//         });

//         child2.stderr.on("data", (data) => {
//           console.error(`stderr (git script): ${data}`);
//         });

//         child2.on("close", (code) => {
//           if (code === 0) {
//             console.log("Second script completed successfully.");
//             resolve();
//           } else {
//             reject(`Second script failed with exit code ${code}`);
//           }
//         });
//       });
//     };

//     const runScripts = async () => {
//       try {
//         await initialSetup(); // Run the first script
//         await gitCommands(); // Run the second script after the first one completes
//       } catch (error) {
//         console.error(`Error: ${error}`);
//       }
//     };

//   const { action } = req.body;
//   if (action === "test") {

//     runScripts();

//   // requirement
//   // our app is suppose to have kubectl

//   // chmod all the scripts in the bash folder
//   // bash-script - echo variables into the test pod yaml and apply namespace, app-name, name-repo, --- (url-git)

//   // STEP 1
//   // namespace
//   // test-pod
//   // clone repo if it's already pull chnages
//   // cd into the repo

//   // STEP 2
//   // WE ARE HERE
//   // kubectl exec test-pod
//   // clone repo if it's already pull chnages
//   // // cd into the repo
//   // // run test
//   // inside test pod - Victor's script

//   res.json({ status: "deployment start with passed data", data: payload });
// });

// app.use("/", router);

// const PORT = 3001;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // const commands = `bash ${scriptPathInit} ${args1.join(
// //       " "
// //     )} && bash ${scriptPathGit} ${args2.join(" ")}`;

// //     // Spawn a child process to run the script
// //     const child = spawn("bash", ["-c", commands]);

// //     // Handle streaming the logs to the console
// //     child.stdout.on("data", (data) => {
// //       console.log(`stdout: ${data}`);
// //     });

// //     child.stderr.on("data", (data) => {
// //       console.error(`stderr: ${data}`);
// //     });

// //     child.on("close", (code) => {
// //       console.log(`Child process exited with code ${code}`);
// //     });

// //     child.on("error", (err) => {
// //       console.error("Failed to start subprocess:", err);
// //     });
// //   } else {
// //     console.error("Invalid action");
// //   }

import express, { Router } from "express";
import cors from "cors";
import path from "path";
import { spawn } from "child_process";
import { payloadSchema } from "./model/payload";
const { execSync } = require("child_process");

const app = express();
const router = Router();

// Middlewares
app.use(cors());
app.use(express.json());

// Paths to the shell scripts
const scriptPathGit = path.join(__dirname, "./scripts/git-commands.sh");
const scriptPathInit = path.join(__dirname, "./scripts/initial-setup.sh");
const scriptPathProd = path.join(__dirname, "./scripts/prod-git-commands.sh");

// Helper function to spawn a child process
const runScript = (scriptPath: string, args: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const child = spawn("bash", [scriptPath, ...args]);

    child.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(`Script failed with exit code ${code}`);
      }
    });
  });
};

// Run initial setup script
const initialSetup = (
  namespace: string,
  app_name: string,
  repo_name: string
) => {
  const args = [namespace, app_name, repo_name];
  return runScript(scriptPathInit, args);
};

//run deploy
const runDeploy = (repo_name: string, namespace: string) => {
  const args = [repo_name, namespace];
  return runScript(scriptPathProd, args);
};

// Run Git commands script
const gitCommands = (repo_name: string, namespace: string) => {
  const args = [repo_name, namespace];
  return runScript(scriptPathGit, args);
};

// POST /api/infra handler
router.post("/api/infra", async (req, res) => {
  const body = req.body;

  // Validate the request body using payloadSchema
  const payload = payloadSchema.parse(body);

  if (!payload) {
    res.status(400).json({ error: "Missing or invalid body content" });
    return;
  }

  // Prepare arguments
  const namespace = `${body.user}-${body.project_name}`;
  const app_name = body.project_name;
  const repo_name = body.repo_name;

  // Check the action type in the body
  const { action } = req.body;

  if (action === "test") {
    // Respond with success message
    res.json({
      status: "Deployment started with passed data",
      data: payload,
    });

    try {
      // Run the initial setup script, then the git commands script sequentially
      console.log("Starting initial setup script...");
      await initialSetup(namespace, app_name, repo_name);

      console.log("Starting git commands script...");
      await gitCommands(repo_name, namespace);
    } catch (error) {
      console.error("Error executing scripts:", error);
    }
  } else if (action === "deploy") {
    try {
      console.log("Deploying app....");
      await runDeploy(repo_name, namespace);

      const url = execSync(`minikube service ${app_name}-service --url`, {
        encoding: "utf-8",
      });

      res.json({ message: "App deployed", url: url });
    } catch (error) {
      console.error("Error executing scripts:", error);
      res.status(500).json({ error: "internal server error" });
    }
  } else {
    res.status(400).json({ error: "Invalid action" });
    return;
  }
});

// Use the router in the app
app.use("/", router);

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
