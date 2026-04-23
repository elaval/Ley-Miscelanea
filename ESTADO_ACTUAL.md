# Estado Actual del Proyecto - Ley Miscelánea

**Fecha**: 22 de abril de 2026
**Versión**: 0.2.0
**Fase**: 1 (Parsing y estructuración) - COMPLETADA ✅

---

## ✅ Lo que ya está funcionando

### 1. Infraestructura del proyecto
- ✅ Estructura de carpetas creada (`fuente/`, `scripts/`, `datos/`, `types/`, `prompts/`)
- ✅ Proyecto Node.js/TypeScript configurado
- ✅ Dependencias instaladas (`mammoth`, `tsx`, `typescript`)
- ✅ Scripts ejecutables vía npm

### 2. Sistema de tipos TypeScript
- ✅ Archivo [types/schema.ts](types/schema.ts) con definiciones completas:
  - `LegalDocument`, `Article`, `Section`
  - `EnrichedArticle`, `LegalReference`, `Institution`
  - `NumericValue`, `LLMAnalysis`

### 3. Scripts implementados
- ✅ [scripts/parse-docx.ts](scripts/parse-docx.ts) - Parser principal
- ✅ [scripts/enrich-metadata.ts](scripts/enrich-metadata.ts) - Enriquecedor
- ✅ [scripts/verify-articles.ts](scripts/verify-articles.ts) - Verificación
- ✅ [scripts/show-between.ts](scripts/show-between.ts) - Análisis de secciones

### 4. Datos generados
- ✅ [datos/intermedio/documento_base.json](datos/intermedio/documento_base.json) (~413 KB)
- ✅ [datos/enriquecido/articulos_enriquecidos.json](datos/enriquecido/articulos_enriquecidos.json)

### 5. Documentación creada
- ✅ [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)
- ✅ [OBSERVACIONES.md](OBSERVACIONES.md)
- ✅ [README.tecnico.md](README.tecnico.md)
- ✅ [prompts/analisis-articulo.md](prompts/analisis-articulo.md)
- ✅ [CLAUDE.md](CLAUDE.md) (principios del proyecto)

---

## ✅ PROBLEMA CRÍTICO RESUELTO (v0.2.0)

### Estructura real del documento (descubierta en esta sesión)

El documento tiene **dos partes bien diferenciadas**:
1. **Mensaje presidencial** (líneas 1-196): introduce y describe cada artículo en lenguaje explicativo
   - "Artículos permanentes" y "Artículos transitorios" aquí son **secciones de descripción del mensaje**, no el articulado
2. **PROYECTO DE LEY** (líneas 197-705): texto legal formal
   - Artículos permanentes 1-33: formato `Artículo N.-`
   - Artículo 1 empieza con `"Artículo 1.-` (comilla de apertura del texto citado del proyecto)
   - Artículos transitorios: formato ordinal `Artículo primero transitorio.-` ... `Artículo décimo séptimo transitorio.-`
   - Sub-artículos de leyes modificadas (`"Artículo 9.-`, `"Artículo 26.-`, etc.) se cuelan pero deben ignorarse

### Correcciones aplicadas en `scripts/parse-docx.ts`
1. Detección de `PROYECTO DE LEY:` como activador del parsing formal
2. Artículo 1 detectado con comilla inicial (único caso válido con comilla)
3. Artículos con comilla que no sean el primero → ignorados (son de leyes modificadas)
4. Artículos transitorios detectados por ordinal: primero→1 ... décimo séptimo→17
5. Sub-artículos (bis, ter, quáter) excluidos

## 📊 Resultados actuales (correctos)

### Metadata extraída
- Leyes únicas mencionadas: 40
- Instituciones detectadas: 155 (pendiente normalización)
- Artículos con referencias legales: 31 (62%)
- Artículos con valores numéricos: 20 (40%)

### Artículos procesados
- **Total detectado**: 50 ✅
- **Permanentes**: 33 ✅
- **Transitorios**: 17 ✅

---

## 🎯 Próximos pasos

### 1. ✅ Vinculación de descripciones del mensaje — COMPLETADO
- ✅ 50/50 artículos con `message_description` del mensaje presidencial
- ✅ Casos complejos manejados: Art. 14/16 (sub-frases), T11 (typo), T17 (cierre del mensaje)
- ✅ `npm run pipeline` ejecuta todo el pipeline completo

### 2. Fase 2: Diseñar prompt LLM mejorado
- [ ] Rediseñar prompt usando `message_description` como ancla de intención de política pública
- [ ] Separar explícitamente: "Contexto declarado" (del mensaje) vs. "Análisis propio" (del LLM)
- [ ] Implementar `generate-analysis.ts`
- [ ] Testear en 3-5 artículos de muestra (ej: Art. 9, 12, 13, T3, T11)

### 3. Mejoras de datos pendientes (baja prioridad hasta ver calidad LLM)
- [ ] Normalizar instituciones (reducir de 155 a ~20-30 entidades reales)
- [ ] Mejorar cross-references (distinguir arts. del PDL vs. de leyes externas)

### 4. Fase 3: Frontend
- [ ] Elegir framework (Next.js o Astro)
- [ ] Estructura de páginas según UX del CLAUDE.md

---

## 💻 Comandos disponibles

```bash
# Parsear documento
npm run parse

# Enriquecer metadata
npm run enrich

# Pipeline completo
npm run parse && npm run enrich

# Scripts de verificación
npx tsx scripts/verify-articles.ts
npx tsx scripts/show-between.ts
```

---

## 📁 Estructura del proyecto

```
.
├── fuente/
│   └── 018-374 Mensaje PDL Reconstrucción (22.04.2026) DJL.docx
├── scripts/
│   ├── parse-docx.ts           ⚠️ REQUIERE CORRECCIÓN
│   ├── enrich-metadata.ts      ✅ Funcionando
│   ├── verify-articles.ts      ✅ Script auxiliar
│   └── show-between.ts         ✅ Script auxiliar
├── types/
│   └── schema.ts               ✅ Tipos completos
├── datos/
│   ├── intermedio/
│   │   └── documento_base.json ⚠️ Con datos incorrectos
│   └── enriquecido/
│       └── articulos_enriquecidos.json ⚠️ Con datos incorrectos
├── prompts/
│   └── analisis-articulo.md    ✅ Template para LLM
├── CLAUDE.md                   ✅ Principios del proyecto
├── OBSERVACIONES.md            ⚠️ Desactualizado (refleja error)
├── RESUMEN_EJECUTIVO.md        ⚠️ Desactualizado (refleja error)
├── README.tecnico.md           ⚠️ Desactualizado (refleja error)
└── ESTADO_ACTUAL.md            ← Este archivo
```

---

## 🔍 Información clave del documento

### Estructura detectada hasta ahora:
1. Encabezado y metadata
2. Antecedentes
3. Fundamentos
4. "III. CONTENIDO DEL PROYECTO DE LEY"
5. **"Artículos permanentes"** ← Sección con descripciones
   - "El artículo 1° modifica..."
   - "El artículo 2° modifica..."
   - ... (cantidad desconocida)
6. **"Artículos transitorios"** ← Sección con texto legal
   - "Artículo 2.- Agrégase..."
   - "Artículo 3.- Introdúcense..."
   - ... (35 artículos confirmados)

### Observación importante
No hay "Artículo 1" en formato legal formal. El primer artículo transitorio es el **Artículo 2**.

Esto sugiere que:
- Artículo 1 podría estar en la sección permanente
- O la numeración es intencional (empieza en 2)

---

## 🤔 Preguntas sin resolver

1. ¿Los textos descriptivos "El artículo N° modifica..." SON los artículos permanentes, o solo son fundamentos que explican artículos permanentes que están en otro lugar?

2. Si son fundamentos, ¿dónde está el texto legal formal de los artículos permanentes?

3. ¿Cuántos artículos permanentes hay? (Necesitamos contarlos)

4. ¿Por qué la numeración de transitorios empieza en 2 y no en 1?

---

## 📝 Notas para la próxima sesión

### Para retomar el trabajo:
1. Leer este archivo completo
2. Decidir estrategia para artículos permanentes
3. Ejecutar corrección del parser
4. Re-validar todos los resultados
5. Actualizar documentación

### Contexto importante:
- Este es un proyecto de ley de reconstrucción post-incendios (enero 2026)
- Regiones afectadas: Valparaíso, Ñuble, Biobío
- El objetivo es crear un sitio web de lectura asistida
- **Principio clave**: Separar texto oficial de interpretación LLM

### Decisiones de diseño tomadas:
- Dos capas de datos: base + enriquecido
- No usar LLM para parsing básico
- Priorizar trazabilidad sobre sofisticación
- Sistema debe ser regenerable

---

## ⚡ Acción inmediata recomendada

**Al retomar:**
```bash
# 1. Inspeccionar manualmente el documento
# Ver cuántos "El artículo N°" hay entre las dos secciones
npx tsx scripts/show-between.ts

# 2. Buscar si existe texto legal formal de permanentes
# (Requiere nueva lógica de búsqueda)

# 3. Corregir parser según hallazgos

# 4. Re-ejecutar pipeline
npm run parse && npm run enrich
```

---

**Última actualización**: 2026-04-22 22:30
**Última acción**: Vinculadas 50/50 descripciones del mensaje presidencial a cada artículo (campo `message_description`)
**Estado**: LISTO para Fase 2 ✅ — Rediseño del prompt de análisis LLM
