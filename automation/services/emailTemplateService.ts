/**
 * Email Template Service - Industry-specific, language-aware email templates
 * Automatically selects and customizes templates based on business type and pain points
 */

export interface EmailTemplate {
  id: string;
  name: string;
  industry: string;
  language: 'en' | 'es';
  subject: string;
  preheader: string;
  bodyTemplate: string;
  cta: string;
  recommendedServices: string[];
  painPoints: string[];
}

export interface EmailContext {
  businessName: string;
  ownerName?: string;
  industry: string;
  city: string;
  painPoints: string[];
  revenueLevel: 'high' | 'medium' | 'low';
  language: 'en' | 'es';
}

// English Templates

const LEGAL_SERVICES_EN: EmailTemplate = {
  id: 'legal-en',
  name: 'Legal Services - English',
  industry: 'Legal Services',
  language: 'en',
  subject: 'Streamline case management & client acquisition - Legal practitioners in {city}',
  preheader: 'Free consultation: 30 min call on optimizing your legal practice',
  bodyTemplate: `Hi {ownerName},

Running a legal practice in {city} comes with unique challenges – from managing complex cases to acquiring quality clients consistently.

We work with law firms across Colombia to implement:
- Automated case management systems
- Client intake & document automation
- Website with online consultation booking
- Targeted marketing funnels

Many of our legal clients see 40-60% more qualified leads within 3 months.

Would you be open to a quick 20-minute call to discuss what's working for similar practices in your area?

Best,
{senderName}
Gringo Connection`,
  cta: 'Schedule a 20-min call',
  recommendedServices: [
    'Custom Website with Intake Forms',
    'Case Management Automation',
    'Lead Generation System',
    'Legal Document Templates',
  ],
  painPoints: [
    'client acquisition',
    'case management',
    'document automation',
    'online presence',
    'fee structure optimization',
  ],
};

const MEDICAL_EN: EmailTemplate = {
  id: 'medical-en',
  industry: 'Medical/Healthcare',
  language: 'en',
  name: 'Medical/Healthcare - English',
  subject: 'Modernize patient scheduling & telehealth - {city} clinics',
  preheader: 'HIPAA-compliant systems for healthcare practices',
  bodyTemplate: `Hi {ownerName},

Healthcare providers in {city} are facing pressure to modernize while maintaining HIPAA compliance and patient satisfaction.

Our healthcare automation solutions:
- Secure patient appointment scheduling
- Telehealth integration
- Automated appointment reminders (reduce no-shows by 25%)
- HIPAA-compliant billing integration
- Patient portal for medical records

We've helped {city} clinics reduce administrative time by 40% and increase patient retention by 35%.

Ready for a confidential consultation?

Best,
{senderName}
Gringo Connection`,
  cta: 'Book a confidential consultation',
  recommendedServices: [
    'Telehealth Platform Integration',
    'Patient Management System',
    'Billing Automation',
    'Secure Patient Portal',
  ],
  painPoints: [
    'patient scheduling',
    'telemedicine adoption',
    'HIPAA compliance',
    'billing complexity',
    'appointment no-shows',
  ],
};

const REAL_ESTATE_EN: EmailTemplate = {
  id: 'real-estate-en',
  industry: 'Real Estate',
  language: 'en',
  name: 'Real Estate - English',
  subject: 'List 3x more properties online - {city} realtors',
  preheader: 'Virtual tours, lead capture, and transaction management in one platform',
  bodyTemplate: `Hi {ownerName},

The best real estate agents in {city} are using technology to close more deals faster.

We've built systems for {city} realtors that:
- Create 3D virtual tours (increase showings by 45%)
- Automate lead capture from property listings
- Integrate with MLS automatically
- Manage transactions end-to-end
- Generate market reports for clients

Result: Our clients average 2.3x more transactions in 6 months.

Let's find out how this could work for your agency.

Best,
{senderName}
Gringo Connection`,
  cta: 'See a demo of our real estate platform',
  recommendedServices: [
    'Virtual Tour Integration',
    'CRM for Real Estate',
    'Automated Lead Nurturing',
    'Transaction Management',
  ],
  painPoints: [
    'property listings',
    'lead generation',
    'virtual tours',
    'transaction complexity',
    'client communication',
  ],
};

const RESTAURANT_EN: EmailTemplate = {
  id: 'restaurant-en',
  industry: 'Restaurants',
  language: 'en',
  name: 'Restaurants - English',
  subject: 'Double online orders & reservations - {city} restaurants',
  preheader: '2.5x more revenue without hiring kitchen staff',
  bodyTemplate: `Hi {ownerName},

{city} restaurants that embrace delivery + online ordering are averaging 2.5x more revenue.

We've integrated:
- Multi-platform delivery aggregation (Rappi, Uber Eats, Didi)
- Reservation system with automated confirmations
- Inventory management integration
- Kitchen display system
- Loyalty program automation

{city} restaurants using our system report:
✓ 45% increase in online orders
✓ 25% reduction in no-shows
✓ 40% less manual order errors

Want to see how your restaurant could capture this?

Best,
{senderName}
Gringo Connection`,
  cta: 'See restaurant platform demo',
  recommendedServices: [
    'Online Ordering Platform',
    'Delivery Integration',
    'Kitchen Management System',
    'Reservation System',
    'Loyalty Program',
  ],
  painPoints: [
    'online ordering',
    'reservation management',
    'inventory tracking',
    'delivery integration',
    'customer retention',
  ],
};

const RETAIL_EN: EmailTemplate = {
  id: 'retail-en',
  industry: 'Retail',
  language: 'en',
  name: 'Retail - English',
  subject: 'Sell online + in-store seamlessly - {city} retailers',
  preheader: 'Omnichannel retail: +60% revenue potential',
  bodyTemplate: `Hi {ownerName},

{city} retailers combining online + physical store experience are seeing 60% revenue increases.

Our retail solution includes:
- Unified point-of-sale + ecommerce
- Inventory sync across channels
- Customer loyalty program
- Smart analytics & trending products
- Automated restocking alerts

In just 90 days, our clients typically see:
✓ 35% higher average transaction value
✓ 50% increase in repeat customers
✓ 40% reduction in out-of-stock situations

Ready to become an omnichannel retailer?

Best,
{senderName}
Gringo Connection`,
  cta: 'Get an omnichannel consultation',
  recommendedServices: [
    'POS + eCommerce Integration',
    'Inventory Management',
    'Customer Loyalty System',
    'Analytics Dashboard',
  ],
  painPoints: [
    'POS integration',
    'inventory tracking',
    'ecommerce presence',
    'customer loyalty',
    'multi-channel sales',
  ],
};

const MANUFACTURING_EN: EmailTemplate = {
  id: 'manufacturing-en',
  industry: 'Manufacturing',
  language: 'en',
  name: 'Manufacturing - English',
  subject: 'Cut production waste by 35% - {city} manufacturers',
  preheader: 'Supply chain optimization & production tracking',
  bodyTemplate: `Hi {ownerName},

Leading manufacturers in {city} are using real-time production tracking to reduce waste and boost efficiency.

We provide:
- Production floor monitoring
- Automated quality control alerts
- Supply chain visibility
- Predictive maintenance scheduling
- Real-time reporting dashboard

Manufacturers using our system see:
✓ 35% reduction in production waste
✓ 25% improvement in on-time delivery
✓ 40% faster problem identification

Let's discuss how this applies to your operation.

Best,
{senderName}
Gringo Connection`,
  cta: 'Schedule production optimization call',
  recommendedServices: [
    'Production Tracking System',
    'Quality Control Automation',
    'Supply Chain Management',
    'Predictive Maintenance',
  ],
  painPoints: [
    'supply chain visibility',
    'quality control',
    'production efficiency',
    'waste reduction',
    'predictive maintenance',
  ],
};

// Spanish Templates (Español)

const LEGAL_SERVICES_ES: EmailTemplate = {
  id: 'legal-es',
  name: 'Servicios Legales - Español',
  industry: 'Legal Services',
  language: 'es',
  subject: 'Optimiza gestión de casos y adquisición de clientes - Abogados en {city}',
  preheader: 'Consulta gratis: 30 min sobre cómo optimizar tu práctica legal',
  bodyTemplate: `Hola {ownerName},

Dirigir un despacho legal en {city} presenta desafíos únicos – desde gestionar casos complejos hasta adquirir clientes calificados consistentemente.

Trabajamos con despachos jurídicos de toda Colombia para implementar:
- Sistemas automatizados de gestión de casos
- Automatización de formularios de admisión de clientes
- Sitios web con reserva de consultas en línea
- Embudos de marketing dirigidos

Muchos de nuestros clientes legales ven 40-60% más clientes calificados en 3 meses.

¿Estarías abierto a una llamada de 20 minutos para discutir qué está funcionando para despachos similares en tu área?

Saludos,
{senderName}
Gringo Connection`,
  cta: 'Programar llamada de 20 minutos',
  recommendedServices: [
    'Sitio web con formularios de admisión',
    'Automatización de gestión de casos',
    'Sistema de generación de leads',
    'Plantillas de documentos legales',
  ],
  painPoints: [
    'adquisición de clientes',
    'gestión de casos',
    'automatización de documentos',
    'presencia en línea',
    'optimización de honorarios',
  ],
};

const MEDICAL_ES: EmailTemplate = {
  id: 'medical-es',
  industry: 'Medical/Healthcare',
  language: 'es',
  name: 'Médica/Sanitaria - Español',
  subject: 'Moderniza agendamiento de pacientes y telemedicina - Clínicas en {city}',
  preheader: 'Sistemas conformes con protección de datos para consultorios',
  bodyTemplate: `Hola {ownerName},

Los proveedores de salud en {city} enfrentan presión para modernizarse mientras mantienen cumplimiento normativo y satisfacción del paciente.

Nuestras soluciones de automatización sanitaria:
- Agendamiento seguro de citas de pacientes
- Integración de telemedicina
- Recordatorios automatizados de citas (reducen inasistencia 25%)
- Integración de facturación conforme
- Portal seguro de pacientes para historias médicas

Hemos ayudado a clínicas en {city} a reducir tiempo administrativo 40% y aumentar retención de pacientes 35%.

¿Listo para una consulta confidencial?

Saludos,
{senderName}
Gringo Connection`,
  cta: 'Agendar consulta confidencial',
  recommendedServices: [
    'Integración de plataforma de telemedicina',
    'Sistema de gestión de pacientes',
    'Automatización de facturación',
    'Portal seguro de pacientes',
  ],
  painPoints: [
    'agendamiento de pacientes',
    'adopción de telemedicina',
    'cumplimiento normativo',
    'complejidad de facturación',
    'inasistencia de citas',
  ],
};

const RESTAURANT_ES: EmailTemplate = {
  id: 'restaurant-es',
  industry: 'Restaurants',
  language: 'es',
  name: 'Restaurantes - Español',
  subject: 'Duplica pedidos en línea y reservas - Restaurantes en {city}',
  preheader: '2.5x más ingresos sin contratar más personal de cocina',
  bodyTemplate: `Hola {ownerName},

Los restaurantes en {city} que adoptan delivery + pedidos en línea están promediando 2.5x más ingresos.

Hemos integrado:
- Agregación de plataformas múltiples de delivery (Rappi, Uber Eats, Didi)
- Sistema de reservas con confirmaciones automatizadas
- Integración de gestión de inventario
- Sistema de pantalla de cocina
- Automatización de programa de lealtad

Restaurantes en {city} usando nuestro sistema reportan:
✓ 45% aumento en pedidos en línea
✓ 25% reducción en inasistencias
✓ 40% menos errores manuales de pedidos

¿Te gustaría ver cómo tu restaurante podría capturar esto?

Saludos,
{senderName}
Gringo Connection`,
  cta: 'Ver demo de plataforma de restaurante',
  recommendedServices: [
    'Plataforma de pedidos en línea',
    'Integración de delivery',
    'Sistema de gestión de cocina',
    'Sistema de reservas',
    'Programa de fidelización',
  ],
  painPoints: [
    'pedidos en línea',
    'gestión de reservas',
    'seguimiento de inventario',
    'integración de delivery',
    'retención de clientes',
  ],
};

// Template registry
const TEMPLATES: EmailTemplate[] = [
  LEGAL_SERVICES_EN,
  LEGAL_SERVICES_ES,
  MEDICAL_EN,
  MEDICAL_ES,
  REAL_ESTATE_EN,
  RESTAURANT_EN,
  RESTAURANT_ES,
  RETAIL_EN,
  MANUFACTURING_EN,
];

/**
 * Select best template based on business profile
 */
export function selectTemplate(context: EmailContext): EmailTemplate | null {
  let template = TEMPLATES.find(
    (t) => t.industry === context.industry && t.language === context.language
  );

  // Fallback to English if language not available
  if (!template) {
    template = TEMPLATES.find((t) => t.industry === context.industry && t.language === 'en');
  }

  return template || null;
}

/**
 * Render email with context
 */
export function renderEmail(
  template: EmailTemplate,
  context: EmailContext,
  senderName: string = 'Daniel Smith'
): { subject: string; preheader: string; body: string; cta: string } {
  let subject = template.subject
    .replace('{city}', context.city)
    .replace('{industry}', context.industry);

  let body = template.bodyTemplate
    .replace(/{ownerName}/g, context.ownerName || 'there')
    .replace(/{businessName}/g, context.businessName)
    .replace(/{city}/g, context.city)
    .replace(/{industry}/g, context.industry)
    .replace(/{senderName}/g, senderName);

  return {
    subject,
    preheader: template.preheader,
    body,
    cta: template.cta,
  };
}

/**
 * Generate HTML email from template
 */
export function generateHtmlEmail(
  emailContent: { subject: string; preheader: string; body: string; cta: string },
  senderEmail: string = 'info@gringoconnection.com',
  recommendedServices: string[] = []
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailContent.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <!-- Preheader -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${emailContent.preheader}
  </div>

  <!-- Container -->
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0066cc, #004499); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 24px;">Gringo Connection</h1>
      <p style="margin: 5px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Business Growth & Automation</p>
    </div>

    <!-- Body -->
    <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
      ${emailContent.body
        .split('\n\n')
        .map((paragraph) => `<p style="margin: 0 0 15px; line-height: 1.6; color: #333;">${paragraph.replace(/\n/g, '<br>')}</p>`)
        .join('')}

      ${
        recommendedServices.length > 0
          ? `
        <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0 0 10px; font-weight: 600; color: #1f2937;">💡 Services that could help:</p>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
            ${recommendedServices.map((service) => `<li style="margin: 5px 0;">${service}</li>`).join('')}
          </ul>
        </div>
      `
          : ''
      }

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://calendly.com/gringoconnection/15min" style="
          display: inline-block;
          background: #0066cc;
          color: white;
          padding: 12px 30px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
        ">
          ${emailContent.cta}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; font-size: 13px; color: #6b7280; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
      <p style="margin: 0 0 10px;">
        <strong>Gringo Connection</strong><br>
        <a href="mailto:${senderEmail}" style="color: #0066cc; text-decoration: none;">${senderEmail}</a> | 
        <a href="https://gringoconnection.com" style="color: #0066cc; text-decoration: none;">gringoconnection.com</a>
      </p>
      <p style="margin: 0 0 10px;">
        We respect your inbox.<br>
        <a href="#" style="color: #6b7280; text-decoration: none;">Unsubscribe</a> if you'd prefer not to hear from us.
      </p>
      <p style="margin: 0; color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} Gringo Connection. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Get all templates for an industry
 */
export function getIndustryTemplates(industry: string): EmailTemplate[] {
  return TEMPLATES.filter((t) => t.industry === industry);
}

/**
 * Get all available industries
 */
export function getAvailableIndustries(): string[] {
  return Array.from(new Set(TEMPLATES.map((t) => t.industry)));
}
