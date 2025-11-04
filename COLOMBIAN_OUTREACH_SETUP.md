# Colombian Business Outreach Campaign - Sistema Completo de Divulgación

## Overview / Descripción General

El **Agente de Divulgación Empresarial Colombiana** es un sistema automatizado que envía correos electrónicos personalizados en ESPAÑOL a miles de negocios colombianos, segmentados por:

- ✅ **Nivel de Ingresos** - Alto patrimonio → Medio → Bajo
- ✅ **Industria** - Servicios Legales, Médico, Retail, Restaurantes, etc.
- ✅ **Ubicación Geográfica** - Medellín, Bogotá, Cali, Barranquilla, Cartagena
- ✅ **Puntos Débiles Específicos** - Automatización, marketing digital, CRM, etc.

### Key Features

1. **100% en Español** - Todos los correos generados en español profesional
2. **AI-Powered Personalization** - Usa Grok/Gemini/AIMLAPI para generar pitches únicos
3. **Rotating Senders** - Múltiples direcciones @gringoconnection.com para máxima entregabilidad
4. **Rate Limiting** - Respeta límites de Resend para evitar suspensiones
5. **Revenue Tier Prioritization** - Comienza con negocios de alto patrimonio
6. **Contact Info** - Incluye teléfono de Eddy (+505 5780 2643) en cada correo
7. **Campaign Tracking** - Registra estadísticas detalladas y resultados

---

## Installation / Instalación

### Prerequisites

```bash
# Asegurar que tienes Node.js 18+ y pnpm instalado
node --version  # v18+
pnpm --version  # 8+
```

### Setup

```bash
# 1. Instalar dependencias (ya incluidas)
pnpm install

# 2. Configurar variables de entorno
cp env.example .env.local

# 3. Agregar las siguientes variables si falta:
# RESEND_API_KEY=re_xxxxx (obtener en https://resend.com)
# GEMINI_API_KEY=xxxx (opcional - para IA)
# GROK_API_KEY=xxxx (opcional - para IA)
# AIMLAPI_API_KEY=xxxx (opcional - para IA)
# DEFAULT_TZ=America/Bogota
# EOD_TO=dan@doorknockingsucks.com,eddy@doorknockingsucks.com
```

---

## Usage / Uso

### Quick Start - Test con 50 Correos

```bash
# Generar y enviar 50 correos de prueba (SEGURO)
pnpm outreach:colombian:test

# Salida esperada:
# 📧 Iniciando campaña... (máx: 50 correos)...
# 📥 Cargando negocios colombianos...
# 📝 Generando correo 1/50...
# ✅ Correo enviado a info-0@negociocolombia0.co
# ...
# 🎉 ¡Campaña de divulgación colombiana completada!
```

### Scale to 500 Emails

```bash
pnpm outreach:colombian 500
```

### Scale to 5,000 Emails (Production)

```bash
pnpm outreach:colombian 5000
```

### Scale to 50,000 Emails (Full Campaign)

```bash
pnpm outreach:colombian 50000
```

---

## Architecture / Arquitectura

### Core Components

```
automation/agents/
├── colombianOutreachAgent.ts
│   ├── ejecutarDivulgacionColombia()      # Main campaign orchestrator
│   ├── generarDivulgacionPersonalizada()  # AI-powered pitch generator
│   ├── enviarCorreoDivulgacion()          # Resend integration
│   ├── ordenarNegociosPorIngreso()        # Revenue tier segmentation
│   └── generarPuntosDolientes()           # Industry pain point mapping

utilities/
├── rateLimiter.ts                         # Controla velocidad de envío
└── providers.ts                           # LLM + Resend integration

content/
├── negocios-colombianos.json              # Business database (generated)
└── campana-divulgacion-*.json             # Campaign results (saved)
```

### Email Rotation

El sistema rotea automáticamente entre 5 direcciones de correo:

```javascript
const SENDER_EMAILS = [
  'outreach@gringoconnection.com',
  'growth@gringoconnection.com',
  'hello@gringoconnection.com',
  'sales@gringoconnection.com',
  'contact@gringoconnection.com',
];
```

**Cada correo incluye:**
- ✅ Asunto personalizado en ESPAÑOL
- ✅ Cuerpo de 3-4 párrafos en ESPAÑOL
- ✅ Referencia específica a su industria y desafíos
- ✅ Ejemplos de resultados que hemos logrado
- ✅ Teléfono de Eddy: +505 5780 2643
- ✅ CTA suave (llamada de 15 min)
- ✅ Remitente rotativo

### AI-Powered Personalization

Para cada negocio, el sistema:

1. **Detecta industria** - Servicios Legales, Médico, Retail, etc.
2. **Identifica puntos débiles** - Adquisición de clientes, automatización, etc.
3. **Genera prompt personalizado** - Incluye nombre del negocio, ubicación, industria
4. **Llama a IA** - Grok, Gemini, o AIMLAPI (fallback automático)
5. **Recibe pitch en ESPAÑOL** - JSON con asunto, cuerpo, servicios recomendados
6. **Renderiza HTML** - Formatea para máxima compatibilidad con emails
7. **Envía vía Resend** - Con rate limiting inteligente

---

## Email Examples / Ejemplos de Correos

### Ejemplo: Servicios Legales en Medellín

```
De: outreach@gringoconnection.com
Asunto: Multiplica clientes en tu despacho legal - Medellín

Hola [Propietario del Despacho],

Manejar un despacho legal en Medellín requiere estar siempre buscando nuevos clientes mientras gestionas casos complejos. Sabemos que esto consume tiempo y dinero.

En Gringo Connection especializamos en ayudar despachos legales colombianos a crecer 40-60% más rápido mediante:
- Sitios web con sistema de citas automatizado
- Automatización de formularios de cliente
- Campañas de marketing dirigidas a clientes ideales
- Sistema CRM para gestión de casos

Nuestros clientes en Medellín están cerrando 2-3x más casos por mes.

¿Te gustaría una llamada de 15 minutos para explorar cómo podemos ayudarte?

Mejores saludos,
Daniel Smith
Gringo Connection
outreach@gringoconnection.com | +505 5780 2643
gringoconnection.com

---

Servicios Recomendados:
- Sitio Web Personalizado con Sistema de Citas
- Automatización de CRM para Despachos
- Campaña de Marketing Digital
```

### Ejemplo: Restaurante en Bogotá

```
De: growth@gringoconnection.com
Asunto: Duplica entregas - Integración múltiple de apps - Bogotá

Hola [Propietario del Restaurante],

Los restaurantes en Bogotá que aprovechan Rappi, Uber Eats Y Didi están sacando 2.5x más ingresos del delivery.

Pero administrar múltiples plataformas es caótico. Por eso creamos un sistema que:
- Centraliza TODOS tus pedidos en una pantalla
- Sincroniza inventario automáticamente
- Reduce errores de preparación 40%
- Integra tu POS existente

Restaurantes usando nuestro sistema reportan:
- 45% más pedidos en línea
- 25% menos no-shows
- 40% menos errores

¿Quieres ver cómo funciona?

Mejores saludos,
Eddy Richardson
Gringo Connection
growth@gringoconnection.com | +505 5780 2643
gringoconnection.com

---

Servicios Recomendados:
- Plataforma Centralizada de Pedidos
- Sincronización de Inventory
- Integración POS
```

---

## Campaign Results / Resultados de Campaña

El sistema genera reportes automáticos guardados en:

```json
// content/campana-divulgacion-1730000000.json
{
  "estadisticas": {
    "totalSolicitado": 100,
    "totalEnviado": 95,
    "totalFallido": 5,
    "porIndustria": {
      "Servicios Legales": 12,
      "Médico/Sanitario": 15,
      "Bienes Raíces": 10,
      "Restaurantes": 20,
      "Retail": 15,
      "Manufactura": 8,
      "Construcción": 5,
      "Educación": 8,
      "Contabilidad": 4,
      "Agencia de Marketing": 3
    },
    "porNivelIngreso": {
      "alto": 20,
      "medio": 45,
      "bajo": 35
    },
    "duracionCampana": 480,
    "promedioCorreosPorHora": 11.9
  },
  "campanas": [
    {
      "idNegocio": "neg-0",
      "correo": "info-0@negociocolombia0.co",
      "asunto": "Optimiza gestión de casos...",
      "estado": "enviado",
      "enviadoEn": "2024-11-04T10:30:00Z",
      "serviciosRecomendados": ["Desarrollo de Sitio Web", "Automatización de CRM"]
    }
  ]
}
```

---

## Performance Metrics / Métricas de Rendimiento

### Expected Results / Resultados Esperados

| Métrica | Estimado |
|---------|----------|
| **Emails Enviados/Hora** | 10-15 |
| **Tasa de Entrega** | 92-98% |
| **Open Rate** | 15-25% (industry avg 20%) |
| **Click Rate** | 2-5% |
| **Response Rate** | 0.5-2% |
| **Meeting Booking Rate** | 0.1-0.5% |

### Scaling Timeline

| Fase | Correos | Días | Acumulado |
|------|---------|------|-----------|
| **Fase 1** | 500 | 2 | 500 |
| **Fase 2** | 2,000 | 8 | 2,500 |
| **Fase 3** | 5,000 | 20 | 7,500 |
| **Fase 4** | 10,000 | 40 | 17,500 |
| **Fase 5** | 25,000 | 100 | 42,500 |
| **Fase 6** | 7,500 | 30 | 50,000 |

---

## Configuration / Configuración

### Environment Variables

```bash
# Email Routing
RESEND_API_KEY=re_xxxxx                          # Resend API key
RESEND_FROM="Gringo Connection <info@...>"       # Default sender

# AI/LLM Selection (priority order)
GEMINI_API_KEY=xxxx                              # Google Gemini
GROK_API_KEY=xxxx                                # Elon's Grok
PERPLEXITY_API_KEY=xxxx                          # Perplexity
AIMLAPI_API_KEY=xxxx                             # AIMLAPI (300+ models)
POE_API_KEY=xxxx                                 # Poe AI

# Timezone
DEFAULT_TZ=America/Bogota

# Team Notifications
EOD_TO=dan@doorknockingsucks.com,eddy@...       # Campaign summary email
```

### Optional: Business Data Sources

Para escalar a 50K+ negocios, integra:

```bash
HUNTER_API_KEY=xxxx                    # Domain email finder
APOLLO_API_KEY=xxxx                    # B2B database
CLEARBIT_API_KEY=xxxx                  # Company enrichment
ROCKETREACH_API_KEY=xxxx               # Executive finder
GOOGLE_MAPS_API_KEY=xxxx               # Business listings
```

---

## Resend Setup / Configuración de Resend

### 1. Create Resend Account

```bash
# Go to https://resend.com
# Sign up with Gmail/GitHub
# Get API Key from Settings → API Tokens
# Copy RESEND_API_KEY
```

### 2. Verify Domain

```bash
# Add DNS records to gringoconnection.com:
# Type: TXT
# Name: default._domainkey
# Value: [provided by Resend]

# Type: MX
# Priority: 10
# Value: feedback-smtp.us-east-1.amazonses.com
```

### 3. Create Sending Addresses

```bash
# In Resend dashboard, create:
- outreach@gringoconnection.com
- growth@gringoconnection.com
- hello@gringoconnection.com
- sales@gringoconnection.com
- contact@gringoconnection.com
```

### 4. Test Delivery

```bash
# Verify a test email arrives
pnpm outreach:colombian:test

# Check Resend dashboard for delivery status
# Should see "Delivered" or "Bounced" status
```

---

## Troubleshooting / Solución de Problemas

### Error: "Resend API key missing"

```bash
# Solución:
# 1. Obtener clave de https://resend.com/api-keys
# 2. Agregar a .env.local:
RESEND_API_KEY=re_xxxxx

# 3. Reiniciar proceso:
pnpm outreach:colombian:test
```

### Error: "No LLM provider available"

```bash
# Solución: Agregar al menos uno de:
GEMINI_API_KEY=xxxx
GROK_API_KEY=xxxx
AIMLAPI_API_KEY=xxxx

# O usar fallback genérico (menos personalizado)
```

### Emails Not Being Sent (Slow)

```bash
# Verificar rate limiting:
# - Resend: máx 100 req/sec
# - Sistema añade 2-5s entre correos
# - Para escalar: aumentar paralelización

# Debug:
pnpm outreach:colombian:test
# Observar logs - debe ver ✅ o ❌ para cada correo
```

### Low Open Rates?

```bash
# Optimizar:
1. Test diferentes líneas de asunto (A/B testing)
2. Cambiar horario de envío (martes-jueves mejor)
3. Incluir nombre de propietario en greeting
4. Reducir duración de email (párrafos más cortos)
```

---

## Advanced Usage / Uso Avanzado

### Custom Business List

```bash
# 1. Crear archivo: content/negocios-colombianos.json
[
  {
    "id": "neg-001",
    "nombre": "Despacho Pérez & Asociados",
    "correo": "contacto@perez-abogados.com",
    "industria": "Servicios Legales",
    "ubicacion": "Medellín",
    "ingresoEstimado": "alto",
    "empleados": 15,
    "nombrePropietario": "Dr. Pérez",
    "puntosDolientes": ["adquisición de clientes", "gestión de casos"]
  }
]

# 2. Ejecutar campaña:
pnpm outreach:colombian 1000
```

### Integrate with Business Data APIs

```typescript
// automation/services/businessDataService.ts
// Implementar:
- searchHunter()      // Domain email finder
- searchApollo()      // B2B database
- searchClearbit()    // Company enrichment
- verifyEmails()      // Remove bounces

// Luego llamar en colombianOutreachAgent.ts:
const businesses = await searchByIndustry('Servicios Legales', ['Medellín'], 1000);
const verified = await verifyEmails(businesses);
```

### Track Responses

```typescript
// Futura implementación:
// 1. Webhook de Resend para "delivered", "opened", "clicked"
// 2. Guardar en database: email → estado → timestamp
// 3. Auto-follow-up después de 3 días sin respuesta
// 4. Escalate "interested" leads a Eddy
```

---

## Next Steps / Próximos Pasos

1. ✅ **Test Setup** (hoy)
   ```bash
   pnpm outreach:colombian:test
   ```

2. ⏳ **Phase 1: 500 emails** (mañana)
   ```bash
   pnpm outreach:colombian 500
   # Monitor responses en Calendly
   ```

3. ⏳ **Phase 2: 2,000 emails** (esta semana)
   ```bash
   pnpm outreach:colombian 2000
   # Track open rates en Resend dashboard
   ```

4. ⏳ **Scale to 50K** (próximas 3-4 semanas)
   ```bash
   # Incremento gradual
   # Monitorear bounce rates
   # Optimizar copy basado en resultados
   ```

5. ⏳ **Add Follow-up Sequences**
   - Day 3: "¿Viste mi correo anterior?"
   - Day 7: "Oferta especial para negocios en Medellín"
   - Day 14: "Último: consulta gratis"

---

## Support / Soporte

Para preguntas o problemas:

- 📧 Email: info@gringoconnection.com
- 📞 Phone: +505 5780 2643 (Eddy)
- 💬 Slack: #colombian-outreach channel

---

**Last Updated:** November 4, 2024
**Status:** ✅ Ready for Production
**Next Review:** November 11, 2024
