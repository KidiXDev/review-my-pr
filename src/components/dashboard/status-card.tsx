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
import { Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function StatusCard() {
  const { data: status, isLoading, refetch, isFetching } = useWhatsAppStatus();

  if (isLoading || !status) {
    return (
      <Card className="h-full border-white/5 bg-white/5 backdrop-blur-md flex flex-col justify-center items-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">
          Checking WhatsApp status...
        </p>
      </Card>
    );
  }

  const isConnected = status.isConnected;

  return (
    <Card className="h-full border-white/5 bg-white/5 backdrop-blur-md flex flex-col overflow-hidden relative group">
      {isConnected && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_var(--color-emerald-500)] z-20" />
      )}
      {!isConnected && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-500 shadow-[0_0_10px_var(--color-amber-500)] z-20" />
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            WhatsApp Status
            {isConnected ? (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              >
                Online
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-500 border-amber-500/20"
              >
                Offline
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
        <CardDescription>
          {isConnected
            ? "Bot is active and ready to send messages."
            : "Scan the QR code to connect your session."}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center p-6 min-h-[300px]">
        {!isConnected && status.qr ? (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative group/qr p-4 bg-white rounded-xl shadow-2xl">
              <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl opacity-50 group-hover/qr:opacity-100 transition-opacity" />
              <div className="relative bg-white p-2 rounded-lg">
                <QRCodeSVG value={status.qr} size={200} level="H" />
              </div>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium text-foreground">
                Scan with WhatsApp
              </p>
              <p className="text-xs text-muted-foreground">
                Settings {">"} Linked Devices {">"} Link a Device
              </p>
            </div>
          </div>
        ) : !isConnected && !status.qr ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center animate-pulse">
              <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              Initializing connection...
              <br />
              Please wait for QR code.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20 shadow-[0_0_20px_var(--color-emerald-500)]">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <p className="font-medium">Everything looks good!</p>
              <p className="text-sm text-muted-foreground">
                Your WhatsApp session is active.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
