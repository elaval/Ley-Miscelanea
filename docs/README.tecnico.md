# README Técnico - Parser de Proyecto de Ley

## Resumen

Sistema de parsing y análisis estructurado del proyecto de ley de reconstrucción (Mensaje 018-374, 22.04.2026).

**Estado actual**: ✅ Fase 1 completada (Parsing y enriquecimiento de metadata)

## Arquitectura

### Flujo de Datos

```
┌─────────────────┐
│  documento.docx │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ parse-docx.ts   │ ← Extrae texto y estructura
└────────┬────────┘
         │
         ↓
┌──────────────────────┐
│ documento_base.json  │ ← Capa 1: Estructura cruda
└────────┬─────────────┘
         │
         ↓
┌─────────────────────┐
│ enrich-metadata.ts  │ ← Extrae metadata factual
└────────┬────────────┘
         │
         ↓
┌────────────────────────────┐
│ articulos_enriquecidos.json│ ← Capa 2: Metadata estructurada
└────────────────────────────┘
         │
         ↓
    [Próxima fase]
┌─────────────────────┐
│ generate-analysis.ts│ ← Genera interpretaciones LLM
└────────┬────────────┘
         │
         ↓
┌──────────────────────────┐
│ articulos_con_analisis.json│ ← Capa 3: Análisis + Metadata + Texto
└──────────────────────────┘
```

### Tipos de Datos

Ver [types/schema.ts](types/schema.ts) para definiciones completas.

**Tipos principales**:
- `LegalDocument`: Documento completo con secciones y artículos
- `Article`: Artículo individual con metadata
- `EnrichedArticle`: Artículo + metadata extraída
- `LegalReference`: Referencia a ley con tipo de modificación
- `Institution`: Institución mencionada
- `NumericValue`: Valor numérico (monto, plazo, porcentaje)

## Instalación

```bash
npm install
```

**Dependencias**:
- `mammoth`: Parser de DOCX
- `tsx`: Ejecutor de TypeScript
- `typescript`: Compilador

## Uso

### 1. Parsear documento DOCX

```bash
npm run parse
```

**Input**: `fuente/*.docx`
**Output**: `datos/intermedio/documento_base.json`

**Qué hace**:
- Extrae texto del DOCX
- Detecta secciones (antecedentes, fundamentos, ejes, artículos)
- Extrae artículos individuales
- Clasifica artículos permanentes vs. transitorios
- Genera warnings sobre ambigüedades

### 2. Enriquecer con metadata

```bash
npm run enrich
```

**Input**: `datos/intermedio/documento_base.json`
**Output**: `datos/enriquecido/articulos_enriquecidos.json`

**Qué hace**:
- Extrae referencias legales (leyes, DFL, decretos)
- Detecta instituciones mencionadas
- Extrae valores numéricos (montos, plazos, porcentajes)
- Asigna tags temáticos y de eje
- Detecta referencias cruzadas entre artículos

### 3. Pipeline completo

```bash
npm run parse && npm run enrich
```

## Estructura de Archivos

```
.
├── fuente/                          # Documentos fuente
│   └── 018-374 *.docx              # Documento original
│
├── scripts/                         # Scripts de procesamiento
│   ├── parse-docx.ts               # Parser principal
│   └── enrich-metadata.ts          # Enriquecedor
│
├── types/                           # Definiciones TypeScript
│   └── schema.ts                   # Tipos e interfaces
│
├── datos/
│   ├── intermedio/                 # Capa 1: Estructura base
│   │   └── documento_base.json     # ~413 KB
│   │
│   └── enriquecido/                # Capa 2: Metadata
│       └── articulos_enriquecidos.json
│
├── prompts/                         # Prompts para LLM
│   └── analisis-articulo.md        # Template de análisis
│
├── CLAUDE.md                        # Principios del proyecto
├── OBSERVACIONES.md                 # Hallazgos y recomendaciones
├── README.md                        # Documentación general
└── README.tecnico.md               # Este archivo
```

## Resultados Actuales

### Documento Procesado

- **Total de artículos**: 35
- **Artículos permanentes**: 0
- **Artículos transitorios**: 35
- **Secciones detectadas**: 26

### Metadata Extraída

- **Leyes únicas mencionadas**: 39
- **Instituciones detectadas**: 153 (requiere normalización)
- **Artículos con referencias legales**: 23 (66%)
- **Artículos con valores numéricos**: 13 (37%)

## Problemas Conocidos

### 1. Artículos con sufijos (CRÍTICO)

**Problema**: Artículos como "Artículo 24 bis", "Artículo 24 ter" se detectan con el mismo ID.

**Impacto**: IDs duplicados (`art-transitory-24` aparece 3 veces)

**Solución propuesta**: Mejorar regex en [scripts/parse-docx.ts:185](scripts/parse-docx.ts#L185)

```typescript
// Actual:
const articleMatch = line.match(/^Artículo\s+(\d+)[°º]?\.?\s*/i);

// Propuesto:
const articleMatch = line.match(/^Artículo\s+(\d+)\s*(bis|ter|quáter|quinquies)?[°º]?\.?\s*/i);
```

### 2. Instituciones sin normalizar

**Problema**: 153 instituciones únicas incluyen variaciones del mismo organismo.

**Solución propuesta**: Crear diccionario de normalización en `enrich-metadata.ts`.

### 3. Secciones mal clasificadas

**Problema**: Algunos párrafos que deberían ser "contenido" se clasifican como "antecedentes".

**Solución propuesta**: Mejorar lógica contextual en `detectSectionType()`.

## Próximos Pasos

### Fase 2: Análisis LLM (Pendiente)

1. Crear `scripts/generate-analysis.ts`
2. Implementar llamadas a API de LLM (Claude/GPT)
3. Usar template de [prompts/analisis-articulo.md](prompts/analisis-articulo.md)
4. Generar `articulos_con_analisis.json`

### Fase 3: Frontend (Pendiente)

1. Elegir framework (Next.js / Astro)
2. Crear generador estático
3. Implementar vistas:
   - Por artículo
   - Por eje temático
   - Por ley modificada
   - Por institución

## Principios de Diseño

1. **Separación de capas**
   - Texto oficial ≠ Metadata ≠ Análisis
   - Cada capa es regenerable independientemente

2. **Trazabilidad**
   - Todo análisis debe poder vincularse al texto fuente
   - Metadata incluye contexto de extracción

3. **Verificabilidad**
   - Preferir soluciones simples y auditables
   - Sobre sofisticadas y opacas

4. **Regenerabilidad**
   - Poder regenerar análisis LLM sin reprocesar DOCX
   - Versionar prompts y outputs

## API de Tipos

### LegalDocument

```typescript
interface LegalDocument {
  metadata: DocumentMetadata;
  sections: Section[];
  articles: Article[];
  parsing_stats?: ParsingStats;
}
```

### Article

```typescript
interface Article {
  article_id: string;           // "art-transitory-9"
  article_number: number;       // 9
  article_type: ArticleType;    // "permanent" | "transitory"
  title: string;                // "Artículo 9"
  raw_text: string;             // Texto completo
  order: number;                // Orden de aparición

  // Campos enriquecidos (vacíos en documento_base)
  theme_tags?: string[];
  axis_tags?: string[];
  legal_references?: LegalReference[];
  institutions?: Institution[];
  numeric_values?: NumericValue[];
  cross_references?: string[];
  llm_analysis?: LLMAnalysis;
}
```

### LegalReference

```typescript
interface LegalReference {
  law_name: string;             // "Ley 21.681"
  article_number?: string;      // "41"
  modification_type?: string;   // "modifica" | "deroga" | ...
  raw_mention: string;          // Texto original
}
```

## Contribuir

### Agregar nueva metadata

1. Agregar tipo en [types/schema.ts](types/schema.ts)
2. Implementar extracción en [scripts/enrich-metadata.ts](scripts/enrich-metadata.ts)
3. Actualizar estadísticas en `calculateStats()`

### Mejorar detección

1. Modificar regex o lógica en scripts
2. Ejecutar `npm run parse && npm run enrich`
3. Validar cambios en JSON generado
4. Actualizar tests si existen

## Licencia

[Por definir]

## Contacto

[Por definir]

---

**Última actualización**: 2026-04-22
**Versión**: 0.1.0
