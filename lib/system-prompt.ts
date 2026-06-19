// =====================================================================
// PROMPT BASE — se envía SIEMPRE, en cada llamada. Mantenerlo corto.
// Identidad, tono, instrucciones de cómo responder. NO incluye el
// desarrollo detallado de las lecciones (eso vive en CONTENIDO_LECCIONES).
// =====================================================================
export const PROMPT_BASE = `Eres un compañero de estudio experto en Diseño Sistémico (Systemic Design), especializado en el libro "Design Journeys through Complex Systems" de Peter Jones y Kristel Van Ael, y en el curso "Systemic Design for Tackling Complexity" del Service Design College (instructores: Peter Jones, Kristel Van Ael, Koen Peters e Inge Keizer).

Tu rol es ayudar a Moisés y María Teresa a repasar y comprender profundamente el método Design Journeys y sus herramientas. Respondes SIEMPRE en español, con un tono cálido, didáctico y accesible — como un tutor paciente que conoce el material en profundidad. Usa siempre español neutro latinoamericano: "tú" en vez de "vos", "tienes" en vez de "tenés", "quieres" en vez de "querés", evitando modismos regionales de cualquier país. Cuando algo no esté en el libro pero sí en tu conocimiento general de sistemas complejos o diseño sistémico, puedes responder aclarando que vas más allá del material del curso.

El curso y el mapa de la app están organizados en 8 capítulos x 3 lecciones (24 lecciones en total): [1] Introducción, [2] Encuadre, [3] Escucha, [4] Comprensión, [5] Visión, [6] Posibilidades, [7] Planificación, [8] Transición.

El libro organiza el método en 7 estadios (Framing, Listening, Understanding, Envisioning, Exploring the Possibility Space, Planning, Fostering) que son una clasificación temática transversal a los 8 capítulos — no los confundas entre sí cuando hables con el usuario.

A continuación recibirás el contenido detallado SOLO de la(s) lección(es) más relevante(s) para la pregunta actual del usuario. Si la pregunta es general (pide una visión del curso completo, no de un tema específico), recibirás un resumen breve de todas las lecciones en vez del detalle.

## RECURSOS DE REFERENCIA
Si el sistema te indica recursos disponibles (PDFs, gráficos, videos) para esta consulta, intégralos de forma natural en tu respuesta cuando sean genuinamente relevantes — da el título y el link tal como aparecen, sin inventar descripciones. No los fuerces si no aportan.

## CÓMO RESPONDER
1. Sobre una herramienta específica: explica su propósito, cuándo usarla, sus pasos principales (con referencia a páginas del libro cuando aplique), y cómo conecta con otras herramientas.
2. Sobre un estadio o capítulo: describe su propósito, sus herramientas, principios sistémicos asociados, y cómo recibe inputs del estadio anterior y alimenta al siguiente.
3. Comparando herramientas: muestra similitudes, diferencias y cuándo elegir una sobre otra.
4. Para practicar un ejercicio: guía paso a paso, preguntando por el sistema o contexto real del usuario para personalizar la práctica. Adopta el rol de facilitador — guía, pregunta, no des la respuesta directamente.
5. Sobre conceptos teóricos: explica con claridad, da ejemplos concretos, y conecta con las herramientas que los operacionalizan.
6. Más allá del material: si la pregunta va más allá del curso pero es relevante para Systemic Design, responde usando tu conocimiento general y aclara que va más allá del material del curso.
7. Si no sabes algo: dilo con honestidad y sugiere dónde buscar.

Recuerda: no eres un catedrático. Eres un compañero de estudio que piensa junto a ellos, hace preguntas para activar su reflexión, y conecta los conceptos con situaciones reales.`

// =====================================================================
// CONTENIDO DETALLADO POR LECCIÓN — solo se agrega al prompt el/los
// bloques de la(s) lección(es) detectada(s) como relevante(s) para la
// pregunta actual (usando el mismo PALABRAS_CLAVE que ya existe en route.ts).
// =====================================================================
export const CONTENIDO_LECCIONES: Record<string, string> = {

  cap1_lec0: `**Lección: Para de solucionar problemas** (Capítulo 1 — Introducción)
Mentalidad de diseño sistémico vs. resolución de problemas tradicional. Sistemas complejos no se pueden predecir ni controlar, solo influir (Donella Meadows). Producen su propio patrón de comportamiento. El curso enseña a pensar en sistemas, no en problemas aislados.`,

  cap1_lec1: `**Lección: Wicked Problems** (Capítulo 1 — Introducción)
Problemas perversos sin solución definitiva, interdependientes, donde cada intento de solución genera nuevas consecuencias (Horst Rittel & Melvin Webber, 1973, "Dilemmas in a General Theory of Planning"). Distintos de "tame problems" (problemas domesticados/ordinarios). Diez propiedades clásicas: no hay formulación definitiva, no hay regla de parada, soluciones no son verdadero/falso sino mejor/peor, no hay test inmediato ni último de una solución, cada intento es "one-shot", no hay enumeración exhaustiva de soluciones posibles, cada problema es esencialmente único, cada wicked problem puede verse como síntoma de otro problema, hay múltiples explicaciones posibles, el planificador no tiene derecho a equivocarse.
Lecturas relacionadas: "A General Theory of Planning" (Rittel & Webber, 1973), "Revisiting Rittel and Webber's Dilemmas" (2020), "Strategy as a Wicked Problem" (Camillus, 2008).`,

  cap1_lec2: `**Lección: Diseño sistémico** (Capítulo 1 — Introducción)
Origen y evolución del diseño sistémico como campo interdisciplinario. Modelo de Design Domains (Peter Jones, en colaboración con GK van Patter): 1.0 Diseño de artefactos, 2.0 Diseño de producto/servicio, 3.0 Innovación organizacional/social, 4.0 Diseño sistémico (transformación social, sistemas complejos, multi-stakeholder, políticas públicas). Los 11 principios del diseño sistémico se organizan a lo largo de los 7 estadios: boundary framing, purpose finding, idealisation, requisite variety, appreciating complexity, system ordering, feedback coordination, leverage impact, generative emergence, self-organising, continuous adaptation.
Lectura relacionada: "Systemic Design Principles in Social Innovation" (Van der Bijl-Brouwer, 2020).`,

  cap2_lec0: `**Lección: El Antropoceno** (Capítulo 2 — Encuadre)
La era geológica humana: el impacto humano en los sistemas planetarios alcanza escala geológica. "The Great Acceleration" (Will Steffen et al., 2015): crecimiento exponencial en población, uso de energía, producción industrial desde 1950. Límites planetarios (planetary boundaries, 2009): nueve procesos que regulan la estabilidad del sistema Tierra. Contexto necesario para entender la urgencia del diseño sistémico aplicado a sostenibilidad.
Lecturas relacionadas: "Global Trends 2040", "Journey to Earthland" (Paul Raskin, 2016), "The Anthropocene Review" (Oldfield et al., 2014), "Learning from the Future" (J. Peter Scoblic, 2020) — sobre foresight estratégico en condiciones de incertidumbre radical.`,

  cap2_lec1: `**Lección: VUCA y BANI** (Capítulo 2 — Encuadre)
VUCA (Volatility, Uncertainty, Complexity, Ambiguity) — acrónimo de 1985 (Warren Bennis & Burt Nanus) para describir contextos cambiantes. BANI (Brittle, Anxious, Non-linear, Incomprehensible) — marco más reciente para sistemas que ya no son solo "complejos" sino frágiles e impredecibles de forma cualitativamente distinta. Multi-Level Perspective (MLP) de Frank Geels: tres niveles — Paisaje (landscape, macro tendencias), Régimen (regime, el sistema dominante actual), Nicho (niche, innovaciones emergentes). Los regímenes cambian cuando la presión del paisaje se alinea con innovaciones de nicho maduras.
Lectura relacionada: "Processes and Patterns in Transitions and System Innovations" (Frank Geels, 2004).`,

  cap2_lec2: `**Lección: Entendiendo el Iceberg** (Capítulo 2 — Encuadre)
Causal Layered Analysis (CLA) de Sohail Inayatullah: 4 capas — (1) Litanía: eventos y tendencias visibles/superficiales, (2) Causas sistémicas: estructuras sociales, económicas, políticas subyacentes, (3) Visión del mundo/paradigmas: cosmovisiones que legitiman las causas sistémicas, (4) Mitos/metáforas: narrativas profundas inconscientes que sostienen el sistema. El Iceberg Model (adaptado de Daniel Kim, 1999) visualiza esto como: eventos (visible) → patrones → estructuras sistémicas (oculto). Útil para reformular narrativas de cambio, no solo describir síntomas.
Herramientas y lecturas relacionadas: "2050 Scenarios" (Arup), ejercicio de CLA, "Frame Creation: Design in the Expanded Field" (Kees Dorst, 2015), "Evolutionary Stakeholder Discovery" (Peter Jones, 2018), "Systemic Design Principles" (Peter Jones, 2014), "System Mapping Report: Early Childhood Development" (2022).
Ejercicio asociado: usar el reporte Arup 2050, analizar un problema en las 4 capas y proponer una narrativa de cambio.`,

  cap3_lec0: `**Lección: Hacer investigación** (Capítulo 3 — Escucha)
Metodologías de investigación en diseño sistémico. El "diamante de investigación" de Peter Jones (2014) organiza los métodos según dos ejes: understanding↔prediction (interpretativo vs. positivista) y change↔design (orientación a cambio vs. a diseño). Incluye desde etnografía y diarios/probes hasta scenario planning, delphi method y simulación. La investigación en diseño sistémico es participativa: incluye stakeholders como co-investigadores, no solo como sujetos de estudio.
Lectura relacionada: "Tackling Obesities — Future Choices / Obesity System Atlas" — ejemplo de mapa de investigación en capas (litanía, estructuras, visión del mundo, mitos) aplicado a un sistema de salud pública complejo.`,

  cap3_lec1: `**Lección: Análisis Causal Sistémico** (Capítulo 3 — Escucha)
Stakeholder Discovery: identificación y priorización de stakeholders con sampling deliberado, buscando requisite variety (diversidad real de perspectivas, no solo las más accesibles). Entrevistas contextuales: investigación cualitativa en el entorno natural del participante.
Causal Loop Diagrams (CLD): diagramas con bucles de Refuerzo (R, amplifican cambios) y Balance (B, buscan equilibrio o resistencia al cambio). Stock and Flow Diagrams: modelan acumulaciones (stocks) y tasas de cambio (flujos) — ejemplo clásico de Meadows: el nivel de cerveza en un vaso (stock) regulado por la apertura del grifo (flujo).
System Archetypes (Peter Senge / William Braun, 2002): patrones recurrentes de comportamiento sistémico — Shifting the Burden (solución sintomática debilita la solución fundamental), Limits to Growth (crecimiento topa con un limitante — atacar el limitante, no amplificar el motor), Tragedy of the Commons, Escalation, Success to the Successful, Fixes that Fail, Eroding Goals, Accidental Adversaries, Growth and Underinvestment, The Attractiveness Principle.
Systemigrams (Sauser, 2007): diagramas narrativos que conectan factores sistémicos en una historia causal integrada — más legibles que un CLD para audiencias no técnicas.
Lecturas relacionadas: "Communicating Strategic Intent with Systemigrams" (Sauser, 2007), "Systems Thinking One" (Draper L. Kaufman, 1980), "Systems Archetypes I" (Daniel Kim, 2000), "The System Archetypes" (William Braun, 2002), "Bathtubs 101" (Meadows, 2008), "Get Your Model Out There" (Erin Suzanne Kenzie, 2021), "Thinking in Systems" (Donella Meadows, 2008).
Ejercicio asociado: construir un CLD de un sistema elegido, identificar bucles R y B, encontrar puntos de palanca, basándose en el ejemplo de Meadows del vaso de cerveza.`,

  cap3_lec2: `**Lección: Visualizar Sistemas** (Capítulo 3 — Escucha)
Synthesis Maps: integran múltiples hallazgos de investigación en una narrativa visual coherente. Técnicas de visualización de sistemas en general — diagramas de conexión, mapas causales, mapas de actores. La visualización no es solo comunicación, es también una herramienta de sensemaking (dar sentido) para el propio equipo de diseño.
Lectura relacionada: "Report: Adapting to Drought in the Waikato" (2021) — ejemplo real de mapa de sistema aplicado a gestión de recursos hídricos.`,

  cap4_lec0: `**Lección: Dinámica de sistemas** (Capítulo 4 — Comprensión)
System dynamics: el comportamiento de un sistema emerge de su estructura, no de eventos aislados. Stocks (acumulaciones, ej. nivel de agua) y flujos (tasas de cambio, ej. entrada/salida de agua) son los bloques fundamentales. Ejemplo clásico de Donella Meadows ("Bathtubs 101"): el nivel de cerveza en un vaso como sistema con stock (cerveza) y flujo (apertura del grifo) regulado por un bucle de balance buscando el "nivel deseado".
Lecturas relacionadas: "Bathtubs 101" (Meadows, 2008), "Get Your Model Out There" (Erin Suzanne Kenzie, 2021), "Thinking in Systems" (Meadows, 2008).`,

  cap4_lec1: `**Lección: Puntos o nodos clave** (Capítulo 4 — Comprensión)
Leverage Points (Donella Meadows, "Leverage Points: Places to Intervene in a System", 1999): puntos donde una pequeña intervención produce grandes cambios. Meadows ordena 12 leverage points de menor a mayor impacto — los más débiles son parámetros y constantes (subsidios, impuestos, estándares); los más potentes son los paradigmas del sistema y la capacidad de trascender paradigmas (el poder de cambiar el paradigma mismo). Influence Maps / Interpretive Structural Modelling (ISM): mapas de influencias que identifican qué variables tienen mayor grado de entrada/salida (in-degree/out-degree) en la red causal — esos nodos son candidatos a leverage points.
Lecturas relacionadas: "Leverage Points: Places to Intervene in a System" (Meadows, 1999), "Sylvie Daumal — Leverage Cards Deck" (2021) y "Leverage Cards Impact" (2023) — cartas prácticas para facilitar talleres de identificación de leverage points.`,

  cap4_lec2: `**Lección: El Modelo DIKW** (Capítulo 4 — Comprensión)
Jerarquía Data → Information → Knowledge → Wisdom (Russell Ackoff). Datos: hechos sin procesar. Información: datos procesados que responden quién/qué/dónde/cuándo. Conocimiento: aplicación de información, responde cómo. Sabiduría: comprensión evaluada, responde por qué — la única categoría orientada al futuro, porque incorpora visión y diseño. La transición entre niveles requiere "entendimiento" (understanding) como puente, no es una categoría separada.
Lectura relacionada: "The Wisdom Hierarchy" (Jennifer Rowley, 2006) — revisión crítica y usos del modelo DIKW en investigación de diseño.`,

  cap5_lec0: `**Lección: Modelar Valor** (Capítulo 5 — Visión)
System Value Proposition: propuesta de valor a nivel de sistema (no solo a nivel de un producto o usuario individual), en cuatro dimensiones: económica, ecológica, psicológica y social. Modelo de Elke den Ouden (2018): el valor de una innovación debe evaluarse en múltiples niveles simultáneos — individuo, organización/ecosistema, sociedad en general — no solo en el nivel donde se implementa la intervención.
Lectura relacionada: "Innovation Design" (Elke den Ouden, 2018).`,

  cap5_lec1: `**Lección: Escaneo de horizontes** (Capítulo 5 — Visión)
Three Horizons Map (Bill Sharpe, con desarrollo de Curry & Hodgson): H1 = sistema vigente actual (curva descendente), H2 = transición turbulenta con innovaciones intermedias (curva central), H3 = visión transformadora de largo plazo (curva ascendente). Punto clave: los tres horizontes **coexisten en el presente**, no son secuenciales — siempre hay elementos de H1, H2 y H3 actuando simultáneamente, y el trabajo de diseño es identificar cuáles fortalecer. Horizon scanning: técnica de foresight para detectar señales débiles/fuertes de cambio en el entorno.
Lectura relacionada: "Seeing in Multiple Horizons: Connecting Futures" (Curry & Hodgson, 2008).`,

  cap5_lec2: `**Lección: Trabajo con paradojas** (Capítulo 5 — Visión)
Paradoxing (Kristel Van Ael): técnica para trabajar creativamente con tensiones y demandas en competencia (ej. centralizado vs. distribuido, individual vs. colectivo) en vez de intentar resolverlas como un compromiso a medio camino. Usa cartas con conceptos binarios opuestos como provocaciones imaginativas para generar ideas que abracen ambos polos ("AND thinking" en vez de "OR thinking") — busca soluciones que satisfagan ambos lados de la tensión, no un punto medio diluido.
Lectura relacionada: "Reflections: Perspective on Paradox and Its Application to Modern Management" (Johnson, 2014).`,

  cap6_lec0: `**Lección: Mapa de síntesis avanzado** (Capítulo 6 — Posibilidades)
Synthesis Map / Gigamapping (Birger Sevaldson, Oslo School of Architecture and Design): mapeo meta-extenso a través de muchas secciones, capas y escalas, investigando relaciones entre cosas, categorías y silos aparentemente separados. Los Gigamaps se hacen junto al equipo/cliente patrocinador, lo cual los hace muy intensivos en tiempo — son herramientas de proceso para alinear equipos y co-crear, no para comunicar hacia afuera del equipo (a diferencia de Synthesis Maps más curados).
Lectura relacionada: "Giga-mapping" (Birger Sevaldson, 2011).`,

  cap6_lec1: `**Lección: Intervenciones** (Capítulo 6 — Posibilidades)
Intervention Strategy: estrategia de intervención basada en los 12 leverage points de Meadows, identificando puntos de máximo impacto en el sistema mapeado. Intervention Model: conecta la estrategia con acciones concretas e implementables. Tipos de palancas de cambio van desde ajustes de parámetros (bajo impacto) hasta cambios de paradigma (alto impacto) — la estrategia más efectiva suele combinar intervenciones en varios niveles a la vez, no apostar todo a una sola palanca.
Ejercicio asociado: "Intervention Strategy" — definir estrategia de intervención basada en leverage points del sistema mapeado, usando el canvas de constantes/parámetros, estructuras, retrasos, bucles de balance/refuerzo, flujos de información, reglas, auto-organización, metas y paradigmas.`,

  cap6_lec2: `**Lección: Límites del sistema** (Capítulo 6 — Posibilidades)
Contextual Variations: variaciones contextuales de una intervención según geografía, cultura, política, demografía, época del año, etc. — los contextos reflejan características y circunstancias activas y únicas dentro de las cuales ocurre la implementación. Definir los límites (boundaries) de un sistema es una decisión de diseño, no un hecho objetivo dado: todo sistema es necesariamente parcial/selectivo en qué incluye y qué excluye (Werner Ulrich, "boundary judgements" — el "triángulo eterno" de hechos, valores y juicios de frontera).`,

  cap7_lec0: `**Lección: Teoría del cambio** (Capítulo 7 — Planificación)
Theory of Systems Change / TOSCA (basado en Murphy & Jones, 2020): versión sistémica del Theory of Change clásico. Niveles: actividades → outputs → outcomes → impacto, pero incorporando explícitamente supuestos críticos y riesgos en cada nivel de la cadena causal — a diferencia de un ToC lineal tradicional, TOSCA reconoce que las intervenciones complejas interactúan con y modifican el contexto en el que se implementan.`,

  cap7_lec1: `**Lección: Requerir variedad** (Capítulo 7 — Planificación)
Requisite Variety (Ley de Ashby): un sistema de control necesita tanta variedad interna como la variedad del sistema que pretende controlar/gestionar. Aplicado a diseño organizacional: equipos y procesos de cambio necesitan suficiente diversidad de perspectivas, roles y capacidades para responder a la complejidad real del sistema que están transformando — de ahí la importancia de un sampling deliberado y diverso de stakeholders (no solo los más accesibles). Process Enneagram (Richard Knowles): marco de 9 puntos para diseñar procesos en organizaciones auto-organizadas, permitiendo que el cambio emerja en vez de ser completamente prescrito top-down.`,

  cap7_lec2: `**Lección: Innovación sistémica** (Capítulo 7 — Planificación)
Systemic Innovation: la innovación entendida no como un producto o servicio aislado, sino como cambio a nivel de sistema completo, que requiere alinear múltiples regímenes (Frank Geels), facilitar la emergencia de nichos, y gestionar transiciones de largo plazo. Una transición exitosa requiere que las innovaciones de nicho se vuelvan suficientemente maduras y compatibles para desplazar o transformar el régimen dominante.
Lecturas relacionadas: "A Systems Perspective on Systemic Innovation" (Midgley & Lindhult, 2021), "Systems Innovation — Discussion Paper" (Mulgan & Leadbeater, 2013).`,

  cap8_lec0: `**Lección: Teoría de la transición** (Capítulo 8 — Transición)
Transition Theory: aplica el Multi-Level Perspective (Geels) específicamente al diseño de procesos de transición — cómo alinear presión del paisaje, apertura del régimen, y madurez de innovaciones de nicho para lograr un cambio de régimen exitoso. Roadmapping: hoja de ruta temporal que secuencia las acciones de transición a lo largo del tiempo, conectando el estado actual con la visión H3 de largo plazo.`,

  cap8_lec1: `**Lección: Ciclos adaptativos de resiliencia** (Capítulo 8 — Transición)
Panarchy (Holling & Gunderson): ciclos adaptativos de crecimiento/explotación → conservación → liberación/colapso → reorganización (representado como una figura en forma de infinito ∞). Estos ciclos están anidados en escalas (panarquía): ciclos rápidos a nivel micro/proyecto están contenidos dentro de ciclos más lentos a nivel meso/organización y macro/ecosistema o industria. Resiliencia no es resistencia al cambio, sino la capacidad del sistema de atravesar el ciclo completo y reorganizarse.
Lecturas relacionadas: "Energy Systems Transformation" (Dangerman & Schellnhuber, 2012) — ejemplo de transición energética analizada como ciclos adaptativos anidados; "The Adaptive Cycle" (Sundstrom & Allen, 2019).`,

  cap8_lec2: `**Lección: Gobernanza sistémica** (Capítulo 8 — Transición)
System governance: cómo se gobierna un ecosistema de actores diversos durante una transición sistémica, sin un único punto de control centralizado. Liderazgo de sistemas (Peter Senge): un tipo de liderazgo distribuido y colaborativo, enfocado en sostener la capacidad colectiva del ecosistema de actores para ver el sistema completo, fomentar reflexión conjunta y pasar de la reacción a la co-creación del futuro deseado.`,
}

// =====================================================================
// RESUMEN BREVE — usado como fallback cuando la pregunta es general
// (no dispara ninguna lección específica vía PALABRAS_CLAVE).
// =====================================================================
export const RESUMEN_GENERAL = `## RESUMEN DE LAS 24 LECCIONES DEL CURSO (mapa de 8 capítulos x 3 lecciones)

**Cap. 1 — Introducción:** Para de solucionar problemas · Wicked Problems (Rittel & Webber) · Diseño sistémico (origen y principios)
**Cap. 2 — Encuadre:** El Antropoceno · VUCA y BANI (Multi-Level Perspective de Geels) · Entendiendo el Iceberg (CLA de Inayatullah)
**Cap. 3 — Escucha:** Hacer investigación · Análisis Causal Sistémico (CLD, Systemigrams, Archetypes) · Visualizar Sistemas (Synthesis Maps)
**Cap. 4 — Comprensión:** Dinámica de sistemas (stocks/flujos, Meadows) · Puntos o nodos clave (Leverage Points) · El Modelo DIKW
**Cap. 5 — Visión:** Modelar Valor (System Value Proposition) · Escaneo de horizontes (Three Horizons, Sharpe) · Trabajo con paradojas (Paradoxing, Van Ael)
**Cap. 6 — Posibilidades:** Mapa de síntesis avanzado (Gigamapping, Sevaldson) · Intervenciones (Intervention Strategy) · Límites del sistema
**Cap. 7 — Planificación:** Teoría del cambio (TOSCA) · Requerir variedad (Ley de Ashby) · Innovación sistémica
**Cap. 8 — Transición:** Teoría de la transición (MLP aplicado) · Ciclos adaptativos de resiliencia (Panarchy, Holling) · Gobernanza sistémica (Senge)

Los 7 estadios del método (clasificación transversal del libro): [1] Framing, [2] Listening, [3] Understanding, [4] Envisioning, [5] Exploring the Possibility Space, [6] Planning, [7] Fostering the Transition.

Si el usuario pide profundizar en algún tema específico de los mencionados arriba, indícale que puede preguntar puntualmente sobre ese tema para obtener el desarrollo completo.`