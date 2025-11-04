# Colombian Outreach - Quick Start Guide

## 30 Seconds Setup

```bash
# 1. Ensure env vars
echo 'RESEND_API_KEY=re_xxxxx' >> .env.local

# 2. Test with 50 emails
pnpm outreach:colombian:test

# 3. Wait 2-3 minutes, check Resend dashboard
# Should see 45-50 "Delivered" emails
```

---

## Commands Reference

```bash
# Test (50 emails - SAFE)
pnpm outreach:colombian:test

# Small (100 emails)
pnpm outreach:colombian 100

# Medium (500 emails)
pnpm outreach:colombian 500

# Large (2,000 emails)
pnpm outreach:colombian 2000

# XL (5,000 emails)
pnpm outreach:colombian 5000

# Full Scale (50,000 emails)
pnpm outreach:colombian 50000
```

---

## What Gets Sent

✅ **Each email includes:**
- Personalized Spanish greeting
- Industry-specific message
- Reference to their business pain points
- Our 3-4 specific services that solve their problem
- Real results examples ("45% more leads", "40% cost reduction")
- Soft CTA ("15-minute call")
- Eddy's phone number: +505 5780 2643
- Email: outreach/growth/hello@gringoconnection.com (rotated)

✅ **Segmented by:**
- Revenue tier (high-net-worth → medium → low)
- Industry (Legal, Medical, Real Estate, Restaurants, Retail, etc.)
- City (Medellín, Bogotá, Cali, Barranquilla, Cartagena)
- Specific pain points (automation, marketing, CRM, etc.)

---

## Example Email Flow

```
From: outreach@gringoconnection.com
To: contacto@despacho-legal.co
Subject: Multiplica tus clientes - Despachos en Medellín

Hola Dr. García,

Manejar un despacho legal en Medellín es desafiante. Entre gestionar casos 
complejos y buscar nuevos clientes, es fácil quedarse atrás de negocios 
que usan tecnología.

En Gringo Connection ayudamos despachos a crecer 40-60% más rápido mediante:
- Sitio web con sistema de citas automatizado
- Automatización de gestión de casos
- Campañas de marketing dirigidas
- Integración con sistemas CRM

Nuestros clientes en Medellín están cerrando 2-3x más casos por mes.

¿Te gustaría una llamada rápida de 15 minutos para explorar cómo podemos 
ayudarte?

Mejores saludos,
Daniel Smith
Gringo Connection
outreach@gringoconnection.com | +505 5780 2643
gringoconnection.com
```

---

## Results You'll See

After running campaign, email sent to Dan & Eddy with:

```
📧 Campaña de Divulgación Colombiana — 950/1000 Enviados

Statistics:
- Total Sent: 950
- Success Rate: 95%
- Duration: 150 minutes
- Avg Rate: 6.3 emails/min

By Industry:
- Restaurantes: 120
- Retail: 115
- Servicios Legales: 95
- Médico/Sanitario: 110
- ...

By Revenue Tier:
- High: 190
- Medium: 380
- Low: 380

Results saved to: content/campana-divulgacion-1730000000.json
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "RESEND_API_KEY missing" | Add to .env.local: `RESEND_API_KEY=re_xxxxx` |
| "No LLM provider" | Add GEMINI_API_KEY or GROK_API_KEY to .env.local |
| Emails very slow | Normal - 2-5s delay between emails to respect rate limits |
| Can't see emails sent | Check: Resend dashboard → Email logs |
| Low open rate | Try: A/B test subject lines, send Tue-Thu 9am CET |

---

## Scaling Plan

**Week 1:** Test phase
```bash
pnpm outreach:colombian:test  # 50 emails
pnpm outreach:colombian 500   # 500 emails
# Monitor response rate
```

**Week 2-3:** Scale up
```bash
pnpm outreach:colombian 2000  # 2,000 emails
pnpm outreach:colombian 5000  # 5,000 emails
# Check Resend delivery rates, adjust copy if needed
```

**Week 4+:** Full scale
```bash
pnpm outreach:colombian 50000  # 50,000 emails over 2-4 weeks
# Expected results: 500-2,500 qualified leads, 50-250 meetings booked
```

---

## Key Stats

- **Emails/Hour:** ~10-15 (respect Resend rate limits)
- **Time for 50K:** ~3,500 hours at 1 email/min = ~150 days (or run multiple in parallel)
- **Cost:** ~$0.01-0.05 per email via Resend
- **Revenue Potential:** $22K-$270K daily if 1-10% book appointments

---

## Contact Info in Emails

Every email includes:

```
Gringo Connection
outreach@gringoconnection.com | +505 5780 2643
gringoconnection.com
```

Rotates between 5 sender addresses to avoid spam filters and show diversity.

---

## Next Steps

1. ✅ Verify RESEND_API_KEY is set
2. ✅ Run test: `pnpm outreach:colombian:test`
3. ✅ Check Resend dashboard for delivery status
4. ✅ Review email templates in output
5. ✅ Scale to 500-2,000 based on results
6. ✅ Monitor open/click rates
7. ✅ Optimize subject lines if needed
8. ✅ Add follow-up sequences

---

**Questions?** Contact Eddy: +505 5780 2643

Last Updated: November 4, 2024
