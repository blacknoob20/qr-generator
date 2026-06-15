# 01-PRODUCT: Alcance, Flujos y Arquitectura de Negocio

**Proyecto:** QR Generator SPA
**Versión:** 1.0
**Stack:** Preact + TypeScript + Vite
**Fecha:** 2026-06-14

---

## 1. Alcance del Proyecto

### 1.1 Objetivo

Single Page Application (SPA) para generación de códigos QR configurables y exportables.

### 1.2 Funcionalidades incluidas

- Generar QR para: URL, WhatsApp, correo, WiFi, teléfono, ubicación y texto libre.
- Personalizar color, degradados, forma de módulos/esquinas y logo.
- Ajustar versión QR, nivel de corrección de error y margen.
- Exportar en PNG y SVG.
- Ver advertencias de validación (capacidad, contraste, tamaño de logo, etc.).

### 1.3 Funcionalidades excluidas (alcance futuro)

| Funcionalidad | Justificación | Complejidad |
|---------------|---------------|-------------|
| Historial de QRs | Persistencia de configuraciones anteriores | Media |
| Estadísticas de escaneo | Tracking de scans (URLs dinámicas) | Alta |
| Short links | Redirecciones con analytics | Alta |
| Autenticación | Usuarios con perfiles y guardado | Media-Alta |
| QR dinámicos | Contenido que cambia post-generación | Alta |

---

## 2. Librerías Externas Recomendadas

| Librería | Propósito | Versión Mínima |
|----------|-----------|----------------|
| `qr-code-styling` | Generación de QR con estilos | ^1.6.0 |
| `@preact/signals` | Estado reactivo global | ^1.2.0 |
| `file-saver` | Exportación a PNG/SVG | ^2.0.5 |
| `vitest` | Framework de testing | ^2.1.9 |
| `@vitest/ui` | Interfaz gráfica para tests | ^2.1.9 |
| `jsdom` | Entorno DOM para tests | ^29.1.1 |
| `@testing-library/preact` | Testing utilities para Preact | ^3.2.4 |

---

## 3. Flujos de Usuario

### 3.1 Flujo Principal (Happy Path)

```
┌──────────────────────────────────────────────────────────────────┐
│                      QR STUDIO — GENERADOR PROFESIONAL            │
└──────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   1. QR Protagonista  │
                     │   (420px, centrado)   │
                     │   - Preview en vivo   │
                     │   - Botones de acción │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   2. Info Contextual  │
                     │   - Tipo detectado    │
                     │   - Estadísticas QR   │
                     │   - Compatibilidad    │
                     │   - Preview de escaneo│
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   3. Ingreso de datos │
                     │   (DataConfig)        │
                     │   - Seleccionar tipo  │
                     │   - URL/WhatsApp/etc  │
                     │   - Modo encoding     │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   4. Configuración    │
                     │   (StyleConfig)       │
                     │   - Colores, formas   │
                     │   - Logo (opcional)   │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   5. Config. Avanzada │
                     │   (AdvancedConfig)    │
                     │   - Versión, ECL      │
                     │   - Margen, debug     │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   6. Exportar         │
                     │   (QRPreview)         │
                     │   - PNG/SVG/Copiar    │
                     │   - Compartir         │
                     └───────────────────────┘
```

### 3.2 Flujo Alterno: Logo Upload

```
   ┌─────────┐
   │ START   │
   └────┬────┘
        │
        ▼
   ┌─────────────────┐
   │  StyleConfig    │
   │  Logo section   │
   └──────┬──────────┘
          │
          ▼
   ┌─────────────────┐
   │  Click upload   │
   │  or drag/drop   │
   └──────┬──────────┘
          │
          ▼
   ┌─────────────────┐
   │  File selected  │
   └──────┬──────────┘
          │
    ┌─────┴─────┐
    │  Valid?   │
    └─────┬─────┘
         │
    YES  │  NO
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌─────────────────┐
│Show   │ │  Show error      │
│size   │ │  "Invalid file"  │
│slider │ └─────────────────┘
└───┬───┘
    │
    ▼
┌─────────────────┐
│  Set logo size  │
└──────┬──────────┘
       │
 ┌─────┴─────┐
 │ ≤ 20%?    │
 └─────┬─────┘
       │
  YES  │  NO (error)
   ┌───┴───┐
   │       │
   ▼       ▼
┌───────┐ ┌─────────────────┐
│Update │ │  Show error     │
│QR with│ │  "Logo must be  │
│logo   │ │   ≤ 20%"        │
└───┬───┘ └─────────────────┘
    │
    ▼
┌─────────────────┐
│  QR re-renders  │
│  with logo      │
└─────────────────┘
```

### 3.3 Flujo Alterno: Validación de Contraste

```
   ┌─────────┐
   │ User    │
   │ changes │
   │ colors  │
   └────┬────┘
        │
        ▼
   ┌─────────────────┐
   │  Calculate      │
   │  contrast ratio │
   └──────┬──────────┘
         │
   ┌─────┴─────┐
   │ ratio     │
   │ ≥ 4.5:1?  │
   └─────┬─────┘
         │
    YES  │  NO
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌─────────────────┐
│Green  │ │ Yellow/Red      │
│✓ OK   │ │ ⚠️ Warning       │
└───┬───┘ └──────┬──────────┘
    │            │
    │            ▼
    │ ┌─────────────────┐
    │ │ Show warning    │
    │ │ "Low contrast   │
    │ │ may affect      │
    │ │ scanning"       │
    │ └──────┬──────────┘
    │        │
    │        ▼
    │ ┌─────────────────┐
    │ │ Export still    │──┐
    │ │ allowed         │  │
    │ └─────────────────┘  │
    │                     │
    ▼                     ▼
┌─────────────────────────────┐
│     Continue to export      │
│     or adjust colors        │
└─────────────────────────────┘
```

### 3.4 Flujo Alterno: Contenido Muy Largo

```
   ┌─────────┐
   │ User    │
   │ enters  │
   │ content │
   └────┬────┘
        │
        ▼
   ┌─────────────────┐
   │  Calculate      │
   │  required       │
   │  version        │
   └──────┬──────────┘
         │
   ┌─────┴─────┐
   │ Version   │
   │ needed ≤40│
   └─────┬─────┘
         │
    YES  │  NO
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌─────────────────┐
│Version │ │  Show error      │
│auto   │ │  "Content too    │
│or     │ │   long for       │
│manual │ │   any version"   │
└───┬───┘ └─────────────────┘
    │
    ▼
┌─────────────────┐
│ Check capacity  │
│ for version     │
└────┬──────────┘
     │
┌────┴────────────┐
│ content ≤       │
│ capacity?       │
└────┬────────────┘
     │
YES  │  NO
┌────┴────┐
│         │
▼         ▼
┌───────┐ ┌─────────────────┐
│✓ OK   │ │  Show error      │
│       │ │  "Exceeds        │
│       │ │   capacity by     │
│       │ │   X bytes"        │
│       │ │                   │
│       │ │ Disable export    │
│       │ │ Suggest:          │
│       │ │ - Shorten URL     │
│       │ │ - Use URL short   │
│       │ │   service         │
└───────┘ └─────────────────┘
```

---

## 4. Reglas de UX

1. **QR como protagonista:** Ocupa el centro visual, 2-3× más grande que diseños tradicionales.
2. **Feedback inmediato:** El preview se actualiza en tiempo real con microanimación suave.
3. **Configuración contextual:** Acordeón expandible debajo del QR, no sidebar lateral.
4. **Tipos de contenido:** URL, WhatsApp, Correo, WiFi, Teléfono, Ubicación, Texto libre.
5. **Información útil:** Estadísticas, compatibilidad, y preview de escaneo visible.
6. **Validación proactiva:** Los errores/warnings aparecen antes de que el usuario intente exportar.
7. **Defaults sensatos:**
   - Versión: `auto`
   - Corrección: `M`
   - Margen: `4`
   - Encoding: `auto`
8. **Undo/Reset:** Botón para restaurar configuración por defecto.
9. **Copy-to-clipboard:** Copiar contenido directamente.
10. **Compartir nativo:** Web Share API cuando esté disponible.
11. **Responsive:** Layout vertical centrado en móvil, máximo 720px de ancho en desktop.

---

## 5. Backend

### 5.1 Sin Backend (Default)

El proyecto **no requiere backend** para:
- ✅ Generar códigos QR (client-side)
- ✅ Aplicar estilos y configuraciones
- ✅ Exportar PNG/SVG
- ✅ Validar contenido

### 5.2 Arquitectura Híbrida (Opcional)

Si se implementa backend futuro:

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (SPA)                        │
│   - UI/UX completa                                      │
│   - Lógica de generación QR                            │
│   - Exportación                                        │
└───────────────────────┬─────────────────────────────────┘
                        │ API REST / GraphQL (opcional)
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (opcional)                    │
│   - POST /api/qrs          → Guardar QR                 │
│   - GET  /api/qrs/:id      → Obtener configuración     │
│   - GET  /api/qrs/:id/stats → Estadísticas de scan     │
│   - POST /api/shortlinks   → Crear short link          │
└─────────────────────────────────────────────────────────┘
```

**Recomendación:** Iniciar sin backend. Diseñar la UI para que sea posible agregarlo posteriormente sin refactorizaciones mayores.

---

## 6. Infraestructura Docker

### 6.1 Imagen Base

| Servicio | Imagen | Versión |
|----------|--------|---------|
| **app** | `node` | `alpine` |

### 6.2 Docker Compose

```yaml
services:
  app:
    image: node:alpine
    container_name: qr-generator
    working_dir: /app
    tty: true
    stdin_open: true
    volumes:
      - ./:/app
    ports:
      - "5173:5173"
    command: sh -c "npm install -g pnpm && pnpm install && pnpm dev"
    environment:
      - NODE_ENV=development
    restart: unless-stopped
    healthcheck:
      test: [ "CMD-SHELL", "wget -q --spider http://127.0.0.1:5173/ || exit 1" ]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    networks:
      - net

networks:
  net:
    driver: bridge
```

### 6.3 Comandos Docker

```bash
# Iniciar la aplicación
docker compose up -d

# Ver logs
docker compose logs -f

# Detener la aplicación
docker compose down

# Reconstruir contenedores
docker compose up -d --build
```

---

## 7. Resumen de Contratos Principales

```typescript
// QRConfig - Contrato principal
interface QRConfig {
  content: string;
  encoding: EncodingMode;
  style: QRStyle;
  advanced: QRAdvancedConfig;
}

// ValidationResult - Resultado de validación
interface ValidationResult {
  isValid: boolean;
  errors: ValidationWarning[];
  warnings: ValidationWarning[];
  metadata: { version: number; capacity: number; used: number; modules: number };
}

// ExportOptions - Opciones de exportación
interface ExportOptions {
  format: 'png' | 'svg';
  width?: number;
  height?: number;
  scale?: number;
  filename: string;
}
```

---

**FIN DE 01-PRODUCT**
