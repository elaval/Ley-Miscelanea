# Aproximación posible
## Idea general
La forma más sólida de abordar este proyecto no es partir desde el frontend ni desde un prompt largo sobre el documento completo, sino desde una **ingeniería de contexto por capas**.
La clave es transformar primero el mensaje presidencial en una estructura de datos intermedia, y luego usar esa estructura como insumo de análisis, navegación y publicación.
En este caso, el valor no está solo en “explicar artículos”, sino en construir una experiencia que permita:
- leer el texto oficial
- comprenderlo en lenguaje claro
- relacionar artículos con fundamentos
- identificar ejes temáticos
- navegar medidas dispersas dentro de un paquete legislativo grande
- distinguir entre descripción, interpretación y discusión
---
## Enfoque recomendado
### Fase 1: extracción y estructuración
Tomar el archivo:
`fuente/018-374  Mensaje PDL Reconstrucción (22.04.2026) DJL.docx`
y convertirlo en un JSON estructurado que preserve, en lo posible:
- metadata general del documento
- encabezados principales
- subtítulos
- ejes
- artículos permanentes
- artículos transitorios
- referencias legales
- referencias institucionales
- cifras relevantes
Esta fase es crítica, porque un LLM trabajando directamente sobre el `.docx` completo tenderá a:
- perder granularidad
- mezclar fundamentos con articulado
- repetir lenguaje político del mensaje
- producir resúmenes poco trazables
---
## Fase 2: enriquecimiento semiestructurado
Una vez construido el JSON base, agregar metadata computable o extraíble con reglas:
- tipo de artículo: permanente / transitorio
- eje temático principal
- tags temáticos
- leyes modificadas
- instituciones mencionadas
- plazos
- montos
- tasas e impuestos
- actores afectados
Parte de esto puede extraerse con expresiones regulares y reglas simples.  
Otra parte puede completarse con LLM, pero siempre sobre unidades pequeñas.
---
## Fase 3: interpretación LLM por unidad
La unidad recomendada es el artículo individual.
Para cada artículo, pedir al modelo algo como:
- explicación simple
- qué cambia
- a quién afecta
- cuál parece ser su objetivo
- qué preguntas abre
- qué tensiones pueden surgir
Importante: no pedir “evaluación jurídica” ni “impacto económico real” salvo que existan fuentes adicionales y una metodología separada.
---
## Fase 4: frontend editorial
Con esa base, construir el sitio.
No pensarlo solo como una colección de artículos, sino como una interfaz de lectura pública.
---
## Arquitectura sugerida
### Opción simple y robusta
- `scripts/parse-docx.ts`
- `scripts/segment-document.ts`
- `scripts/enrich-articles.ts`
- `scripts/generate-llm-analysis.ts`
- `datos/intermedio/documento.json`
- `datos/enriquecido/articulos.json`
- `site/`
### Flujo
1. parser de `.docx`
2. texto limpio
3. segmentación
4. JSON base
5. enriquecimiento
6. análisis LLM
7. sitio estático
---
## Estructura sugerida del JSON base
```json
{
  "document_id": "mensaje-reconstruccion-2026",
  "source_file": "fuente/018-374  Mensaje PDL Reconstrucción (22.04.2026) DJL.docx",
  "title": "Mensaje de S.E. el Presidente de la República...",
  "date": "2026-04-22",
  "sections": [
    {
      "section_id": "I",
      "title": "Antecedentes",
      "raw_text": ""
    },
    {
      "section_id": "II",
      "title": "Fundamentos",
      "raw_text": "",
      "subsections": []
    },
    {
      "section_id": "III",
      "title": "Contenido del proyecto de ley",
      "subsections": [
        {
          "section_id": "III.permanentes",
          "title": "Artículos permanentes",
          "items": []
        },
        {
          "section_id": "III.transitorios",
          "title": "Artículos transitorios",
          "items": []
        }
      ]
    }
  ]
}

⸻

Estructura sugerida de un artículo enriquecido

{
  "article_id": "13",
  "article_label": "Artículo 13",
  "article_type": "permanent",
  "raw_text": "",
  "plain_title": "Modificaciones al SEIA",
  "axis_tags": ["reconstruccion_institucional"],
  "theme_tags": ["medioambiente", "evaluacion_ambiental", "RCA"],
  "modifies_laws": ["Ley N° 19.300"],
  "institutions": ["SEA", "Tribunales Ambientales"],
  "numbers_detected": ["1", "2", "30 días", "un tercio"],
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

Buenas prácticas de ingeniería de contexto

1. Separar fuentes de interpretación

Nunca mezclar en el mismo campo:

* texto fuente
* resumen automático
* interpretación editorial

2. Trabajar con unidades pequeñas

Mejor un prompt por artículo o por bloque acotado que un prompt único sobre todo el proyecto.

3. Incluir contexto mínimo pero suficiente

Para analizar un artículo, entregar:

* el artículo
* su bloque temático inmediato
* una breve referencia del fundamento relacionado, si existe
* artículos cercanos relacionados, si aplica

4. Versionar el JSON intermedio

El JSON estructurado debe quedar en el repo.
No debe depender siempre de reprocesar el .docx.

5. Permitir revisión humana

Toda salida LLM debería ser fácilmente editable o regenerable.

⸻

Qué valor público podría agregar el sitio

Más que “resumir la ley”, podría:

* mostrar la arquitectura del proyecto
* hacer visibles relaciones entre medidas
* separar reconstrucción, desregulación, incentivos y ajuste fiscal
* facilitar lectura por tema
* detectar artículos potencialmente sensibles o controvertidos
* ayudar a periodistas, estudiantes, analistas y ciudadanía a leer un texto largo sin perder fidelidad

⸻

Secciones posibles del sitio

Portada

* qué es este proyecto
* cómo usar el sitio
* metodología

Mapa del proyecto

* por eje
* por tema
* por tipo de artículo

Explorador de artículos

* permanentes
* transitorios
* filtros por tema e institución

Ficha por artículo

* texto oficial
* explicación
* preguntas abiertas
* relaciones

Recorridos temáticos

* tributación
* empleo
* medioambiente
* reconstrucción
* educación superior
* acuicultura
* gasto fiscal

⸻

Riesgos a evitar

Riesgo 1

Convertir esto en una experiencia demasiado opinante.

Riesgo 2

Hacer pasar la interpretación LLM por explicación “neutral”.

Riesgo 3

Usar prompts demasiado generales y perder control.

Riesgo 4

No distinguir bien fundamentos políticos de contenido normativo.

Riesgo 5

No preservar trazabilidad con el texto fuente.

⸻

MVP recomendado

Un MVP razonable podría incluir:

1. parser del .docx
2. JSON con todos los artículos
3. una ficha navegable por artículo
4. explicación simple generada por LLM
5. tags temáticos
6. filtros básicos
7. advertencia metodológica clara

Eso ya permitiría una primera publicación útil.

⸻

Segunda etapa recomendable

Después del MVP, agregar:

* comparación fundamento ↔ articulado
* recorridos curatoriales
* detección de temas sensibles
* visualizaciones simples del mapa del proyecto
* revisión humana de interpretaciones LLM
* exportación a markdown o CMS
