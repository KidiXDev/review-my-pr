import { WhatsAppClient } from "./whatsapp-client";

declare global {
  var sessionManager: SessionManager | undefined;
}

export class SessionManager {
  private sessions: Map<string, WhatsAppClient> = new Map();

  public getClient(userId: string): WhatsAppClient {
    if (!this.sessions.has(userId)) {
      console.log(`Creating new WhatsApp session for user ${userId}`);
      const client = new WhatsAppClient(userId);
      this.sessions.set(userId, client);
    }
    return this.sessions.get(userId)!;
  }

  public async disconnect(userId: string) {
    if (this.sessions.has(userId)) {
      console.log(`Disconnecting session for user ${userId}`);
      const client = this.sessions.get(userId);
      await client?.destroy();
      this.sessions.delete(userId);
    }
  }

  public getAllSessions() {
    return Array.from(this.sessions.keys());
  }
}

// Singleton pattern
const sessionManagerSingleton = global.sessionManager || new SessionManager();

if (process.env.NODE_ENV !== "production") {
  global.sessionManager = sessionManagerSingleton;
}

export const sessionManager = sessionManagerSingleton;
