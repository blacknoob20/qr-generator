# 00-INDEX: Índice Maestro de Especificaciones

**Proyecto:** QR Generator SPA
**Versión:** 1.0
**Stack:** Preact + TypeScript + Vite
**Fecha:** 2026-06-14

---

## Propósito de este índice

Este archivo es la **puerta de entrada obligatoria** para cualquier agente que trabaje en el proyecto. Define:

1. El orden de lectura recomendado según la tarea.
2. La responsabilidad de cada archivo de especificación.
3. Las reglas de precedencia entre documentos.

---

## Orden de lectura por tipo de tarea

| Tarea del agente | Secuencia obligatoria |
|------------------|----------------------|
| **Nuevo en el proyecto** | `00-INDEX.md` → `01-PRODUCT.md` → `02-ARCHITECTURE.md` |
| **Implementar componente UI** | `00-INDEX.md` → `03-COMPONENTS.md` → `05-TYPES.md` → `08-UX.md` |
| **Implementar lógica de negocio** | `00-INDEX.md` → `04-HOOKS.md` → `05-TYPES.md` → `06-VALIDATIONS.md` |
| **Implementar exportación** | `00-INDEX.md` → `07-EXPORT.md` → `05-TYPES.md` |
| **Testing** | `00-INDEX.md` → `09-TESTING.md` → `01-PRODUCT.md` |
| **Validación** | `00-INDEX.md` → `01-PRODUCT.md` → `02-ARCHITECTURE.md` → `06-VALIDATIONS.md` |
| **Refactorización** | `00-INDEX.md` → `02-ARCHITECTURE.md` → `11-ADR.md` |
| **Documentación** | `00-INDEX.md` → `01-PRODUCT.md` → `13-APPENDIX.md` |

---

## Descripción de archivos

| Archivo | Líneas (aprox) | Contenido | Autoridad |
|---------|----------------|-----------|-----------|
| `01-PRODUCT.md` | ~200 | Alcance, objetivo, flujos de usuario, decisiones de backend | Alta |
| `02-ARCHITECTURE.md` | ~250 | Estructura de carpetas, capas, flujo de datos, signals, jerarquía de componentes | Alta |
| `03-COMPONENTS.md` | ~400 | Contratos de props, eventos, responsabilidades y diagramas de cada componente UI | Alta |
| `04-HOOKS.md` | ~200 | Firma de `useQRCode`, entradas, salidas, efectos colaterales | Alta |
| `05-TYPES.md` | ~300 | Todos los contratos TypeScript: `QRConfig`, `QRStyle`, `ValidationResult`, etc. | Alta |
| `06-VALIDATIONS.md` | ~350 | Reglas de validación, algoritmo, severidades, contraste, logo, quiet zone | Alta |
| `07-EXPORT.md` | ~200 | Contratos de exportación PNG/SVG, escalado, DPI, calidad | Alta |
| `08-UX.md` | ~350 | Tokens de diseño, responsive, tema claro/oscuro, accesibilidad, layout | Alta |
| `09-TESTING.md` | ~150 | Framework, estructura de tests, cobertura mínima, reglas | Media |
| `10-QR-TECH.md` | ~400 | Capacidad por versión, ECL, quiet zone, contraste, riesgos de degradados/logos/formas | Alta |
| `11-ADR.md` | ~200 | Decisiones arquitectónicas: Preact, Signals, qr-code-styling, Vite, Docker, file-saver | Media |
| `12-RISKS.md` | ~100 | Riesgos técnicos, UX, performance, mantenibilidad | Media |
| `13-APPENDIX.md` | ~150 | Tipos completos, glosario, recursos externos | Referencia |

---

## Reglas de precedencia

```
01-PRODUCT.md > 02-ARCHITECTURE.md > 03-COMPONENTS.md > 04-HOOKS.md > 05-TYPES.md > 06-VALIDATIONS.md > 07-EXPORT.md > 08-UX.md > 09-TESTING.md > 10-QR-TECH.md > 11-ADR.md > 12-RISKS.md > 13-APPENDIX.md
```

**Reglas:**

1. Si un archivo de mayor precedencia contradice a uno de menor precedencia, el de mayor prevalece.
2. Si dos archivos del mismo nivel se contradicen, reportar como inconsistencia.
3. El código existente **nunca** tiene mayor precedencia que la especificación.
4. `13-APPENDIX.md` es **puramente referencial**; no define nuevos requisimos.

---

## Reglas de modificación

| Acción | Permitido |
|--------|-----------|
| Modificar `00-INDEX.md` | Sí, para actualizar orden o descripciones |
| Modificar `01-PRODUCT.md` | Sí, con criterio de producto |
| Modificar `02-ARCHITECTURE.md` | Sí, si cambia la arquitectura |
| Modificar `03-COMPONENTS.md` | Sí, si cambian componentes |
| Modificar `04-HOOKS.md` | Sí, si cambia la lógica de hooks |
| Modificar `05-TYPES.md` | Sí, si cambian contratos |
| Modificar `06-VALIDATIONS.md` | Sí, si cambian reglas de validación |
| Modificar `07-EXPORT.md` | Sí, si cambia la exportación |
| Modificar `08-UX.md` | Sí, si cambia el diseño visual |
| Modificar `09-TESTING.md` | Sí, si cambia la estrategia de testing |
| Modificar `10-QR-TECH.md` | Sí, si cambia el alcance de tipos QR |
| Modificar `11-ADR.md` | Sí, para nuevas decisiones |
| Modificar `12-RISKS.md` | Sí, para nuevos riesgos |
| Modificar `13-APPENDIX.md` | Sí, para mantener actualizado |

---

**FIN DEL ÍNDICE**
