/**
 * Email address rotation system for @gringoconnection.com
 * Rotates between multiple email addresses to avoid rate limits
 */

export interface EmailAddress {
  address: string;
  name: string;
  sendCount: number;
  lastUsed?: Date;
  dailyLimit: number;
}

export class EmailRotator {
  private emails: EmailAddress[];
  private currentIndex = 0;

  constructor(emails: EmailAddress[]) {
    this.emails = emails.map((e) => ({
      ...e,
      sendCount: 0,
      dailyLimit: e.dailyLimit || 1000, // Default 1000 per day per email
    }));
  }

  /**
   * Get next available email address
   * Rotates and checks daily limits
   */
  getNext(): EmailAddress | null {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Reset daily counts if older than 24 hours
    this.emails.forEach((email) => {
      if (!email.lastUsed || email.lastUsed.getTime() < oneDayAgo) {
        email.sendCount = 0;
      }
    });

    // Find available email (hasn't hit daily limit)
    let attempts = 0;
    while (attempts < this.emails.length) {
      const email = this.emails[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.emails.length;

      if (email.sendCount < email.dailyLimit) {
        return email;
      }

      attempts++;
    }

    // All emails hit limit, return first one anyway (will be rate limited)
    return this.emails[0];
  }

  /**
   * Mark email as used
   */
  markUsed(email: EmailAddress): void {
    const found = this.emails.find((e) => e.address === email.address);
    if (found) {
      found.sendCount++;
      found.lastUsed = new Date();
    }
  }

  /**
   * Get all email addresses
   */
  getAll(): EmailAddress[] {
    return [...this.emails];
  }

  /**
   * Get stats
   */
  getStats() {
    return this.emails.map((e) => ({
      address: e.address,
      sendCount: e.sendCount,
      remaining: e.dailyLimit - e.sendCount,
      lastUsed: e.lastUsed,
    }));
  }
}

// Default email addresses - can be expanded
export function createDefaultEmailRotator(): EmailRotator {
  const emails: EmailAddress[] = [
    { address: 'info@gringoconnection.com', name: 'Gringo Connection', dailyLimit: 1000 },
    { address: 'contacto@gringoconnection.com', name: 'Gringo Connection', dailyLimit: 1000 },
    { address: 'hola@gringoconnection.com', name: 'Gringo Connection', dailyLimit: 1000 },
    { address: 'ventas@gringoconnection.com', name: 'Gringo Connection', dailyLimit: 1000 },
    { address: 'soporte@gringoconnection.com', name: 'Gringo Connection', dailyLimit: 1000 },
    { address: 'servicios@gringoconnection.com', name: 'Gringo Connection', dailyLimit: 1000 },
    { address: 'ia@gringoconnection.com', name: 'Gringo Connection', dailyLimit: 1000 },
    { address: 'automatizacion@gringoconnection.com', name: 'Gringo Connection', dailyLimit: 1000 },
    { address: 'medellin@gringoconnection.com', name: 'Gringo Connection', dailyLimit: 1000 },
    { address: 'colombia@gringoconnection.com', name: 'Gringo Connection', dailyLimit: 1000 },
  ];

  return new EmailRotator(emails);
}
