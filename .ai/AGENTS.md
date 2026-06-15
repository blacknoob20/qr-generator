# AGENTS.md

## 1. Propósito del sistema multi-agente

El sistema multi-agente de `QR-GENERATOR` existe para coordinar la implementación, validación y documentación del proyecto de forma consistente, trazable y sin ambigüedades.

El problema que resuelve es la divergencia entre intención funcional, diseño técnico e implementación. Para evitarlo, los agentes trabajan con una jerarquía de autoridad documental fija y con responsabilidades claramente separadas.

La organización del sistema se basa en:

| Elemento | Rol |
|---|---|
| `SPEC.md` | Define el alcance, contratos principales, arquitectura base y restricciones funcionales |
| `SDD.md` | Detalla el diseño técnico, flujos, decisiones arquitectónicas y criterios operativos |
| Agente Constructor | Implementa el proyecto según los documentos fuente |
| Agente de Validación | Revisa conformidad técnica, funcional y arquitectónica |
| Agente de Documentación | Produce documentación derivada del sistema implementado |
| Agentes opcionales | Refuerzan testing, refactorización y control de calidad sin cambiar el alcance |

El objetivo operativo es que cualquier agente pueda ejecutar su trabajo con una secuencia clara, una fuente de verdad definida y un criterio uniforme de decisión.

## 2. Reglas globales para todos los agentes

### 2.1 Orden obligatorio de lectura

Todo agente debe seguir este orden antes de proponer, validar o modificar trabajo:

1. Leer `/.ai/specs/SPEC.md`.
2. Leer `/.ai/specs/SDD.md`.
3. Revisar el código existente solo después de comprender ambos documentos.

Ningún agente puede omitir este orden.

### 2.2 Precedencia de autoridad

La precedencia obligatoria es:

`SPEC.md` > `SDD.md` > código existente

Esto implica:

| Fuente | Nivel de autoridad | Uso permitido |
|---|---|---|
| `/.ai/specs/SPEC.md` | Máxima | Define alcance, contratos, módulos, restricciones y objetivo del producto |
| `/.ai/specs/SDD.md` | Alta | Define diseño técnico detallado y decisiones de implementación compatibles con SPEC |
| Código existente | Referencial | Sirve como estado actual del repositorio, pero no puede contradecir SPEC ni SDD |

Si el código existente contradice `SPEC.md` o `SDD.md`, el agente debe seguir la documentación y reportar la discrepancia.

### 2.3 Reglas de ejecución obligatorias

Todos los agentes deben cumplir estas reglas:

1. No inventar funcionalidades, flujos, pantallas, componentes, estados, validaciones o dependencias que no estén definidas o justificadas por `SPEC.md` o `SDD.md`.
2. No modificar `/.ai/specs/SPEC.md`.
3. No modificar `/.ai/specs/SDD.md`.
4. No reinterpretar una omisión como permiso para ampliar alcance.
5. Mantener la arquitectura definida en los documentos fuente.
6. Mantener nombres de componentes, módulos, hooks, tipos y carpetas definidos por la especificación.
7. Tratar el código existente como implementación candidata, no como fuente de verdad.
8. Reportar inconsistencias documentales o de implementación antes de resolverlas implícitamente.
9. Preservar los contratos TypeScript y los límites funcionales del sistema.
10. No introducir dependencias no aprobadas.

### 2.4 Regla de resolución de conflictos

Cuando exista conflicto entre fuentes, el agente debe actuar así:

1. Verificar si `SPEC.md` define explícitamente la regla.
2. Si `SPEC.md` la define, esa decisión prevalece.
3. Si `SPEC.md` no la define y `SDD.md` sí lo hace sin contradecir a `SPEC.md`, aplicar `SDD.md`.
4. Si ambos documentos se contradicen o dejan un vacío material, detener la decisión implícita y reportar la inconsistencia.
5. No corregir por criterio propio aquello que cambie alcance, arquitectura o contratos.

### 2.5 Regla de reporte de inconsistencias

Todo agente debe reportar inconsistencias cuando detecte cualquiera de estos casos:

| Tipo de inconsistencia | Ejemplo |
|---|---|
| Documental | `SPEC.md` define una firma distinta a `SDD.md` |
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
| Ejecución | Entorno Docker definido por la especificación |

## 3. Agentes del proyecto

### 3.1 Agente Constructor

**Misión:** implementar el proyecto completo `QR-GENERATOR` de acuerdo con `SPEC.md` y `SDD.md`, sin ampliar alcance.

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
| `/.ai/specs/SPEC.md` | Fuente primaria de alcance y contratos |
| `/.ai/specs/SDD.md` | Fuente secundaria de diseño detallado |
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
4. No modifica `SPEC.md` ni `SDD.md`.
5. Si detecta ambigüedad material, reporta antes de cerrar una interpretación.

### 3.2 Agente de Validación

**Misión:** verificar que la implementación cumpla el alcance funcional, técnico y arquitectónico definido por `SPEC.md` y `SDD.md`.

**Responsabilidades principales:**

1. Revisar conformidad contra `SPEC.md` y `SDD.md`.
2. Verificar estructura arquitectónica y organización de módulos.
3. Revisar contratos TypeScript, props, tipos y retornos.
4. Revisar validaciones funcionales y restricciones de negocio.
5. Revisar consistencia de UI/UX respecto a layout, responsive, accesibilidad y feedback.
6. Detectar desviaciones, omisiones y sobreimplementaciones.

**Entradas obligatorias:**

| Entrada | Uso |
|---|---|
| `/.ai/specs/SPEC.md` | Base de verificación funcional |
| `/.ai/specs/SDD.md` | Base de verificación técnica |
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
4. Reflejar decisiones ya existentes en `SPEC.md` y `SDD.md` sin cambiar su significado.
5. Mantener consistencia entre documentación y código real.

**Entradas obligatorias:**

| Entrada | Uso |
|---|---|
| `/.ai/specs/SPEC.md` | Fuente de alcance funcional |
| `/.ai/specs/SDD.md` | Fuente de diseño técnico |
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
3. No usa la documentación derivada para invalidar `SPEC.md` o `SDD.md`.

### 3.4 Agente de Testing

**Misión:** garantizar que la implementación tenga la cobertura y las pruebas mínimas requeridas por la especificación.

**Responsabilidades principales:**

1. Diseñar y mantener tests unitarios, de integración y de componentes según lo definido.
2. Verificar reglas críticas de validación, exportación y estado.
3. Confirmar que los tests representen contratos reales del sistema.
4. Crear pruebas de regresión antes de fixes cuando aplique.

**Restricción clave:** no debe introducir tests que formalicen comportamiento fuera de `SPEC.md` o `SDD.md`.

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
| 1 | Constructor | `SPEC.md`, `SDD.md`, código existente | Implementación alineada a especificación |
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
| Validación | No existen incumplimientos críticos contra `SPEC.md` o `SDD.md` |
| Testing | Las pruebas relevantes existen y validan el comportamiento esperado |
| Refactor | No cambió comportamiento, contratos ni arquitectura |
| Documentación | La documentación refleja fielmente el sistema final |

## 5. Restricciones

Las siguientes restricciones son obligatorias para todos los agentes:

1. No modificar `/.ai/specs/SPEC.md`.
2. No modificar `/.ai/specs/SDD.md`.
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
| `SPEC.md` | `/.ai/specs/SPEC.md` |
| `SDD.md` | `/.ai/specs/SDD.md` |

### 6.1 Regla de acceso documental

Todo agente debe resolver primero estas rutas antes de cualquier tarea sustantiva. Si un archivo falta, el agente debe reportarlo como bloqueo formal.

## 7. Objetivo final

El objetivo final de este sistema multi-agente es permitir que el Agente Constructor implemente `QR-GENERATOR` sin ambigüedades, usando `SPEC.md` como autoridad principal, `SDD.md` como diseño técnico detallado y el código existente únicamente como referencia de estado.

El resultado esperado es una implementación consistente con la arquitectura definida, validable por otros agentes y documentable sin reinterpretaciones del alcance.
