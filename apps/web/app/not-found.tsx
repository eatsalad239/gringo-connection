'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const pathname = usePathname();
  const [locale, setLocale] = useState<'en' | 'es'>('en');
  
  useEffect(() => {
    setLocale(pathname?.startsWith('/es') ? 'es' : 'en');
  }, [pathname]);
  
  const prefix = locale === 'es' ? '/es' : '';
  const isEs = locale === 'es';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {isEs ? 'Página no encontrada' : 'Page Not Found'}
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            {isEs
              ? 'Lo sentimos, la página que buscas no existe o ha sido movida.'
              : "Sorry, the page you're looking for doesn't exist or has been moved."}
          </p>
        </motion.div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={`${prefix}/`}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              {isEs ? 'Ir al inicio' : 'Go Home'}
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={() => window.history.back()}
              className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-lg font-semibold border-2 border-blue-600 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              {isEs ? 'Volver' : 'Go Back'}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
