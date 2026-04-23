# CLAUDE.md
## Propósito del proyecto
Construir un sitio web de lectura asistida y análisis público del documento:
`fuente/018-374  Mensaje PDL Reconstrucción (22.04.2026) DJL.docx`
El objetivo no es solo mostrar el texto legal, sino ofrecer una lectura estructurada, navegable y útil para discusión pública, separando con claridad:
1. texto oficial
2. interpretación asistida por LLM
3. observaciones editoriales o analíticas
4. metadata estructural y temática
El foco principal es evitar una experiencia de “resumen genérico con IA”.  
La iniciativa debe privilegiar trazabilidad, claridad, separación de capas y utilidad pública.
---
## Principios editoriales
- Nunca reemplazar el texto oficial con una paráfrasis.
- Toda interpretación debe estar explícitamente marcada como interpretación LLM.
- No presentar inferencias políticas o jurídicas discutibles como hechos.
- Separar descripción, interpretación y evaluación.
- Favorecer trazabilidad entre:
  - fundamentos del mensaje
  - ejes temáticos
  - artículos permanentes
  - artículos transitorios
- Ayudar a navegar el proyecto, no solo a resumirlo.
---
## Principios de arquitectura
### Regla central
**No usar el LLM directamente sobre el `.docx` completo como primer paso.**
Primero debe construirse una representación estructurada del documento en JSON.  
Luego, recién sobre esa estructura, generar análisis por unidad.
### Pipeline recomendado
1. Ingesta del `.docx`
2. Extracción de texto limpio
3. Segmentación jerárquica del documento
4. Construcción de JSON estructurado
5. Enriquecimiento de metadata
6. Generación de interpretaciones LLM por unidad
7. Render del sitio web
---
## Modelo conceptual del documento
El documento contiene, al menos, estas capas:
- encabezado y metadata
- antecedentes
- fundamentos
- ejes temáticos
  - reconstrucción física
  - reconstrucción económica
  - reconstrucción institucional
  - reconstrucción fiscal
- contenido del proyecto
  - artículos permanentes
  - artículos transitorios
Además, cada artículo puede:
- modificar una ley existente
- crear una norma nueva
- tener impactos temáticos múltiples
- estar vinculado con uno o más fundamentos previos
---
## Unidad recomendada de análisis LLM
La unidad principal de análisis debe ser el **artículo individual**.
También pueden existir análisis complementarios por:
- eje temático
- bloque de artículos relacionados
- comparación entre fundamento y articulado
- fichas de controversia o tensión
No generar primero un análisis global largo y difuso.
---
## Estructura de datos sugerida
Se recomienda construir un archivo JSON con una estructura como esta:
```json
{
  "document": {
    "title": "",
    "subtitle": "",
    "date": "",
    "source_path": ""
  },
  "sections": [],
  "articles": [],
  "transitory_articles": []
}

Cada artículo debería contener algo cercano a:

{
  "article_id": "13",
  "article_type": "permanent",
  "title": "Artículo 13",
  "raw_text": "",
  "summary_source": "",
  "theme_tags": [],
  "axis_tags": [],
  "modifies_laws": [],
  "institutions": [],
  "cross_references": [],
  "llm_analysis": {
    "plain_explanation": "",
    "what_changes": "",
    "who_is_affected": "",
    "policy_goal": "",
    "open_questions": [],
    "possible_tensions": []
  }
}

⸻

Requisitos de calidad del parser

El parser debe intentar detectar y preservar:

* numeración romana
* numeración decimal de subtítulos
* etiquetas como “Artículos permanentes”
* etiquetas como “Artículos transitorios”
* número de artículo
* leyes mencionadas
* instituciones mencionadas
* fechas y plazos
* tasas, porcentajes, montos y umbrales

Es mejor una segmentación incompleta pero verificable que una “inteligente” pero opaca.

⸻

Requisitos para el uso de LLM

El LLM sí puede:

* explicar en lenguaje claro
* identificar qué cambia
* identificar actores afectados
* detectar tensiones o dudas
* proponer preguntas para debate legislativo
* resumir vínculos entre fundamento y artículo

El LLM no debe:

* inventar contexto externo no provisto
* afirmar constitucionalidad o ilegalidad como hecho
* sostener efectos económicos como certeza
* borrar ambigüedades del texto
* mezclar explicación con opinión sin marcarlo

⸻

Formato ideal de salida por artículo

Cada ficha debería tener algo así:

* número de artículo
* tipo de artículo
* texto oficial
* explicación simple
* qué cambia
* a quién afecta
* objetivo aparente
* leyes o normas involucradas
* preguntas abiertas
* tensiones posibles
* artículos relacionados
* advertencia de que la interpretación fue generada con IA

⸻

UX / contenido del sitio

El sitio podría tener:

1. Portada

* explicación del proyecto
* cómo leer el sitio
* advertencia metodológica
* mapa de ejes

2. Mapa del proyecto

* reconstrucción física
* reconstrucción económica
* reconstrucción institucional
* reconstrucción fiscal

3. Navegación por artículos

* permanentes
* transitorios
* por tema
* por institución
* por ley modificada

4. Fichas de artículo

* texto
* análisis
* trazabilidad

5. Recorridos curatoriales

* cambios tributarios
* cambios ambientales
* reconstrucción post incendios
* medidas pro inversión
* ajuste fiscal
* educación superior
* empleo formal

⸻

Sugerencias de implementación

Tecnologías posibles:

* Node.js / TypeScript
* parser de docx
* JSON intermedio versionado en repo
* generación estática del sitio
* framework sugerido: Next.js / Astro / similar

Carpetas sugeridas

/fuente
/datos
  /intermedio
  /enriquecido
/prompts
/scripts
/site

⸻

Etapas de trabajo sugeridas

Etapa 1

Construir parser y JSON base verificable.

Etapa 2

Enriquecer metadata básica:

* tema
* eje
* leyes citadas
* instituciones
* plazos
* montos

Etapa 3

Diseñar prompts de análisis por artículo.

Etapa 4

Generar primeras fichas.

Etapa 5

Construir frontend.

Etapa 6

Agregar recorridos editoriales y comparaciones.

⸻

Criterio de éxito

Este proyecto será exitoso si:

* hace el documento navegable
* mejora la comprensión pública
* conserva trazabilidad
* evita simplificaciones engañosas
* permite lectura crítica
* hace visible dónde termina el texto oficial y dónde empieza la interpretación