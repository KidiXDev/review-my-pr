import z from "zod";
export const repoSettingsSchema = z.object({
  allowedEvents: z
    .array(z.string())
    .nonempty("Please select at least one event"),
  groupIds: z.array(z.string()).nonempty("Please select at least one group"),
  messageTemplate: z
    .string()
    .max(500, "Message template must not be longer than 500 characters.")
    .nonempty("Message template cannot be empty"),
});

export type RepoSettingsFormValues = z.infer<typeof repoSettingsSchema>;
