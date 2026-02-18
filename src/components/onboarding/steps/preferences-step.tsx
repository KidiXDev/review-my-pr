"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export function PreferencesStep({ onNext, onBack }: StepProps) {
  const [preferences, setPreferences] = useState({
    prOpened: true,
    prMerged: true,
    reviews: true,
    comments: false,
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Notification Preferences</h2>
        <p className="text-muted-foreground">
          Choose what you want to be notified about. You can change this later.
        </p>
      </div>

      <div className="space-y-4 pt-4 max-w-md mx-auto">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
          <div className="space-y-0.5">
            <Label className="text-base">PR Opened</Label>
            <p className="text-xs text-muted-foreground">
              When a new pull request is created
            </p>
          </div>
          <Switch
            checked={preferences.prOpened}
            onCheckedChange={(c) =>
              setPreferences((p) => ({ ...p, prOpened: c }))
            }
          />
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
          <div className="space-y-0.5">
            <Label className="text-base">PR Merged</Label>
            <p className="text-xs text-muted-foreground">
              When a pull request is merged
            </p>
          </div>
          <Switch
            checked={preferences.prMerged}
            onCheckedChange={(c) =>
              setPreferences((p) => ({ ...p, prMerged: c }))
            }
          />
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
          <div className="space-y-0.5">
            <Label className="text-base">Reviews</Label>
            <p className="text-xs text-muted-foreground">
              When someone requests a review or approves
            </p>
          </div>
          <Switch
            checked={preferences.reviews}
            onCheckedChange={(c) =>
              setPreferences((p) => ({ ...p, reviews: c }))
            }
          />
        </div>
      </div>

      <div className="pt-8 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} className="group">
          Continue
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
