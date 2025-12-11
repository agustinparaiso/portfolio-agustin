<?php
/**
 * Plugin Name: Proyecto 01 – Publicador automático con IA
 * Description: Generador automático de contenido SEO para WordPress usando IA + bloque de productos de WooCommerce y buscador de productos.
 * Version:     1.0.0
 * Author:      Agustín Paraíso Gallardo
 * Text Domain: agustin-pia
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Constantes básicas del plugin
 */
define( 'AGUSTIN_PIA_VERSION', '1.0.0' );
define( 'AGUSTIN_PIA_PLUGIN_FILE', __FILE__ );
define( 'AGUSTIN_PIA_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'AGUSTIN_PIA_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Includes principales
 */
if ( file_exists( AGUSTIN_PIA_PLUGIN_DIR . 'includes/admin-settings.php' ) ) {
    require_once AGUSTIN_PIA_PLUGIN_DIR . 'includes/admin-settings.php';
}
if ( file_exists( AGUSTIN_PIA_PLUGIN_DIR . 'includes/helpers.php' ) ) {
    require_once AGUSTIN_PIA_PLUGIN_DIR . 'includes/helpers.php';
}
if ( file_exists( AGUSTIN_PIA_PLUGIN_DIR . 'includes/shortcode-form.php' ) ) {
    require_once AGUSTIN_PIA_PLUGIN_DIR . 'includes/shortcode-form.php';
}
if ( file_exists( AGUSTIN_PIA_PLUGIN_DIR . 'includes/endpoint-generate.php' ) ) {
    require_once AGUSTIN_PIA_PLUGIN_DIR . 'includes/endpoint-generate.php';
}
if ( file_exists( AGUSTIN_PIA_PLUGIN_DIR . 'includes/image-generation.php' ) ) {
    require_once AGUSTIN_PIA_PLUGIN_DIR . 'includes/image-generation.php';
}

/**
 * Registro del Custom Post Type para contenido generado con IA
 */
add_action( 'init', 'agustin_pia_register_cpt' );
function agustin_pia_register_cpt() {
    $labels = [
        'name'                  => 'Contenido IA',
        'singular_name'         => 'Contenido IA',
        'menu_name'             => 'Contenido IA',
        'name_admin_bar'        => 'Contenido IA',
        'add_new'               => 'Añadir nuevo',
        'add_new_item'          => 'Añadir nuevo contenido IA',
        'edit_item'             => 'Editar contenido IA',
        'new_item'              => 'Nuevo contenido IA',
        'view_item'             => 'Ver contenido IA',
        'search_items'          => 'Buscar contenido IA',
        'not_found'             => 'No se ha encontrado contenido',
        'not_found_in_trash'    => 'No hay contenido IA en la papelera',
        'all_items'             => 'Todo el contenido IA',
        'archives'              => 'Archivo de contenido IA',
        'insert_into_item'      => 'Insertar en contenido IA',
        'uploaded_to_this_item' => 'Subido a este contenido IA',
    ];

    $args = [
        'labels'             => $labels,
        'public'             => true,
        'has_archive'        => true,
        'show_in_rest'       => true,
        'menu_icon'          => 'dashicons-art',
        'supports'           => [ 'title', 'editor', 'excerpt', 'thumbnail', 'author', 'revisions', 'custom-fields' ],
        'rewrite'            => [
            'slug'       => 'contenido-ia',
            'with_front' => true,
        ],
    ];

    register_post_type( 'ai_content', $args );
}

/**
 * Activación: refrescar reglas de reescritura
 */
register_activation_hook( AGUSTIN_PIA_PLUGIN_FILE, 'agustin_pia_activate' );
function agustin_pia_activate() {
    agustin_pia_register_cpt();
    flush_rewrite_rules();
}

/**
 * Desactivación: limpiar reglas de reescritura
 */
register_deactivation_hook( AGUSTIN_PIA_PLUGIN_FILE, 'agustin_pia_deactivate' );
function agustin_pia_deactivate() {
    flush_rewrite_rules();
}

/**
 * Ajustar el menú del CPT "Contenido IA":
 * - Quitar "Añadir nuevo contenido IA"
 * - Añadir "Ajustes IA" como submenú
 * - Ocultar (si existe) el menú superior independiente de Ajustes IA
 */
add_action( 'admin_menu', 'agustin_pia_adjust_cpt_menu', 99 );
function agustin_pia_adjust_cpt_menu() {

    // 1) Eliminar "Añadir nuevo" del menú del CPT
    //    Slug padre: edit.php?post_type=ai_content
    //    Slug hijo:  post-new.php?post_type=ai_content
    remove_submenu_page(
        'edit.php?post_type=ai_content',
        'post-new.php?post_type=ai_content'
    );

    // 2) Añadir "Ajustes IA" como submenú debajo de Contenido IA
    //    Usamos la misma página de ajustes del plugin.
    if ( function_exists( 'agustin_pia_render_settings_page' ) ) {
        add_submenu_page(
            'edit.php?post_type=ai_content',
            __( 'Ajustes IA', 'agustin-pia' ),   // Título de la página
            __( 'Ajustes IA', 'agustin-pia' ),   // Texto del menú
            'manage_options',                    // Capacidad
            'agustin-pia-settings',              // slug de la página de ajustes
            'agustin_pia_render_settings_page'   // función que pinta la página (definida en admin-settings.php)
        );
    }

    // 3) Ocultar un posible menú superior independiente "Ajustes IA"
    //    (por si admin-settings.php lo registró como add_menu_page)
    remove_menu_page( 'agustin-pia-settings' );
}

/**
 * Encolado de CSS y JS del formulario
 * Solo en páginas que contengan el shortcode [ia_publicador_form]
 */
add_action( 'wp_enqueue_scripts', 'agustin_pia_enqueue_assets' );
function agustin_pia_enqueue_assets() {
    // Solo en frontend
    if ( is_admin() ) {
        return;
    }

    global $post;
    if ( ! $post || ! isset( $post->post_content ) ) {
        return;
    }

    if ( has_shortcode( $post->post_content, 'ia_publicador_form' ) ) {
        wp_enqueue_style(
            'agustin-pia-form-css',
            AGUSTIN_PIA_PLUGIN_URL . 'assets/css/form.css',
            [],
            AGUSTIN_PIA_VERSION
        );

        wp_enqueue_script(
            'agustin-pia-form-js',
            AGUSTIN_PIA_PLUGIN_URL . 'assets/js/form.js',
            [ 'jquery' ],
            AGUSTIN_PIA_VERSION,
            true
        );

        wp_localize_script(
            'agustin-pia-form-js',
            'AgustinPIA',
            [
                'restUrl'          => esc_url_raw( rest_url( 'agustin/v1/generate-post' ) ),
                'productSearchUrl' => esc_url_raw( rest_url( 'agustin/v1/search-products' ) ),
                'nonce'            => wp_create_nonce( 'wp_rest' ),
            ]
        );
    }
}

/**
 * Filtro para inyectar la línea de autor personalizado al principio del contenido,
 * solo en el CPT "ai_content".
 */
add_filter( 'the_content', 'agustin_pia_inject_author_line_if_missing', 9 );
function agustin_pia_inject_author_line_if_missing( $content ) {
    if ( ! is_singular( 'ai_content' ) ) {
        return $content;
    }

    $post_id = get_the_ID();
    if ( ! $post_id ) {
        return $content;
    }

    $custom_author = get_post_meta( $post_id, 'agustin_pia_author_name', true );
    if ( ! $custom_author ) {
        return $content;
    }

    if ( strpos( $content, 'agustin-pia-author-line' ) !== false ) {
        return $content;
    }

    $author_html = '<p class="agustin-pia-author-line">Por ' . esc_html( $custom_author ) . '</p>';

    if ( preg_match( '/<h1[^>]*>.*?<\/h1>/is', $content ) ) {
        $content = preg_replace(
            '/(<h1[^>]*>.*?<\/h1>)/is',
            '$1' . $author_html,
            $content,
            1
        );
        return $content;
    }

    return $author_html . $content;
}

/**
 * Oculta el bloque de autor/categorías del tema
 * ("Escrito por ... en ...") SOLO en el CPT ai_content.
 */
add_filter( 'render_block', 'agustin_pia_hide_ai_content_author_meta', 10, 2 );
function agustin_pia_hide_ai_content_author_meta( $block_content, $block ) {
    if ( ! is_singular( 'ai_content' ) ) {
        return $block_content;
    }

    if ( empty( $block['blockName'] ) ) {
        return $block_content;
    }

    $blocks_to_hide = [
        'core/post-author',
        'core/post-author-name',
        'core/post-date',
        'core/post-terms',
        'core/post-author-biography',
    ];

    if ( in_array( $block['blockName'], $blocks_to_hide, true ) ) {
        return '';
    }

    return $block_content;
}

/**
 * Aviso en el escritorio si falta configurar la API Key de OpenAI
 */
add_action( 'admin_notices', 'agustin_pia_admin_notice_if_no_api_key' );
function agustin_pia_admin_notice_if_no_api_key() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    if ( ! function_exists( 'agustin_pia_get_openai_key' ) ) {
        return;
    }

    $screen = get_current_screen();
    if ( ! $screen ) {
        return;
    }

    if ( $screen->id !== 'dashboard' && strpos( $screen->id, 'agustin-pia-settings' ) === false ) {
        return;
    }

    $api_key = agustin_pia_get_openai_key();
    if ( empty( $api_key ) ) {
        ?>
        <div class="notice notice-warning">
            <p>
                <strong>Publicador IA:</strong> aún no has configurado tu OpenAI API Key.
                Ve a <a href="<?php echo esc_url( admin_url( 'edit.php?post_type=ai_content&page=agustin-pia-settings' ) ); ?>">Contenido IA → Ajustes IA</a>
                para poder generar contenido automáticamente.
            </p>
        </div>
        <?php
    }
}
