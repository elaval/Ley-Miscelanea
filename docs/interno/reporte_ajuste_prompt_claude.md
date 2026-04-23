# REPORTE PARA AJUSTAR PROMPT — Revisión cruzada de análisis LLM de artículos legales

## Objetivo de este reporte

Este documento resume observaciones útiles para ajustar el prompt de análisis de artículos legales chilenos, a partir de una revisión cruzada entre:

- texto oficial del artículo
- descripción oficial del mensaje presidencial
- análisis generado por otro LLM

La idea es reducir errores típicos de interpretación y mejorar el control de fidelidad, especialmente en proyectos de ley largos con mezcla de contenido normativo, justificación política y simplificaciones comunicacionales.

---

## Diagnóstico general

El análisis revisado fue, en términos generales, sólido y útil. Sin embargo, aparecieron varios patrones que conviene corregir en el prompt para futuras iteraciones:

1. **Tendencia a ampliar demasiado formulaciones legales**
   - Ejemplo: transformar una habilitación de cruce de datos en una “obligación” más fuerte de la institución involucrada.
   - Riesgo: exagerar el alcance normativo.

2. **Tendencia a presentar inferencias como hechos**
   - Ejemplo: afirmar que una situación “antes no estaba regulada” sin tener el derecho previo completo a la vista.
   - Riesgo: conclusiones no demostradas por el material entregado.

3. **Mezcla entre chequeo de fidelidad textual y especulación jurídica/política**
   - Ejemplo: convertir preguntas abiertas sobre constitucionalidad, garantías procesales o motivación política en parte central del análisis.
   - Riesgo: alejarse del encargo de verificación.

4. **Buena detección de brechas reales entre mensaje político y texto legal**
   - Esto sí funcionó bien.
   - El modelo identificó correctamente cuando el mensaje:
     - simplifica demasiado,
     - omite condiciones relevantes,
     - no explicita sujetos excluidos,
     - o resume reglas complejas de forma demasiado general.

5. **Omisión de detalles operativos importantes**
   - En algunos casos, el análisis captó la idea general del artículo, pero dejó fuera aspectos relevantes para su aplicación práctica:
     - remanentes,
     - reglas de imputación,
     - condiciones de plazo,
     - prueba documental,
     - fiscalización posterior,
     - reglas de cómputo o exclusión.

---

## Lecciones principales para el prompt

### 1. Priorizar fidelidad literal antes que síntesis elegante

El prompt debe empujar al modelo a responder primero:

- qué dice efectivamente el texto,
- qué no dice,
- y qué solo puede inferirse con cautela.

**Instrucción sugerida para el prompt:**

> Evalúa primero el tenor literal del artículo.  
> No transformes inferencias razonables en afirmaciones categóricas.  
> Si una conclusión requiere conocer derecho previo, jurisprudencia o contexto adicional no entregado, indícalo expresamente.

---

### 2. Diferenciar con más fuerza entre:
- lo que está en el artículo,
- lo que agrega o simplifica el mensaje presidencial,
- y lo que infiere el analista.

**Instrucción sugerida:**

> Separa claramente:
> 1. fidelidad al texto oficial,
> 2. diferencias reales entre mensaje y texto,
> 3. omisiones importantes,
> 4. afirmaciones incorrectas o especulativas del análisis.
>
> No mezcles estos planos.

---

### 3. Evitar afirmaciones sobre el derecho previo salvo que estén demostradas

Uno de los errores típicos es escribir frases como:

- “antes esto no estaba regulado”
- “esto modifica permanentemente X”
- “esto crea por primera vez Y”

Ese tipo de frases solo deberían aparecer si:
- el material entregado lo demuestra,
- o el análisis se apoya en fuentes adicionales explícitas.

**Instrucción sugerida:**

> No afirmes que una situación previa no estaba regulada, o que una regla modifica de forma permanente el derecho vigente, salvo que ello se desprenda claramente del material entregado.  
> En caso contrario, formula la observación como hipótesis o abstente.

---

### 4. Penalizar la sobrelectura institucional

Otro problema es cuando el modelo toma una facultad legal y la reescribe como obligación fuerte o efecto cerrado.

Ejemplos de cosas a evitar:
- convertir “podrá requerir información” en “queda obligado a cruzar información”
- convertir una remisión legal en una descripción detallada de penas no citadas directamente
- convertir una regla acotada en una consecuencia general

**Instrucción sugerida:**

> No reformules facultades como obligaciones, ni remisiones normativas como consecuencias totalmente desarrolladas, salvo que el texto lo diga expresamente.

---

### 5. Pedir detección de omisiones operativas, no solo conceptuales

El análisis mejora mucho cuando no solo mira la “idea” del artículo, sino también:
- plazos,
- sujetos,
- condiciones,
- exclusiones,
- secuencia de aplicación,
- efectos por incumplimiento.

**Instrucción sugerida:**

> Al identificar omisiones relevantes, presta especial atención a:
> - plazos,
> - condiciones de acceso,
> - exclusiones,
> - secuencia de imputación o aplicación,
> - mecanismos de fiscalización,
> - pérdida del beneficio,
> - reglas documentales o procedimentales.

---

## Observaciones específicas por patrón detectado

### A. Cuando el análisis está bien encaminado

Hubo varias fortalezas que conviene conservar en el prompt:

- buena detección de simplificaciones del mensaje presidencial;
- buena identificación de sujetos afectados;
- buena capacidad para detectar matices relevantes entre texto legal y resumen político;
- capacidad para levantar preguntas útiles cuando el texto deja ambigüedades reales.

**Conclusión:**  
No hay que volver el prompt excesivamente estrecho.  
La idea no es eliminar la capacidad analítica, sino **encauzarla**.

---

### B. Cuando el análisis se pasa de rosca

Patrones a restringir:

1. **Sobreafirmación**
   - usar verbos demasiado fuertes;
   - presentar conclusiones más allá del texto.

2. **Expansión penal o jurídica no pedida**
   - desarrollar consecuencias penales o constitucionales que el texto no explicita por sí mismo.

3. **Interpretación político-legislativa excesiva**
   - introducir preguntas sobre por qué una medida es permanente o transitoria,
   - o sobre compatibilidad con garantías constitucionales,
   cuando el encargo principal es verificar fidelidad del análisis.

**Corrección deseada:**  
El prompt debe permitir detectar problemas reales, pero con disciplina textual.

---

## Recomendaciones concretas para reescribir el prompt

## Versión sugerida de instrucciones de control

Puedes agregar un bloque como este al prompt base:

> Trabaja con criterio de auditoría textual estricta.  
> Tu tarea principal no es opinar sobre el mérito de la norma, sino verificar si el análisis:
> - representa fielmente el texto oficial,
> - identifica correctamente diferencias con el mensaje presidencial,
> - omite elementos relevantes,
> - o introduce afirmaciones no sustentadas.
>
> Reglas:
> 1. No atribuyas al artículo efectos que no se desprendan claramente de su texto.
> 2. No afirmes cambios respecto del derecho previo salvo que estén demostrados por el material entregado.
> 3. No conviertas facultades legales en obligaciones.
> 4. No expandas remisiones normativas penales o tributarias más allá de lo que puede afirmarse con seguridad.
> 5. Marca explícitamente como “inferencia” cualquier conclusión que no sea textual.
> 6. Si una observación depende de revisar otros artículos o normas no entregadas, indícalo.
> 7. Distingue siempre entre:
>    - error,
>    - especulación,
>    - omisión,
>    - y simplificación válida.

---

## Formato de salida recomendado

También conviene ajustar el formato esperado del modelo.  
Una buena estructura sería:

### Para cada artículo:

**1. Fidelidad general al texto oficial**  
- Alta / media / baja  
- breve justificación

**2. Revisión de los gaps detectados**  
- gap 1: correcto / parcialmente correcto / incorrecto
- gap 2: correcto / parcialmente correcto / incorrecto
- etc.

**3. Omisiones relevantes del análisis**  
- lista breve y específica

**4. Afirmaciones incorrectas o especulativas**  
- cita o paráfrasis de la afirmación
- explicación de por qué excede el texto

**5. Veredicto final**  
- 2 a 4 líneas

Este formato obliga al modelo a no diluirse.

---

## Ajustes de estilo recomendados

Para este tipo de tarea, el prompt debería pedir explícitamente:

- lenguaje preciso
- baja retórica
- sin adornos
- sin hipótesis políticas innecesarias
- sin “lecturas de intención” salvo que el texto lo diga

**Instrucción sugerida:**

> Usa un tono técnico, preciso y sobrio.  
> Evita formular hipótesis sobre intenciones políticas o sobre constitucionalidad, salvo que sean indispensables para explicar un error evidente del análisis.

---

## Qué conservar del enfoque anterior

El prompt anterior tenía cosas valiosas que no conviene perder:

- capacidad para detectar diferencias reales entre texto y mensaje;
- disposición a señalar omisiones;
- atención a detalles normativos;
- capacidad de formular preguntas útiles.

La mejora no consiste en hacerlo más “ciego”, sino en hacerlo más disciplinado.

---

## Prompt breve sugerido para futuras revisiones

> Te adjunto el texto oficial, la descripción del gobierno y el análisis generado por otro LLM para uno o más artículos de un proyecto de ley chileno.
>
> Para cada artículo, evalúa estrictamente:
> 1. si el análisis es fiel al texto oficial;
> 2. si las brechas detectadas respecto del mensaje presidencial son reales, parciales o erróneas;
> 3. qué elementos importantes omite el análisis;
> 4. qué afirmaciones son incorrectas, exageradas o especulativas.
>
> Reglas de trabajo:
> - Prioriza el tenor literal del texto.
> - No atribuyas efectos no expresos.
> - No afirmes cambios respecto del derecho previo salvo que estén demostrados por el material entregado.
> - No conviertas facultades en obligaciones.
> - Si una observación depende de otras normas o artículos no entregados, dilo expresamente.
> - Distingue entre error, inferencia plausible y especulación.
> - Sé específico y cita el punto exacto cuando corresponda.

---

## Conclusión

La principal mejora que necesita el prompt no es “más inteligencia”, sino **más disciplina de auditoría textual**.

El modelo revisado mostró buena capacidad para detectar:
- simplificaciones del mensaje,
- omisiones relevantes,
- y diferencias normativas.

Pero para que sea realmente confiable como herramienta de revisión legal comparada, el prompt debe reducir:

- sobreafirmaciones,
- inferencias no marcadas,
- expansiones jurídicas no demostradas,
- y mezcla entre verificación textual y especulación normativa.

La consigna correcta es:  
**menos interpretación libre, más control de fidelidad y de alcance.**
