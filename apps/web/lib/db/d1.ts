/**
 * Cloudflare D1 Database Interface
 * Free SQLite database for production
 */

import type {
  Contact,
  Deal,
  Activity,
  Invoice,
  Expense,
  Payment,
  Account,
  Transaction,
  Workflow,
  Report,
} from '../db/schema';

export class D1Database {
  constructor(private db: D1Database) {}

  // Contacts
  async createContact(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'lifetimeValue' | 'totalDeals' | 'totalRevenue'>): Promise<Contact> {
    const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    await this.db.prepare(`
      INSERT INTO contacts (
        id, type, first_name, last_name, email, phone, company, title,
        address_street, address_city, address_state, address_zip, address_country,
        tags, source, status, assigned_to, notes, custom_fields,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, data.type, data.firstName, data.lastName, data.email, data.phone || null,
      data.company || null, data.title || null,
      data.address?.street || null, data.address?.city || null,
      data.address?.state || null, data.address?.zip || null, data.address?.country || null,
      JSON.stringify(data.tags || []), data.source, data.status,
      data.assignedTo || null, JSON.stringify(data.notes || []),
      JSON.stringify(data.customFields || {}), now, now
    ).run();

    return {
      ...data,
      id,
      lifetimeValue: 0,
      totalDeals: 0,
      totalRevenue: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getContact(id: string): Promise<Contact | null> {
    const result = await this.db.prepare('SELECT * FROM contacts WHERE id = ?').bind(id).first();
    if (!result) return null;
    return this.mapContact(result);
  }

  async listContacts(filters?: { status?: string; type?: string; assignedTo?: string }): Promise<Contact[]> {
    let query = 'SELECT * FROM contacts WHERE 1=1';
    const binds: any[] = [];

    if (filters?.status) {
      query += ' AND status = ?';
      binds.push(filters.status);
    }
    if (filters?.type) {
      query += ' AND type = ?';
      binds.push(filters.type);
    }
    if (filters?.assignedTo) {
      query += ' AND assigned_to = ?';
      binds.push(filters.assignedTo);
    }

    query += ' ORDER BY updated_at DESC';

    const results = await this.db.prepare(query).bind(...binds).all();
    return results.results.map((r: any) => this.mapContact(r));
  }

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact | null> {
    const contact = await this.getContact(id);
    if (!contact) return null;

    const updates: string[] = [];
    const binds: any[] = [];

    if (data.firstName !== undefined) { updates.push('first_name = ?'); binds.push(data.firstName); }
    if (data.lastName !== undefined) { updates.push('last_name = ?'); binds.push(data.lastName); }
    if (data.email !== undefined) { updates.push('email = ?'); binds.push(data.email); }
    if (data.phone !== undefined) { updates.push('phone = ?'); binds.push(data.phone); }
    if (data.status !== undefined) { updates.push('status = ?'); binds.push(data.status); }
    if (data.lifetimeValue !== undefined) { updates.push('lifetime_value = ?'); binds.push(data.lifetimeValue); }
    if (data.totalDeals !== undefined) { updates.push('total_deals = ?'); binds.push(data.totalDeals); }
    if (data.totalRevenue !== undefined) { updates.push('total_revenue = ?'); binds.push(data.totalRevenue); }

    updates.push('updated_at = ?');
    binds.push(new Date().toISOString());
    binds.push(id);

    await this.db.prepare(`UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`).bind(...binds).run();
    return await this.getContact(id);
  }

  async deleteContact(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM contacts WHERE id = ?').bind(id).run();
    return result.success;
  }

  // Deals
  async createDeal(data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'activities'>): Promise<Deal> {
    const id = `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.db.prepare(`
      INSERT INTO deals (
        id, contact_id, title, description, value, currency, stage, probability,
        expected_close_date, actual_close_date, assigned_to, tags, custom_fields,
        won_at, lost_at, lost_reason, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, data.contactId, data.title, data.description || null, data.value, data.currency,
      data.stage, data.probability, data.expectedCloseDate || null, data.actualCloseDate || null,
      data.assignedTo || null, JSON.stringify(data.tags || []), JSON.stringify(data.customFields || {}),
      data.wonAt || null, data.lostAt || null, data.lostReason || null, now, now
    ).run();

    return {
      ...data,
      id,
      activities: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  async getDeal(id: string): Promise<Deal | null> {
    const result = await this.db.prepare('SELECT * FROM deals WHERE id = ?').bind(id).first();
    if (!result) return null;
    return this.mapDeal(result);
  }

  async listDeals(filters?: { stage?: string; contactId?: string; assignedTo?: string }): Promise<Deal[]> {
    let query = 'SELECT * FROM deals WHERE 1=1';
    const binds: any[] = [];

    if (filters?.stage) {
      query += ' AND stage = ?';
      binds.push(filters.stage);
    }
    if (filters?.contactId) {
      query += ' AND contact_id = ?';
      binds.push(filters.contactId);
    }
    if (filters?.assignedTo) {
      query += ' AND assigned_to = ?';
      binds.push(filters.assignedTo);
    }

    query += ' ORDER BY updated_at DESC';

    const results = await this.db.prepare(query).bind(...binds).all();
    return results.results.map((r: any) => this.mapDeal(r));
  }

  async updateDeal(id: string, data: Partial<Deal>): Promise<Deal | null> {
    const deal = await this.getDeal(id);
    if (!deal) return null;

    const updates: string[] = [];
    const binds: any[] = [];

    if (data.stage !== undefined) { updates.push('stage = ?'); binds.push(data.stage); }
    if (data.value !== undefined) { updates.push('value = ?'); binds.push(data.value); }
    if (data.probability !== undefined) { updates.push('probability = ?'); binds.push(data.probability); }
    if (data.wonAt !== undefined) { updates.push('won_at = ?'); binds.push(data.wonAt); }
    if (data.lostAt !== undefined) { updates.push('lost_at = ?'); binds.push(data.lostAt); }
    if (data.lostReason !== undefined) { updates.push('lost_reason = ?'); binds.push(data.lostReason); }

    updates.push('updated_at = ?');
    binds.push(new Date().toISOString());
    binds.push(id);

    await this.db.prepare(`UPDATE deals SET ${updates.join(', ')} WHERE id = ?`).bind(...binds).run();
    return await this.getDeal(id);
  }

  // Invoices
  async createInvoice(data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.db.prepare(`
      INSERT INTO invoices (
        id, number, contact_id, deal_id, issue_date, due_date, paid_date,
        status, items, subtotal, tax, discount, total, currency, notes, terms,
        pdf_url, payment_method, transaction_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, data.number, data.contactId, data.dealId || null, data.issueDate, data.dueDate,
      data.paidDate || null, data.status, JSON.stringify(data.items), data.subtotal,
      data.tax, data.discount, data.total, data.currency, data.notes || null,
      data.terms || null, data.pdfUrl || null, data.paymentMethod || null,
      data.transactionId || null, now, now
    ).run();

    return { ...data, id, createdAt: now, updatedAt: now };
  }

  async listInvoices(filters?: { contactId?: string; status?: string }): Promise<Invoice[]> {
    let query = 'SELECT * FROM invoices WHERE 1=1';
    const binds: any[] = [];

    if (filters?.contactId) {
      query += ' AND contact_id = ?';
      binds.push(filters.contactId);
    }
    if (filters?.status) {
      query += ' AND status = ?';
      binds.push(filters.status);
    }

    query += ' ORDER BY created_at DESC';

    const results = await this.db.prepare(query).bind(...binds).all();
    return results.results.map((r: any) => this.mapInvoice(r));
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice | null> {
    const invoice = await this.getInvoice(id);
    if (!invoice) return null;

    const updates: string[] = [];
    const binds: any[] = [];

    if (data.status !== undefined) { updates.push('status = ?'); binds.push(data.status); }
    if (data.paidDate !== undefined) { updates.push('paid_date = ?'); binds.push(data.paidDate); }

    updates.push('updated_at = ?');
    binds.push(new Date().toISOString());
    binds.push(id);

    await this.db.prepare(`UPDATE invoices SET ${updates.join(', ')} WHERE id = ?`).bind(...binds).run();
    return await this.getInvoice(id);
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    const result = await this.db.prepare('SELECT * FROM invoices WHERE id = ?').bind(id).first();
    if (!result) return null;
    return this.mapInvoice(result);
  }

  // Expenses
  async createExpense(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.db.prepare(`
      INSERT INTO expenses (
        id, category, vendor, contact_id, description, amount, currency, date,
        payment_method, receipt_url, tags, is_reimbursable, status,
        approved_by, approved_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, data.category, data.vendor || null, data.contactId || null, data.description,
      data.amount, data.currency, data.date, data.paymentMethod, data.receiptUrl || null,
      JSON.stringify(data.tags || []), data.isReimbursable ? 1 : 0, data.status,
      data.approvedBy || null, data.approvedAt || null, now, now
    ).run();

    return { ...data, id, createdAt: now, updatedAt: now };
  }

  async listExpenses(filters?: { category?: string; status?: string; startDate?: string; endDate?: string }): Promise<Expense[]> {
    let query = 'SELECT * FROM expenses WHERE 1=1';
    const binds: any[] = [];

    if (filters?.category) {
      query += ' AND category = ?';
      binds.push(filters.category);
    }
    if (filters?.status) {
      query += ' AND status = ?';
      binds.push(filters.status);
    }
    if (filters?.startDate) {
      query += ' AND date >= ?';
      binds.push(filters.startDate);
    }
    if (filters?.endDate) {
      query += ' AND date <= ?';
      binds.push(filters.endDate);
    }

    query += ' ORDER BY date DESC';

    const results = await this.db.prepare(query).bind(...binds).all();
    return results.results.map((r: any) => this.mapExpense(r));
  }

  // Payments
  async createPayment(data: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const id = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.db.prepare(`
      INSERT INTO payments (
        id, invoice_id, contact_id, amount, currency, method, transaction_id,
        reference, date, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, data.invoiceId, data.contactId, data.amount, data.currency, data.method,
      data.transactionId || null, data.reference || null, data.date, data.status,
      data.notes || null, now
    ).run();

    // Update invoice status
    const invoice = await this.getInvoice(data.invoiceId);
    if (invoice) {
      const payments = await this.listPayments({ invoiceId: data.invoiceId });
      const totalPaid = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      let status = invoice.status;
      if (totalPaid >= invoice.total) {
        status = 'paid';
      } else if (totalPaid > 0) {
        status = 'partial';
      }

      await this.updateInvoice(data.invoiceId, {
        status,
        paidDate: totalPaid >= invoice.total ? data.date : undefined,
      });
    }

    return { ...data, id, createdAt: now };
  }

  async listPayments(filters?: { invoiceId?: string; contactId?: string }): Promise<Payment[]> {
    let query = 'SELECT * FROM payments WHERE 1=1';
    const binds: any[] = [];

    if (filters?.invoiceId) {
      query += ' AND invoice_id = ?';
      binds.push(filters.invoiceId);
    }
    if (filters?.contactId) {
      query += ' AND contact_id = ?';
      binds.push(filters.contactId);
    }

    query += ' ORDER BY date DESC';

    const results = await this.db.prepare(query).bind(...binds).all();
    return results.results.map((r: any) => this.mapPayment(r));
  }

  // Accounts
  async createAccount(data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const id = `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.db.prepare(`
      INSERT INTO accounts (
        id, name, type, currency, balance, account_number, routing_number,
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, data.name, data.type, data.currency, data.balance,
      data.accountNumber || null, data.routingNumber || null,
      data.isActive ? 1 : 0, now, now
    ).run();

    return { ...data, id, createdAt: now, updatedAt: now };
  }

  async listAccounts(): Promise<Account[]> {
    const results = await this.db.prepare('SELECT * FROM accounts ORDER BY name').all();
    return results.results.map((r: any) => this.mapAccount(r));
  }

  // Transactions
  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Get account and calculate balance
    const accountResult = await this.db.prepare('SELECT balance FROM accounts WHERE id = ?').bind(data.accountId).first();
    if (!accountResult) throw new Error('Account not found');

    const currentBalance = (accountResult as any).balance;
    const balanceAfter = data.type === 'income'
      ? currentBalance + data.amount
      : currentBalance - data.amount;

    await this.db.prepare(`
      INSERT INTO transactions (
        id, account_id, type, category, amount, currency, description,
        invoice_id, expense_id, payment_id, date, balance_after, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, data.accountId, data.type, data.category, data.amount, data.currency, data.description,
      data.invoiceId || null, data.expenseId || null, data.paymentId || null,
      data.date, balanceAfter, JSON.stringify(data.metadata || {}), now
    ).run();

    // Update account balance
    await this.db.prepare('UPDATE accounts SET balance = ?, updated_at = ? WHERE id = ?')
      .bind(balanceAfter, now, data.accountId).run();

    return { ...data, id, balanceAfter, createdAt: now };
  }

  async listTransactions(filters?: { accountId?: string; type?: string; startDate?: string; endDate?: string }): Promise<Transaction[]> {
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const binds: any[] = [];

    if (filters?.accountId) {
      query += ' AND account_id = ?';
      binds.push(filters.accountId);
    }
    if (filters?.type) {
      query += ' AND type = ?';
      binds.push(filters.type);
    }
    if (filters?.startDate) {
      query += ' AND date >= ?';
      binds.push(filters.startDate);
    }
    if (filters?.endDate) {
      query += ' AND date <= ?';
      binds.push(filters.endDate);
    }

    query += ' ORDER BY date DESC';

    const results = await this.db.prepare(query).bind(...binds).all();
    return results.results.map((r: any) => this.mapTransaction(r));
  }

  // Activities
  async createActivity(data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity> {
    const id = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    await this.db.prepare(`
      INSERT INTO activities (
        id, type, contact_id, deal_id, title, description, due_date,
        completed_at, assigned_to, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, data.type, data.contactId || null, data.dealId || null, data.title,
      data.description || null, data.dueDate || null, data.completedAt || null,
      data.assignedTo || null, JSON.stringify(data.metadata || {}), now, now
    ).run();

    return { ...data, id, createdAt: now, updatedAt: now };
  }

  async listActivities(filters?: { contactId?: string; dealId?: string; type?: string }): Promise<Activity[]> {
    let query = 'SELECT * FROM activities WHERE 1=1';
    const binds: any[] = [];

    if (filters?.contactId) {
      query += ' AND contact_id = ?';
      binds.push(filters.contactId);
    }
    if (filters?.dealId) {
      query += ' AND deal_id = ?';
      binds.push(filters.dealId);
    }
    if (filters?.type) {
      query += ' AND type = ?';
      binds.push(filters.type);
    }

    query += ' ORDER BY created_at DESC';

    const results = await this.db.prepare(query).bind(...binds).all();
    return results.results.map((r: any) => this.mapActivity(r));
  }

  // Helper mapping functions
  private mapContact(row: any): Contact {
    return {
      id: row.id,
      type: row.type,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      title: row.title,
      address: {
        street: row.address_street,
        city: row.address_city,
        state: row.address_state,
        zip: row.address_zip,
        country: row.address_country,
      },
      tags: JSON.parse(row.tags || '[]'),
      source: row.source,
      status: row.status,
      assignedTo: row.assigned_to,
      notes: JSON.parse(row.notes || '[]'),
      customFields: JSON.parse(row.custom_fields || '{}'),
      lifetimeValue: row.lifetime_value || 0,
      totalDeals: row.total_deals || 0,
      totalRevenue: row.total_revenue || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastContactedAt: row.last_contacted_at,
    };
  }

  private mapDeal(row: any): Deal {
    return {
      id: row.id,
      contactId: row.contact_id,
      title: row.title,
      description: row.description,
      value: row.value,
      currency: row.currency,
      stage: row.stage,
      probability: row.probability,
      expectedCloseDate: row.expected_close_date,
      actualCloseDate: row.actual_close_date,
      assignedTo: row.assigned_to,
      tags: JSON.parse(row.tags || '[]'),
      customFields: JSON.parse(row.custom_fields || '{}'),
      activities: [], // Load separately if needed
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      wonAt: row.won_at,
      lostAt: row.lost_at,
      lostReason: row.lost_reason,
    };
  }

  private mapInvoice(row: any): Invoice {
    return {
      id: row.id,
      number: row.number,
      contactId: row.contact_id,
      dealId: row.deal_id,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      paidDate: row.paid_date,
      status: row.status,
      items: JSON.parse(row.items || '[]'),
      subtotal: row.subtotal,
      tax: row.tax,
      discount: row.discount,
      total: row.total,
      currency: row.currency,
      notes: row.notes,
      terms: row.terms,
      pdfUrl: row.pdf_url,
      paymentMethod: row.payment_method,
      transactionId: row.transaction_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapExpense(row: any): Expense {
    return {
      id: row.id,
      category: row.category,
      vendor: row.vendor,
      contactId: row.contact_id,
      description: row.description,
      amount: row.amount,
      currency: row.currency,
      date: row.date,
      paymentMethod: row.payment_method,
      receiptUrl: row.receipt_url,
      tags: JSON.parse(row.tags || '[]'),
      isReimbursable: row.is_reimbursable === 1,
      status: row.status,
      approvedBy: row.approved_by,
      approvedAt: row.approved_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapPayment(row: any): Payment {
    return {
      id: row.id,
      invoiceId: row.invoice_id,
      contactId: row.contact_id,
      amount: row.amount,
      currency: row.currency,
      method: row.method,
      transactionId: row.transaction_id,
      reference: row.reference,
      date: row.date,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
    };
  }

  private mapAccount(row: any): Account {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      currency: row.currency,
      balance: row.balance,
      accountNumber: row.account_number,
      routingNumber: row.routing_number,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapTransaction(row: any): Transaction {
    return {
      id: row.id,
      accountId: row.account_id,
      type: row.type,
      category: row.category,
      amount: row.amount,
      currency: row.currency,
      description: row.description,
      invoiceId: row.invoice_id,
      expenseId: row.expense_id,
      paymentId: row.payment_id,
      date: row.date,
      balanceAfter: row.balance_after,
      metadata: JSON.parse(row.metadata || '{}'),
      createdAt: row.created_at,
    };
  }

  private mapActivity(row: any): Activity {
    return {
      id: row.id,
      type: row.type,
      contactId: row.contact_id,
      dealId: row.deal_id,
      title: row.title,
      description: row.description,
      dueDate: row.due_date,
      completedAt: row.completed_at,
      assignedTo: row.assigned_to,
      metadata: JSON.parse(row.metadata || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// Export a factory function that uses Cloudflare D1 or fallback
export function getDatabase(env?: { DB?: D1Database }): D1Database | any {
  if (env?.DB) {
    return new D1Database(env.DB);
  }
  // Fallback to in-memory database for development
  return require('./index').db;
}

