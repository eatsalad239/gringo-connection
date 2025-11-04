/**
 * Servicio de Plantillas de Correo Electrónico - Específico por industria, consciente del idioma
 * Selecciona y personaliza automáticamente plantillas según el tipo de negocio y puntos débiles
 * ESPAÑOL PRIMERO - Diseñado para negocios colombianos
 */

export interface PlantillaCorreo {
  id: string;
  nombre: string;
  industria: string;
  idioma: 'es';
  asunto: string;
  preencabezado: string;
  plantillaDesdeBaseCuerpo: string;
  ctaTexto: string;
  serviciosRecomendados: string[];
  puntosDolientes: string[];
}

export interface ContextoCorreo {
  nombreNegocio: string;
  nombrePropietario?: string;
  industria: string;
  ciudad: string;
  puntosDolientes: string[];
  nivelIngreso: 'alto' | 'medio' | 'bajo';
  idioma: 'es';
}

// Plantillas en Español

const SERVICIOS_LEGALES_ES: PlantillaCorreo = {
  id: 'legales-es',
  nombre: 'Servicios Legales - Español',
  industria: 'Servicios Legales',
  idioma: 'es',
  asunto: 'Optimiza gestión de casos y adquisición de clientes - Abogados en {ciudad}',
  preencabezado: 'Consulta gratis: 30 min para optimizar tu despacho legal',
  plantillaDesdeBaseCuerpo: `Hola {nombrePropietario},

Dirigir un despacho legal en {ciudad} presenta desafíos únicos – desde gestionar casos complejos hasta adquirir clientes calificados consistentemente.

Trabajamos con despachos jurídicos de toda Colombia para implementar:
- Sistemas automatizados de gestión de casos
- Automatización de formularios de admisión de clientes
- Sitios web con reserva de consultas en línea
- Embudos de marketing dirigidos

Muchos de nuestros clientes legales ven 40-60% más clientes calificados en 3 meses.

¿Estarías abierto a una llamada de 20 minutos para discutir qué está funcionando para despachos similares en tu área?

Saludos,
{nombreRemitente}
Gringo Connection`,
  ctaTexto: 'Programar llamada de 20 minutos',
  serviciosRecomendados: [
    'Sitio Web con Formularios de Admisión',
    'Automatización de Gestión de Casos',
    'Sistema de Generación de Leads',
    'Plantillas de Documentos Legales',
  ],
  puntosDolientes: [
    'adquisición de clientes',
    'gestión de casos',
    'automatización de documentos',
    'presencia en línea',
    'optimización de honorarios',
  ],
};

const MEDICO_ES: PlantillaCorreo = {
  id: 'medico-es',
  industria: 'Médico/Sanitario',
  idioma: 'es',
  nombre: 'Médica/Sanitaria - Español',
  asunto: 'Moderniza agendamiento de pacientes y telemedicina - Clínicas en {ciudad}',
  preencabezado: 'Sistemas conformes con protección de datos para consultorios médicos',
  plantillaDesdeBaseCuerpo: `Hola {nombrePropietario},

Los proveedores de salud en {ciudad} enfrentan presión para modernizarse mientras mantienen cumplimiento normativo y satisfacción del paciente.

Nuestras soluciones de automatización sanitaria:
- Agendamiento seguro de citas de pacientes
- Integración de telemedicina
- Recordatorios automatizados de citas (reducen inasistencia 25%)
- Integración de facturación conforme
- Portal seguro de pacientes para historias médicas

Hemos ayudado a clínicas en {ciudad} a reducir tiempo administrativo 40% y aumentar retención de pacientes 35%.

¿Listo para una consulta confidencial?

Saludos,
{nombreRemitente}
Gringo Connection`,
  ctaTexto: 'Agendar consulta confidencial',
  serviciosRecomendados: [
    'Integración de Plataforma de Telemedicina',
    'Sistema de Gestión de Pacientes',
    'Automatización de Facturación',
    'Portal Seguro de Pacientes',
  ],
  puntosDolientes: [
    'agendamiento de pacientes',
    'adopción de telemedicina',
    'cumplimiento normativo',
    'complejidad de facturación',
    'inasistencia de citas',
  ],
};

const BIENES_RAICES_ES: PlantillaCorreo = {
  id: 'bienes-raices-es',
  industria: 'Bienes Raíces',
  idioma: 'es',
  nombre: 'Bienes Raíces - Español',
  asunto: 'Vende 3x más propiedades en línea - Agentes en {ciudad}',
  preencabezado: 'Tours virtuales, captura de leads y gestión de transacciones en una plataforma',
  plantillaDesdeBaseCuerpo: `Hola {nombrePropietario},

Los mejores agentes inmobiliarios en {ciudad} usan tecnología para cerrar más negocios más rápido.

Hemos construido sistemas para agentes en {ciudad} que:
- Crean tours 3D (aumentan las visitas 45%)
- Automatizan la captura de leads de listados de propiedades
- Se integran con MLS automáticamente
- Gestionan transacciones de principio a fin
- Generan informes de mercado para clientes

Resultado: Nuestros clientes promedian 2.3x más transacciones en 6 meses.

Descubramos cómo esto podría funcionar para tu agencia.

Saludos,
{nombreRemitente}
Gringo Connection`,
  ctaTexto: 'Ver demostración de plataforma inmobiliaria',
  serviciosRecomendados: [
    'Integración de Tours Virtuales',
    'CRM para Bienes Raíces',
    'Nutrición Automática de Leads',
    'Gestión de Transacciones',
  ],
  puntosDolientes: [
    'listados de propiedades',
    'generación de leads',
    'tours virtuales',
    'complejidad de transacciones',
    'comunicación con clientes',
  ],
};

const RESTAURANTES_ES: PlantillaCorreo = {
  id: 'restaurantes-es',
  industria: 'Restaurantes',
  idioma: 'es',
  nombre: 'Restaurantes - Español',
  asunto: 'Duplica pedidos en línea y reservas - Restaurantes en {ciudad}',
  preencabezado: '2.5x más ingresos sin contratar más personal de cocina',
  plantillaDesdeBaseCuerpo: `Hola {nombrePropietario},

Los restaurantes en {ciudad} que adoptan delivery + pedidos en línea están promediando 2.5x más ingresos.

Hemos integrado:
- Agregación de plataformas múltiples de delivery (Rappi, Uber Eats, Didi)
- Sistema de reservas con confirmaciones automatizadas
- Integración de gestión de inventario
- Sistema de pantalla de cocina
- Automatización de programa de lealtad

Restaurantes en {ciudad} usando nuestro sistema reportan:
✓ 45% aumento en pedidos en línea
✓ 25% reducción en inasistencias
✓ 40% menos errores manuales de pedidos

¿Te gustaría ver cómo tu restaurante podría capturar esto?

Saludos,
{nombreRemitente}
Gringo Connection`,
  ctaTexto: 'Ver demostración de plataforma de restaurante',
  serviciosRecomendados: [
    'Plataforma de Pedidos en Línea',
    'Integración de Delivery',
    'Sistema de Gestión de Cocina',
    'Sistema de Reservas',
    'Programa de Fidelización',
  ],
  puntosDolientes: [
    'pedidos en línea',
    'gestión de reservas',
    'seguimiento de inventario',
    'integración de delivery',
    'retención de clientes',
  ],
};

const RETAIL_ES: PlantillaCorreo = {
  id: 'retail-es',
  industria: 'Retail',
  idioma: 'es',
  nombre: 'Retail - Español',
  asunto: 'Vende en línea + en tienda sin problemas - Tiendas en {ciudad}',
  preencabezado: 'Retail omnicanal: potencial de +60% de ingresos',
  plantillaDesdeBaseCuerpo: `Hola {nombrePropietario},

Las tiendas en {ciudad} que combinan experiencia en línea + física están viendo aumentos de 60% en ingresos.

Nuestra solución minorista incluye:
- POS unificado + comercio electrónico
- Sincronización de inventario entre canales
- Programa de lealtad de clientes
- Análisis inteligentes y productos tendencia
- Alertas automáticas de reabastecimiento

En solo 90 días, nuestros clientes típicamente ven:
✓ 35% mayor valor promedio de transacción
✓ 50% aumento en clientes recurrentes
✓ 40% reducción en situaciones de falta de stock

¿Listo para convertirte en una tienda omnicanal?

Saludos,
{nombreRemitente}
Gringo Connection`,
  ctaTexto: 'Obtener consulta de omnicanal',
  serviciosRecomendados: [
    'Integración POS + Comercio Electrónico',
    'Gestión de Inventario',
    'Sistema de Lealtad del Cliente',
    'Panel de Análisis',
  ],
  puntosDolientes: [
    'integración POS',
    'seguimiento de inventario',
    'presencia de comercio electrónico',
    'lealtad del cliente',
    'ventas multicanal',
  ],
};

const MANUFACTURA_ES: PlantillaCorreo = {
  id: 'manufactura-es',
  industria: 'Manufactura',
  idioma: 'es',
  nombre: 'Manufactura - Español',
  asunto: 'Reduce desperdicio de producción 35% - Fabricantes en {ciudad}',
  preencabezado: 'Optimización de cadena de suministro y seguimiento de producción',
  plantillaDesdeBaseCuerpo: `Hola {nombrePropietario},

Los fabricantes líderes en {ciudad} están usando seguimiento de producción en tiempo real para reducir desperdicio e impulsar eficiencia.

Proporcionamos:
- Monitoreo de piso de producción
- Alertas automatizadas de control de calidad
- Visibilidad de cadena de suministro
- Programación de mantenimiento predictivo
- Panel de informes en tiempo real

Los fabricantes que usan nuestro sistema ven:
✓ 35% reducción de desperdicio de producción
✓ 25% mejora en entrega a tiempo
✓ 40% identificación más rápida de problemas

Hablemos sobre cómo esto se aplica a tu operación.

Saludos,
{nombreRemitente}
Gringo Connection`,
  ctaTexto: 'Agendar llamada de optimización de producción',
  serviciosRecomendados: [
    'Sistema de Seguimiento de Producción',
    'Automatización de Control de Calidad',
    'Gestión de Cadena de Suministro',
    'Mantenimiento Predictivo',
  ],
  puntosDolientes: [
    'visibilidad de cadena de suministro',
    'control de calidad',
    'eficiencia de producción',
    'reducción de desperdicio',
    'mantenimiento predictivo',
  ],
};

const CONSTRUCCION_ES: PlantillaCorreo = {
  id: 'construccion-es',
  industria: 'Construcción',
  idioma: 'es',
  nombre: 'Construcción - Español',
  asunto: 'Completa proyectos a tiempo y dentro de presupuesto - Constructores en {ciudad}',
  preencabezado: 'Gestión de proyectos y seguimiento de costos en tiempo real',
  plantillaDesdeBaseCuerpo: `Hola {nombrePropietario},

Los constructores exitosos en {ciudad} están completando proyectos a tiempo y dentro de presupuesto usando software moderno.

Nuestras soluciones para construcción:
- Gestión centralizada de proyectos
- Seguimiento de costos en tiempo real
- Asignación automática de equipos y trabajadores
- Comunicación del sitio en línea
- Documentación y reportes automáticos

Constructores usando nuestro sistema reportan:
✓ 30% mejora en cumplimiento de cronograma
✓ 25% reducción de costos de overrun
✓ 40% menos retrabajos

Descubramos cómo mejorar tu próximo proyecto.

Saludos,
{nombreRemitente}
Gringo Connection`,
  ctaTexto: 'Ver demostración de gestión de proyectos',
  serviciosRecomendados: [
    'Plataforma de Gestión de Proyectos',
    'Seguimiento de Costos',
    'Asignación de Equipos',
    'Documentación Automatizada',
  ],
  puntosDolientes: [
    'gestión de proyectos',
    'seguimiento de costos',
    'cumplimiento de cronograma',
    'comunicación del sitio',
    'documentación',
  ],
};

const EDUCACION_ES: PlantillaCorreo = {
  id: 'educacion-es',
  industria: 'Educación',
  idioma: 'es',
  nombre: 'Educación - Español',
  asunto: 'Moderniza enseñanza con aula virtual - Instituciones en {ciudad}',
  preencabezado: 'Gestión de estudiantes y plataforma de aprendizaje en línea',
  plantillaDesdeBaseCuerpo: `Hola {nombrePropietario},

Las instituciones educativas líderes en {ciudad} están adoptando aulas virtuales para mayor alcance y flexibilidad.

Nuestras soluciones educativas:
- Plataforma de aula virtual interactiva
- Gestión de estudiantes centralizada
- Seguimiento automático de asistencia
- Evaluaciones en línea y calificación automática
- Portal de padres y comunicación

Instituciones usando nuestro sistema reportan:
✓ 50% aumento en inscripciones
✓ 35% mejora en retención de estudiantes
✓ 40% menos trabajo administrativo

¿Listo para modernizar tu institución?

Saludos,
{nombreRemitente}
Gringo Connection`,
  ctaTexto: 'Ver demostración educativa',
  serviciosRecomendados: [
    'Plataforma de Aula Virtual',
    'Sistema de Gestión de Estudiantes',
    'Evaluaciones Automatizadas',
    'Portal de Padres',
  ],
  puntosDolientes: [
    'aprendizaje en línea',
    'gestión de estudiantes',
    'aula virtual',
    'seguimiento de calificaciones',
    'comunicación con padres',
  ],
};

const CONTABILIDAD_ES: PlantillaCorreo = {
  id: 'contabilidad-es',
  industria: 'Contabilidad',
  idioma: 'es',
  nombre: 'Contabilidad - Español',
  asunto: 'Automatiza contabilidad y cumplimiento fiscal - Contadores en {ciudad}',
  preencabezado: 'Sistemas conformes y automatización de facturación',
  plantillaDesdeBaseCuerpo: `Hola {nombrePropietario},

Los despachos contables líderes en {ciudad} están automatizando tareas repetitivas para enfocarse en asesoramiento estratégico.

Nuestras soluciones contables:
- Automatización de entrada de datos contables
- Cumplimiento fiscal y reportes automáticos
- Integración con sistemas bancarios
- Auditoría y trazabilidad completa
- Portal de cliente para documentos

Despachos contables usando nuestro sistema reportan:
✓ 50% menos tiempo en tareas manuales
✓ Cero errores de cumplimiento
✓ 60% más capacidad de client adicionales

¿Listo para escalar tu despacho?

Saludos,
{nombreRemitente}
Gringo Connection`,
  ctaTexto: 'Ver demostración contable',
  serviciosRecomendados: [
    'Automatización Contable',
    'Cumplimiento Fiscal Automático',
    'Integración Bancaria',
    'Auditoría Automatizada',
  ],
  puntosDolientes: [
    'entrada de datos contables',
    'cumplimiento fiscal',
    'reportes financieros',
    'auditoría y trazabilidad',
    'escalabilidad del despacho',
  ],
};

const MARKETING_ES: PlantillaCorreo = {
  id: 'marketing-es',
  industria: 'Agencia de Marketing',
  idioma: 'es',
  nombre: 'Agencia de Marketing - Español',
  asunto: 'Automatiza campañas y reportes - Agencias en {ciudad}',
  preencabezado: 'Gestión de campañas y análisis avanzado para agencias',
  plantillaDesdeBaseCuerpo: `Hola {nombrePropietario},

Las agencias de marketing exitosas en {ciudad} están usando automatización para manejar 3x más clientes con el mismo equipo.

Nuestras soluciones para agencias:
- Automatización de gestión de campañas
- Reportes de cliente automáticos y reales
- Integración de todos los canales (Meta, Google, LinkedIn)
- Gestión centralizada de cuentas de cliente
- Análisis predictivo y recomendaciones

Agencias usando nuestro sistema reportan:
✓ 60% menos tiempo en reportes
✓ 3x más clientes con mismo equipo
✓ 40% mejora en retención de clientes

¿Listo para automatizar tu agencia?

Saludos,
{nombreRemitente}
Gringo Connection`,
  ctaTexto: 'Ver demostración de automatización',
  serviciosRecomendados: [
    'Automatización de Campaña',
    'Reportes Automáticos',
    'Integración de Canales',
    'Análisis Predictivo',
  ],
  puntosDolientes: [
    'gestión de campañas',
    'reportes de clientes',
    'integración de canales',
    'escalabilidad',
    'análisis de datos',
  ],
};

// Registro de plantillas
const PLANTILLAS: PlantillaCorreo[] = [
  SERVICIOS_LEGALES_ES,
  MEDICO_ES,
  BIENES_RAICES_ES,
  RESTAURANTES_ES,
  RETAIL_ES,
  MANUFACTURA_ES,
  CONSTRUCCION_ES,
  EDUCACION_ES,
  CONTABILIDAD_ES,
  MARKETING_ES,
];

/**
 * Seleccionar mejor plantilla según perfil empresarial
 */
export function seleccionarPlantilla(contexto: ContextoCorreo): PlantillaCorreo | null {
  const plantilla = PLANTILLAS.find((t) => t.industria === contexto.industria);
  return plantilla || null;
}

/**
 * Renderizar correo con contexto
 */
export function renderizarCorreo(
  plantilla: PlantillaCorreo,
  contexto: ContextoCorreo,
  nombreRemitente: string = 'Daniel Smith'
): { asunto: string; preencabezado: string; cuerpo: string; ctaTexto: string } {
  let asunto = plantilla.asunto
    .replace('{ciudad}', contexto.ciudad)
    .replace('{industria}', contexto.industria);

  let cuerpo = plantilla.plantillaDesdeBaseCuerpo
    .replace(/{nombrePropietario}/g, contexto.nombrePropietario || 'allá')
    .replace(/{nombreNegocio}/g, contexto.nombreNegocio)
    .replace(/{ciudad}/g, contexto.ciudad)
    .replace(/{industria}/g, contexto.industria)
    .replace(/{nombreRemitente}/g, nombreRemitente);

  return {
    asunto,
    preencabezado: plantilla.preencabezado,
    cuerpo,
    ctaTexto: plantilla.ctaTexto,
  };
}

/**
 * Generar correo HTML desde plantilla
 */
export function generarCorreoHtml(
  contenidoCorreo: { asunto: string; preencabezado: string; cuerpo: string; ctaTexto: string },
  correoRemitente: string = 'info@gringoconnection.com',
  serviciosRecomendados: string[] = []
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${contenidoCorreo.asunto}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <!-- Preencabezado -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${contenidoCorreo.preencabezado}
  </div>

  <!-- Contenedor -->
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Encabezado -->
    <div style="background: linear-gradient(135deg, #0066cc, #004499); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 24px;">Gringo Connection</h1>
      <p style="margin: 5px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Crecimiento Empresarial y Automatización</p>
    </div>

    <!-- Cuerpo -->
    <div style="background: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
      ${contenidoCorreo.cuerpo
        .split('\n\n')
        .map((parrafo) => `<p style="margin: 0 0 15px; line-height: 1.6; color: #333;">${parrafo.replace(/\n/g, '<br>')}</p>`)
        .join('')}

      ${
        serviciosRecomendados.length > 0
          ? `
        <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0 0 10px; font-weight: 600; color: #1f2937;">💡 Servicios que podrían ayudar:</p>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
            ${serviciosRecomendados.map((servicio) => `<li style="margin: 5px 0;">${servicio}</li>`).join('')}
          </ul>
        </div>
      `
          : ''
      }

      <!-- Botón CTA -->
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
          ${contenidoCorreo.ctaTexto}
        </a>
      </div>
    </div>

    <!-- Pie de página -->
    <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; font-size: 13px; color: #6b7280; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
      <p style="margin: 0 0 10px;">
        <strong>Gringo Connection</strong><br>
        <a href="mailto:${correoRemitente}" style="color: #0066cc; text-decoration: none;">${correoRemitente}</a> | 
        <a href="https://gringoconnection.com" style="color: #0066cc; text-decoration: none;">gringoconnection.com</a>
      </p>
      <p style="margin: 0 0 10px;">
        Respetamos tu bandeja de entrada.<br>
        <a href="#" style="color: #6b7280; text-decoration: none;">Desuscribirse</a> si prefieres no escuchar de nosotros.
      </p>
      <p style="margin: 0; color: #999; font-size: 12px;">
        © ${new Date().getFullYear()} Gringo Connection. Todos los derechos reservados.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Obtener todas las plantillas para una industria
 */
export function obtenerPlantillasIndustria(industria: string): PlantillaCorreo[] {
  return PLANTILLAS.filter((t) => t.industria === industria);
}

/**
 * Obtener todas las industrias disponibles
 */
export function obtenerIndustriasDisponibles(): string[] {
  return Array.from(new Set(PLANTILLAS.map((t) => t.industria)));
}
