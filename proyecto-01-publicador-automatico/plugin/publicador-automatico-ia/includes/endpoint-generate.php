<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Registro de rutas REST del plugin:
 * - agustin/v1/generate-post   → genera contenido con IA y crea el post.
 * - agustin/v1/search-products → busca productos de WooCommerce por nombre.
 */
add_action( 'rest_api_init', function () {
    register_rest_route(
        'agustin/v1',
        '/generate-post',
        [
            'methods'             => 'POST',
            'callback'            => 'agustin_pia_generate_ai_post',
            'permission_callback' => 'agustin_pia_rest_permission',
        ]
    );

    register_rest_route(
        'agustin/v1',
        '/search-products',
        [
            'methods'             => 'GET',
            'callback'            => 'agustin_pia_search_products',
            'permission_callback' => 'agustin_pia_rest_permission',
        ]
    );
} );

/**
 * Permisos de la API REST.
 *
 * Se exige:
 * - Usuario autenticado
 * - Capacidad de editar contenido (edit_posts)
 */
function agustin_pia_rest_permission( $request ) {
    if ( is_user_logged_in() && current_user_can( 'edit_posts' ) ) {
        return true;
    }

    return new WP_Error( 'rest_forbidden', 'No autorizado', [ 'status' => 403 ] );
}

/**
 * Control de límite de peticiones por minuto.
 *
 * Opción: agustin_pia_rate_limit_per_minute
 *
 * Se guarda un array de timestamps recientes en el transient
 * "agustin_pia_request_log". Si se supera el límite configurado,
 * se devuelve un WP_Error con código 429.
 */
function agustin_pia_check_rate_limit() {
    $limit = intval( get_option( 'agustin_pia_rate_limit_per_minute', 10 ) );

    // 0 o negativo = sin límite
    if ( $limit <= 0 ) {
        return true;
    }

    $window_seconds = 60;
    $now            = time();
    $threshold      = $now - $window_seconds;

    $log = get_transient( 'agustin_pia_request_log' );
    if ( ! is_array( $log ) ) {
        $log = [];
    }

    // Mantener solo las peticiones de los últimos X segundos
    $log = array_filter(
        $log,
        function ( $timestamp ) use ( $threshold ) {
            return ( $timestamp >= $threshold );
        }
    );

    if ( count( $log ) >= $limit ) {
        return new WP_Error(
            'rate_limited',
            sprintf(
                'Se ha superado el límite de %d peticiones por minuto. Inténtalo de nuevo en unos segundos.',
                $limit
            ),
            [ 'status' => 429 ]
        );
    }

    // Registrar la petición actual
    $log[] = $now;
    set_transient( 'agustin_pia_request_log', $log, $window_seconds + 10 );

    return true;
}

/**
 * Endpoint REST para buscar productos de WooCommerce por nombre.
 * Ruta: /wp-json/agustin/v1/search-products?q=texto
 */
function agustin_pia_search_products( WP_REST_Request $request ) {
    if ( ! function_exists( 'wc_get_products' ) ) {
        return new WP_Error( 'no_wc', 'WooCommerce no está activo', [ 'status' => 500 ] );
    }

    $term = sanitize_text_field( $request->get_param( 'q' ) );

    if ( $term === '' ) {
        return [];
    }

    $products = wc_get_products( [
        'status' => 'publish',
        'limit'  => 20,
        'search' => $term,
        'orderby'=> 'date',
        'order'  => 'DESC',
    ] );

    $results = [];

    foreach ( $products as $product ) {
        $thumb_id  = $product->get_image_id();
        $thumb_url = $thumb_id ? wp_get_attachment_image_url( $thumb_id, 'thumbnail' ) : '';

        $results[] = [
            'id'    => $product->get_id(),
            'name'  => $product->get_name(),
            'url'   => get_permalink( $product->get_id() ),
            'thumb' => $thumb_url,
        ];
    }

    return $results;
}

/**
 * Generación de contenido con IA y creación del post en WordPress.
 *
 * Entrada posible:
 * - Objeto WP_REST_Request (llamada REST desde formulario)
 * - Array (llamadas internas como CRON u otros flujos del plugin)
 *
 * Parámetros soportados:
 * - keyword                 (string, obligatorio)
 * - source                  (string, opcional)   → origen (frontend|cron|manual...)
 * - post_type               (string, opcional)   → post|page|ai_content
 * - slug                    (string, opcional)
 * - author_name             (string, opcional)
 * - categories              (string, opcional)   → nombres CSV
 * - tags                    (string, opcional)   → nombres CSV
 * - categories_selected     (array, opcional)    → IDs de categorías existentes
 * - tags_selected           (array, opcional)    → IDs de etiquetas existentes
 * - parent_id               (int, opcional)      → ID de página padre
 * - post_status             (string, opcional)   → publish|draft|pending
 * - visibility              (string, opcional)   → public|private
 * - shop_products_selected  (array, opcional)    → IDs productos WooCommerce
 * - shop_cats_selected      (array, opcional)    → IDs categorías producto
 * - shop_cats_limit         (int, opcional)      → nº productos de categorías
 * - shop_cats_orderby       (string, opcional)   → date|title|price|rand
 * - shop_cats_order         (string, opcional)   → ASC|DESC
 */
function agustin_pia_generate_ai_post( $request ) {

    // Seguridad extra para llamadas REST directas
    if ( ! is_array( $request ) ) {
        if ( ! is_user_logged_in() || ! current_user_can( 'edit_posts' ) ) {
            return new WP_Error( 'forbidden', 'No autorizado para generar contenido.', [ 'status' => 403 ] );
        }
    }

    // Normalización de parámetros
    $params = is_array( $request ) ? $request : $request->get_json_params();

    $keyword     = isset( $params['keyword'] ) ? sanitize_text_field( $params['keyword'] ) : '';
    $source      = isset( $params['source'] ) ? sanitize_text_field( $params['source'] ) : 'manual';
    $post_type   = isset( $params['post_type'] ) ? sanitize_key( $params['post_type'] ) : agustin_pia_get_default_post_type();
    $slug        = isset( $params['slug'] ) ? sanitize_title( $params['slug'] ) : '';
    $author_name = isset( $params['author_name'] ) ? sanitize_text_field( $params['author_name'] ) : '';

    // Categorías / etiquetas nuevas (CSV)
    $categories_csv = isset( $params['categories'] ) ? sanitize_text_field( $params['categories'] ) : '';
    $tags_csv       = isset( $params['tags'] ) ? sanitize_text_field( $params['tags'] ) : '';

    // Categorías / etiquetas existentes seleccionadas (IDs)
    $categories_selected = isset( $params['categories_selected'] ) ? (array) $params['categories_selected'] : [];
    $tags_selected       = isset( $params['tags_selected'] ) ? (array) $params['tags_selected'] : [];

    // Página padre
    $parent_id = isset( $params['parent_id'] ) ? intval( $params['parent_id'] ) : 0;

    // Estado y visibilidad
    $post_status_param = isset( $params['post_status'] ) ? sanitize_key( $params['post_status'] ) : 'publish';
    $visibility_param  = isset( $params['visibility'] ) ? sanitize_key( $params['visibility'] ) : 'public';

    $allowed_status = [ 'publish', 'draft', 'pending' ];
    if ( ! in_array( $post_status_param, $allowed_status, true ) ) {
        $post_status_param = 'publish';
    }

    // Productos y categorías de producto
    $shop_products_selected = isset( $params['shop_products_selected'] ) ? (array) $params['shop_products_selected'] : [];
    $shop_cats_selected     = isset( $params['shop_cats_selected'] ) ? (array) $params['shop_cats_selected'] : [];

    // Configuración de productos por categoría
    $shop_cats_limit   = isset( $params['shop_cats_limit'] ) ? intval( $params['shop_cats_limit'] ) : 3;
    if ( $shop_cats_limit <= 0 ) {
        $shop_cats_limit = 3;
    }

    $shop_cats_orderby = isset( $params['shop_cats_orderby'] ) ? sanitize_key( $params['shop_cats_orderby'] ) : 'date';
    $allowed_orderby   = [ 'date', 'title', 'price', 'rand' ];
    if ( ! in_array( $shop_cats_orderby, $allowed_orderby, true ) ) {
        $shop_cats_orderby = 'date';
    }

    $shop_cats_order = isset( $params['shop_cats_order'] ) ? strtoupper( sanitize_text_field( $params['shop_cats_order'] ) ) : 'DESC';
    if ( ! in_array( $shop_cats_order, [ 'ASC', 'DESC' ], true ) ) {
        $shop_cats_order = 'DESC';
    }

    if ( empty( $keyword ) ) {
        return new WP_Error( 'no_keyword', 'Falta la keyword', [ 'status' => 400 ] );
    }

    if ( ! post_type_exists( $post_type ) ) {
        $post_type = agustin_pia_get_default_post_type();
    }

    $api_key = agustin_pia_get_openai_key();
    if ( empty( $api_key ) ) {
        return new WP_Error( 'no_api_key', 'Falta la OpenAI API Key en los ajustes', [ 'status' => 500 ] );
    }

    // Límite de peticiones por minuto
    $rate_check = agustin_pia_check_rate_limit();
    if ( is_wp_error( $rate_check ) ) {
        return $rate_check;
    }

    // Construcción del prompt
    $prompt = agustin_pia_build_prompt( $keyword );

    // Cuerpo de la petición a OpenAI
    $body = [
        'model'       => agustin_pia_get_model(),
        'temperature' => agustin_pia_get_temperature(),
        'max_tokens'  => agustin_pia_get_max_tokens(),
        'messages'    => [
            [
                'role'    => 'system',
                'content' => 'Eres un generador de contenido profesional especializado en marketing, automatización y negocios online. Devuelves SIEMPRE HTML bien estructurado, con un solo <h1> inicial, subtítulos <h2> y <h3>, listas y contenido listo para publicar en WordPress.',
            ],
            [
                'role'    => 'user',
                'content' => $prompt,
            ],
        ],
    ];

    // Parámetros avanzados opcionales
    $top_p = agustin_pia_get_top_p();
    if ( null !== $top_p ) {
        $body['top_p'] = $top_p;
    }

    $presence = agustin_pia_get_presence_penalty();
    if ( null !== $presence ) {
        $body['presence_penalty'] = $presence;
    }

    $frequency = agustin_pia_get_frequency_penalty();
    if ( null !== $frequency ) {
        $body['frequency_penalty'] = $frequency;
    }

    // Llamada HTTP a la API de OpenAI
    $response = wp_remote_post(
        'https://api.openai.com/v1/chat/completions',
        [
            'headers' => [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type'  => 'application/json',
            ],
            'body'    => wp_json_encode( $body ),
            'timeout' => 60,
        ]
    );

    if ( is_wp_error( $response ) ) {
        if ( function_exists( 'agustin_pia_log' ) ) {
            agustin_pia_log( 'Error HTTP al llamar a OpenAI', [ 'error' => $response->get_error_message() ] );
        }
        return new WP_Error( 'openai_http_error', 'Error HTTP al llamar a OpenAI', [ 'status' => 500 ] );
    }

    $code = wp_remote_retrieve_response_code( $response );
    $data = json_decode( wp_remote_retrieve_body( $response ), true );

    if ( $code !== 200 || empty( $data['choices'][0]['message']['content'] ) ) {
        if ( function_exists( 'agustin_pia_log' ) ) {
            agustin_pia_log( 'Respuesta no válida de OpenAI', [ 'code' => $code, 'body' => $data ] );
        }
        return new WP_Error( 'openai_invalid_response', 'Respuesta no válida de OpenAI', [ 'status' => 500 ] );
    }

    // Contenido HTML devuelto por el modelo
    $content_html = trim( $data['choices'][0]['message']['content'] );

    // Limpieza de fences ```html ``` etc.
    if ( function_exists( 'agustin_pia_clean_html_from_fences' ) ) {
        $content_html = agustin_pia_clean_html_from_fences( $content_html );
    }

    // Insertar línea de autor dentro del contenido si se indicó
    if ( $author_name ) {
        $author_html = '<p class="agustin-pia-author-line">Por ' . esc_html( $author_name ) . '</p>';

        if ( preg_match( '/<h1[^>]*>.*?<\/h1>/is', $content_html ) ) {
            $content_html = preg_replace(
                '/(<h1[^>]*>.*?<\/h1>)/is',
                '$1' . $author_html,
                $content_html,
                1
            );
        } else {
            $content_html = $author_html . $content_html;
        }
    }

    /**
     * Bloque de productos recomendados de la tienda (WooCommerce).
     * Usa shortcodes [products] para respetar el diseño del tema.
     */
    if ( function_exists( 'wc_get_product' ) && ( ! empty( $shop_products_selected ) || ! empty( $shop_cats_selected ) ) ) {

        $shop_html  = '<section class="agustin-pia-shop-cta">';
        $shop_html .= '<h2>Productos recomendados de mi tienda</h2>';
        $shop_html .= '<p>Si te interesa este contenido, aquí tienes recursos y productos relacionados que pueden ayudarte a dar el siguiente paso.</p>';

        // 1) Productos seleccionados por ID
        if ( ! empty( $shop_products_selected ) ) {
            $product_ids = array_map( 'intval', $shop_products_selected );
            $product_ids = array_filter( $product_ids );

            if ( ! empty( $product_ids ) ) {
                $ids_string = implode( ',', $product_ids );

                $shop_html .= do_shortcode(
                    '[products ids="' . esc_attr( $ids_string ) . '" columns="3" orderby="post__in"]'
                );
            }
        }

        // 2) Productos de categorías seleccionadas
        if ( ! empty( $shop_cats_selected ) ) {
            $term_slugs = [];

            foreach ( $shop_cats_selected as $cid ) {
                $term_id = intval( $cid );
                $term    = get_term( $term_id, 'product_cat' );

                if ( ! $term || is_wp_error( $term ) ) {
                    continue;
                }

                $term_slugs[] = $term->slug;
            }

            $term_slugs = array_filter( array_unique( $term_slugs ) );

            if ( ! empty( $term_slugs ) ) {
                $cats_string = implode( ',', $term_slugs );

                $shortcode = sprintf(
                    '[products category="%s" columns="3" limit="%d" orderby="%s" order="%s"]',
                    esc_attr( $cats_string ),
                    $shop_cats_limit,
                    esc_attr( $shop_cats_orderby ),
                    esc_attr( $shop_cats_order )
                );

                $shop_html .= '<div class="agustin-pia-shop-cats-block">';
                $shop_html .= '<h3>Más productos de categorías relacionadas</h3>';
                $shop_html .= do_shortcode( $shortcode );
                $shop_html .= '</div>';
            }
        }

        $shop_html .= '</section>';

        $content_html .= $shop_html;
    }

    // Título desde el primer <h1> o fallback
    $post_title = '';
    if ( preg_match( '/<h1[^>]*>(.*?)<\/h1>/is', $content_html, $matches ) ) {
        $post_title = wp_strip_all_tags( $matches[1] );
    }
    if ( ! $post_title ) {
        $post_title = wp_trim_words( wp_strip_all_tags( $content_html ), 10 );
    }

    // Extracto resumido
    $excerpt = wp_trim_words( wp_strip_all_tags( $content_html ), 40 );

    // Slug amigable
    if ( empty( $slug ) ) {
        $slug = sanitize_title( $keyword );
    }

    // Determinar post_status final según estado + visibilidad
    $final_status = $post_status_param;
    if ( $visibility_param === 'private' && $post_status_param === 'publish' ) {
        $final_status = 'private';
    }

    // Datos del post
    $postarr = [
        'post_type'    => $post_type,
        'post_title'   => $post_title,
        'post_content' => $content_html,
        'post_excerpt' => $excerpt,
        'post_status'  => $final_status,
        'post_name'    => $slug,
    ];

    // Página padre si procede
    if ( $parent_id > 0 && is_post_type_hierarchical( $post_type ) ) {
        $postarr['post_parent'] = $parent_id;
    }

    // Crear post
    $post_id = wp_insert_post( $postarr, true );

    if ( is_wp_error( $post_id ) ) {
        if ( function_exists( 'agustin_pia_log' ) ) {
            agustin_pia_log( 'Error al crear el post', [ 'error' => $post_id->get_error_message(), 'postarr' => $postarr ] );
        }
        return new WP_Error( 'insert_post_error', 'No se pudo crear el post', [ 'status' => 500 ] );
    }

    // Metadatos de autor y productos
    if ( $author_name ) {
        update_post_meta( $post_id, 'agustin_pia_author_name', $author_name );
    }

    if ( ! empty( $shop_products_selected ) ) {
        update_post_meta( $post_id, 'agustin_pia_shop_products', array_map( 'intval', $shop_products_selected ) );
    }

    if ( ! empty( $shop_cats_selected ) ) {
        update_post_meta( $post_id, 'agustin_pia_shop_cats', array_map( 'intval', $shop_cats_selected ) );
    }

    /**
     * SEO: asignación de categorías y etiquetas.
     */

    // Categorías por defecto desde ajustes (IDs)
    $cat_ids = (array) get_option( 'agustin_pia_default_categories', [] );
    if ( is_object_in_taxonomy( $post_type, 'category' ) && ! empty( $cat_ids ) ) {
        wp_set_post_terms( $post_id, array_map( 'intval', $cat_ids ), 'category', false );
    }

    // Categorías existentes seleccionadas (IDs)
    if ( ! empty( $categories_selected ) && is_object_in_taxonomy( $post_type, 'category' ) ) {
        $cat_ids_from_form = array_map( 'intval', $categories_selected );
        wp_set_post_terms( $post_id, $cat_ids_from_form, 'category', true );
    }

    // Nuevas categorías por nombre (CSV)
    if ( $categories_csv && is_object_in_taxonomy( $post_type, 'category' ) ) {
        $names     = array_filter( array_map( 'trim', explode( ',', $categories_csv ) ) );
        $extra_ids = [];

        foreach ( $names as $name ) {
            if ( '' === $name ) {
                continue;
            }

            $term = term_exists( $name, 'category' );
            if ( ! $term ) {
                $term = wp_insert_term( $name, 'category' );
            }

            if ( ! is_wp_error( $term ) ) {
                $extra_ids[] = (int) ( is_array( $term ) ? $term['term_id'] : $term );
            }
        }

        if ( $extra_ids ) {
            wp_set_post_terms( $post_id, $extra_ids, 'category', true );
        }
    }

    // Etiquetas por defecto desde ajustes (IDs)
    $tag_ids = (array) get_option( 'agustin_pia_default_tags', [] );
    if ( is_object_in_taxonomy( $post_type, 'post_tag' ) && ! empty( $tag_ids ) ) {
        wp_set_post_terms( $post_id, array_map( 'intval', $tag_ids ), 'post_tag', false );
    }

    // Etiquetas existentes seleccionadas (IDs)
    if ( ! empty( $tags_selected ) && is_object_in_taxonomy( $post_type, 'post_tag' ) ) {
        $tag_ids_from_form = array_map( 'intval', $tags_selected );
        wp_set_post_terms( $post_id, $tag_ids_from_form, 'post_tag', true );
    }

    // Nuevas etiquetas por nombre (CSV)
    if ( $tags_csv && is_object_in_taxonomy( $post_type, 'post_tag' ) ) {
        $names     = array_filter( array_map( 'trim', explode( ',', $tags_csv ) ) );
        $extra_ids = [];

        foreach ( $names as $name ) {
            if ( '' === $name ) {
                continue;
            }

            $term = term_exists( $name, 'post_tag' );
            if ( ! $term ) {
                $term = wp_insert_term( $name, 'post_tag' );
            }

            if ( ! is_wp_error( $term ) ) {
                $extra_ids[] = (int) ( is_array( $term ) ? $term['term_id'] : $term );
            }
        }

        if ( $extra_ids ) {
            wp_set_post_terms( $post_id, $extra_ids, 'post_tag', true );
        }
    }

    // Imagen destacada generada con IA (si existe la función)
    if ( function_exists( 'agustin_pia_generate_featured_image' ) ) {
        agustin_pia_generate_featured_image( $keyword, $post_id );
    }

    // Log
    if ( function_exists( 'agustin_pia_log' ) ) {
        agustin_pia_log( 'Post IA creado correctamente', [
            'post_id'   => $post_id,
            'keyword'   => $keyword,
            'source'    => $source,
            'post_type' => $post_type,
            'slug'      => $slug,
        ] );
    }

    // Respuesta REST
    return [
        'status'    => 'ok',
        'post_id'   => $post_id,
        'title'     => get_the_title( $post_id ),
        'url'       => get_permalink( $post_id ),
        'post_type' => $post_type,
        'slug'      => $slug,
        'source'    => $source,
    ];
}
