import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState as baileysAuthState,
  makeCacheableSignalKeyStore,
  type WASocket,
  type ConnectionState,
  type UserFacingSocketConfig,
  type GroupMetadata,
  type AuthenticationState,
} from "@whiskeysockets/baileys";
import pino from "pino";
import { Boom } from "@hapi/boom";
import fs from "fs";
import path from "path";

export class WhatsAppClient {
  private socket: WASocket | null = null;
  private qrCode: string | null = null;
  private isConnected: boolean = false;
  private isReady: boolean = false;
  private authState: AuthenticationState | null = null;
  private saveCreds: (() => Promise<void>) | null = null;
  private userId: string;
  private authDir: string;

  constructor(userId: string) {
    this.userId = userId;
    this.authDir = path.join(process.cwd(), ".baileys_auth", userId);
    this.initialize();
  }

  private async initialize() {
    console.log(`Initializing WhatsApp Client for user ${this.userId}...`);

    // Ensure auth directory exists
    if (!fs.existsSync(this.authDir)) {
      fs.mkdirSync(this.authDir, { recursive: true });
    }

    try {
      const { state, saveCreds } = await baileysAuthState(this.authDir);
      this.authState = state;
      this.saveCreds = saveCreds;

      this.connectToWhatsApp();
    } catch (error) {
      console.error(
        `Failed to initialize auth state for user ${this.userId}:`,
        error,
      );
    }
  }

  private async connectToWhatsApp() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logger: any = pino({ level: "silent" });

    if (!this.authState || !this.saveCreds) {
      console.error(`Auth state not initialized for user ${this.userId}`);
      return;
    }

    const config: UserFacingSocketConfig = {
      logger,
      auth: {
        creds: this.authState.creds,
        keys: makeCacheableSignalKeyStore(this.authState.keys, logger),
      },
      generateHighQualityLinkPreview: true,
    };

    this.socket = makeWASocket(config);

    if (!this.socket) {
      console.error(`Failed to create socket for user ${this.userId}`);
      return;
    }

    this.socket.ev.on("creds.update", this.saveCreds);

    this.socket.ev.on(
      "connection.update",
      (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          console.log(`QR Code received for user ${this.userId}`);
          this.qrCode = qr;
        }

        if (connection === "close") {
          const error = lastDisconnect?.error as Boom | undefined;
          const shouldReconnect =
            error?.output?.statusCode !== DisconnectReason.loggedOut;

          console.log(
            `Connection closed for user ${this.userId} due to `,
            error,
            ", reconnecting ",
            shouldReconnect,
          );
          this.isConnected = false;
          this.isReady = false;
          // reconnect if not logged out
          if (shouldReconnect) {
            this.connectToWhatsApp();
          }
        } else if (connection === "open") {
          console.log(`Opened connection for user ${this.userId}`);
          this.isConnected = true;
          this.isReady = true;
          this.qrCode = null;

          // Trigger internal notification for the user
          import("@/actions/notifications").then(
            async ({ triggerNotification }) => {
              try {
                await triggerNotification(this.userId, {
                  type: "whatsapp:connected",
                  title: "WhatsApp Connected",
                  message: "Your WhatsApp session is now active and ready.",
                });
              } catch (err) {
                console.error(
                  `Failed to notify user ${this.userId} about WA connection:`,
                  err,
                );
              }
            },
          );
        }
      },
    );
  }

  public getClient() {
    return this.socket;
  }

  public getLatestQR() {
    return this.qrCode;
  }

  public getStatus() {
    return {
      isConnected: this.isConnected,
      isReady: this.isReady && !!this.socket,
    };
  }

  public async getAllGroups(): Promise<GroupMetadata[]> {
    if (!this.socket) {
      throw new Error("WhatsApp client is not initialized");
    }

    // In Baileys, we fetch all groups using groupFetchAllParticipating
    const groups = await this.socket.groupFetchAllParticipating();
    return Object.values(groups);
  }

  public async sendGroupMessage(groupId: string, message: string) {
    if (!this.socket) {
      throw new Error("WhatsApp client is not initialized");
    }

    try {
      await this.socket.sendMessage(groupId, { text: message });
      return true;
    } catch (error) {
      console.error(
        `Failed to send message to group ${groupId} for user ${this.userId}:`,
        error,
      );
      throw error;
    }
  }

  public async destroy() {
    if (this.socket) {
      this.socket.end(undefined);
      this.socket = null;
    }
  }
}
