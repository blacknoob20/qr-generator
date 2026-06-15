# 10-QR-TECH: Límites de la Tecnología QR

**Proyecto:** QR Generator SPA
**Versión:** 1.0
**Stack:** Preact + TypeScript + Vite
**Fecha:** 2026-06-14

---

## 1. Capacidad por Versión

### 1.1 Tabla Completa

| Ver | Tamaño | Numeric | Alphanumeric | Byte | Kanji |
|-----|--------|---------|--------------|------|-------|
| 1 | 21×21 | 7089 | 4296 | 2953 | 1817 |
| 2 | 25×25 | 4296 | 2612 | 1796 | 1103 |
| 3 | 29×29 | 7089 | 4296 | 2953 | 1817 |
| 4 | 33×33 | 14132 | 8592 | 5914 | 3639 |
| 5 | 37×37 | 23330 | 14168 | 9753 | 5999 |
| 6 | 41×41 | 31130 | 18917 | 13012 | 8005 |
| 7 | 45×45 | 43369 | 26350 | 18124 | 11149 |
| 8 | 49×49 | 55913 | 33976 | 23364 | 14374 |
| 9 | 53×53 | 69936 | 42499 | 29229 | 17974 |
| 10 | 57×57 | 85880 | 52196 | 35903 | 22083 |
| 11 | 61×61 | 103864 | 63139 | 43429 | 26716 |
| 12 | 65×65 | 124364 | 75599 | 52003 | 31990 |
| 13 | 69×69 | 146452 | 88982 | 61211 | 37658 |
| 14 | 73×73 | 170162 | 103412 | 71135 | 43760 |
| 15 | 77×77 | 195728 | 118942 | 81829 | 50342 |
| 16 | 81×81 | 223492 | 135837 | 93459 | 57507 |
| 17 | 85×85 | 253664 | 154159 | 106087 | 65257 |
| 18 | 89×89 | 285584 | 173618 | 119436 | 73471 |
| 19 | 93×93 | 319560 | 194260 | 133634 | 82198 |
| 20 | 97×97 | 355816 | 216292 | 148758 | 91532 |
| 21 | 101×101 | 394628 | 239872 | 165001 | 101503 |
| 22 | 105×105 | 436616 | 265312 | 182480 | 112264 |
| 23 | 109×109 | 481608 | 292776 | 201374 | 123867 |
| 24 | 113×113 | 530176 | 322308 | 221725 | 136385 |
| 25 | 117×117 | 582596 | 354008 | 243454 | 149785 |
| 26 | 121×121 | 638656 | 387960 | 266852 | 164171 |
| 27 | 125×125 | 698336 | 424560 | 292012 | 179649 |
| 28 | 129×129 | 762336 | 463360 | 318720 | 196094 |
| 29 | 133×133 | 829892 | 504508 | 347026 | 213510 |
| 30 | 137×137 | 901120 | 547696 | 376787 | 231781 |
| 31 | 141×141 | 976048 | 593212 | 408050 | 251003 |
| 32 | 145×145 | 1055504 | 641428 | 441216 | 271377 |
| 33 | 149×149 | 1138864 | 692556 | 476448 | 293068 |
| 34 | 153×153 | 1226212 | 745848 | 513000 | 315593 |
| 35 | 157×157 | 1317636 | 800760 | 550958 | 338965 |
| 36 | 161×161 | 1413248 | 858808 | 590712 | 363359 |
| 37 | 165×165 | 1513132 | 919440 | 632404 | 389017 |
| 38 | 169×169 | 1617632 | 983288 | 676329 | 416115 |
| 39 | 173×173 | 1726844 | 1049928 | 722772 | 444567 |
| 40 | 177×177 | 1840964 | 1119160 | 770112 | 473767 |

**Nota:** Los valores están en **caracteres**. Para bytes, multiplicar por 1 para Byte, 2 para caracteres multibyte.

### 1.2 Resumen por Corrección (Byte)

| Versión | Dimensiones | Bits (Byte/L) | Bits (Byte/M) | Bits (Byte/Q) | Bits (Byte/H) |
|---------|-------------|---------------|---------------|---------------|---------------|
| 1 | 21×21 | 17 | 14 | 11 | 7 |
| 2 | 25×25 | 32 | 26 | 20 | 14 |
| 3 | 29×29 | 53 | 42 | 32 | 24 |
| 4 | 33×33 | 78 | 62 | 46 | 34 |
| 5 | 37×37 | 106 | 84 | 60 | 44 |
| 10 | 57×57 | 354 | 282 | 208 | 154 |
| 20 | 97×97 | 1853 | 1480 | 1096 | 816 |
| 30 | 137×137 | 4196 | 3357 | 2493 | 1867 |
| 40 | 177×177 | 7089 | 5663 | 4211 | 3153 |

---

## 2. Niveles de Corrección de Error (ECL)

| Nivel | Capacidad de recuperación | Uso de redundancia | Aplicación recomendada |
|-------|---------------------------|-------------------|------------------------|
| **L** (Low) | ~7% | ~19% | Entornos controlados, QR cortos |
| **M** (Medium) | ~15% | ~26% | Uso general (recomendado) |
| **Q** (Quartile) | ~25% | ~38% | Entornos industriales, superficies irregulares |
| **H** (High) | ~30% | ~50% | Logos, decorativos, superficies problemáticas |

**Implicaciones:**
- Mayor corrección = menor capacidad de datos
- Logos **requieren** nivel H para funcionar correctamente
- Versiones superiores permiten más datos con misma corrección

---

## 3. Quiet Zone (Zona de Silencio)

- **Mínimo:** 4 módulos en cada lado
- **Default:** 4 módulos
- **Color:** Recomendado blanco o color de fondo

---

## 4. Contraste

**Fórmula WCAG 2.1:**

```
                (L1 + 0.05)
Ratio =  ─────────────────
                (L2 + 0.05)
```

Donde L1 = luminancia más clara, L2 = luminancia más oscura.

| Ratio | WCAG Level | Aplicación QR |
|-------|------------|---------------|
| 21:1 | AAA | Excelente (negro/blanco) |
| 7:1 | AAA | Óptimo |
| 4.5:1 | AA | Mínimo recomendado |
| 3:1 | AA Large | Riesgoso |
| < 3:1 | Fail | Probablemente falla escaneo |

---

## 5. Riesgos Documentados

### 5.1 Logos Grandes

- **Riesgo:** Si el logo supera el 20%, el QR puede volverse no escaneable
- **Mitigación:** Usar nivel de corrección H y garantizar contraste

### 5.2 Colores No Contrastantes

- **Riesgo:** El escaneo falla con ratios de contraste < 3:1
- **Mitigación:** Validar contraste WCAG y mostrar warning

### 5.3 Degradados

- **Riesgo:** El lector QR puede interpretar el degradado como ruido
- **Mitigación:** Usar solo degradados sutiles y siempre con nivel H

### 5.4 Formas Redondeadas

- **Riesgo:** Redondear módulos excesivamente reduce la definición del patrón
- **Mitigación:** Limitar radio de redondeo al 20% del módulo

### 5.5 Falta de Cifrado

- **Riesgo:** Los datos del QR son **siempre públicos**
- **Mitigación:** No almacenar información sensible en el QR
- **Alternativa:** Usar un short link que apunte a un recurso autenticado

---

## 6. Tabla Comparativa de Riesgos

| Factor | Riesgo | Impacto | Mitigación |
|--------|--------|---------|------------|
| **Logo > 20%** | Alto | QR no escaneable | Usar ≤20%, ECL H |
| **Contraste < 4.5:1** | Alto | Escaneo parcial/fallido | Validar ratio WCAG |
| **Degradados** | Medio | Reducción tasa éxito | ECL H, test multi-device |
| **Formas circulares** | Medio | Pérdida definición | ECL H, evitar industrial |
| **Quiet zone < 4** | Bajo | Escaneo difícil bordes | Mantener ≥4 módulos |
| **ECL L con logo** | Alto | Logo destruye datos | Usar ECL H |
| **Versión muy baja** | Alto | Overflow datos | Calcular versión mínima |

---

**FIN DE 10-QR-TECH**
