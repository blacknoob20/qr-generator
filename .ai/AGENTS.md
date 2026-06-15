# AGENTS.md

## 1. Propósito del sistema multi-agente

El sistema multi-agente de `QR-GENERATOR` existe para coordinar la implementación, validación y documentación del proyecto de forma consistente, trazable y sin ambigüedades.

El problema que resuelve es la divergencia entre intención funcional, diseño técnico e implementación. Para evitarlo, los agentes trabajan con una jerarquía de autoridad documental fija y con responsabilidades claramente separadas.

La organización del sistema se basa en:

| Elemento | Rol |
|---|---|
| `00-INDEX.md` | Índice maestro. Puerta de entrada obligatoria. Define orden de lectura por tarea. |
| `01-PRODUCT.md` | Alcance, objetivo, flujos de usuario, backend, resumen de contratos |
| `02-ARCHITECTURE.md` | Estructura de carpetas, capas, flujo de datos, signals, jerarquía de componentes |
| `03-COMPONENTS.md` | Contratos de props, eventos, responsabilidades y diagramas de cada componente UI |
| `04-HOOKS.md` | Firma de `useQRCode`, entradas, salidas, efectos colaterales |
| `05-TYPES.md` | Todos los contratos TypeScript: `QRConfig`, `QRStyle`, `ValidationResult`, etc. |
| `06-VALIDATIONS.md` | Reglas de validación, algoritmo, severidades, contraste, logo, quiet zone |
| `07-EXPORT.md` | Contratos de exportación PNG/SVG, escalado, DPI, calidad |
| `08-UX.md` | Tokens de diseño, responsive, tema claro/oscuro, accesibilidad, layout |
| `09-TESTING.md` | Framework, estructura de tests, cobertura mínima, reglas |
| `10-QR-TECH.md` | Capacidad por versión, ECL, quiet zone, contraste, riesgos de degradados/logos/formas |
| `11-ADR.md` | Decisiones arquitectónicas: Preact, Signals, qr-code-styling, Vite, Docker, file-saver |
| `12-RISKS.md` | Riesgos técnicos, UX, performance, mantenibilidad |
| `13-APPENDIX.md` | Tipos completos, glosario, recursos externos |
| Agente Constructor | Implementa el proyecto según los documentos fuente |
| Agente de Validación | Revisa conformidad técnica, funcional y arquitectónica |
| Agente de Documentación | Produce documentación derivada del sistema implementado |
| Agentes opcionales | Refuerzan testing, refactorización y control de calidad sin cambiar el alcance |

El objetivo operativo es que cualquier agente pueda ejecutar su trabajo con una secuencia clara, una fuente de verdad definida y un criterio uniforme de decisión.

## 2. Reglas globales para todos los agentes

### 2.1 Orden obligatorio de lectura

Todo agente debe seguir este orden antes de proponer, validar o modificar trabajo:

1. Leer `/.ai/specs/00-INDEX.md`.
2. Leer `/.ai/specs/01-PRODUCT.md`.
3. Leer `/.ai/specs/02-ARCHITECTURE.md`.
4. Leer los archivos de especificación específicos para su tarea (según la tabla de `00-INDEX.md`).
5. Revisar el código existente solo después de comprender los documentos relevantes.

Ningún agente puede omitir este orden.

### 2.2 Precedencia de autoridad

La precedencia obligatoria es:

`01-PRODUCT.md` > `02-ARCHITECTURE.md` > `03-COMPONENTS.md` > `04-HOOKS.md` > `05-TYPES.md` > `06-VALIDATIONS.md` > `07-EXPORT.md` > `08-UX.md` > `09-TESTING.md` > `10-QR-TECH.md` > `11-ADR.md` > `12-RISKS.md` > `13-APPENDIX.md` > código existente

Esto implica:

| Fuente | Nivel de autoridad | Uso permitido |
|---|---|---|
| `01-PRODUCT.md` | Máxima | Define alcance, contratos, módulos, restricciones y objetivo del producto |
| `02-ARCHITECTURE.md` | Alta | Define arquitectura, estructura, capas y flujo de datos |
| `03-COMPONENTS.md` ... `12-RISKS.md` | Media-Alta | Definen dominios específicos compatibles con los archivos de mayor precedencia |
| `13-APPENDIX.md` | Referencial | Glosario, recursos y tipos completos. No define nuevos requisitos. |
| Código existente | Referencial | Sirve como estado actual del repositorio, pero no puede contradecir la especificación |

Si el código existente contradice cualquier archivo de especificación, el agente debe seguir la documentación y reportar la discrepancia.

### 2.3 Reglas de ejecución obligatorias

Todos los agentes deben cumplir estas reglas:

1. No inventar funcionalidades, flujos, pantallas, componentes, estados, validaciones o dependencias que no estén definidas o justificadas por los archivos de especificación.
2. No modificar `/.ai/specs/00-INDEX.md`.
3. No modificar `/.ai/specs/01-PRODUCT.md` sin autorización explícita.
4. No reinterpretar una omisión como permiso para ampliar alcance.
5. Mantener la arquitectura definida en los documentos fuente.
6. Mantener nombres de componentes, módulos, hooks, tipos y carpetas definidos por la especificación.
7. Tratar el código existente como implementación candidata, no como fuente de verdad.
8. Reportar inconsistencias documentales o de implementación antes de resolverlas implícitamente.
9. Preservar los contratos TypeScript y los límites funcionales del sistema.
10. No introducir dependencias no aprobadas.

### 2.4 Regla de resolución de conflictos

Cuando exista conflicto entre fuentes, el agente debe actuar así:

1. Verificar si `01-PRODUCT.md` define explícitamente la regla.
2. Si `01-PRODUCT.md` la define, esa decisión prevalece.
3. Si `01-PRODUCT.md` no la define y un archivo de dominio específico (ej. `06-VALIDATIONS.md`) sí lo hace sin contradecir a `01-PRODUCT.md`, aplicar el archivo de dominio.
4. Si dos archivos de especificación se contradicen o dejan un vacío material, detener la decisión implícita y reportar la inconsistencia.
5. No corregir por criterio propio aquello que cambie alcance, arquitectura o contratos.

### 2.5 Regla de reporte de inconsistencias

Todo agente debe reportar inconsistencias cuando detecte cualquiera de estos casos:

| Tipo de inconsistencia | Ejemplo |
|---|---|
| Documental | `01-PRODUCT.md` define una firma distinta a `05-TYPES.md` |
| Arquitectónica | El código implementa una estructura distinta a la definida |
| Contractual | Tipos, props o retornos no coinciden con los contratos |
| Funcional | El comportamiento implementado excede o incumple el alcance |
| Dependencias | El proyecto usa librerías no aprobadas por la especificación |

El reporte debe incluir como mínimo:

1. Archivo o sección afectada.
2. Naturaleza del conflicto.
3. Fuente de mayor autoridad aplicable.
4. Impacto potencial en implementación o validación.
5. Recomendación de bloqueo o continuidad controlada.

### 2.6 Regla de conservación arquitectónica

Todo agente debe preservar, como mínimo, estas decisiones estructurales del proyecto:

| Área | Directriz obligatoria |
|---|---|
| Stack | `Preact + TypeScript + Vite` |
| Estado global | `@preact/signals` |
| Generación QR | `qr-code-styling` |
| Exportación | PNG y SVG según contratos definidos |
| Estructura | Organización por `components`, `hooks`, `types`, `utils`, `state`, `styles` |
| Naturaleza de app | SPA sin backend por defecto |
| Ejecución | Entorno Docker. No requiere Node.js ni pnpm en la máquina host |
| Testing | Tests unitarios y E2E se ejecutan dentro del contenedor Docker |

## 3. Agentes del proyecto

### 3.1 Agente Constructor

**Misión:** implementar el proyecto completo `QR-GENERATOR` de acuerdo con los archivos de especificación, sin ampliar alcance.

**Responsabilidades principales:**

1. Implementar estructura de carpetas y módulos definidos.
2. Crear archivos, componentes, hooks, tipos, utilidades, estado y estilos requeridos.
3. Respetar contratos de props, tipos, eventos, validaciones y exportación.
4. Implementar la arquitectura establecida sin sustituciones arbitrarias.
5. Mantener paridad exacta con los nombres definidos por la especificación.
6. Implementar solo funcionalidades explícitamente descritas.

**Entradas obligatorias:**

| Entrada | Uso |
|---|---|
| `/.ai/specs/00-INDEX.md` | Índice maestro y orden de lectura |
| `/.ai/specs/01-PRODUCT.md` | Fuente primaria de alcance y contratos |
| `/.ai/specs/02-ARCHITECTURE.md` | Fuente de arquitectura y estructura |
| Archivos de dominio específicos | Según la tarea asignada (ver `00-INDEX.md`) |
| Código existente | Base de trabajo y referencia de estado actual |

**Salidas esperadas:**

| Salida | Descripción |
|---|---|
| Código fuente | Implementación completa o incremental alineada a especificación |
| Estructura de archivos | Organización consistente con la arquitectura definida |
| Observaciones | Reporte de inconsistencias o bloqueos detectados |

**Reglas específicas:**

1. No inventa nada.
2. No cambia arquitectura.
3. No cambia nombres de componentes ni contratos sin autorización documental explícita.
4. No modifica archivos de especificación.
5. Si detecta ambigüedad material, reporta antes de cerrar una interpretación.

### 3.2 Agente de Validación

**Misión:** verificar que la implementación cumpla el alcance funcional, técnico y arquitectónico definido por los archivos de especificación.

**Responsabilidades principales:**

1. Revisar conformidad contra los archivos de especificación relevantes.
2. Verificar estructura arquitectónica y organización de módulos.
3. Revisar contratos TypeScript, props, tipos y retornos.
4. Revisar validaciones funcionales y restricciones de negocio.
5. Revisar consistencia de UI/UX respecto a layout, responsive, accesibilidad y feedback.
6. Detectar desviaciones, omisiones y sobreimplementaciones.

**Entradas obligatorias:**

| Entrada | Uso |
|---|---|
| `/.ai/specs/00-INDEX.md` | Índice maestro y orden de lectura |
| `/.ai/specs/01-PRODUCT.md` | Base de verificación funcional |
| `/.ai/specs/02-ARCHITECTURE.md` | Base de verificación arquitectónica |
| `/.ai/specs/03-COMPONENTS.md` ... `12-RISKS.md` | Bases de verificación por dominio |
| Código implementado | Objeto de validación |

**Salidas esperadas:**

| Salida | Descripción |
|---|---|
| Informe de hallazgos | Incumplimientos, riesgos, faltantes o inconsistencias |
| Estado de conformidad | Conforme, conforme con observaciones o no conforme |
| Recomendaciones | Ajustes necesarios para alinear implementación y especificación |

**Criterios mínimos de revisión:**

1. Arquitectura.
2. Contratos TypeScript.
3. Componentes y nombres.
4. Estado global.
5. Validaciones QR.
6. Exportación PNG/SVG.
7. UI/UX y responsive.
8. Dependencias aprobadas.

### 3.3 Agente de Documentación

**Misión:** generar documentación derivada del sistema implementado, sin redefinir el producto ni alterar la especificación.

**Responsabilidades principales:**

1. Generar o actualizar `README` del proyecto.
2. Documentar arquitectura implementada.
3. Documentar componentes, hooks, estado, utilidades y flujos relevantes.
4. Reflejar decisiones ya existentes en los archivos de especificación sin cambiar su significado.
5. Mantener consistencia entre documentación y código real.

**Entradas obligatorias:**

| Entrada | Uso |
|---|---|
| `/.ai/specs/00-INDEX.md` | Índice maestro y orden de lectura |
| `/.ai/specs/01-PRODUCT.md` | Fuente de alcance funcional |
| `/.ai/specs/02-ARCHITECTURE.md` | Fuente de diseño arquitectónico |
| Código implementado | Fuente de documentación derivada |

**Salidas esperadas:**

| Salida | Descripción |
|---|---|
| `README` | Guía operativa y técnica del proyecto |
| Documentación técnica | Explicación de arquitectura, componentes y uso |
| Notas de consistencia | Desviaciones documentales detectadas |

**Reglas específicas:**

1. No redefine requerimientos.
2. No documenta funcionalidades no implementadas como si existieran.
3. No usa la documentación derivada para invalidar los archivos de especificación.

### 3.4 Agente de Testing

**Misión:** garantizar que la implementación tenga la cobertura y las pruebas mínimas requeridas por la especificación.

**Responsabilidades principales:**

1. Diseñar y mantener tests unitarios, de integración y de componentes según lo definido.
2. Verificar reglas críticas de validación, exportación y estado.
3. Confirmar que los tests representen contratos reales del sistema.
4. Crear pruebas de regresión antes de fixes cuando aplique.

**Restricción clave:** no debe introducir tests que formalicen comportamiento fuera de los archivos de especificación.

### 3.5 Agente de Refactor

**Misión:** mejorar claridad, mantenibilidad y estructura interna sin cambiar comportamiento, alcance ni contratos.

**Responsabilidades principales:**

1. Simplificar implementación.
2. Reducir duplicación.
3. Mejorar legibilidad.
4. Preservar comportamiento observable.

**Restricción clave:** no puede usar refactorización como excusa para rediseñar arquitectura o renombrar elementos especificados.

## 4. Flujo de trabajo entre agentes

### 4.1 Orden recomendado

El flujo recomendado entre agentes es el siguiente:

1. Agente Constructor.
2. Agente de Validación.
3. Agente de Testing.
4. Agente de Refactor, si la validación lo permite y sin cambiar contratos.
5. Agente de Documentación.

### 4.2 Flujo operativo

| Etapa | Agente | Recibe | Produce |
|---|---|---|---|
| 1 | Constructor | Archivos de especificación + código existente | Implementación alineada a especificación |
| 2 | Validación | Implementación + documentos fuente | Informe de conformidad y hallazgos |
| 3 | Testing | Implementación validada + contratos | Suite de pruebas y resultados |
| 4 | Refactor | Código validado + hallazgos | Mejora interna sin cambio funcional |
| 5 | Documentación | Código final + documentos fuente | `README` y documentación técnica derivada |

### 4.3 Reglas de traspaso entre agentes

1. Ningún agente debe asumir contexto no entregado explícitamente por documentos o artefactos previos.
2. Toda salida del agente anterior debe ser verificable por el siguiente.
3. Si Validación detecta incumplimientos críticos, el flujo vuelve al Constructor.
4. Si Testing detecta regresiones, el flujo vuelve al Constructor o Refactor según la causa.
5. Documentación trabaja sobre el estado final aprobado, no sobre supuestos.

### 4.4 Criterio de cierre por etapa

Una etapa solo se considera cerrada cuando:

| Etapa | Criterio de cierre |
|---|---|
| Construcción | La implementación cubre el alcance definido sin desvíos no justificados |
| Validación | No existen incumplimientos críticos contra los archivos de especificación |
| Testing | Las pruebas relevantes existen y validan el comportamiento esperado |
| Refactor | No cambió comportamiento, contratos ni arquitectura |
| Documentación | La documentación refleja fielmente el sistema final |

## 5. Restricciones

Las siguientes restricciones son obligatorias para todos los agentes:

1. No modificar `/.ai/specs/00-INDEX.md`.
2. No modificar `/.ai/specs/01-PRODUCT.md` sin autorización explícita.
3. No cambiar nombres de componentes definidos por la especificación.
4. No cambiar la arquitectura definida.
5. No agregar dependencias no aprobadas.
6. No agregar backend, persistencia o servicios remotos si no están explícitamente requeridos.
7. No introducir funcionalidades fuera del alcance de la SPA QR Generator.
8. No reemplazar `@preact/signals`, `qr-code-styling`, `file-saver` o el stack base sin aprobación explícita.
9. No convertir warnings definidos en errores, ni errores definidos en warnings, salvo instrucción documental superior.
10. No usar el código existente para justificar una desviación respecto de la documentación fuente.

### 5.1 Dependencias aprobadas

Las dependencias aprobadas por la especificación son:

| Dependencia | Uso esperado |
|---|---|
| `qr-code-styling` | Generación QR con estilos |
| `@preact/signals` | Estado global reactivo |
| `file-saver` | Exportación y descarga |
| `vitest` | Testing |
| `@vitest/ui` | UI de tests |
| `jsdom` | Entorno DOM de tests |
| `@testing-library/preact` | Testing de componentes Preact |

Cualquier dependencia adicional requiere aprobación explícita externa a este documento.

## 6. Ubicación de archivos

Las rutas de referencia del sistema multi-agente son las siguientes:

| Archivo | Ubicación obligatoria |
|---|---|
| `AGENTS.md` | `/.ai/AGENTS.md` |
| `00-INDEX.md` | `/.ai/specs/00-INDEX.md` |
| `01-PRODUCT.md` | `/.ai/specs/01-PRODUCT.md` |
| `02-ARCHITECTURE.md` | `/.ai/specs/02-ARCHITECTURE.md` |
| `03-COMPONENTS.md` | `/.ai/specs/03-COMPONENTS.md` |
| `04-HOOKS.md` | `/.ai/specs/04-HOOKS.md` |
| `05-TYPES.md` | `/.ai/specs/05-TYPES.md` |
| `06-VALIDATIONS.md` | `/.ai/specs/06-VALIDATIONS.md` |
| `07-EXPORT.md` | `/.ai/specs/07-EXPORT.md` |
| `08-UX.md` | `/.ai/specs/08-UX.md` |
| `09-TESTING.md` | `/.ai/specs/09-TESTING.md` |
| `10-QR-TECH.md` | `/.ai/specs/10-QR-TECH.md` |
| `11-ADR.md` | `/.ai/specs/11-ADR.md` |
| `12-RISKS.md` | `/.ai/specs/12-RISKS.md` |
| `13-APPENDIX.md` | `/.ai/specs/13-APPENDIX.md` |

### 6.1 Regla de acceso documental

Todo agente debe resolver primero `/.ai/specs/00-INDEX.md` antes de cualquier tarea sustantiva. Si un archivo falta, el agente debe reportarlo como bloqueo formal.

## 7. Objetivo final

El objetivo final de este sistema multi-agente es permitir que el Agente Constructor implemente `QR-GENERATOR` sin ambigüedades, usando `01-PRODUCT.md` como autoridad principal, `02-ARCHITECTURE.md` como autoridad arquitectónica, los archivos de dominio específicos como detalle técnico, y el código existente únicamente como referencia de estado.

El resultado esperado es una implementación consistente con la arquitectura definida, validable por otros agentes y documentable sin reinterpretaciones del alcance.
