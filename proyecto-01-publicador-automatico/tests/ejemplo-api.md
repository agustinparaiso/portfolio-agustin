	## Ejemplo de petición a la API de OpenAI

	Este documento muestra un ejemplo real de cómo el plugin **Publicador Automático con IA**
	envía información a la API de OpenAI.

	---

	## Endpoint utilizado

	```
	/wp-json/agustin/v1/generate-content
	```

	Este endpoint está protegido mediante permisos de usuario y nonce de seguridad.

	---

	## Ejemplo de payload enviado al modelo

```json
{
  "model": "gpt-4.1-mini",
  "temperature": 0.7,
  "top_p": 1,
  "messages": [
    {
      "role": "system",
      "content": "Eres un redactor SEO experto en WordPress."
    },
    {
      "role": "user",
      "content": "Genera un artículo sobre automatización de procesos con IA para pymes."
    }
  ]
}
yaml
Copiar código
---

## Descripción del payload

- **model** → Modelo de OpenAI usado para generar contenido.  
- **temperature** → Controla la creatividad del texto.  
- **top_p** → Ajusta la diversidad del muestreo.  
- **messages** → Conversación enviada al modelo (rol system + rol user).  

---

## Resultado esperado

El plugin debe recibir:

- Título SEO  
- Extracto  
- Cuerpo HTML estructurado con `<h1>`, `<h2>`, listas y secciones  
- Texto limpio y listo para publicar  
- Sin etiquetas inválidas  
- Sin estilos inline  

Después de recibir la respuesta, el plugin:

1. Limpia el HTML  
2. Genera la imagen destacada (si está activado)  
3. Crea el post en WordPress  
4. Asigna categorías / etiquetas  
5. Inserta los productos WooCommerce seleccionados  