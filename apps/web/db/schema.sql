-- Cloudflare D1 Database Schema
-- Free SQLite database for CRM + Financial System

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('lead', 'customer', 'partner', 'vendor')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  title TEXT,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  address_country TEXT,
  tags TEXT, -- JSON array
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('new', 'contacted', 'qualified', 'nurturing', 'customer', 'lost')),
  assigned_to TEXT,
  notes TEXT, -- JSON array
  custom_fields TEXT, -- JSON object
  lifetime_value REAL DEFAULT 0,
  total_deals INTEGER DEFAULT 0,
  total_revenue REAL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_contacted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);

-- Deals
CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  value REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  stage TEXT NOT NULL CHECK(stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost')),
  probability INTEGER NOT NULL DEFAULT 0 CHECK(probability >= 0 AND probability <= 100),
  expected_close_date TEXT,
  actual_close_date TEXT,
  assigned_to TEXT,
  tags TEXT, -- JSON array
  custom_fields TEXT, -- JSON object
  won_at TEXT,
  lost_at TEXT,
  lost_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);

-- Activities
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('call', 'email', 'meeting', 'note', 'task', 'sms', 'whatsapp')),
  contact_id TEXT,
  deal_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT,
  completed_at TEXT,
  assigned_to TEXT,
  metadata TEXT, -- JSON object
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (deal_id) REFERENCES deals(id)
);

CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal_id ON activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  contact_id TEXT NOT NULL,
  deal_id TEXT,
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  paid_date TEXT,
  status TEXT NOT NULL CHECK(status IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled')),
  items TEXT NOT NULL, -- JSON array
  subtotal REAL NOT NULL,
  tax REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  terms TEXT,
  pdf_url TEXT,
  payment_method TEXT,
  transaction_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (deal_id) REFERENCES deals(id)
);

CREATE INDEX IF NOT EXISTS idx_invoices_contact_id ON invoices(contact_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(number);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  vendor TEXT,
  contact_id TEXT,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  date TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'bank', 'credit_card', 'paypal', 'other')),
  receipt_url TEXT,
  tags TEXT, -- JSON array
  is_reimbursable INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected', 'paid')),
  approved_by TEXT,
  approved_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  method TEXT NOT NULL CHECK(method IN ('cash', 'bank_transfer', 'credit_card', 'paypal', 'stripe', 'other')),
  transaction_id TEXT,
  reference TEXT,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_contact_id ON payments(contact_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('bank', 'credit_card', 'cash', 'paypal', 'stripe', 'other')),
  currency TEXT NOT NULL DEFAULT 'USD',
  balance REAL NOT NULL DEFAULT 0,
  account_number TEXT,
  routing_number TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'transfer')),
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT NOT NULL,
  invoice_id TEXT,
  expense_id TEXT,
  payment_id TEXT,
  date TEXT NOT NULL,
  balance_after REAL NOT NULL,
  metadata TEXT, -- JSON object
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (expense_id) REFERENCES expenses(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- Workflows
CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL, -- JSON object
  conditions TEXT NOT NULL, -- JSON array
  actions TEXT NOT NULL, -- JSON array
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('sales', 'financial', 'customer', 'custom')),
  parameters TEXT, -- JSON object
  filters TEXT, -- JSON array
  group_by TEXT, -- JSON array
  sort_by TEXT,
  created_at TEXT NOT NULL,
  last_run_at TEXT
);

