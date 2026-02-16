"use client";

import { Button } from "@/components/ui/button";
import { Github, MessageSquare, Zap, Shield, Rocket } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider";
import { MockupEmulator } from "@/components/landing/mockup-emulator";

export default function LandingPage() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden selection:bg-green-500/30">
        {/* Navigation */}
        <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-linear-to-b from-white to-white/70">
                ReviewMyPR
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:block"
              >
                Login
              </Link>
              <Link href="/login">
                <Button
                  size="sm"
                  className="rounded-full px-5 bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10"
                >
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 md:pt-48 md:pb-32">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-green-500/10 blur-[120px] rounded-full -z-10 animate-pulse-glow" />

            <div className="max-w-7xl mx-auto flex flex-col items-center text-center px-4 sm:px-6 lg:px-8">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-7xl font-bold tracking-tight text-gradient max-w-4xl leading-[1.1]"
              >
                GitHub Actions meet <br /> WhatsApp productivity.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 text-xl text-muted-foreground max-w-2xl leading-relaxed"
              >
                Streamline your development loop with real-time PR n o
                dnotificationselivered straight to your team on WhatsApp.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-10 flex flex-col sm:flex-row gap-4"
              >
                <Link href="/login">
                  <Button
                    size="lg"
                    className="h-12 px-8 rounded-full text-lg shadow-xl shadow-primary/20"
                  >
                    Get Started for Free
                  </Button>
                </Link>
                <Link href="https://github.com" target="_blank">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="h-12 px-8 rounded-full text-lg border border-white/10 hover:bg-white/5"
                  >
                    <Github className="mr-2 h-5 w-5" /> Star on GitHub
                  </Button>
                </Link>
              </motion.div>

              {/* Hero Emulator */}
              <div className="w-full mt-4">
                <MockupEmulator />
              </div>
            </div>
          </section>

          {/* Value Props Section */}
          <section className="py-24 border-t border-white/5 bg-black/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-3 gap-12">
                {[
                  {
                    title: "Instant Velocity",
                    description:
                      "Get notified the second a PR is opened or merged. No more constant tab-switching.",
                    icon: Zap,
                    color: "text-blue-400",
                    bg: "bg-blue-400/10",
                  },
                  {
                    title: "Team Sync",
                    description:
                      "Engage your team where they already are. WhatsApp groups become your dev pulse.",
                    icon: Rocket,
                    color: "text-purple-400",
                    bg: "bg-purple-400/10",
                  },
                  {
                    title: "Encrypted & Secure",
                    description:
                      "We treat your repository data with bank-grade security and anonymous tokens.",
                    icon: Shield,
                    color: "text-green-400",
                    bg: "bg-green-400/10",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="max-w-7xl mx-auto py-32 px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-[2.5rem] p-12 md:p-24 text-center border border-white/10 glass"
            >
              <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-green-500/20 blur-[100px] rounded-full" />
              <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/10 blur-[100px] rounded-full" />

              <div className="relative z-10 space-y-8">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gradient">
                  Ship faster, together.
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Join hundreds of developers who have optimized their GitHub
                  workflow. Start your journey today.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                  <Link href="/login">
                    <Button
                      size="lg"
                      className="h-14 px-10 rounded-full text-lg shadow-2xl shadow-primary/30"
                    >
                      Get Started Now
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="h-14 px-10 rounded-full text-lg border border-white/10"
                    >
                      Contact Sales
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </section>
        </main>

        <footer className="border-t border-white/5 py-16 bg-black/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12">
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-bold text-lg">
                  <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <span>ReviewMyPR</span>
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  The ultimate bridge between code reviews and instant
                  communication.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40">
                    Product
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <Link
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Features
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Security
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Beta
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40">
                    Company
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <Link
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        About
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Privacy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Terms
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40">
                    Connect
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <Link
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Twitter
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        GitHub
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Discord
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
              <p>© 2024 ReviewMyPR. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="#" className="hover:text-white transition-colors">
                  System Status
                </Link>
                <Link href="#" className="hover:text-white transition-colors">
                  Back to Top
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
