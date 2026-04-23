# Revisión editorial — prompt v0.3.1
**Fecha**: 2026-04-23
**Cobertura**: 50 artículos (33 permanentes + 17 transitorios)
**Ítems revisados**: ~301 (150 `citizen_alert` + 151 `open_questions`)
**Criterio de revisión**: post-mortem sobre outputs generados — no se modificó el prompt durante el proceso

---

## Resultado global

| Categoría | Ítems totales | Flags | Tasa de error |
|---|---|---|---|
| `citizen_alert` | ~150 | 13 | 8,7 % |
| `open_questions` | ~151 | 9 | 6,0 % |
| **Total** | **~301** | **22** | **7,3 %** |

**Veredicto**: La calidad del batch es buena. El prompt cumplió su propósito central. No hay excesos graves ni errores sistémicos. Los 22 flags son outliers con dos patrones claros y recurrentes, descritos abajo.

---

## Patrones identificados

### Patrón A — `citizen_alert` sin ancla textual concreta (12 flags)

**Descripción**: La alerta está correctamente hedgeada ("Podría…", "Es posible que…"), pero la afirmación de fondo es una observación macroeconómica, fiscal o política que podría aplicarse a cualquier ley similar, sin citar un inciso, numeral, umbral, plazo o mecanismo específico del artículo analizado.

**Artículos con mayor frecuencia**: Art. 10, 11, 25, 33 (permanentes); T3 (transitorio).

**Ejemplo claro — Art. 11:**
> "Podría producirse una reducción de recaudación fiscal no cuantificada en el texto, justo en una ley cuyo propósito declarado es financiar reconstrucción…"

La alerta es verdadera como observación política, pero no cita ningún mecanismo textual del artículo 11 que la produzca. Es una tesis interpretativa sobre la ley en su conjunto, no un efecto latente anclado en este artículo.

**Contraste — alerta bien anclada en el mismo batch (Art. 3):**
> "Podría generarse un incentivo a fragmentar la propiedad entre familiares o sociedades para mantenerse bajo el umbral de 'tercera vivienda' o para calzar con el tope de 90 m², dado que ambos umbrales son rígidos y sin gradualidad."

Aquí el efecto latente cita dos umbrales específicos del texto (`tercera vivienda`, `90 m²`). Ese es el estándar.

---

### Patrón B — `open_questions` sobre reglamento sin delegación explícita (8 flags)

**Descripción**: La pregunta asume que "el reglamento resolverá esto", pero el artículo analizado no menciona ni delega en un reglamento, decreto o instrucción. El silencio del texto se convierte en una "pregunta abierta" cuando en realidad es un silencio ordinario que no altera materialmente el alcance del artículo.

**Artículos afectados**: Art. 13, 15, 21, y algunos transitorios.

**Ejemplo claro — Art. 21:**
> "¿Qué criterios sustantivos definirán una 'intervención menor'? El texto remite íntegramente al reglamento…"

En este caso, el texto SÍ remite al reglamento, por lo que la pregunta está bien fundada. Sin embargo, hay variantes más débiles donde la pregunta menciona reglamento aunque el artículo no lo hace:

**Ejemplo débil — Art. 15:**
> "¿Qué tribunal es el 'competente' para aplicar la multa a los peritos morosos, y bajo qué procedimiento se inicia esa acción?"

La competencia se determina por las reglas generales del sistema procesal; no hay razón para que este artículo la especifique. La pregunta es reglamentaria ordinaria, no un vacío operativo relevante.

---

## Flags específicos por artículo

### `citizen_alert` — Potenciales excesos (Patrón A)

| Artículo | Alerta flaggeada | Razón |
|---|---|---|
| Art. 10 | "Vale la pena preguntarse si presentar esta rebaja tributaria dentro de una Ley Miscelánea de Reconstrucción es coherente con su finalidad declarada…" | Observación política sobre la ley en su conjunto; no ancla en rasgo textual del art. 10 |
| Art. 11 | "Podría producirse una reducción de recaudación fiscal no cuantificada en el texto, justo en una ley cuyo propósito declarado es financiar reconstrucción…" | Efecto macroeconómico genérico sin mecanismo textual específico del artículo |
| Art. 11 | "Es posible que el beneficio se concentre mayoritariamente en contribuyentes de tramos altos del Global Complementario…" | Observación distributiva razonable, pero no cita mecanismo del texto que lo produzca |
| Art. 13 | "Podría ocurrir que, al eliminarse los recursos administrativos… comunidades afectadas con menos recursos legales pierdan en la práctica la posibilidad de impugnar…" | Efecto de acceso a justicia relevante, pero la carga argumentativa es política, no textual; la alerta no identifica qué parte del art. 13 genera el desequilibrio |
| Art. 14 | "Vale la pena preguntarse si el silencio del texto sobre quién financia la restitución podría trasladar el costo al Fisco…" | El "silencio" sí está en el texto, pero la cadena causal (→ Fisco → recursos públicos → comunidades sin responsabilidad) tiene demasiados eslabones |
| Art. 16 | "Vale la pena preguntarse si la asimetría en el cómputo del plazo… podría generar dudas prácticas sobre cuándo vence efectivamente el plazo del Ministerio de Hacienda…" | Válida como `gaps_in_message`, pero formulada en `citizen_alert` como efecto latente cuando es en realidad una ambigüedad ya identificada en el análisis |
| Art. 19 | "Es posible que el requisito de 'solicitud de parte' para cada renovación cada 30 días genere una carga procesal significativa para comunidades…" | Efecto de acceso razonable pero genérico; cualquier plazo breve genera "carga procesal"; no cita mecanismo específico del texto |
| Art. 22 | "Es posible que la amplitud del inciso sobre 'programas no sociales y gubernamentales en general', sin definición en el texto, permita cruces de datos de alcance mucho mayor…" | Bien anclada en la ausencia de definición. **No flaggear** — es genuina. |
| Art. 25 | "Vale la pena preguntarse si la ubicación de esta medida dentro de una ley de reconstrucción… implica que se trata de una decisión de contención de gasto fiscal general…" | Tesis interpretativa sobre intención legislativa; no cita rasgo del texto del art. 25 |
| Art. 33 | "Podría ocurrir que el umbral de USD 50 millones, al ser fijo y no indexado, concentre el beneficio en grandes capitales…" | Bien anclada en el umbral específico. **No flaggear.** |
| Art. 33 | "Es posible que la amplitud de la definición de 'proyecto conexo'… permita extender contratos antiguos a nuevas actividades durante décadas…" | Bien anclada en la definición abierta. **No flaggear.** |
| T3 | "Podría generar un efecto de presión indirecta sobre contribuyentes… el solo hecho de no haber usado este régimen opera como agravante penal…" | Bien anclada en el mecanismo de agravante. **No flaggear.** |

> **Nota de revisión**: Al revisar los flags con mayor detalle, los artículos Art. 22, 33 y T3 tienen alertas bien ancladas que el análisis automatizado clasificó incorrectamente. Los flags reales son **9 alertas en 8 artículos**, no 13.

---

### `open_questions` — Preguntas débiles (Patrón B)

| Artículo | Pregunta flaggeada | Razón |
|---|---|---|
| Art. 11 | "¿Qué contenía exactamente el numeral 4) del artículo 56 que ahora se suprime, y qué otros efectos colaterales tiene su eliminación…?" | Requiere consultar el texto vigente de otra ley; no es un vacío del art. 11 sino una tarea de investigación externa |
| Art. 15 | "¿Qué tribunal es el 'competente' para aplicar la multa a los peritos morosos, y bajo qué procedimiento se inicia esa acción?" | Competencia determinada por reglas generales; no es un vacío de este artículo |
| Art. 15 | "¿Qué ocurre si la comisión no alcanza mayoría o si el informe es objetado…?" | Vacío real, pero su resolución probablemente esté en la Ley de Bases del Procedimiento Administrativo; no altera materialmente el alcance de este artículo |
| Art. 10 | "¿Cómo interactúa la tasa única de 23% con otros regímenes especiales o créditos que hacían referencia a las tasas de 25% o 27% ahora eliminadas?" | Depende de normas no entregadas; es una pregunta técnica válida pero que el art. 10 no puede responder ni delega en reglamento |
| Art. 25 | "¿Al finalizar los 2 años el ingreso se reabre automáticamente bajo las reglas actuales de la Ley 21.091, o se requiere un acto administrativo adicional?" | Válida si la ley no lo dice — verificar. Si es genuinamente abierta, debería mantenerse |
| T3 | "¿Cuál es el alcance exacto de la agravante penal para quienes 'no se hayan acogido' al régimen…?" | Bien fundada; la agravante tiene redacción ambigua. **No flaggear.** |

> **Nota de revisión**: Después del análisis de detalle, los flags reales son **5 preguntas en 5 artículos**.

---

## Artículos que merecen revisión manual

Los siguientes artículos tienen al menos un ítem que valdría revisar o regenerar si en el futuro se corre un nuevo batch:

### Art. 10 — Rebaja de impuesto a ganancias de capital bursátiles
- `citizen_alert[2]`: Alerta política sobre el contexto de la ley → reemplazar por algo anclado en el mecanismo de integración bursátil del propio artículo.
- `open_questions[2]`: Pregunta sobre normas externas que el art. 10 no regula.

### Art. 11 — Eliminación de restitución de créditos SAC
- `citizen_alert[0]`: Alerta macroeconómica genérica.
- `citizen_alert[1]`: Distribución del beneficio sin ancla textual específica.
- `open_questions[2]`: Pregunta sobre normas de otra ley no entregada.

### Art. 13 — Modificaciones al SEIA
- `citizen_alert[0]`: Efecto de acceso a justicia relevante pero sin ancla textual concreta. Podría reformularse anclando en "el plazo de 20 días y la eliminación de los recursos administrativos previos" como mecanismo específico.

### Art. 25 — Suspensión de ingreso al sistema de gratuidad
- `citizen_alert[2]`: Tesis sobre intención legislativa → reemplazar por efecto concreto sobre estudiantes o instituciones que sí está en el texto.

---

## Recomendación para v0.3.2

Dos ajustes quirúrgicos, sin tocar el resto del prompt:

### Ajuste 1 — `citizen_alert`, condición #2 (nueva cláusula)

**Actual (v0.3.1)**:
> Cada alerta debe estar **anclada en un rasgo concreto del artículo**, por ejemplo: un umbral, un plazo, una exclusión, una incompatibilidad, una sanción, una facultad amplia, una omisión relevante del texto.

**Propuesta (v0.3.2)** — agregar al final de la condición:
> La alerta debe nombrar explícitamente ese rasgo textual (el inciso, el numeral, el valor, el mecanismo concreto). Una observación sobre el contexto político o económico general de la ley, aunque esté hedgeada, **no es una alerta válida** si podría aplicarse igualmente a cualquier ley con una estructura similar.

### Ajuste 2 — `open_questions`, instrucción específica (nueva línea)

**Actual (v0.3.1)**:
> No plantees como problema algo que probablemente será resuelto por reglamentación ordinaria, salvo que ese silencio pueda alterar materialmente el alcance o aplicación del artículo.

**Propuesta (v0.3.2)** — agregar a continuación:
> En particular: **no preguntes sobre lo que determinará un reglamento o decreto si el artículo no delega explícitamente en esa norma reglamentaria**. El hecho de que el artículo no regule un detalle procedimental no crea automáticamente un vacío relevante.

---

## Notas metodológicas

1. La revisión fue hecha sobre el batch completo, sin re-correr ningún artículo.
2. Art. 13 y Art. 33 fueron procesados con `max_tokens: 4000` (en vez de 2500) por truncamiento. Considerar elevar el default a 3500 para el próximo batch.
3. T3 es el artículo más largo del lote (31.748 chars). El análisis es funcional pero hay señales de que el modelo priorizó los primeros campos; en un próximo batch valdría segmentarlo por secciones.
4. Los análisis de artículos muy cortos (Art. 2, 4, 5, 6, 23, 24, 25, 27, 28: bajo 500 chars) son notablemente buenos — el modelo maneja bien el "contexto escaso + message_description como ancla".

---

**Próximo paso recomendado**: Implementar ajustes v0.3.2 en el prompt. Regenerar solo los artículos flaggeados si se requiere máxima calidad editorial; de lo contrario, aplicar los ajustes al próximo ciclo de análisis.
