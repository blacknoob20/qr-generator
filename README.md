# QR Generator
Generador de códigos QR como SPA construido con `Preact + TypeScript + Vite`, pensado para crear QR personalizables (contenido, estilo, logo, validaciones y exportación) de forma rápida y transparente.

## Enfoque de comunidad
Este repositorio está abierto a colaboraciones de la comunidad.
Si quieres sumar valor, puedes:
- reportar bugs o problemas de UX,
- proponer nuevas mejoras,
- aportar tests, documentación o refactors,
- revisar pull requests de otras personas.

La idea es mantener un espacio técnico, colaborativo y respetuoso para construir una herramienta útil para todos.

## Qué puedes hacer hoy
- Generar QR para URL, WhatsApp, correo, WiFi, teléfono, ubicación y texto libre.
- Personalizar color, degradados, forma de módulos/esquinas y logo.
- Ajustar versión QR, nivel de corrección de error y margen.
- Exportar en PNG y SVG.
- Ver advertencias de validación (capacidad, contraste, tamaño de logo, etc.).

## Stack técnico
- Preact
- TypeScript
- Vite
- `@preact/signals` para estado global
- `qr-code-styling` para render y estilos QR
- `file-saver` para descarga
- Vitest + Playwright para pruebas

## Requisitos
- Docker + Docker Compose (recomendado, no requiere Node.js local)
- Node.js 20+ (solo si prefieres ejecutar local sin Docker)
- `pnpm` o `npm` (solo si prefieres ejecutar local sin Docker)

## Inicio rápido

### Opción 1: Docker Compose (recomendado)
```bash
# Iniciar el entorno de desarrollo
docker compose up -d

# Ejecutar tests
docker compose exec app pnpm vitest run
```
Con la configuración actual, el servicio se publica en `http://localhost:5173`.

### Opción 2: entorno local (pnpm)
```bash
pnpm install
pnpm dev
```
App disponible en `http://localhost:5173` (o el puerto que indique Vite).

### Opción 3: entorno local (npm)
```bash
npm install
npm run dev
```

## Scripts útiles

### Dentro del contenedor Docker (recomendado)
```bash
docker compose exec app pnpm dev         # desarrollo
docker compose exec app pnpm build       # build de producción
docker compose exec app pnpm preview     # previsualizar build
docker compose exec app pnpm test        # modo watch
docker compose exec app pnpm test:run    # ejecutar tests una vez
docker compose exec app pnpm coverage    # cobertura
```

### Local (si tienes Node.js instalado)
```bash
pnpm dev         # desarrollo
pnpm build       # build de producción
pnpm preview     # previsualizar build
pnpm test        # modo watch
pnpm test:run    # ejecutar tests una vez
pnpm coverage    # cobertura
```

## Pruebas E2E

### Dentro del contenedor (recomendado)
```bash
# Ejecutar tests E2E con Playwright
docker compose exec app sh -c "cd tests && npx playwright test"

# Ejecutar con UI
docker compose exec app sh -c "cd tests && npx playwright test --ui"
```

### Con perfil de test (CI/CD)
```bash
docker compose --profile test up --build --abort-on-container-exit
```

## Estructura del proyecto
```text
src/
  components/
    ConfigPanel/
    QRCanvas/
    QRPreview/
  hooks/
  state/
  styles/
  types/
  utils/
tests/
.ai/specs/
```

## Cómo contribuir
1. Haz fork del repositorio.
2. Crea una rama descriptiva (`feat/nueva-funcion`, `fix/bug-export`).
3. Implementa tu cambio con pruebas cuando aplique.
4. Ejecuta validaciones dentro del contenedor:
   ```bash
   docker compose exec app pnpm test:run
   docker compose exec app sh -c "cd tests && npx playwright test"
   ```
5. Abre un PR explicando:
   - problema que resuelve,
   - enfoque de solución,
   - evidencias (capturas/logs/tests).

Si el cambio toca UX, incluye capturas o video corto.

## Guía para reportar issues
Cuando abras un issue, intenta incluir:
- comportamiento actual,
- comportamiento esperado,
- pasos para reproducir,
- entorno (OS, navegador, versión de Node),
- capturas o logs si existen.

## Principios de colaboración
- Respeto y comunicación clara.
- Feedback técnico accionable.
- Discusión basada en evidencia (tests, métricas, reproducibilidad).
- Prioridad a cambios pequeños, revisables y mantenibles.

## Seguridad
Si encuentras una vulnerabilidad o riesgo de seguridad, evita publicarlo con detalles sensibles en un issue público.
Comparte el contexto mínimo necesario y coordinamos una solución responsable.

## Estado del proyecto
Proyecto activo en evolución.
Las mejoras de accesibilidad, cobertura de pruebas y experiencia móvil son bienvenidas.
