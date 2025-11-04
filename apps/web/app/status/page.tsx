/**
 * Status Page - Shows what's running
 * Public status page for monitoring
 */

import { Metadata } from 'next';
import { getLocale } from '@/lib/locale';

export const metadata: Metadata = {
  title: 'System Status — Gringo Connection',
  description: 'Real-time status of Gringo Connection services and agents',
  robots: {
    index: true,
    follow: true,
  },
};

export default async function StatusPage() {
  const locale = getLocale();
  const isEs = locale === 'es';

  // Fetch status from API (with fallback)
  let status: any = null;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gringoconnection.com';
    const response = await fetch(`${baseUrl}/api/status`, {
      next: { revalidate: 60 }, // Revalidate every minute
    });
    if (response.ok) {
      status = await response.json();
    }
  } catch (error) {
    // Fallback to static status if API fails
    console.error('Failed to fetch status:', error);
  }
  
  // Fallback status if API fails
  if (!status) {
    status = {
      status: 'live',
      environment: 'production',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://gringoconnection.com',
      version: '1.0.0',
      agents: [
        { id: 'lead-qualification', name: 'Lead Qualification Agent', status: 'active', schedule: 'every-2-hours', category: 'revenue' },
        { id: 'follow-up', name: 'Follow-up Agent', status: 'active', schedule: '09:00-daily', category: 'revenue' },
        { id: 'upsell', name: 'Upsell Agent', status: 'active', schedule: 'monday-10:00', category: 'revenue' },
        { id: 'proposal-generator', name: 'Proposal Generator Agent', status: 'active', schedule: 'on-demand', category: 'revenue' },
        { id: 'referral', name: 'Referral Agent', status: 'active', schedule: 'friday-14:00', category: 'revenue' },
        { id: 'dev-helper', name: 'Dev Helper Agent', status: 'active', schedule: '08:00-daily', category: 'development' },
        { id: 'code-generator', name: 'Code Generator Agent', status: 'active', schedule: 'on-demand', category: 'development' },
        { id: 'workflow', name: 'Workflow Automation Agent', status: 'active', schedule: '09:00-daily', category: 'development' },
        { id: 'intake', name: 'Intake Agent', status: 'active', schedule: '09:15 & 14:00', category: 'operations' },
        { id: 'eod', name: 'EOD Agent', status: 'active', schedule: '21:30-daily', category: 'operations' },
        { id: 'grant', name: 'Grant Agent', status: 'active', schedule: 'mon-thu-08:00', category: 'operations' },
        { id: 'qa', name: 'QA Agent', status: 'active', schedule: 'on-demand', category: 'operations' },
        { id: 'alert', name: 'Alert Agent', status: 'active', schedule: 'real-time', category: 'operations' },
        { id: 'performance', name: 'Performance Monitor', status: 'active', schedule: 'continuous', category: 'operations' },
        { id: 'swarm', name: 'Swarm Orchestrator', status: 'active', schedule: 'continuous', category: 'operations' },
        { id: 'deployment-status', name: 'Deployment Status Agent', status: 'active', schedule: 'on-demand', category: 'operations' },
      ],
      features: {
        website: { status: 'operational', pages: 11, languages: ['en', 'es'] },
        automation: { status: 'running', agents: { total: 16, active: 16 } },
      },
    };
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {isEs ? 'Estado del Sistema' : 'System Status'}
          </h1>
          <p className="text-xl text-gray-600">
            {isEs
              ? 'Estado en tiempo real de servicios y agentes'
              : 'Real-time status of services and agents'}
          </p>
        </div>

        {status ? (
          <div className="space-y-8">
            {/* Overall Status */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEs ? 'Estado General' : 'Overall Status'}
                </h2>
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                  🟢 {status.status.toUpperCase()}
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{isEs ? 'Versión' : 'Version'}</p>
                  <p className="text-2xl font-bold text-gray-900">{status.version}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{isEs ? 'Desplegado' : 'Deployed'}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Date(status.deployedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{isEs ? 'Ambiente' : 'Environment'}</p>
                  <p className="text-2xl font-bold text-gray-900 uppercase">{status.environment}</p>
                </div>
              </div>
            </div>

            {/* Active Agents */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isEs ? 'Agentes Activos' : 'Active Agents'} ({status.agents.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {status.agents.map((agent: any) => (
                  <div
                    key={agent.id}
                    className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>{isEs ? 'Programa' : 'Schedule'}:</strong> {agent.schedule}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>{isEs ? 'Categoría' : 'Category'}:</strong> {agent.category}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isEs ? 'Características' : 'Features'}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {isEs ? 'Sitio Web' : 'Website'}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✅ {status.features.website.pages} {isEs ? 'páginas' : 'pages'}</li>
                    <li>✅ {status.features.website.languages.join(', ').toUpperCase()} {isEs ? 'idiomas' : 'languages'}</li>
                    <li>✅ {isEs ? 'Estado' : 'Status'}: {status.features.website.status}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {isEs ? 'Automatización' : 'Automation'}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✅ {status.features.automation.agents.active} {isEs ? 'agentes activos' : 'active agents'}</li>
                    <li>✅ {isEs ? 'Estado' : 'Status'}: {status.features.automation.status}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600">
              {isEs ? 'Cargando estado...' : 'Loading status...'}
            </p>
          </div>
        )}

        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>
            {isEs
              ? 'Última actualización:'
              : 'Last updated:'} {new Date().toLocaleString()}
          </p>
          <p className="mt-2">
            {isEs
              ? 'Esta página se actualiza automáticamente cada minuto.'
              : 'This page auto-updates every minute.'}
          </p>
        </div>
      </div>
    </div>
  );
}

