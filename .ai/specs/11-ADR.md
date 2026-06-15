# 11-ADR: Decisiones Técnicas (Architecture Decision Records)

**Proyecto:** QR Generator SPA
**Versión:** 1.0
**Stack:** Preact + TypeScript + Vite
**Fecha:** 2026-06-14

---

## ADR-001: Uso de Preact sobre React

**Contexto:** Necesitamos una SPA ligera con rendimiento óptimo.

**Decisión:** Usar Preact en lugar de React.

**Justificación:**
- Preact pesa ~3KB vs React ~45KB
- API compatible con React (fácil migración)
- Signals integration nativa con @preact/signals
- Rendimiento superior en mobile

**Alternativas descartadas:**
- React: Demasiado peso para SPA simple
- Solid: Ecosistema menor, curva de aprendizaje
- Svelte: Bundle size bajo pero ecosistema diferente

**Consecuencias:**
- Posible necesidad de aliases para react → preact/compat
- Verificar compatibilidad de librerías

---

## ADR-002: Estado con Signals sobre Context/Redux

**Contexto:** Estado global necesario para configuración QR.

**Decisión:** Usar @preact/signals para estado reactivo.

**Justificación:**
- Actualizaciones granulares (solo componentes que usan el signal)
- No hay re-renders innecesarios
- API simple e intuitiva
- Integración native con Preact

**Alternativas descartadas:**
- Context API: Re-renders excesivos
- Redux: Overkill para estado simple
- Zustand: Dependencia adicional, menos performant que signals

**Consecuencias:**
- Signals reemplazan props para estado global
- Posible confusión con hooks tradicionales

---

## ADR-003: qr-code-styling para generación QR

**Contexto:** Necesitamos generar QRs con estilos, logos y exportación.

**Decisión:** Usar qr-code-styling library.

**Justificación:**
- Soporte nativo para estilos (colores, gradientes, formas)
- Logo overlay integrado
- Exportación PNG/SVG incluida
- Typescript types incluidos
- Mantenida activamente

**Alternativas descartadas:**
- `qrcode` (npm): No soporta estilos avanzados
- `qrcode-generator`: Solo generación básica
- Implementación manual: Tiempo excesivo, complejo

**Consecuencias:**
- Dependencia de libreria externa
- Posibles breaking changes en updates

---

## ADR-004: Vite como bundler

**Contexto:** Necesitamos dev server rápido y build optimizado.

**Decisión:** Usar Vite.

**Justificación:**
- HMR instantáneo en dev
- Build rápido con esbuild
- Optimización automática de producción
- Configuración minimalista

**Alternativas descartadas:**
- Create React App: Deprecated, lento
- Webpack: Configuración compleja
- Parcel: Menos flexible

**Consecuencias:**
- Configuración Preact en vite.config.ts
- Alias para react → preact/compat

---

## ADR-005: Docker para desarrollo

**Contexto:** Consistencia de entorno y portabilidad.

**Decisión:** Contenedor Docker con node:alpine.

**Justificación:**
- Mismo entorno en todos los desarrolladores
- No requiere instalación local de Node
- Fácil onboarding
- Integración con docker-compose

**Alternativas descartadas:**
- Node local: Inconsistencias entre versiones/SO
- Devcontainer: Requiere VS Code + extensión

**Consecuencias:**
- Tiempo extra en inicialización
- Recursos de Docker necesarios

---

## ADR-006: file-saver para descargas

**Contexto:** Necesitamos exportar PNG/SVG.

**Decisión:** Usar file-saver.js.

**Justificación:**
- Abstracción cross-browser
- Manejo de blobs/DOMException
- Soporte para Safari blob workaround

**Alternativas descartadas:**
- `URL.createObjectURL` + click: Funciona pero más código
- `download` attribute: Limitado

**Consecuencias:**
- Dependencia adicional (~4KB)

---

**FIN DE 11-ADR**
