"use client";

import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Book,
  MessageCircle,
  ExternalLink,
  Github,
} from "lucide-react";

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I connect a new GitHub repository?",
      answer:
        "Navigate to the Repositories page and click 'Add Repository'. You'll need to provide your GitHub personal access token and the repository name (owner/repo).",
    },
    {
      question: "How do I configure WhatsApp notifications?",
      answer:
        "Go to the Dashboard and connect your WhatsApp account using the QR code. Once connected, you can assign WhatsApp groups to specific repositories in the Repositories settings.",
    },
    {
      question: "What events can I be notified about?",
      answer:
        "We support notifications for Pull Request openings, merges, closing, and CI/CD status changes (when configured via webhooks).",
    },
    {
      question: "Is my GitHub token safe?",
      answer:
        "Yes, your tokens are encrypted and stored securely. We only use them to fetch repository information and set up webhooks as requested.",
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-xl text-muted-foreground">
          Everything you need to know about ReviewMyPR.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 bg-white/5 border-white/10 flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <Book className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Documentation</h3>
            <p className="text-sm text-muted-foreground">
              Read our detailed guides and tutorials.
            </p>
          </div>
          <Button variant="link" className="text-primary gap-1 p-0 mt-auto">
            Browse Docs <ExternalLink className="h-3 w-3" />
          </Button>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10 flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Discussions</h3>
            <p className="text-sm text-muted-foreground">
              Contribute to the project and discuss ideas.
            </p>
          </div>
          <Button
            onClick={() =>
              window.open(
                "https://github.com/KidiXDev/review-my-pr/discussions",
                "_blank",
              )
            }
            variant="link"
            className="text-blue-400 gap-1 p-0 mt-auto"
          >
            Join Discussions <ExternalLink className="h-3 w-3" />
          </Button>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10 flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
            <Github className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Source Code</h3>
            <p className="text-sm text-muted-foreground">
              Report issues or contribute on GitHub.
            </p>
          </div>
          <Button
            onClick={() =>
              window.open("https://github.com/KidiXDev/review-my-pr", "_blank")
            }
            variant="link"
            className="text-white gap-1 p-0 mt-auto"
          >
            View Repo <ExternalLink className="h-3 w-3" />
          </Button>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2 px-1">
          <HelpCircle className="h-5 w-5 text-primary" />
          Frequently Asked Questions
        </h2>
        <Card className="bg-white/5 border-white/10 overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-white/10 px-6"
              >
                <AccordionTrigger className="hover:text-primary transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>

      <div className="p-8 rounded-2xl bg-linear-to-br from-primary/10 via-background to-background border border-primary/20 text-center space-y-4 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
        <h3 className="text-xl font-semibold">Still need help?</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Can&apos;t find the answer you&apos;re looking for? Please contact our
          support team or reach out on our community channels.
        </p>
        <div className="flex justify-center gap-4">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
