# Ley Miscelánea de Reconstrucción — Lectura asistida

**Sitio web:** [ley-miscelanea.vercel.app](https://ley-miscelanea.vercel.app)

Herramienta de lectura estructurada y análisis público del proyecto de ley de reconstrucción presentado por el Ejecutivo chileno el 22 de abril de 2026 (Mensaje 018-374), en respuesta a los incendios de enero de 2026 en las regiones de Ñuble y Biobío.

---

## Por qué existe este proyecto

Los proyectos de ley en Chile son documentos extensos, técnicos y difíciles de leer para quienes no son especialistas. Este proyecto apunta a hacer navegable un texto de 50 artículos que abarca materias tributarias, ambientales, laborales, educacionales e institucionales — sin reemplazar el texto oficial ni ocultar la complejidad.

El objetivo no es resumir: es **ayudar a leer**.

---

## Qué hace el sitio

- Navega los 33 artículos permanentes y 17 artículos transitorios del proyecto
- Muestra el **texto oficial** de cada artículo
- Ofrece una **explicación en lenguaje claro** generada con IA (Claude, Anthropic)
- Identifica qué cambia, quién se ve afectado y qué preguntas deja abierto el texto
- Señala dónde la descripción oficial del Ejecutivo no coincide con el texto legal
- Permite filtrar por eje temático: reconstrucción física, económica, institucional o fiscal

Todo el análisis está marcado explícitamente como generado con IA. El sitio no mezcla el texto oficial con la interpretación.

---

## Metodología

El análisis sigue un pipeline reproducible en cuatro etapas:

```
Documento .docx  →  JSON estructurado  →  Enriquecimiento de metadata  →  Análisis LLM por artículo  →  Sitio web
```

1. **Parsing**: extracción y segmentación del `.docx` en unidades por artículo
2. **Estructuración**: construcción de un JSON con texto, tipo, leyes citadas, instituciones y referencias cruzadas
3. **Enriquecimiento**: clasificación temática y por ejes sin LLM
4. **Análisis**: prompt versionado aplicado artículo a artículo con Claude Opus (no sobre el documento completo)

Los prompts utilizados están versionados en [`prompts/`](prompts/). El modelo usado fue `claude-opus-4-7`.

### Principios editoriales

- El texto oficial nunca se reemplaza con paráfrasis
- Toda interpretación está explícitamente marcada como análisis IA
- No se presentan inferencias jurídicas o económicas como hechos
- Se separa descripción, interpretación y evaluación

---

## Estructura del repositorio

```
fuente/          → documento oficial (.docx)
datos/
  intermedio/    → JSON base parseado del documento
  enriquecido/   → JSON con análisis LLM incorporado
prompts/         → prompts versionados de análisis
scripts/         → pipeline completo (parse → enrich → analyze → mini-desc)
site/            → código del sitio web (Next.js)
docs/            → documentación técnica
```

---

## Correr localmente

```bash
# Clonar el repositorio
git clone https://github.com/elaval/Ley-Miscelanea.git
cd Ley-Miscelanea

# Instalar y correr el sitio
cd site
npm install
npm run dev
# → http://localhost:3000
```

Los datos de análisis ya están incluidos en el repositorio (`datos/enriquecido/articulos_enriquecidos.json`). No es necesario correr el pipeline de análisis para ver el sitio.

### Re-generar el análisis (opcional)

Requiere una API key de Anthropic:

```bash
# En la raíz del proyecto
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
npm install

# Analizar todos los artículos
npx tsx scripts/generate-analysis.ts

# Generar mini-descripciones para el listado
npx tsx scripts/generate-mini-descriptions.ts
```

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Parsing del .docx | Node.js + mammoth |
| Análisis LLM | Anthropic SDK / Claude Opus |
| Sitio web | Next.js 16 (App Router) + Tailwind CSS |
| Deploy | Vercel |
| Lenguaje | TypeScript |

---

## Advertencia metodológica

El análisis generado por IA puede contener errores, omisiones o simplificaciones. No constituye asesoría legal ni interpretación jurídica vinculante. Los efectos económicos descritos son posibles, no certezas. Cada ficha indica explícitamente que fue generada con IA e invita a revisar el texto oficial.

---

## Sobre el proyecto

Iniciativa ciudadana independiente. No tiene afiliación con el Ejecutivo, el Congreso ni ningún partido político.

El código y la metodología son abiertos para que otros puedan replicar el ejercicio con otros proyectos de ley.
