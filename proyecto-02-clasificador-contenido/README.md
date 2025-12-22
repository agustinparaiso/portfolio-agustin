# Automated SEO Content Pipeline (WordPress + X)

Sistema de automatización que genera contenido SEO a partir de una lista de palabras clave, lo publica automáticamente en WordPress y lo distribuye en X (Twitter), gestionando estados y URLs sin intervención manual.

Este proyecto está diseñado como un **sistema de producción**, no como una demo puntual.

---

## 🎯 Objetivo del proyecto

Reducir al mínimo el trabajo manual en la creación y distribución de contenido SEO, garantizando:

- Escalabilidad (listas grandes de keywords)
- Consistencia editorial
- Trazabilidad de cada publicación
- Control de estados y prevención de duplicados
- Facilidad de ampliación a nuevos canales

---

## 🧠 Qué problema resuelve

En muchos proyectos de marketing digital, la creación y publicación de contenido implica tareas repetitivas:

- Redacción manual de artículos
- Copiado y pegado en CMS
- Adaptación del contenido para redes sociales
- Falta de control sobre qué se ha publicado y qué no

Este sistema automatiza todo el flujo de principio a fin, manteniendo control y visibilidad en cada paso.

---

## 🧱 Arquitectura general

```text
Google Sheets (keywords)
        ↓
OpenAI (artículo SEO en JSON)
        ↓
Parse JSON
        ↓
WordPress → Crear post
        ↓
WordPress → Obtener URL del post
        ↓
Router
   └── Rama X
         ↓
      OpenAI → Copy para X
         ↓
      Buffer → Publicar en X
         ↓
      Google Sheets → Actualizar estado y URLs
```
        
🛠 Tecnologías utilizadas
Make → Orquestación de la automatización

OpenAI → Generación de contenido SEO y copys sociales

WordPress REST API → Publicación automática de artículos

Google Sheets → Control de keywords, estados y URLs

Buffer → Publicación automática en X (Twitter)

X (Twitter) → Canal de distribución social

📊 Estructura de control (Google Sheets)
La hoja de control actúa como base de datos ligera del sistema.

Columnas principales:

keyword → palabra clave a procesar

estado → pendiente / en_proceso / completado

url_wp → URL del artículo publicado en WordPress

estado_x → publicado

id_buffer_x → identificador del post en Buffer

fecha_publicacion → timestamp automático

Este enfoque permite:

Evitar duplicados

Reanudar ejecuciones

Auditar el sistema fácilmente

✍️ Generación de contenido SEO
Para cada keyword, el sistema genera un JSON estructurado con:

title

excerpt

content_html

Reglas aplicadas:

1 único h1 con la keyword exacta

Estructura clara con h2 y h3

HTML limpio (sin etiquetas de documento)

Longitud controlada para evitar errores de tokens

Contenido pensado para SEO y lectura humana

El uso de JSON permite reutilizar el contenido en otros canales sin reprocesar.

🌐 Publicación en WordPress
El flujo de publicación en WordPress se realiza en dos pasos:

Crear el post mediante la REST API

Obtener el post publicado para recuperar la URL real (link)

Esto evita construir URLs manualmente y garantiza compatibilidad con cualquier estructura de permalinks.

Los posts se publican directamente en estado publish.

🐦 Distribución en X (Twitter)
Debido a que:

X retiró la integración nativa en Make

La API de X exige OAuth User Context para escritura

La autenticación directa añade complejidad innecesaria al MVP

Se utiliza Buffer como capa de publicación, una solución habitual en entornos profesionales.

Ventajas:

Autenticación simplificada

Publicación estable

Integración directa con Make

Facilidad para escalar a otros canales en el futuro

El copy para X se genera automáticamente a partir del contenido del artículo, adaptado a:

Longitud máxima

Tono informativo

CTA claro

Enlace al artículo publicado

🔁 Gestión de estados
Cada keyword sigue un ciclo claro:

pendiente

en_proceso

completado

Además, cada canal tiene su propio estado (estado_x), lo que permite:

Detectar fallos por canal

Implementar reintentos

Escalar el sistema sin conflictos

⚙️ Decisiones técnicas relevantes
Buffer se usa para X por restricciones OAuth de la API v2

Instagram y LinkedIn se excluyen deliberadamente del MVP por:

Requisitos de imagen obligatorios

Procesos de aprobación adicionales

Se prioriza robustez y mantenibilidad frente a complejidad innecesaria

El sistema está preparado para ampliarse sin rehacer la base

🚀 Posibles mejoras futuras
Generación automática de imágenes destacadas

Publicación en LinkedIn (tras aprobación de API)

Reintentos automáticos ante errores

Dashboard visual de métricas

Soporte multinicho con múltiples hojas de keywords

📌 Demo funcional
Página del proyecto:
[https://projects.porfolioagustinparaiso.com/proyecto-02-clasificador-contenido
](https://projects.porfolioagustinparaiso.es/proyecto-02-clasificador-contenido/)                
Ejemplo de artículo generado automáticamente:
](https://projects.porfolioagustinparaiso.es/integracion-de-sistemas-digitales-automatizacion-de-procesos-digitales-2/)        
Ejemplo de publicación en X:
[https://x.com/AgustinPorfolio/status/2000487890329944270
](https://x.com/AgustinPorfolio/status/2000487890329944270)        

🧾 Conclusión

Este proyecto no es un experimento con IA, sino un sistema de producción diseñado para automatizar contenido de forma controlada, trazable y escalable, aplicando decisiones técnicas realistas basadas en limitaciones reales de APIs y plataformas.



