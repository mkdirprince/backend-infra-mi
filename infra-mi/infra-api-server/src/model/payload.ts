import { z } from "zod";

export const payloadSchema = z.object({
  repo_url: z.string(),
  project_name: z.string(),
  user: z.string(),
});
