"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Github,
  MessageSquare,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider";

export default function LandingPage() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2 font-bold text-xl">
              <MessageSquare className="h-6 w-6 text-green-500" />
              <span>WhatsApp Bot</span>
            </div>
            <nav className="flex gap-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/login">
                <Button>Get Started</Button>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 pt-16">
          {/* Hero Section */}
          <section className="container mx-auto px-4 md:px-6 py-24 md:py-32 flex flex-col items-center text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 max-w-3xl"
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                Automate GitHub Notifications to WhatsApp
              </h1>
              <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
                Get real-time updates for Pull Requests, Issues, and Deployments
                directly in your WhatsApp groups. Never miss a critical update
                again.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex gap-4"
            >
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-lg">
                  Start for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="https://github.com" target="_blank">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-lg"
                >
                  <Github className="mr-2 h-5 w-5" /> Star on GitHub
                </Button>
              </Link>
            </motion.div>

            {/* Hero Image / Placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="w-full max-w-5xl mt-12 rounded-xl border bg-card p-4 shadow-2xl"
            >
              <div className="aspect-video rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                <div className="z-10 text-center p-8">
                  <div className="inline-flex items-center justify-center p-4 rounded-full bg-green-500/10 border border-green-500/20 mb-4 animate-pulse">
                    <Zap className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    Real-time Delivery
                  </h3>
                  <p className="text-muted-foreground">
                    Instant notifications from GitHub Actions to your phone.
                  </p>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Features Section */}
          <section className="bg-muted/50 py-24">
            <div className="container mx-auto px-4 md:px-6">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Instant Alerts",
                    description:
                      "Receive notifications immediately when a PR is opened, merged, or reviewed.",
                    icon: Zap,
                  },
                  {
                    title: "Group Management",
                    description:
                      "Easily manage which WhatsApp groups receive notifications for specific repositories.",
                    icon: MessageSquare,
                  },
                  {
                    title: "Secure & Private",
                    description:
                      "We use secure generic API tokens. Your personal data stays private.",
                    icon: CheckCircle2,
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-start p-6 rounded-lg border bg-background shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-3 rounded-lg bg-primary/10 mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="container mx-auto px-4 md:px-6 py-24 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto space-y-6 p-12 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 border border-white/10"
            >
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to streamline your workflow?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of developers who are staying updated with their
                team&apos;s progress.
              </p>
              <Link href="/login">
                <Button size="lg" className="mt-4">
                  Get Started Now
                </Button>
              </Link>
            </motion.div>
          </section>
        </main>

        <footer className="border-t py-8 bg-muted/20">
          <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 font-semibold">
              <MessageSquare className="h-5 w-5" />
              <span>WhatsApp Bot</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 WhatsApp Bot. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="#" className="hover:underline">
                Privacy
              </Link>
              <Link href="#" className="hover:underline">
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
