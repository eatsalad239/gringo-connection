/**
 * Database Schema for Gringo Connection CRM + Financial System
 * Better than GHL + QuickBooks combined
 */

export interface Contact {
  id: string;
  type: 'lead' | 'customer' | 'partner' | 'vendor';
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  tags: string[];
  source: string; // website, referral, social, etc.
  status: 'new' | 'contacted' | 'qualified' | 'nurturing' | 'customer' | 'lost';
  assignedTo?: string; // user ID
  notes: string[];
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  lifetimeValue: number; // Calculated
  totalDeals: number; // Calculated
  totalRevenue: number; // Calculated
}

export interface Deal {
  id: string;
  contactId: string;
  title: string;
  description?: string;
  value: number;
  currency: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number; // 0-100
  expectedCloseDate?: string;
  actualCloseDate?: string;
  assignedTo?: string;
  tags: string[];
  customFields: Record<string, any>;
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
  wonAt?: string;
  lostAt?: string;
  lostReason?: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'sms' | 'whatsapp';
  contactId?: string;
  dealId?: string;
  title: string;
  description?: string;
  dueDate?: string;
  completedAt?: string;
  assignedTo?: string;
  metadata?: Record<string, any>; // Email content, call duration, etc.
  createdAt: string;
  updatedAt: string;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  isDefault: boolean;
  createdAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number; // Default probability for deals in this stage
  color?: string;
}

// Financial Entities
export interface Invoice {
  id: string;
  number: string; // Unique invoice number
  contactId: string;
  dealId?: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  terms?: string;
  pdfUrl?: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface Expense {
  id: string;
  category: string; // office, travel, marketing, software, etc.
  vendor?: string;
  contactId?: string; // If paid to a vendor contact
  description: string;
  amount: number;
  currency: string;
  date: string;
  paymentMethod: 'cash' | 'bank' | 'credit_card' | 'paypal' | 'other';
  receiptUrl?: string;
  tags: string[];
  isReimbursable: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  contactId: string;
  amount: number;
  currency: string;
  method: 'cash' | 'bank_transfer' | 'credit_card' | 'paypal' | 'stripe' | 'other';
  transactionId?: string;
  reference?: string;
  date: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'credit_card' | 'cash' | 'paypal' | 'stripe' | 'other';
  currency: string;
  balance: number; // Current balance
  accountNumber?: string;
  routingNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  amount: number;
  currency: string;
  description: string;
  invoiceId?: string;
  expenseId?: string;
  paymentId?: string;
  date: string;
  balanceAfter: number; // Balance after this transaction
  metadata?: Record<string, any>;
  createdAt: string;
}

// KPI & Analytics
export interface KPIMetrics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
  
  // Sales KPIs
  sales: {
    totalRevenue: number;
    newDeals: number;
    closedWon: number;
    closedLost: number;
    winRate: number; // %
    averageDealSize: number;
    salesCycleDays: number; // Average days to close
    pipelineValue: number;
    conversionRate: number; // Leads to customers
    quotaAttainment: number; // %
  };
  
  // Financial KPIs
  financial: {
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number; // %
    accountsReceivable: number;
    accountsPayable: number;
    cashFlow: number;
    burnRate?: number; // For startups
    runway?: number; // Months of runway
  };
  
  // Customer KPIs
  customer: {
    newCustomers: number;
    totalCustomers: number;
    churnedCustomers: number;
    churnRate: number; // %
    customerLifetimeValue: number;
    customerAcquisitionCost: number;
    ltvCacRatio: number;
    netPromoterScore?: number;
    averageRevenuePerUser: number;
  };
  
  // Activity KPIs
  activity: {
    totalActivities: number;
    calls: number;
    emails: number;
    meetings: number;
    tasksCompleted: number;
    responseTimeHours: number; // Average
  };
  
  calculatedAt: string;
}

// Automation/Workflow
export interface Workflow {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTrigger {
  type: 'contact_created' | 'deal_stage_changed' | 'invoice_sent' | 'payment_received' | 'custom';
  config: Record<string, any>;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface WorkflowAction {
  type: 'send_email' | 'create_task' | 'update_field' | 'create_deal' | 'send_sms' | 'webhook';
  config: Record<string, any>;
}

// Reporting
export interface Report {
  id: string;
  name: string;
  type: 'sales' | 'financial' | 'customer' | 'custom';
  parameters: Record<string, any>;
  filters: ReportFilter[];
  groupBy?: string[];
  sortBy?: string;
  createdAt: string;
  lastRunAt?: string;
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
}

