import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Herramientas Gratis AI | Gringo Connection',
  description: 'Herramientas gratis de inteligencia artificial para negocios colombianos. Calculadora de pérdidas, análisis de sitio web, chatbot educativo y más.',
  openGraph: {
    title: 'Herramientas Gratis AI para Negocios | Gringo Connection',
    description: 'Descubre cuánto dinero estás perdiendo sin presencia digital. Herramientas 100% gratis.',
  },
};

export default function HerramientasGratisPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold">
          ✨ 100% GRATIS • SIN REGISTRO • SIN TRUCOS
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Herramientas AI Gratis
        </h1>
        <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
          Descubre cuánto dinero estás perdiendo sin una presencia digital profesional.
        </p>
        <p className="text-lg text-gray-500 mb-8">
          Para negocios colombianos que quieren crecer. Sin costo. Sin compromisos.
        </p>
      </section>

      {/* Free Tools Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* Tool 1: AI Image Generator */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-blue-500 transition-all">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold mb-3">Generador de Imágenes AI</h3>
            <p className="text-gray-600 mb-6">
              Crea 1 imagen gratis con inteligencia artificial. ¡Prueba la tecnología del futuro!
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-700 font-semibold">
                ⚡ Límite: 1 imagen gratis • Full access con plan
              </p>
            </div>
            <Link 
              href="/herramientas-gratis/ai-imagen"
              className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Generar Imagen →
            </Link>
          </div>

          {/* Tool 2: AI Text Generator */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-purple-500 transition-all">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-2xl font-bold mb-3">Generador de Textos AI</h3>
            <p className="text-gray-600 mb-6">
              Crea 1 descripción de producto o post de redes con AI. ¡Prueba sin compromiso!
            </p>
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
              <p className="text-sm text-purple-700 font-semibold">
                💡 Límite: 1 texto gratis • Más textos con plan
              </p>
            </div>
            <Link 
              href="/herramientas-gratis/ai-texto"
              className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Generar Texto →
            </Link>
          </div>

          {/* Tool 3: Color Palette Generator */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-green-500 transition-all">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold mb-3">Paleta de Colores AI</h3>
            <p className="text-gray-600 mb-6">
              Genera paletas de colores perfectas para tu marca usando inteligencia artificial.
            </p>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <p className="text-sm text-green-700 font-semibold">
                ✅ Prueba: 3 paletas gratis • Ilimitadas con plan
              </p>
            </div>
            <Link 
              href="/herramientas-gratis/colores-ai"
              className="block w-full text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Generar Colores →
            </Link>
          </div>

          {/* Tool 4: Logo Preview */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-orange-500 transition-all">
            <div className="text-4xl mb-4">🏷️</div>
            <h3 className="text-2xl font-bold mb-3">Preview de Logo</h3>
            <p className="text-gray-600 mb-6">
              Visualiza cómo se vería tu logo en diferentes contextos. Demo interactivo.
            </p>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
              <p className="text-sm text-orange-700 font-semibold">
                👁️ Vista previa: Tarjetas, web, redes sociales
              </p>
            </div>
            <Link 
              href="/herramientas-gratis/logo-preview"
              className="block w-full text-center bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Ver Preview →
            </Link>
          </div>

          {/* Tool 5: Font Pairing */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-indigo-500 transition-all">
            <div className="text-4xl mb-4">🔤</div>
            <h3 className="text-2xl font-bold mb-3">Combinador de Fuentes</h3>
            <p className="text-gray-600 mb-6">
              Encuentra combinaciones perfectas de fuentes para tu marca. Demo interactivo.
            </p>
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6">
              <p className="text-sm text-indigo-700 font-semibold">
                🎯 Límite: 5 combinaciones • Más con plan
              </p>
            </div>
            <Link 
              href="/herramientas-gratis/fuentes"
              className="block w-full text-center bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Ver Fuentes →
            </Link>
          </div>

          {/* Tool 6: Website Quiz */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-cyan-500 transition-all">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold mb-3">Quiz: ¿Necesito Web?</h3>
            <p className="text-gray-600 mb-6">
              Quiz divertido de 5 preguntas. Descubre si tu negocio necesita presencia digital.
            </p>
            <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 mb-6">
              <p className="text-sm text-cyan-700 font-semibold">
                🎯 100% gratis • Resultados instantáneos
              </p>
            </div>
            <Link 
              href="/herramientas-gratis/quiz"
              className="block w-full text-center bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Tomar Quiz →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Limits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Herramientas de Prueba • No Todo Gratis
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-3">🎁</span>
                Prueba Gratis Limitada
              </h3>
              <p className="text-gray-700">
                Cada herramienta tiene un límite para que pruebes la calidad. ¿Te gusta? Contrata acceso completo.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-3">💎</span>
                Tecnología Premium
              </h3>
              <p className="text-gray-700">
                Estas son herramientas profesionales de pago. Las demos muestran la calidad que ofrecemos.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-3">🚀</span>
                Acceso Completo
              </h3>
              <p className="text-gray-700">
                ¿Quieres usar sin límites? Nuestros planes incluyen acceso ilimitado a TODAS las herramientas AI.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-3">⚡</span>
                Sin Trucos
              </h3>
              <p className="text-gray-700">
                Lo que ves es lo que obtienes. Pruebas gratis para decidir si te sirve. Simple y transparente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para Más que Herramientas Gratis?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Cuando estés listo para transformación digital completa, estamos aquí.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
            >
              Hablar con Experto
            </Link>
            <Link 
              href="/services"
              className="px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Ver Servicios
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

