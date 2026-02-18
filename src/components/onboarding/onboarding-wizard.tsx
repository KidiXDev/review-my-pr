"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WelcomeStep } from "./steps/welcome-step";
import { ConnectStep } from "./steps/connect-step";
import { PreferencesStep } from "./steps/preferences-step";
import { CompletionStep } from "./steps/completion-step";
import { cn } from "@/lib/utils";

export const steps = [
  { id: "welcome", component: WelcomeStep },
  { id: "connect", component: ConnectStep },
  { id: "preferences", component: PreferencesStep },
  { id: "completion", component: CompletionStep },
];

export function OnboardingWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setDirection(1);
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const CurrentStepComponent = steps[currentStepIndex].component;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] pointer-events-none" />

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-8 px-4 z-10">
        <div className="flex gap-2 mb-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-500",
                index <= currentStepIndex ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-right">
          Step {currentStepIndex + 1} of {steps.length}
        </p>
      </div>

      <div className="w-full max-w-2xl px-4 z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStepIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="bg-card border border-border rounded-2xl shadow-2xl p-6 md:p-10 backdrop-blur-sm bg-opacity-95"
          >
            <CurrentStepComponent onNext={nextStep} onBack={prevStep} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
