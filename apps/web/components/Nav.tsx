'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';

const navItems = {
  en: [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/grants', label: 'Grants' },
    { href: '/tours', label: 'Tours' },
    { href: '/partners', label: 'Partners' },
    { href: '/contact', label: 'Contact' },
  ],
  es: [
    { href: '/es', label: 'Inicio' },
    { href: '/es/services', label: 'Servicios' },
    { href: '/es/grants', label: 'Subvenciones' },
    { href: '/es/tours', label: 'Tours' },
    { href: '/es/partners', label: 'Socios' },
    { href: '/es/contact', label: 'Contacto' },
  ],
};

export function Nav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const items = navItems[locale as 'en' | 'es'] || navItems.en;
  const isEs = locale === 'es';
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
      role="navigation"
      aria-label={isEs ? "Navegación principal" : "Main navigation"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href={isEs ? '/es' : '/'}
            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
            aria-label={isEs ? "Ir al inicio - Gringo Connection" : "Go to home - Gringo Connection"}
          >
            <Sparkles className="w-5 h-5 text-blue-600" aria-hidden="true" />
            Gringo Connection
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center" role="menubar">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 py-1 ${
                  pathname === item.href
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
                role="menuitem"
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    aria-hidden="true"
                  />
                )}
              </Link>
            ))}
            <Link
              href={isEs ? '/' : '/es'}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-medium hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={isEs ? "Cambiar idioma a inglés" : "Switch language to Spanish"}
            >
              {isEs ? 'EN' : 'ES'}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? (isEs ? "Cerrar menú" : "Close menu") : (isEs ? "Abrir menú" : "Open menu")}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
            role="menu"
            aria-label={isEs ? "Menú móvil" : "Mobile menu"}
          >
            <div className="px-4 py-4 space-y-4">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1 ${
                    pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                  role="menuitem"
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={isEs ? '/' : '/es'}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                role="menuitem"
                aria-label={isEs ? "Cambiar idioma a inglés" : "Switch language to Spanish"}
              >
                {isEs ? 'EN' : 'ES'}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

