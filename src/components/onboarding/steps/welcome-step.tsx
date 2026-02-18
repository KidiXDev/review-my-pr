"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export function WelcomeStep({ onNext }: StepProps) {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6"
      >
        <MessageSquare className="w-10 h-10 text-primary" />
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to ReviewMyPR
        </h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          Get real-time WhatsApp notifications for your GitHub Pull Requests.
          Never miss a review again.
        </p>
      </div>

      <div className="pt-8">
        <Button size="lg" onClick={onNext} className="w-full sm:w-auto group">
          Get Started
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
