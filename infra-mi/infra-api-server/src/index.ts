import express, { Router } from "express";
import cors from "cors";
import { payloadSchema } from "./model/payload";

const app = express();
app.use(cors());
app.use(express.json());

const router = Router();

router.post("/api/infra", (req, res) => {
  const body = req.body;

  const payload = payloadSchema.parse(body);

  if (!payload) {
    res.status(400).json({ error: "missing or invalid body content" });
    return;
  }

  // requirement
  // our app is suppose to have kubectl

  // chmod all the scripts in the bash folder
  // bash-script - echo variables into the test pod yaml and apply namespace, app-name, name-repo, --- (url-git)

  // STEP 1
  // namespace
  // test-pod
  // clone repo if it's already pull chnages
  // cd into the repo

  // STEP 2
  // WE ARE HERE
  // kubectl exec test-pod
  // clone repo if it's already pull chnages
  // // cd into the repo
  // // run test
  // inside test pod - Victor's script

  res.json({ status: "deployment start with passed data", data: payload });
});

app.use("/", router);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
