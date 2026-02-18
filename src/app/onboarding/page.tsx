import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome to ReviewMyPR",
  description: "Set up your account to start receiving notifications.",
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
