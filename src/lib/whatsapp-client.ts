import { Client, LocalAuth } from "whatsapp-web.js";

declare global {
  var whatsappClient: WhatsAppClient | undefined;
}

class WhatsAppClient {
  private client: Client;
  private qrCode: string | null = null;
  private isConnected: boolean = false;
  private isReady: boolean = false;

  constructor() {
    console.log("Initializing WhatsApp Client...");
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: "whatsapp-bot",
        dataPath: "./.wwebjs_auth",
      }),
      puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });

    this.initialize();
  }

  private initialize() {
    this.client.on("qr", (qr) => {
      console.log("QR Code received", qr);
      this.qrCode = qr;
      this.isConnected = false;
      this.isReady = false;
    });

    this.client.on("ready", () => {
      console.log("WhatsApp Client is ready!");
      this.isConnected = true;
      this.isReady = true;
      this.qrCode = null;
    });

    this.client.on("authenticated", () => {
      console.log("WhatsApp Client authenticated");
      this.isConnected = true;
    });

    this.client.on("auth_failure", (msg) => {
      console.error("WhatsApp Authentication failure", msg);
      this.isConnected = false;
      this.isReady = false;
    });

    this.client.on("disconnected", (reason) => {
      console.log("WhatsApp Client disconnected", reason);
      this.isConnected = false;
      this.isReady = false;
      // Re-initialize logic could go here if needed, but often client handles reconnection or we restart
    });

    try {
      this.client.initialize();
    } catch (error) {
      console.error("Failed to initialize WhatsApp client:", error);
    }
  }

  public getClient() {
    return this.client;
  }

  public getLatestQR() {
    return this.qrCode;
  }

  public getStatus() {
    return {
      isConnected: this.isConnected,
      isReady: this.isReady,
    };
  }

  public async getAllGroups() {
    if (!this.isReady) {
      throw new Error("WhatsApp client is not ready");
    }
    const chats = await this.client.getChats();
    return chats.filter((chat) => chat.isGroup);
  }

  public async sendGroupMessage(groupId: string, message: string) {
    if (!this.isReady) {
      throw new Error("WhatsApp client is not ready");
    }
    try {
      await this.client.sendMessage(groupId, message);
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
