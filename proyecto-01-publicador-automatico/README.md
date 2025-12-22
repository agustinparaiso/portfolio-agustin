## 📌 Proyecto 01 – Publicador Automático con IA para WordPress	
⭐ Proyecto real desarrollado como parte de un portfolio profesional — combina PHP, WordPress, OpenAI y WooCommerce para automatizar la creación de contenido SEO y venta cruzada.	

## 🚀 Descripción general	
Este proyecto consiste en un plugin completo para WordPress que permite generar artículos optimizados para SEO utilizando IA (OpenAI) y además insertar productos recomendados de WooCommerce en formato tienda.	
El plugin automatiza tareas editoriales, mejora la estructura SEO y añade oportunidades de monetización mediante venta cruzada. Está diseñado siguiendo buenas prácticas de arquitectura, seguridad y UX.	

## ✨ Funcionalidades principales	

### 🧠 Generación de contenido con IA	
Artículos completos en HTML bien estructurado	
h1, h2, listas, bloques organizados y extracto automático	
Imagen destacada generada con IA	
Slug SEO automático o personalizado	

### 📝 Control editorial avanzado	
Tipo de contenido: Entrada, Página o CPT "Contenido IA"	
Estado: Publicado / Borrador / Pendiente	
Visibilidad: Pública / Privada	
Página padre para contenido jerárquico	

### 🏷️ SEO automatizado	
Categorías y etiquetas existentes	
Creación automática de nuevas	
Autor personalizado dentro del contenido	
Eliminación del meta "Escrito por..." del theme para posts IA	

### 🛒 Integración con WooCommerce	
Buscador interno de productos por nombre	
Selección múltiple de productos y categorías de producto	
Productos insertados en formato tienda usando [products]	
Respeta el diseño 100% del tema y de WooCommerce	

### 🔐 Seguridad y rendimiento	
Solo usuarios autenticados pueden usar el generador	
Límite configurable de peticiones por minuto	
Protección mediante REST API + WP Nonces	
API Key almacenada de forma segura	

## 🧩 Arquitectura del plugin

```text
publicador-automatico-ia/
│
├── publicador-automatico-ia.php      ← Archivo principal
├── includes/
│   ├── admin-settings.php            ← Ajustes del plugin
│   ├── shortcode-form.php            ← Formulario [ia_publicador_form]
│   ├── endpoint-generate.php         ← Integración con OpenAI
│   ├── helpers.php                   ← Funciones auxiliares
│   └── image-generation.php          ← Imagen destacada con IA
└── assets/
    ├── css/form.css
    ├── js/form.js
```

## 🔗 Enlace al proyecto
https://projects.porfolioagustinparaiso.es/proyecto-01

