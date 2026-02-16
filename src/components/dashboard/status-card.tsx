"use client";

import { useWhatsAppStatus } from "@/hooks/use-whatsapp";
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
  const { data: status, isLoading, refetch, isFetching } = useWhatsAppStatus();

  if (isLoading || !status) {
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

  const isConnected = status.isConnected;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Connection Status</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
        <CardDescription>
          Scan QR code to connect your WhatsApp bot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          {isConnected ? (
            <Badge variant="default" className="bg-green-600">
              Connected
            </Badge>
          ) : (
            <Badge variant="destructive">Disconnected</Badge>
          )}
        </div>

        {!isConnected && status.qr && (
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-white">
            <QRCodeSVG value={status.qr} size={256} />
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Scan with WhatsApp (Linked Devices)
            </p>
          </div>
        )}

        {!isConnected && !status.qr && (
          <p className="text-sm text-yellow-500">
            Initializing client... please wait.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
