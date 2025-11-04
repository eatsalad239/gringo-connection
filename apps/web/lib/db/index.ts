/**
 * Database Interface
 * In-memory storage for now, can be replaced with SQLite/PostgreSQL/MySQL
 */

import type {
  Contact,
  Deal,
  Activity,
  Pipeline,
  Invoice,
  Expense,
  Payment,
  Account,
  Transaction,
  KPIMetrics,
  Workflow,
  Report,
} from './schema';

// In-memory storage (fallback for development)
// Production uses Cloudflare D1 (see lib/db/d1.ts)
class Database {
  private contacts = new Map<string, Contact>();
  private deals = new Map<string, Deal>();
  private activities = new Map<string, Activity>();
  private pipelines = new Map<string, Pipeline>();
  private invoices = new Map<string, Invoice>();
  private expenses = new Map<string, Expense>();
  private payments = new Map<string, Payment>();
  private accounts = new Map<string, Account>();
  private transactions = new Map<string, Transaction>();
  private workflows = new Map<string, Workflow>();
  private reports = new Map<string, Report>();

  // Contacts
  async createContact(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'lifetimeValue' | 'totalDeals' | 'totalRevenue'>): Promise<Contact> {
    const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const contact: Contact = {
      ...data,
      id,
      lifetimeValue: 0,
      totalDeals: 0,
      totalRevenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContact(id: string): Promise<Contact | null> {
    return this.contacts.get(id) || null;
  }

  async listContacts(filters?: { status?: string; type?: string; assignedTo?: string }): Promise<Contact[]> {
    let contacts = Array.from(this.contacts.values());
    if (filters?.status) contacts = contacts.filter(c => c.status === filters.status);
    if (filters?.type) contacts = contacts.filter(c => c.type === filters.type);
    if (filters?.assignedTo) contacts = contacts.filter(c => c.assignedTo === filters.assignedTo);
    return contacts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact | null> {
    const contact = this.contacts.get(id);
    if (!contact) return null;
    const updated = { ...contact, ...data, updatedAt: new Date().toISOString() };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: string): Promise<boolean> {
    return this.contacts.delete(id);
  }

  // Deals
  async createDeal(data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'activities'>): Promise<Deal> {
    const id = `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const deal: Deal = {
      ...data,
      id,
      activities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.deals.set(id, deal);
    return deal;
  }

  async getDeal(id: string): Promise<Deal | null> {
    return this.deals.get(id) || null;
  }

  async listDeals(filters?: { stage?: string; contactId?: string; assignedTo?: string }): Promise<Deal[]> {
    let deals = Array.from(this.deals.values());
    if (filters?.stage) deals = deals.filter(d => d.stage === filters.stage);
    if (filters?.contactId) deals = deals.filter(d => d.contactId === filters.contactId);
    if (filters?.assignedTo) deals = deals.filter(d => d.assignedTo === filters.assignedTo);
    return deals.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async updateDeal(id: string, data: Partial<Deal>): Promise<Deal | null> {
    const deal = this.deals.get(id);
    if (!deal) return null;
    const updated = { ...deal, ...data, updatedAt: new Date().toISOString() };
    this.deals.set(id, updated);
    return updated;
  }

  async deleteDeal(id: string): Promise<boolean> {
    return this.deals.delete(id);
  }

  // Activities
  async createActivity(data: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity> {
    const id = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const activity: Activity = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.activities.set(id, activity);
    
    // Link to deal if applicable
    if (data.dealId) {
      const deal = this.deals.get(data.dealId);
      if (deal) {
        deal.activities.push(activity);
        this.deals.set(data.dealId, deal);
      }
    }
    
    return activity;
  }

  async listActivities(filters?: { contactId?: string; dealId?: string; type?: string }): Promise<Activity[]> {
    let activities = Array.from(this.activities.values());
    if (filters?.contactId) activities = activities.filter(a => a.contactId === filters.contactId);
    if (filters?.dealId) activities = activities.filter(a => a.dealId === filters.dealId);
    if (filters?.type) activities = activities.filter(a => a.type === filters.type);
    return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Invoices
  async createInvoice(data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invoice: Invoice = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    return this.invoices.get(id) || null;
  }

  async listInvoices(filters?: { contactId?: string; status?: string }): Promise<Invoice[]> {
    let invoices = Array.from(this.invoices.values());
    if (filters?.contactId) invoices = invoices.filter(i => i.contactId === filters.contactId);
    if (filters?.status) invoices = invoices.filter(i => i.status === filters.status);
    return invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice | null> {
    const invoice = this.invoices.get(id);
    if (!invoice) return null;
    const updated = { ...invoice, ...data, updatedAt: new Date().toISOString() };
    this.invoices.set(id, updated);
    return updated;
  }

  // Expenses
  async createExpense(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expense: Expense = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async listExpenses(filters?: { category?: string; status?: string; startDate?: string; endDate?: string }): Promise<Expense[]> {
    let expenses = Array.from(this.expenses.values());
    if (filters?.category) expenses = expenses.filter(e => e.category === filters.category);
    if (filters?.status) expenses = expenses.filter(e => e.status === filters.status);
    if (filters?.startDate) expenses = expenses.filter(e => e.date >= filters.startDate!);
    if (filters?.endDate) expenses = expenses.filter(e => e.date <= filters.endDate!);
    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Payments
  async createPayment(data: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const id = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payment: Payment = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    this.payments.set(id, payment);
    
    // Update invoice status
    const invoice = this.invoices.get(data.invoiceId);
    if (invoice) {
      const totalPaid = Array.from(this.payments.values())
        .filter(p => p.invoiceId === data.invoiceId && p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      
      let status = invoice.status;
      if (totalPaid >= invoice.total) {
        status = 'paid';
      } else if (totalPaid > 0) {
        status = 'partial';
      }
      
      this.invoices.set(data.invoiceId, { ...invoice, status, paidDate: totalPaid >= invoice.total ? data.date : undefined });
    }
    
    return payment;
  }

  // Accounts
  async createAccount(data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const id = `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const account: Account = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.accounts.set(id, account);
    return account;
  }

  async listAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  // Transactions
  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'balanceAfter'>): Promise<Transaction> {
    const id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const account = this.accounts.get(data.accountId);
    if (!account) throw new Error('Account not found');
    
    const balanceAfter = data.type === 'income' 
      ? account.balance + data.amount 
      : account.balance - data.amount;
    
    const transaction: Transaction = {
      ...data,
      id,
      balanceAfter,
      createdAt: new Date().toISOString(),
    };
    
    this.transactions.set(id, transaction);
    
    // Update account balance
    this.accounts.set(data.accountId, { ...account, balance: balanceAfter, updatedAt: new Date().toISOString() });
    
    return transaction;
  }

  async listTransactions(filters?: { accountId?: string; type?: string; startDate?: string; endDate?: string }): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values());
    if (filters?.accountId) transactions = transactions.filter(t => t.accountId === filters.accountId);
    if (filters?.type) transactions = transactions.filter(t => t.type === filters.type);
    if (filters?.startDate) transactions = transactions.filter(t => t.date >= filters.startDate!);
    if (filters?.endDate) transactions = transactions.filter(t => t.date <= filters.endDate!);
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Payments helper
  async listPayments(filters?: { invoiceId?: string; contactId?: string }): Promise<Payment[]> {
    let payments = Array.from(this.payments.values());
    if (filters?.invoiceId) payments = payments.filter(p => p.invoiceId === filters.invoiceId);
    if (filters?.contactId) payments = payments.filter(p => p.contactId === filters.contactId);
    return payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

export const db = new Database();

