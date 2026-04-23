# Observaciones del Parsing y Propuesta de Pipeline

## Resumen de Implementación

Se ha completado la primera iteración del sistema de parsing y estructuración del documento legal. El sistema consta de dos capas de datos claramente separadas:

1. **documento_base.json** - Estructura cruda del documento
2. **articulos_enriquecidos.json** - Metadata extraída y estructurada

## Estructura del Proyecto

```
.
├── fuente/                          # Documento fuente (.docx)
├── scripts/                         # Scripts de procesamiento
│   ├── parse-docx.ts               # Parser principal
│   └── enrich-metadata.ts          # Enriquecedor de metadata
├── types/                           # Definiciones TypeScript
│   └── schema.ts                   # Tipos e interfaces
├── datos/
│   ├── intermedio/                 # Capa 1: estructura base
│   │   └── documento_base.json
│   └── enriquecido/                # Capa 2: metadata enriquecida
│       └── articulos_enriquecidos.json
├── prompts/                         # (Para futura generación LLM)
└── site/                            # (Para futuro frontend)
```

## Estadísticas del Documento Procesado

### Contenido Extraído
- **Total de párrafos**: 705
- **Total de secciones**: 26
- **Total de artículos**: 35
  - Artículos permanentes: 0
  - Artículos transitorios: 35

### Metadata Enriquecida
- **Artículos con referencias legales**: 23 de 35 (66%)
- **Artículos con instituciones mencionadas**: 26 de 35 (74%)
- **Artículos con valores numéricos**: 13 de 35 (37%)
- **Leyes únicas mencionadas**: 39
- **Instituciones únicas detectadas**: 153

## Hallazgos y Observaciones

### 1. Estructura del Documento

✅ **Bien detectado:**
- Secciones principales (Antecedentes, Fundamentos)
- Marcadores de "Artículos permanentes" y "Artículos transitorios"
- Numeración de artículos
- Referencias a otras leyes

⚠️ **Ambigüedades encontradas:**

1. **No hay artículos permanentes reales**: El documento tiene la etiqueta "Artículos permanentes" seguida inmediatamente de "Artículos transitorios". Todos los 35 artículos son transitorios.
   - **Implicación**: Esto es coherente con un proyecto de reconstrucción (medidas temporales)
   - **Decisión**: El parser clasifica correctamente todos los artículos como transitorios

2. **Secciones mal clasificadas**: Algunas secciones que deberían ser "contenido" o "eje_tematico" fueron clasificadas como "antecedentes" (ver secciones 4, 6, 7, 8, etc.)
   - **Causa**: El parser detecta secciones basándose en keywords, pero muchos párrafos que empiezan con "Artículo XX establece..." son clasificados como antecedentes
   - **Recomendación**: Mejorar la detección contextual o usar análisis de jerarquía del documento

3. **Detección de instituciones demasiado amplia**: Se detectaron 153 instituciones únicas, probablemente con muchas variaciones del mismo organismo
   - **Ejemplo**: "Ministerio de Hacienda", "Ministerio de Hacienda de Chile", etc.
   - **Recomendación**: Implementar normalización de nombres de instituciones

### 2. Referencias Legales

✅ **Patrones detectados correctamente:**
- Ley N° XXXXX
- Decreto con Fuerza de Ley N° XXX
- Decreto N° XXXX

⚠️ **Mejoras posibles:**
- Detectar artículos específicos de leyes mencionadas
- Mejorar detección de tipo de modificación (actualmente básico por keywords)
- Agregar contexto sobre qué se está modificando exactamente

### 3. Valores Numéricos

✅ **Detectados:**
- Porcentajes
- Montos (UF, UTM, pesos)
- Plazos (días, meses, años)

⚠️ **Limitaciones:**
- Algunos valores sin unidad explícita no se detectan
- Contexto capturado es limitado (50 caracteres)
- No se diferencia entre valores normativos vs. ejemplos

### 4. Artículos con Problemas de Parsing

Artículos con ID duplicado detectados:
- `art-transitory-24` aparece 3 veces

**Causa**: El texto contiene:
- Artículo 24 bis
- Artículo 24 ter
- Artículo 24 quáter

**Solución requerida**: Mejorar regex para detectar sufijos latinos (bis, ter, quáter, etc.)

## Propuesta de Pipeline para Análisis LLM

### Fase 1: Preparación (✅ Completado)
```
documento.docx
    ↓
[parse-docx.ts]
    ↓
documento_base.json
    ↓
[enrich-metadata.ts]
    ↓
articulos_enriquecidos.json
```

### Fase 2: Generación de Interpretaciones LLM (Siguiente paso)

```
articulos_enriquecidos.json
    ↓
[generate-analysis.ts]   ← Script a crear
    ↓
articulos_con_analisis.json
```

**Estrategia recomendada:**

1. **Unidad de análisis**: Artículo individual
   - Procesar un artículo a la vez
   - Evitar análisis globales largos y difusos

2. **Prompt estructurado por artículo**:
   ```
   Entrada al LLM:
   - Texto del artículo
   - Metadata ya extraída (leyes, instituciones, valores)
   - Contexto: tipo de proyecto (reconstrucción)

   Solicitar al LLM:
   - Explicación en lenguaje simple
   - Qué cambia concretamente
   - A quién afecta
   - Objetivo aparente de la norma
   - Preguntas abiertas o tensiones detectables
   ```

3. **Separación clara**:
   - Campo `llm_analysis` separado de metadata factual
   - Timestamp de generación
   - Versión del modelo usado
   - Advertencia de que es interpretación generada

4. **Regenerabilidad**:
   - Poder regenerar análisis LLM sin reprocesar documento
   - Mantener versiones de análisis si se mejoran prompts

### Fase 3: Generación del Sitio Web (Futuro)

```
articulos_con_analisis.json
    ↓
[build-site.ts]
    ↓
site/
  ├── index.html
  ├── articulos/
  │   ├── art-1.html
  │   ├── art-2.html
  │   └── ...
  ├── ejes/
  │   ├── reconstruccion-fisica.html
  │   ├── reconstruccion-economica.html
  │   └── ...
  └── leyes/
      ├── ley-21681.html
      └── ...
```

**Vistas recomendadas:**

1. **Vista por artículo**:
   - Texto oficial
   - Metadata (leyes, instituciones, valores)
   - Análisis LLM (claramente marcado)
   - Links a artículos relacionados

2. **Vista por eje temático**:
   - Reconstrucción física
   - Reconstrucción económica
   - Reconstrucción institucional
   - Reconstrucción fiscal

3. **Vista por ley modificada**:
   - Agrupar artículos que modifican la misma ley

4. **Vista por institución**:
   - Qué artículos afectan a cada institución

## Archivos Generados

### documento_base.json
- **Tamaño**: ~413 KB
- **Contenido**: Estructura cruda del documento
- **Uso**: Base para regeneración

### articulos_enriquecidos.json
- **Tamaño**: Por verificar
- **Contenido**: Metadata extraída
- **Uso**: Base para análisis LLM

## Próximos Pasos Recomendados

### Inmediatos (Alta Prioridad)

1. **Mejorar detección de artículos con sufijos** ✅ **CRÍTICO**
   - Detectar "bis", "ter", "quáter", etc.
   - Evitar IDs duplicados

2. **Normalizar instituciones**
   - Crear diccionario de instituciones conocidas
   - Reducir 153 instituciones a ~20-30 reales

3. **Validar metadata extraída**
   - Inspeccionar manualmente algunos artículos
   - Verificar calidad de detección

### Corto Plazo

4. **Diseñar prompts para análisis LLM**
   - Crear plantilla de prompt por artículo
   - Testear con 3-5 artículos representativos
   - Iterar hasta obtener calidad deseada

5. **Implementar generador de análisis**
   - Script `generate-analysis.ts`
   - Rate limiting para API
   - Manejo de errores

### Mediano Plazo

6. **Prototipar frontend**
   - Generador estático simple (Next.js/Astro)
   - Vista de artículo individual
   - Navegación básica

7. **Crear recorridos curatoriales**
   - Cambios tributarios
   - Cambios ambientales
   - Medidas pro-inversión
   - Reconstrucción post-incendios

## Supuestos y Decisiones de Diseño

1. **Artículos sin sección declarada = permanentes**
   - Si un artículo aparece antes de "Artículos permanentes" o "Artículos transitorios"
   - Se genera warning en parsing_stats

2. **Metadata es determinista**
   - No usar LLM para extraer metadata básica
   - Solo regex y análisis de texto

3. **Separación estricta de capas**
   - documento_base.json = solo estructura
   - articulos_enriquecidos.json = metadata factual
   - Futura capa de análisis LLM = interpretación

4. **Prioridad: Trazabilidad > Sofisticación**
   - Mejor solución simple y verificable
   - Que compleja y opaca

## Comandos Disponibles

```bash
# Parsear documento DOCX
npm run parse

# Enriquecer con metadata
npm run enrich

# Ejecutar ambos en secuencia
npm run parse && npm run enrich
```

## Conclusiones

✅ **Logros de esta iteración:**
- Sistema de parsing robusto y verificable
- Dos capas de datos claramente separadas
- 35 artículos extraídos y estructurados
- Metadata enriquecida con 39 leyes y 153 instituciones
- Base sólida para análisis LLM

⚠️ **Limitaciones conocidas:**
- Detección de artículos con sufijos (bis, ter) necesita mejora
- Clasificación de secciones puede mejorar
- Instituciones necesitan normalización
- Falta análisis LLM (siguiente fase)

🎯 **Siguiente hito:**
Implementar generación de análisis LLM por artículo con prompts estructurados.
