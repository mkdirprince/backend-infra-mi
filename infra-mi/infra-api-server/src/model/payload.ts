import { z } from "zod";

export const payloadSchema = z.object({
  repo_name: z.string(),
  project_name: z.string(),
  user: z.string(),
  action: z.string(),
});
