"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { api } from "@/lib/api-client";

interface UserSettings {
  theme: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  isGoogleUser: boolean;
}

interface SettingsResponse {
  user: UserInfo;
  settings: UserSettings;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Fetch settings using react-query and axios
  const { data, isLoading, error } = useQuery<SettingsResponse>({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const response = await api.get("/user/settings");
      return response.data;
    },
  });

  // Update profile and settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedData: {
      name?: string;
      emailNotifications?: boolean;
      pushNotifications?: boolean;
    }) => {
      const response = await api.patch("/user/settings", updatedData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      toast.success("Settings updated successfully");
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        toast.error(
          (error as AxiosError<{ error: string }>).response?.data?.error ||
            "Failed to update settings",
        );
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error(error);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.changePassword({
        newPassword: newPassword,
        currentPassword: currentPassword,
        revokeOtherSessions: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to change password";
      toast.error(message);
      console.error(error);
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
        <p className="text-destructive font-medium">Failed to load settings</p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["user-settings"] })
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  const user = data?.user;
  const settings = data?.settings;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    updateSettingsMutation.mutate({ name });
  };

  const handleToggleNotification = (
    type: "email" | "push",
    checked: boolean,
  ) => {
    updateSettingsMutation.mutate({
      [type === "email" ? "emailNotifications" : "pushNotifications"]: checked,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          {!user?.isGoogleUser && (
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Profile Information</h3>
                <p className="text-sm text-muted-foreground">
                  Update your personal details and how others see you.
                </p>
              </div>
              <div className="grid gap-4 max-w-xl">
                <div className="grid gap-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    defaultValue={user?.name}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Email address cannot be changed.
                  </p>
                </div>
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {updateSettingsMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">
                  Notification Preferences
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose how you want to be notified about activity.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about your repositories via email.
                    </p>
                  </div>
                  <Switch
                    checked={settings?.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleToggleNotification("email", checked)
                    }
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="space-y-0.5">
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive real-time alerts in your browser.
                    </p>
                  </div>
                  <Switch
                    checked={settings?.pushNotifications}
                    onCheckedChange={(checked) =>
                      handleToggleNotification("push", checked)
                    }
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {!user?.isGoogleUser && (
          <TabsContent value="security" className="space-y-4">
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Security Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your account security and authentication.
                  </p>
                </div>
                <div className="space-y-4 max-w-xl">
                  <div className="grid gap-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={() => changePasswordMutation.mutate()}
                      disabled={changePasswordMutation.isPending}
                      variant="outline"
                      className="border-white/10 hover:bg-white/5"
                    >
                      {changePasswordMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update Password
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
