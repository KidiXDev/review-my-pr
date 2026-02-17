"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface IntegrationGuideDialogProps {
  repo: {
    repoName: string;
    apiToken: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntegrationGuideDialog({
  repo,
  open,
  onOpenChange,
}: IntegrationGuideDialogProps) {
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const webhookUrl = `${origin}/api/notify/github?token=${repo.apiToken}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const curlCommand = `curl -X POST "${origin}/api/notify/github" \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "${repo.apiToken}",
    "event": "pr_opened",
    "repo": "${repo.repoName}",
    "title": "New PR: Feature X",
    "author": "dev-user",
    "url": "https://github.com/${repo.repoName}/pull/1"
  }'`;

  const webhookPayload = `{
  "event": "custom_event",
  "repo": "${repo.repoName}",
  "title": "Deployment Successful",
  "author": "CI/CD",
  "url": "https://ci.example.com/build/123"
}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Integration Guide</DialogTitle>
          <DialogDescription>
            Choose from multiple integration methods: GitHub Webhooks, generic
            Webhooks, or Curl API calls for <strong>{repo.repoName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="github" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="github">GitHub Webhook</TabsTrigger>
            <TabsTrigger value="webhook">Generic Webhook</TabsTrigger>
            <TabsTrigger value="curl">Curl / API</TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="space-y-4 py-4">
            <div className="space-y-4 text-sm">
              <p>
                To receive realtime updates from GitHub, add a webhook to your
                repository:
              </p>
              <ol className="list-decimal pl-4 space-y-2 text-muted-foreground">
                <li>
                  Go to{" "}
                  <a
                    href={`https://github.com/${repo.repoName}/settings/hooks/new`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    Repository Settings &gt; Webhooks &gt; Add webhook
                  </a>
                </li>
                <li>
                  Set <strong>Payload URL</strong> to:
                  <div className="mt-2 flex items-center space-x-2">
                    <code className="relative rounded bg-muted px-2 py-[0.3rem] font-mono text-xs flex-1 break-all">
                      {webhookUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => copyToClipboard(webhookUrl)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </li>
                <li>
                  Set <strong>Content type</strong> to{" "}
                  <code>application/json</code>.
                </li>
                <li>
                  Select <strong>Let me select individual events</strong>, then
                  choose the events you want to use as triggers. For example,
                  you can enable:
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Pull requests</li>
                    <li>Issues</li>
                    <li>Pushes</li>
                    <li>Workflow runs (optional)</li>
                  </ul>
                </li>
                <li>
                  Click <strong>Add webhook</strong>.
                </li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="webhook" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Webhook URL</h4>
                <div className="flex items-center space-x-2">
                  <code className="relative rounded bg-muted px-2 py-[0.3rem] font-mono text-xs flex-1 break-all">
                    {webhookUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => copyToClipboard(webhookUrl)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Sample JSON Payload</h4>
                <div className="relative rounded-md bg-muted p-4">
                  <pre className="text-xs font-mono overflow-auto">
                    {webhookPayload}
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6"
                    onClick={() => copyToClipboard(webhookPayload)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="curl" className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Curl Command</h4>
              <div className="relative rounded-md bg-muted p-4">
                <pre className="text-xs font-mono overflow-auto whitespace-pre-wrap break-all">
                  {curlCommand}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6"
                  onClick={() => copyToClipboard(curlCommand)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
