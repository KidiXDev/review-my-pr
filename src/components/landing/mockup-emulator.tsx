"use client";

import { motion } from "framer-motion";
import {
  Github,
  MessageSquare,
  Zap,
  Globe,
  Shield,
  Rocket,
} from "lucide-react";

export function MockupEmulator() {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-16 perspective-1000">
      {/* Background Glow */}
      <div className="absolute -inset-4 bg-green-500/10 rounded-3xl blur-3xl opacity-50 animate-pulse-glow" />

      {/* Main Window */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 5 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative glass rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-float"
      >
        {/* Window Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-black/20 border border-white/5 text-[10px] text-muted-foreground w-1/3 justify-center">
            <Globe className="w-3 h-3" />
            <span>review-my-pr.app</span>
          </div>
          <div className="w-12" />
        </div>

        {/* Window Content */}
        <div className="flex h-[400px] md:h-[500px]">
          {/* Sidebar */}
          <div className="w-16 md:w-56 border-r border-white/5 bg-white/2 hidden md:flex flex-col p-4 gap-4">
            <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
            <div className="space-y-3 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="w-6 h-6 rounded bg-white/5" />
                  <div className="h-2 w-1/2 rounded bg-white/5" />
                </div>
              ))}
            </div>
          </div>

          {/* Main Area (Feed) */}
          <div className="flex-1 flex flex-col bg-black/20">
            <div className="flex-1 p-6 space-y-6 overflow-hidden">
              {/* Message 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="flex gap-4 items-start"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                </div>
                <div className="glass-darker p-4 rounded-2xl rounded-tl-none max-w-sm">
                  <p className="text-sm font-medium text-green-400 mb-1">
                    WhatsApp Bot
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs text-foreground/80">
                      New Pull Request in{" "}
                      <span className="text-blue-400">repo/awesome-app</span>
                    </p>
                    <div className="p-2 rounded bg-white/5 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Github className="w-3 h-3" />
                        <span className="text-[10px]">
                          feat: add glowing effects
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        #124
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Message 2 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2 }}
                className="flex gap-4 items-start"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                </div>
                <div className="glass-darker p-4 rounded-2xl rounded-tl-none max-w-sm">
                  <p className="text-sm font-medium text-green-400 mb-1">
                    WhatsApp Bot
                  </p>
                  <p className="text-xs text-foreground/80">
                    ✅ <span className="text-green-400">Success!</span> PR #124
                    has been merged.
                  </p>
                </div>
              </motion.div>

              {/* Message 3 (Typing) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
                className="flex gap-4 items-start"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                </div>
                <div className="glass-darker p-3 rounded-2xl rounded-tl-none flex gap-1 items-center h-8">
                  <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce" />
                  <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce [animation-delay:0.4s]" />
                </div>
              </motion.div>
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-white/5 bg-white/2">
              <div className="flex gap-3">
                <div className="flex-1 h-10 glass-darker rounded-full px-4 flex items-center">
                  <div className="w-1/2 h-2 rounded bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-white/20 animate-typing"
                      style={{ width: "40%" }}
                    />
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating UI Elements */}
      <motion.div
        drag
        dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
        className="absolute -right-8 top-1/4 glass p-4 rounded-xl shadow-xl hidden lg:block cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Zap className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Automation</p>
            <p className="text-xs font-bold">1.2s Delivery</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        drag
        dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
        className="absolute -left-12 bottom-1/4 glass p-4 rounded-xl shadow-xl hidden lg:block cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/20">
            <Shield className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Security</p>
            <p className="text-xs font-bold">End-to-End</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
