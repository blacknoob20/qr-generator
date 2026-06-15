# 12-RISKS: Riesgos y Consideraciones

**Proyecto:** QR Generator SPA
**Versión:** 1.0
**Stack:** Preact + TypeScript + Vite
**Fecha:** 2026-06-14

---

## 1. Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Librería qr-code-styling descontinuada | Baja | Medio | Forkear si necesario, documentación de reemplazo |
| Compatibilidad Preact con librerías React | Media | Bajo | Usar preact/compat alias |
| Memory leaks en canvas/SVG | Baja | Alto | Cleanup en useEffect |
| XSS en content input | Baja | Alto | Sanitizar y validar input |
| Browser no soporta Canvas | Muy baja | Alto | Feature detection |

---

## 2. Riesgos de UX

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Usuario sube logo muy grande | Media | Medio | Validación + warning claro |
| Contraste bajo pasa desapercibido | Media | Medio | Indicador visual prominente |
| Contenido muy largo sin feedback | Media | Alto | Indicador de capacidad en tiempo real |
| QR no escaneable post-exportación | Baja | Alto | Disclaimer + testing guide |

---

## 3. Riesgos de Performance

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Regeneración QR en cada keystroke | Media | Bajo | Debounce de 300ms |
| Memory leak por blobs no liberados | Baja | Medio | Revocar URLs |
| Bundle size excesivo | Baja | Bajo | Tree shaking, code splitting |

---

## 4. Riesgos de Mantenibilidad

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Documentación desactualizada | Media | Medio | SDD/SPEC en repo |
| Tests faltantes | Media | Medio | Coverage > 80% |
| Dependencias desactualizadas | Baja | Bajo | Dependabot alerts |

---

**FIN DE 12-RISKS**
