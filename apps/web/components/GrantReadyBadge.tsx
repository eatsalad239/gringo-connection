'use client';

import { motion } from 'framer-motion';
import { Award, CheckCircle2, TrendingUp, Users } from 'lucide-react';

export function GrantReadyBadge({ locale }: { locale: string }) {
  const isEs = locale === 'es';

  const achievements = [
    {
      icon: Award,
      label: isEs ? 'Nivel Empresarial' : 'Enterprise-Grade',
      value: '100%',
    },
    {
      icon: CheckCircle2,
      label: isEs ? 'Producción Lista' : 'Production Ready',
      value: '24/7',
    },
    {
      icon: TrendingUp,
      label: isEs ? 'Escalable' : 'Scalable',
      value: '∞',
    },
    {
      icon: Users,
      label: isEs ? 'Bilingüe' : 'Bilingual',
      value: 'EN/ES',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 rounded-full text-white font-semibold mb-6"
            >
              <Award className="w-5 h-5" />
              {isEs ? 'Listo para Subvenciones Tecnológicas' : 'Grant-Ready Platform'}
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {isEs
                ? 'Construido para Impresionar'
                : 'Built to Impress Grant Reviewers'}
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              {isEs
                ? 'Tecnología de vanguardia, diseño profesional y rendimiento excepcional que demuestra innovación y excelencia técnica'
                : 'Cutting-edge technology, professional design, and exceptional performance that demonstrates innovation and technical excellence'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center bg-white/10 rounded-xl p-6 backdrop-blur-sm"
              >
                <achievement.icon className="w-8 h-8 text-white mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{achievement.value}</div>
                <div className="text-sm text-white/80">{achievement.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

