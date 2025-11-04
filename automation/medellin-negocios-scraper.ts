/**
 * Scraper de Negocios de Medellín - Enfoque Español Colombiano
 * Extrae datos de negocios de fuentes locales de Medellín
 * Prioriza negocios de alto valor con dueños operativos
 */

import { chromium } from 'playwright';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { llm } from './providers.js';

interface NegocioMedellin {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  sitio_web?: string;
  direccion: string;
  barrio: string;
  industria: string;
  estimacion_ingresos?: 'alto' | 'medio' | 'bajo';
  dueno_operativo: boolean;
  puntos_dolor: string[];
  servicios_necesarios: string[];
  prioridad_contacto: number;
  fuente_datos: string;
  fecha_extraccion: string;
}

const DIR_DATOS = join(process.cwd(), 'data');
const ARCHIVO_NEGOCIOS = join(DIR_DATOS, 'negocios_medellin.json');

if (!existsSync(DIR_DATOS)) {
  require('fs').mkdirSync(DIR_DATOS, { recursive: true });
}

// Barrios de Medellín y zonas comerciales
const BARRIOS_MEDELLIN = [
  'El Poblado', 'Laureles', 'Centro', 'Envigado', 'Itagüí',
  'Sabaneta', 'Belén', 'Robledo', 'Aranjuez', 'Villa Hermosa',
  'Buenos Aires', 'Manrique', 'Castilla', 'Doce de Octubre', 'Popular'
];

// Perfiles por industria con puntos de dolor y servicios en español
const PERFILES_INDUSTRIA = {
  'restaurantes': {
    puntos_dolor: ['pedidos en línea lentos', 'malas reseñas que afectan ventas', 'menús desactualizados', 'clientes que no regresan', 'competencia de apps de delivery'],
    servicios: ['sistema de pedidos online integrado', 'gestión automática de reseñas', 'menú digital con fotos', 'programa de fidelización', 'optimización SEO local']
  },
  'clínicas': {
    puntos_dolor: ['pacientes que faltan a citas', 'historias clínicas en papel', 'facturación lenta y errores', 'competencia de clínicas grandes', 'pacientes que no pagan'],
    servicios: ['sistema de recordatorios automáticos', 'historia clínica digital', 'facturación automática POS', 'app para pacientes', 'marketing de boca en boca digital']
  },
  'abogados': {
    puntos_dolor: ['plazos procesales que se vencen', 'documentos que se pierden', 'clientes que no pagan honorarios', 'competencia de bufetes grandes', 'gestión de casos caótica'],
    servicios: ['sistema de alertas de plazos', 'automatización documental legal', 'portal seguro del cliente', 'sistema de facturación jurídica', 'CRM legal especializado']
  },
  'contadores': {
    puntos_dolor: ['declaraciones de renta atrasadas', 'clientes que no entregan documentos', 'multas por errores tributarios', 'competencia de firmas grandes', 'trabajo manual repetitivo'],
    servicios: ['software contable certificado en Colombia', 'recordatorios automáticos a clientes', 'declaraciones automáticas DIAN', 'portal seguro para clientes', 'alertas de cumplimiento tributario']
  },
  'inmobiliarias': {
    puntos_dolor: ['listados de propiedades desactualizados', 'clientes que no concretan ventas', 'fotos de baja calidad', 'competencia online', 'gestión manual de contratos'],
    servicios: ['sitio web inmobiliario moderno', 'tours virtuales 360°', 'sistema de contratos digitales', 'CRM inmobiliario', 'marketing digital especializado']
  },
  'comercios': {
    puntos_dolor: ['inventario que no cuadra', 'clientes que no regresan', 'ventas estancadas', 'competencia de grandes cadenas', 'gestión manual de proveedores'],
    servicios: ['sistema de inventario automático', 'programa de fidelización digital', 'tienda virtual integrada', 'gestión automática de proveedores', 'marketing local dirigido']
  },
  'empresas_servicios': {
    puntos_dolor: ['automatización de procesos manuales', 'gestión documental caótica', 'CRM desactualizado', 'facturación masiva ineficiente', 'reportes que toman tiempo'],
    servicios: ['automatización de procesos empresariales', 'gestión documental digital', 'CRM personalizado colombiano', 'facturación electrónica masiva', 'business intelligence en tiempo real']
  },
  'hoteles': {
    puntos_dolor: ['reservas que se pierden', 'check-in lento', 'reseñas negativas online', 'competencia de plataformas grandes', 'gestión de habitaciones manual'],
    servicios: ['motor de reservas integrado', 'check-in sin contacto', 'gestión automática de reseñas', 'sistema PMS colombiano', 'marketing turístico local']
  }
};

// Cargar datos existentes
function cargarDatosNegocios(): NegocioMedellin[] {
  try {
    if (existsSync(ARCHIVO_NEGOCIOS)) {
      return JSON.parse(readFileSync(ARCHIVO_NEGOCIOS, 'utf-8'));
    }
  } catch (e) {
    console.warn('No se pudieron cargar los datos existentes:', e);
  }
  return [];
}

// Guardar datos de negocios
function guardarDatosNegocios(negocios: NegocioMedellin[]): void {
  writeFileSync(ARCHIVO_NEGOCIOS, JSON.stringify(negocios, null, 2));
}

// Analizar negocio para estimación de ingresos y estatus de dueño operativo
async function analizarNegocio(negocio: Partial<NegocioMedellin>): Promise<NegocioMedellin> {
  const prompt = `Analiza este negocio de Medellín y proporciona información detallada en español colombiano para outreach comercial:

Datos del negocio:
- Nombre: ${negocio.nombre}
- Industria: ${negocio.industria}
- Barrio: ${negocio.barrio}
- Dirección: ${negocio.direccion}
- Sitio web: ${negocio.sitio_web || 'No disponible'}
- Teléfono: ${negocio.telefono || 'No disponible'}

Basado en conocimiento local de Medellín y economía colombiana, estima:
1. Estimación de ingresos: alto/medio/bajo (alto = más de $200M COP/año, medio = $50M-200M, bajo = menos de $50M)
2. Dueño operativo: true/false (¿es un negocio familiar donde el dueño está activamente involucrado en operaciones diarias?)
3. Puntos de dolor: 3-5 problemas específicos que enfrenta este negocio en Medellín
4. Servicios necesarios: 3-5 soluciones digitales que ayudarían específicamente
5. Prioridad de contacto: 1-10 (10 = máxima prioridad para campaña de email)

Consideraciones colombianas:
- Economía local de Medellín y el barrio específico
- Regulaciones colombianas (DIAN, Supersalud, etc.)
- Tendencias digitales en Colombia
- Competencia local vs plataformas globales
- Costos y realidad económica colombiana

Output JSON válido:
{
  "estimacion_ingresos": "alto|medio|bajo",
  "dueno_operativo": true|false,
  "puntos_dolor": ["dolor1", "dolor2", "dolor3"],
  "servicios_necesarios": ["servicio1", "servicio2", "servicio3"],
  "prioridad_contacto": 1-10
}`;

  const result = await llm.text(prompt, {
    maxTokens: 600,
    temperature: 0.3,
    system: 'Eres un analista comercial colombiano especializado en Medellín. Conoces perfectamente el mercado local, regulaciones colombianas y comportamiento de negocios. Output solo JSON válido.',
  });

  let analisis = {
    estimacion_ingresos: 'medio' as const,
    dueno_operativo: true,
    puntos_dolor: [],
    servicios_necesarios: [],
    prioridad_contacto: 5
  };

  if (result.ok && result.text) {
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        analisis = { ...analisis, ...parsed };
      }
    } catch (e) {
      console.warn('No se pudo analizar la respuesta del negocio:', e);
    }
  }

  return {
    ...negocio,
    ...analisis,
    fecha_extraccion: new Date().toISOString()
  } as NegocioMedellin;
}

// Extraer de Páginas Amarillas Medellín
async function extraerPaginasAmarillasMedellin(barrio: string, industria: string): Promise<Partial<NegocioMedellin>[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const negocios: Partial<NegocioMedellin>[] = [];

  try {
    const page = await context.newPage();

    const consultaBusqueda = `${industria} ${barrio} Medellín Colombia`;
    const urlBusqueda = `https://www.paginasamarillas.com.co/buscar/${encodeURIComponent(consultaBusqueda)}`;

    console.log(`🔍 Extrayendo Páginas Amarillas: ${consultaBusqueda}`);

    await page.goto(urlBusqueda, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const listings = await page.$$eval('.business-card, .listing-item, [data-business]', (elements) => {
      return elements.slice(0, 15).map(el => {
        const nombre = el.querySelector('h2, .business-name, .title')?.textContent?.trim();
        const direccion = el.querySelector('.address, .location')?.textContent?.trim();
        const telefono = el.querySelector('.phone, .tel')?.textContent?.trim();
        const sitio_web = el.querySelector('a[href*="http"]')?.getAttribute('href');

        return {
          nombre,
          direccion,
          telefono,
          sitio_web: sitio_web?.startsWith('http') ? sitio_web : undefined
        };
      }).filter(item => item.nombre && item.direccion);
    });

    for (const listing of listings) {
      negocios.push({
        ...listing,
        barrio,
        industria,
        fuente_datos: 'paginasamarillas_medellin'
      });
    }

    console.log(`✅ Encontrados ${negocios.length} negocios en Páginas Amarillas`);

  } catch (e) {
    console.warn(`No se pudieron extraer datos de Páginas Amarillas para ${barrio}/${industria}:`, e);
  } finally {
    await browser.close();
  }

  return negocios;
}

// Extraer de Google Maps Medellín
async function extraerGoogleMapsMedellin(barrio: string, industria: string): Promise<Partial<NegocioMedellin>[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const negocios: Partial<NegocioMedellin>[] = [];

  try {
    const page = await context.newPage();

    const consultaBusqueda = `${industria} en ${barrio} Medellín Colombia`;
    const urlMaps = `https://www.google.com/maps/search/${encodeURIComponent(consultaBusqueda)}`;

    console.log(`🗺️  Extrayendo Google Maps: ${consultaBusqueda}`);

    await page.goto(urlMaps, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    try {
      await page.click('button:has-text("Aceptar"), button:has-text("Accept")', { timeout: 5000 });
    } catch (e) {
      // Continuar si no hay banner de cookies
    }

    await page.waitForSelector('[role="article"], .Nv2PK, [data-result-index]', { timeout: 10000 });

    const results = await page.$$eval('[role="article"], .Nv2PK, [data-result-index]', (elements) => {
      return elements.slice(0, 12).map(el => {
        const nombre = el.querySelector('h3, .fontHeadlineSmall, .qBF1Pd')?.textContent?.trim();
        const direccion = el.querySelector('[data-item-id*="address"], .Io6YTe')?.textContent?.trim();
        const rating = el.querySelector('.MW4etd, .ZkP5Je')?.textContent?.trim();

        return {
          nombre,
          direccion,
          rating: rating ? parseFloat(rating) : undefined
        };
      }).filter(item => item.nombre);
    });

    for (const result of results) {
      negocios.push({
        ...result,
        barrio,
        industria,
        fuente_datos: 'google_maps_medellin'
      });
    }

    console.log(`✅ Encontrados ${negocios.length} negocios en Google Maps`);

  } catch (e) {
    console.warn(`No se pudieron extraer datos de Google Maps para ${barrio}/${industria}:`, e);
  } finally {
    await browser.close();
  }

  return negocios;
}

// Función principal de extracción para Medellín
export async function extraerNegociosMedellin(cantidadObjetivo: number = 10000): Promise<NegocioMedellin[]> {
  const datosExistentes = cargarDatosNegocios();
  console.log(`📊 Comenzando con ${datosExistentes.length} negocios existentes`);

  let todosNegocios = [...datosExistentes];
  const industrias = Object.keys(PERFILES_INDUSTRIA);

  for (const barrio of BARRIOS_MEDELLIN) {
    if (todosNegocios.length >= cantidadObjetivo) break;

    for (const industria of industrias) {
      if (todosNegocios.length >= cantidadObjetivo) break;

      console.log(`🏙️  Extrayendo ${barrio} - ${industria} (${todosNegocios.length}/${cantidadObjetivo})`);

      const [datosAmarillas, datosMaps] = await Promise.all([
        extraerPaginasAmarillasMedellin(barrio, industria),
        extraerGoogleMapsMedellin(barrio, industria)
      ]);

      const nuevosNegocios = [...datosAmarillas, ...datosMaps];
      const negociosUnicos = nuevosNegocios.filter(nuevoNeg =>
        !todosNegocios.some(existente =>
          existente.nombre?.toLowerCase() === nuevoNeg.nombre?.toLowerCase() &&
          existente.barrio === nuevoNeg.barrio
        )
      );

      console.log(`✨ Encontrados ${negociosUnicos.length} negocios únicos nuevos`);

      for (const negocio of negociosUnicos) {
        if (todosNegocios.length >= cantidadObjetivo) break;

        const negocioAnalizado = await analizarNegocio(negocio);
        todosNegocios.push(negocioAnalizado);

        console.log(`📝 Analizado: ${negocioAnalizado.nombre} (${negocioAnalizado.estimacion_ingresos} ingresos, prioridad: ${negocioAnalizado.prioridad_contacto})`);
      }

      if (todosNegocios.length % 50 === 0) {
        guardarDatosNegocios(todosNegocios);
        console.log(`💾 Progreso guardado: ${todosNegocios.length} negocios`);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  todosNegocios.sort((a, b) => b.prioridad_contacto - a.prioridad_contacto);
  guardarDatosNegocios(todosNegocios);

  console.log(`🎯 Extracción completada: ${todosNegocios.length} negocios listos para outreach`);
  return todosNegocios;
}

// Obtener negocios listos para campaña de email
export function obtenerObjetivosCampanaEmailMedellin(): NegocioMedellin[] {
  const negocios = cargarDatosNegocios();

  const barriosValorAlto = ['El Poblado', 'Laureles', 'Centro', 'Envigado', 'Itagüí', 'Sabaneta'];

  return negocios
    .filter(neg =>
      neg.prioridad_contacto >= 7 ||
      (neg.prioridad_contacto >= 5 && barriosValorAlto.includes(neg.barrio))
    )
    .sort((a, b) => {
      const valorBarrioA = barriosValorAlto.includes(a.barrio) ? 2 : 1;
      const valorBarrioB = barriosValorAlto.includes(b.barrio) ? 2 : 1;

      if (a.estimacion_ingresos !== b.estimacion_ingresos) {
        const ordenIngresos = { alto: 3, medio: 2, bajo: 1 };
        return ordenIngresos[b.estimacion_ingresos] - ordenIngresos[a.estimacion_ingresos];
      }
      if (valorBarrioB !== valorBarrioA) {
        return valorBarrioB - valorBarrioA;
      }
      if (a.prioridad_contacto !== b.prioridad_contacto) {
        return b.prioridad_contacto - a.prioridad_contacto;
      }
      return b.dueno_operativo ? 1 : -1;
    });
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const cantidadObjetivo = parseInt(process.argv[2] || '10000');
  extraerNegociosMedellin(cantidadObjetivo).catch(console.error);
}