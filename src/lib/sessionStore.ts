/**
 * Simple in-memory session store for AI chat conversations
 * In production, replace this with Redis, Database, or other persistent storage
 */

type Message = {
  role?: string;
  content?: string;
  imageUrl?: string;
};

type Session = {
  messages: Message[];
  lastActivity: number;
  userId?: string;
};

class SessionStore {
  private sessions: Map<string, Session> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  /**
   * Get session by ID, returns empty session if not found
   */
  getSession(sessionId: string): Message[] {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return [];
    }

    // Check if session expired
    if (Date.now() - session.lastActivity > this.SESSION_TIMEOUT) {
      this.sessions.delete(sessionId);
      return [];
    }

    return session.messages;
  }

  /**
   * Update session with new messages
   */
  updateSession(sessionId: string, messages: Message[], userId?: string): void {
    this.sessions.set(sessionId, {
      messages,
      lastActivity: Date.now(),
      userId,
    });
  }

  /**
   * Add a message to existing session
   */
  addMessage(sessionId: string, message: Message): void {
    const existingMessages = this.getSession(sessionId);
    this.updateSession(sessionId, [...existingMessages, message]);
  }

  /**
   * Clear a specific session
   */
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Clean up expired sessions (call periodically)
   */
  cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        this.sessions.delete(id);
      }
    }
  }

  /**
   * Get session count (for monitoring)
   */
  getSessionCount(): number {
    return this.sessions.size;
  }
}

// Singleton instance
export const sessionStore = new SessionStore();

// Cleanup expired sessions every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    sessionStore.cleanupExpiredSessions();
  }, 5 * 60 * 1000);
}
