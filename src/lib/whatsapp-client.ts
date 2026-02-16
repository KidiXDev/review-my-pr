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

declare global {
  var whatsappClient: WhatsAppClient | undefined;
}

class WhatsAppClient {
  private socket: WASocket | null = null;
  private qrCode: string | null = null;
  private isConnected: boolean = false;
  private isReady: boolean = false;
  private authState: AuthenticationState | null = null;
  private saveCreds: (() => Promise<void>) | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    console.log("Initializing WhatsApp Client with Baileys...");

    try {
      const { state, saveCreds } = await baileysAuthState("./.baileys_auth");
      this.authState = state;
      this.saveCreds = saveCreds;

      this.connectToWhatsApp();
    } catch (error) {
      console.error("Failed to initialize auth state:", error);
    }
  }

  private async connectToWhatsApp() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logger: any = pino({ level: "silent" });

    if (!this.authState || !this.saveCreds) {
      console.error("Auth state not initialized");
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
      console.error("Failed to create socket");
      return;
    }

    this.socket.ev.on("creds.update", this.saveCreds);

    this.socket.ev.on(
      "connection.update",
      (update: Partial<ConnectionState>) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          console.log("QR Code received");
          this.qrCode = qr;
        }

        if (connection === "close") {
          const error = lastDisconnect?.error as Boom | undefined;
          const shouldReconnect =
            error?.output?.statusCode !== DisconnectReason.loggedOut;

          console.log(
            "connection closed due to ",
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
          console.log("opened connection");
          this.isConnected = true;
          this.isReady = true;
          this.qrCode = null;
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
      console.error(`Failed to send message to group ${groupId}:`, error);
      throw error;
    }
  }
}

// Singleton pattern to prevent multiple instances in dev mode
const whatsappClientSingleton = global.whatsappClient || new WhatsAppClient();

if (process.env.NODE_ENV !== "production") {
  global.whatsappClient = whatsappClientSingleton;
}

export const waClient = whatsappClientSingleton;
