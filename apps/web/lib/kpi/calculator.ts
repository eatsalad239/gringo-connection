/**
 * KPI Calculator Engine
 * Calculates all business metrics and KPIs
 */

import { db } from '../db';
import type { KPIMetrics } from '../db/schema';

export class KPICalculator {
  async calculateMetrics(
    period: 'day' | 'week' | 'month' | 'quarter' | 'year',
    startDate: string,
    endDate: string
  ): Promise<KPIMetrics> {
    const [deals, contacts, invoices, payments, expenses, activities] = await Promise.all([
      db.listDeals(),
      db.listContacts(),
      db.listInvoices(),
      db.listPayments(),
      db.listExpenses({ startDate, endDate }),
      db.listActivities(),
    ]);

    // Filter by date range
    const dealsInPeriod = deals.filter(d => {
      const created = new Date(d.createdAt);
      return created >= new Date(startDate) && created <= new Date(endDate);
    });

    const closedWon = deals.filter(d => d.stage === 'closed-won' && d.wonAt && new Date(d.wonAt) >= new Date(startDate) && new Date(d.wonAt) <= new Date(endDate));
    const closedLost = deals.filter(d => d.stage === 'closed-lost' && d.lostAt && new Date(d.lostAt) >= new Date(startDate) && new Date(d.lostAt) <= new Date(endDate));

    // Sales KPIs
    const totalRevenue = closedWon.reduce((sum, d) => sum + d.value, 0);
    const newDeals = dealsInPeriod.length;
    const winRate = closedWon.length + closedLost.length > 0 
      ? (closedWon.length / (closedWon.length + closedLost.length)) * 100 
      : 0;
    const averageDealSize = closedWon.length > 0 ? totalRevenue / closedWon.length : 0;
    
    // Calculate average sales cycle
    const salesCycles = closedWon
      .filter(d => d.createdAt && d.wonAt)
      .map(d => {
        const created = new Date(d.createdAt);
        const won = new Date(d.wonAt!);
        return (won.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // Days
      });
    const salesCycleDays = salesCycles.length > 0 
      ? salesCycles.reduce((sum, days) => sum + days, 0) / salesCycles.length 
      : 0;

    const pipelineValue = deals
      .filter(d => d.stage !== 'closed-won' && d.stage !== 'closed-lost')
      .reduce((sum, d) => sum + (d.value * d.probability / 100), 0);

    // Customer KPIs
    const newCustomers = contacts.filter(c => {
      const created = new Date(c.createdAt);
      return created >= new Date(startDate) && created <= new Date(endDate) && c.type === 'customer';
    }).length;

    const totalCustomers = contacts.filter(c => c.type === 'customer').length;
    const churnedCustomers = contacts.filter(c => {
      // Simplified: contacts marked as lost in period
      return c.status === 'lost' && c.updatedAt >= startDate && c.updatedAt <= endDate;
    }).length;

    const churnRate = totalCustomers > 0 ? (churnedCustomers / totalCustomers) * 100 : 0;

    // Calculate Customer Lifetime Value
    const customerLTV = contacts
      .filter(c => c.type === 'customer')
      .reduce((sum, c) => sum + (c.lifetimeValue || 0), 0) / Math.max(totalCustomers, 1);

    // Calculate Customer Acquisition Cost (simplified)
    const marketingExpenses = expenses
      .filter(e => e.category === 'marketing')
      .reduce((sum, e) => sum + e.amount, 0);
    const customerAcquisitionCost = newCustomers > 0 ? marketingExpenses / newCustomers : 0;
    const ltvCacRatio = customerAcquisitionCost > 0 ? customerLTV / customerAcquisitionCost : 0;

    const averageRevenuePerUser = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    // Financial KPIs
    const revenue = payments
      .filter(p => p.status === 'completed' && p.date >= startDate && p.date <= endDate)
      .reduce((sum, p) => sum + p.amount, 0);

    const expensesTotal = expenses
      .filter(e => e.status === 'approved' || e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0);

    const profit = revenue - expensesTotal;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    // Accounts Receivable (unpaid invoices)
    const accountsReceivable = invoices
      .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((sum, i) => sum + (i.total - (i.paidDate ? i.total : 0)), 0);

    // Accounts Payable (unpaid expenses)
    const accountsPayable = expenses
      .filter(e => e.status === 'pending' || e.status === 'approved')
      .reduce((sum, e) => sum + e.amount, 0);

    // Cash Flow
    const accounts = await db.listAccounts();
    const currentBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const previousBalance = currentBalance - profit; // Simplified
    const cashFlow = currentBalance - previousBalance;

    // Activity KPIs
    const activitiesInPeriod = activities.filter(a => {
      const created = new Date(a.createdAt);
      return created >= new Date(startDate) && created <= new Date(endDate);
    });

    const calls = activitiesInPeriod.filter(a => a.type === 'call').length;
    const emails = activitiesInPeriod.filter(a => a.type === 'email').length;
    const meetings = activitiesInPeriod.filter(a => a.type === 'meeting').length;
    const tasksCompleted = activitiesInPeriod.filter(a => a.type === 'task' && a.completedAt).length;

    // Calculate average response time (simplified - would need actual email metadata)
    const responseTimeHours = 24; // Placeholder

    // Conversion rate (leads to customers)
    const leads = contacts.filter(c => c.type === 'lead').length;
    const conversionRate = leads > 0 ? (newCustomers / leads) * 100 : 0;

    // Quota attainment (would need quota configuration)
    const quotaAttainment = 0; // Placeholder

    return {
      period,
      startDate,
      endDate,
      sales: {
        totalRevenue,
        newDeals,
        closedWon: closedWon.length,
        closedLost: closedLost.length,
        winRate,
        averageDealSize,
        salesCycleDays,
        pipelineValue,
        conversionRate,
        quotaAttainment,
      },
      financial: {
        revenue,
        expenses: expensesTotal,
        profit,
        profitMargin,
        accountsReceivable,
        accountsPayable,
        cashFlow,
      },
      customer: {
        newCustomers,
        totalCustomers,
        churnedCustomers,
        churnRate,
        customerLifetimeValue: customerLTV,
        customerAcquisitionCost,
        ltvCacRatio,
        averageRevenuePerUser,
      },
      activity: {
        totalActivities: activitiesInPeriod.length,
        calls,
        emails,
        meetings,
        tasksCompleted,
        responseTimeHours,
      },
      calculatedAt: new Date().toISOString(),
    };
  }

  async getDashboardMetrics(): Promise<{
    today: KPIMetrics;
    thisWeek: KPIMetrics;
    thisMonth: KPIMetrics;
    thisYear: KPIMetrics;
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    return {
      today: await this.calculateMetrics('day', today.toISOString(), now.toISOString()),
      thisWeek: await this.calculateMetrics('week', weekStart.toISOString(), now.toISOString()),
      thisMonth: await this.calculateMetrics('month', monthStart.toISOString(), now.toISOString()),
      thisYear: await this.calculateMetrics('year', yearStart.toISOString(), now.toISOString()),
    };
  }
}

export const kpiCalculator = new KPICalculator();

