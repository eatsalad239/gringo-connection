import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Zap, Shield, Globe, TrendingUp, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Próximamente — Gringo Connection',
  description: 'Soluciones de automatización e IA de próxima generación para Colombia. Próximamente.',
};

const features = [
  {
    icon: Calendar,
    title_en: 'Intelligent Grant Discovery',
    title_es: 'Descubrimiento Inteligente de Subsidios',
    description_en: 'Automated identification of Colombian grant opportunities before they become public. Stay ahead of the competition.',
    description_es: 'Identificación automatizada de oportunidades de subsidios colombianos antes de que se hagan públicas. Mantente por delante de la competencia.',
  },
  {
    icon: Zap,
    title_en: 'Real-Time Operator Agents',
    title_es: 'Agentes Operadores en Tiempo Real',
    description_en: 'AI agents that monitor, alert, and execute workflows 24/7. Intake, EOD reports, QA verification, and priority alerts.',
    description_es: 'Agentes de IA que monitorean, alertan y ejecutan flujos de trabajo 24/7. Intake, reportes EOD, verificación QA y alertas prioritarias.',
  },
  {
    icon: Shield,
    title_en: 'Automated Compliance & QA',
    title_es: 'Cumplimiento y QA Automatizado',
    description_en: 'Built-in quality assurance and compliance checks for Colombian regulations. Never publish content that violates guidelines.',
    description_es: 'Verificación de calidad y cumplimiento integrado para regulaciones colombianas. Nunca publiques contenido que viole las pautas.',
  },
  {
    icon: Globe,
    title_en: 'Market-Specific Intelligence',
    title_es: 'Inteligencia Específica del Mercado',
    description_en: 'Deep integration with Colombian business ecosystems. Context-aware automation for Medellín, Bogotá, and beyond.',
    description_es: 'Integración profunda con ecosistemas empresariales colombianos. Automatización consciente del contexto para Medellín, Bogotá y más allá.',
  },
  {
    icon: TrendingUp,
    title_en: 'Predictive Tour Optimization',
    title_es: 'Optimización Predictiva de Tours',
    description_en: 'AI-powered tour scheduling that maximizes bookings based on historical patterns, partner availability, and market demand.',
    description_es: 'Agendamiento de tours impulsado por IA que maximiza las reservas basándose en patrones históricos, disponibilidad de socios y demanda del mercado.',
  },
  {
    icon: Sparkles,
    title_en: 'Advanced Content Generation',
    title_es: 'Generación Avanzada de Contenido',
    description_en: 'Multi-model AI orchestration for content that resonates with Colombian audiences. Cultural nuance built-in.',
    description_es: 'Orquestación de IA multi-modelo para contenido que resuena con audiencias colombianas. Matices culturales integrados.',
  },
];

export default function ComingSoonPageEs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-6">
            🚀 Próximamente
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            El Futuro de la Automatización
            <br />
            <span className="text-primary-600">Empresarial en Colombia</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Estamos construyendo algo poderoso. Soluciones de IA de nivel empresarial diseñadas específicamente para el mercado colombiano—con integración profunda en el ecosistema de Medellín y más allá.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/es/contact"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Obtener Acceso Anticipado
            </Link>
            <Link
              href="/es"
              className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:border-primary-600 hover:text-primary-600 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title_es}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description_es}
                </p>
              </div>
            );
          })}
        </div>

        {/* Partnership Highlight */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Hecho en Medellín, Para Colombia
          </h2>
          <p className="text-xl text-primary-100 mb-6 max-w-2xl mx-auto">
            En asociación con Gato Blanco en Zona Rosa, estamos creando soluciones que entienden la cultura empresarial colombiana, las regulaciones y las oportunidades.
          </p>
          <Link
            href="/es/partners"
            className="inline-block px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Conoce Nuestra Asociación
          </Link>
        </div>

        {/* Teaser Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm mb-4">
            ¿Quieres ser notificado cuando lancemos?
          </p>
          <Link
            href="/es/contact"
            className="text-primary-600 font-semibold hover:underline"
          >
            Únete a la lista de espera →
          </Link>
        </div>
      </div>
    </div>
  );
}

