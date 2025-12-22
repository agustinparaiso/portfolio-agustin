<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * API key OpenAI
 */
function agustin_pia_get_openai_key() {
    return trim( (string) get_option( 'agustin_pia_openai_api_key', '' ) );
}

/**
 * Modelo de texto
 */
function agustin_pia_get_model() {
    $default = 'gpt-4o-mini';
    $model   = get_option( 'agustin_pia_openai_model', $default );
    return $model ?: $default;
}

/**
 * Parámetros avanzados para la API
 */
function agustin_pia_get_temperature() {
    return floatval( get_option( 'agustin_pia_temperature', 0.7 ) );
}

function agustin_pia_get_max_tokens() {
    $max = intval( get_option( 'agustin_pia_max_tokens', 1200 ) );
    return $max > 0 ? $max : 1200;
}

function agustin_pia_get_top_p() {
    $val = get_option( 'agustin_pia_top_p', '' );
    return $val === '' ? null : floatval( $val );
}

function agustin_pia_get_presence_penalty() {
    $val = get_option( 'agustin_pia_presence_penalty', '' );
    return $val === '' ? null : floatval( $val );
}

function agustin_pia_get_frequency_penalty() {
    $val = get_option( 'agustin_pia_frequency_penalty', '' );
    return $val === '' ? null : floatval( $val );
}

/**
 * Modelo de imágenes
 */
function agustin_pia_get_image_model() {
    return apply_filters( 'agustin_pia_openai_image_model', 'dall-e-3' );
}

/**
 * Tipo de contenido por defecto
 */
function agustin_pia_get_default_post_type() {
    $allowed = [ 'post', 'page', 'ai_content' ];
    $type    = get_option( 'agustin_pia_default_post_type', 'ai_content' );
    return in_array( $type, $allowed, true ) ? $type : 'ai_content';
}

/**
 * Plantilla de prompt de contenido
 */
function agustin_pia_get_prompt_template() {
    $default = "Genera el contenido COMPLETO de un artículo en HTML, optimizado para SEO en español.
Debe empezar con un solo <h1> con el título principal, seguido de subtítulos <h2> y <h3> bien organizados, listas, párrafos y una conclusión final.
Utiliza buenas prácticas SEO: estructura clara, palabras clave relacionadas, texto escaneable.
Tema principal: {{keyword}}.
El contenido será usado en el sitio {{site_name}}.";

    $template = get_option( 'agustin_pia_prompt_template', $default );
    return $template ?: $default;
}

/**
 * Aplica la plantilla de prompt
 */
function agustin_pia_build_prompt( $keyword ) {
    $site_name = get_bloginfo( 'name' );

    $template = agustin_pia_get_prompt_template();
    $replaced = str_replace(
        [ '{{keyword}}', '{{site_name}}' ],
        [ $keyword, $site_name ],
        $template
    );

    return $replaced;
}

/**
 * ¿Debe generar imagen destacada?
 */
function agustin_pia_should_generate_featured_image() {
    return (bool) get_option( 'agustin_pia_enable_featured_image', false );
}

/**
 * Plantilla prompt para imagen
 */
function agustin_pia_get_image_prompt_template() {
    $default = "Imagen profesional, limpia y moderna relacionada con {{keyword}}, estilo ilustración corporativa, fondo claro, alta calidad.";
    $template = get_option( 'agustin_pia_image_prompt_template', $default );
    return $template ?: $default;
}

/**
 * Construye prompt para imagen
 */
function agustin_pia_build_image_prompt( $keyword ) {
    $template = agustin_pia_get_image_prompt_template();
    return str_replace( '{{keyword}}', $keyword, $template );
}

/**
 * Limpia contenido HTML para evitar ```html, ``` y variantes «`html que se cuelan
 */
function agustin_pia_clean_html_from_fences( $html ) {
    // Quitar triple backticks tipo ```html ... ```
    if ( preg_match( '/```html(.*?)```/is', $html, $matches ) ) {
        $html = $matches[1];
    }

    // Quitar restos de ``` sueltos
    $html = str_replace( '```html', '', $html );
    $html = str_replace( '```', '', $html );

    // Quitar posibles comillas tipográficas tipo «`html y «`
    $html = str_replace( [ '«`html', '«`', '`»', '»`' ], '', $html );

    return trim( $html );
}

/**
 * Genera y asigna imagen destacada usando OpenAI Images
 */
function agustin_pia_generate_featured_image( $keyword, $post_id ) {
    if ( ! agustin_pia_should_generate_featured_image() ) {
        return;
    }

    $api_key = agustin_pia_get_openai_key();
    if ( empty( $api_key ) ) {
        return;
    }

    $prompt = agustin_pia_build_image_prompt( $keyword );

    $body = [
        'model'  => agustin_pia_get_image_model(),
        'prompt' => $prompt,
        'n'      => 1,
        'size'   => '1024x1024',
    ];

    $response = wp_remote_post(
        'https://api.openai.com/v1/images/generations',
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
        agustin_pia_log( 'Error HTTP al generar imagen IA', [ 'error' => $response->get_error_message() ] );
        return;
    }

    $code = wp_remote_retrieve_response_code( $response );
    $data = json_decode( wp_remote_retrieve_body( $response ), true );

    if ( $code !== 200 || empty( $data['data'][0]['url'] ) ) {
        agustin_pia_log( 'Respuesta no válida de OpenAI Images', [ 'code' => $code, 'body' => $data ] );
        return;
    }

    $image_url = esc_url_raw( $data['data'][0]['url'] );

    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';

    $alt_text = sprintf( 'Imagen sobre %s generada con IA', $keyword );

    $attachment_id = media_sideload_image( $image_url, $post_id, $alt_text, 'id' );
    if ( ! is_wp_error( $attachment_id ) ) {
        set_post_thumbnail( $post_id, $attachment_id );
        // Alt text SEO-friendly
        update_post_meta( $attachment_id, '_wp_attachment_image_alt', $alt_text );
        agustin_pia_log( 'Imagen destacada IA generada', [ 'post_id' => $post_id, 'attachment_id' => $attachment_id ] );
    } else {
        agustin_pia_log( 'Error al asignar imagen destacada IA', [ 'error' => $attachment_id->get_error_message() ] );
    }
}
// Escribe en el debug.log solo si WP_DEBUG_LOG está activo.
if ( ! function_exists( 'agustin_pia_log' ) ) {
    function agustin_pia_log( $message, $context = [] ) {
        // Solo loguear si está activado el log de WordPress
        if ( defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
            $prefix = '[Publicador IA] ';
            if ( ! is_string( $message ) ) {
                $message = print_r( $message, true );
            }

            if ( ! empty( $context ) ) {
                $message .= ' | ' . wp_json_encode( $context );
            }

            error_log( $prefix . $message );
        }
    }
}