"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function StatusCard() {
  const [status, setStatus] = useState<{
    isConnected: boolean;
    isReady: boolean;
    qr: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/qr");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 5 seconds if not connected
    const interval = setInterval(() => {
      fetchStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Connection Status</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchStatus}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <CardDescription>
          Scan QR code to connect your WhatsApp bot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          {status.isConnected ? (
            <Badge variant="default" className="bg-green-600">
              Connected
            </Badge>
          ) : (
            <Badge variant="destructive">Disconnected</Badge>
          )}
        </div>

        {!status.isConnected && status.qr && (
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-white">
            <QRCodeSVG value={status.qr} size={256} />
            <p className="mt-2 text-xs text-muted-foreground text-center text-black">
              Scan with WhatsApp (Linked Devices)
            </p>
          </div>
        )}

        {!status.isConnected && !status.qr && (
          <p className="text-sm text-yellow-500">
            Initializing client... please wait.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
