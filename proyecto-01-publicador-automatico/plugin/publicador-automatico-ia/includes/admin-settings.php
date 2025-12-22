<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}



/**
 * Registrar ajustes
 */
add_action( 'admin_init', 'agustin_pia_register_settings' );
function agustin_pia_register_settings() {
    register_setting( 'agustin_pia_settings_group', 'agustin_pia_openai_api_key' );
    register_setting( 'agustin_pia_settings_group', 'agustin_pia_default_keyword' );
    register_setting( 'agustin_pia_settings_group', 'agustin_pia_default_post_type' );

    // Modelo y parámetros avanzados
    register_setting( 'agustin_pia_settings_group', 'agustin_pia_openai_model' );
    register_setting( 'agustin_pia_settings_group', 'agustin_pia_temperature' );
    register_setting( 'agustin_pia_settings_group', 'agustin_pia_max_tokens' );
    register_setting( 'agustin_pia_settings_group', 'agustin_pia_top_p' );
    register_setting( 'agustin_pia_settings_group', 'agustin_pia_presence_penalty' );
    register_setting( 'agustin_pia_settings_group', 'agustin_pia_frequency_penalty' );

    register_setting( 'agustin_pia_settings_group', 'agustin_pia_prompt_template' );
    register_setting( 'agustin_pia_settings_group', 'agustin_pia_default_categories', [ 'type' => 'array', 'default' => [] ] );
    register_setting( 'agustin_pia_settings_group', 'agustin_pia_default_tags', [ 'type' => 'array', 'default' => [] ] );
    register_setting( 'agustin_pia_settings_group', 'agustin_pia_enable_featured_image' );
    register_setting( 'agustin_pia_settings_group', 'agustin_pia_image_prompt_template' );
    register_setting( 'agustin_pia_settings_group', 'agustin_pia_rate_limit_per_minute' );


    add_settings_section(
        'agustin_pia_main_section',
        'Configuración principal',
        '__return_false',
        'agustin-pia-settings'
    );

    add_settings_field(
        'agustin_pia_notice_permalinks',
        'Aviso importante',
        'agustin_pia_field_notice_permalinks',
        'agustin-pia-settings',
        'agustin_pia_main_section'
    );

    add_settings_field(
        'agustin_pia_openai_api_key',
        'OpenAI API Key',
        'agustin_pia_field_openai_key',
        'agustin-pia-settings',
        'agustin_pia_main_section'
    );

    add_settings_field(
        'agustin_pia_openai_model',
        'Modelo de ChatGPT',
        'agustin_pia_field_openai_model',
        'agustin-pia-settings',
        'agustin_pia_main_section'
    );

    add_settings_field(
        'agustin_pia_params',
        'Parámetros avanzados',
        'agustin_pia_field_openai_params',
        'agustin-pia-settings',
        'agustin_pia_main_section'
    );

    add_settings_field(
        'agustin_pia_default_post_type',
        'Tipo de contenido por defecto',
        'agustin_pia_field_default_post_type',
        'agustin-pia-settings',
        'agustin_pia_main_section'
    );

    add_settings_field(
        'agustin_pia_default_keyword',
        'Keyword por defecto (CRON)',
        'agustin_pia_field_default_keyword',
        'agustin-pia-settings',
        'agustin_pia_main_section'
    );

    add_settings_field(
        'agustin_pia_prompt_template',
        'Plantilla de prompt (contenido)',
        'agustin_pia_field_prompt_template',
        'agustin-pia-settings',
        'agustin_pia_main_section'
    );

    add_settings_field(
        'agustin_pia_default_categories',
        'Categorías por defecto',
        'agustin_pia_field_default_categories',
        'agustin-pia-settings',
        'agustin_pia_main_section'
    );

    add_settings_field(
        'agustin_pia_default_tags',
        'Etiquetas por defecto',
        'agustin_pia_field_default_tags',
        'agustin-pia-settings',
        'agustin_pia_main_section'
    );

    add_settings_field(
        'agustin_pia_enable_featured_image',
        'Imagen destacada con IA',
        'agustin_pia_field_enable_featured_image',
        'agustin-pia-settings',
        'agustin_pia_main_section'
    );

    add_settings_field(
        'agustin_pia_image_prompt_template',
        'Plantilla de prompt (imagen)',
        'agustin_pia_field_image_prompt_template',
        'agustin-pia-settings',
        'agustin_pia_main_section'
    );

        add_settings_field(
        'agustin_pia_rate_limit_per_minute',
        'Límite de peticiones por minuto',
        'agustin_pia_field_rate_limit_per_minute',
        'agustin-pia-settings',
        'agustin_pia_main_section'
    );

}

/** Aviso enlaces permanentes */
function agustin_pia_field_notice_permalinks() {
    echo '<div style="background:#fff3cd;border:1px solid #ffe69c;padding:10px;border-radius:4px;max-width:700px;">';
    echo '<strong>IMPORTANTE:</strong> Si ves errores 404 al abrir el contenido generado, ve a <em>Ajustes → Enlaces permanentes</em> y pulsa <strong>Guardar cambios</strong> sin modificar nada. Esto refresca las rutas de WordPress.';
    echo '</div>';
}

function agustin_pia_field_openai_key() {
    $value = esc_attr( get_option( 'agustin_pia_openai_api_key', '' ) );
    echo '<input type="password" name="agustin_pia_openai_api_key" value="' . $value . '" class="regular-text" />';
    echo '<p class="description">API Key de OpenAI que se usará para generar el contenido y, opcionalmente, las imágenes.</p>';
}

function agustin_pia_field_openai_model() {
    $current = agustin_pia_get_model();

    // Lista de modelos recomendados (puedes ampliarla)
    $models = [
        'gpt-4.1'      => 'gpt-4.1 (alta calidad)',
        'gpt-4.1-mini' => 'gpt-4.1-mini (rápido, barato)',
        'gpt-4o'       => 'gpt-4o (equilibrado)',
        'gpt-4o-mini'  => 'gpt-4o-mini (rápido, ideal para volumen)',
        'gpt-3.5-turbo'=> 'gpt-3.5-turbo (legacy, económico)',
    ];
    ?>
    <select name="agustin_pia_openai_model">
        <?php foreach ( $models as $value => $label ) : ?>
            <option value="<?php echo esc_attr( $value ); ?>" <?php selected( $current, $value ); ?>>
                <?php echo esc_html( $label ); ?>
            </option>
        <?php endforeach; ?>
    </select>
    <p class="description">
        Elige el modelo que quieras usar para generar el contenido.  
        - <strong>gpt-4.1</strong>: máxima calidad, adecuado para textos largos muy cuidados. <br>
        - <strong>gpt-4.1-mini / gpt-4o-mini</strong>: más rápidos y baratos, ideales para generar muchos artículos. <br>
        - <strong>gpt-4o</strong>: equilibrio entre calidad y coste.
    </p>
    <?php
}


function agustin_pia_field_openai_params() {
    $temp  = esc_attr( get_option( 'agustin_pia_temperature', 0.7 ) );
    $max   = esc_attr( get_option( 'agustin_pia_max_tokens', 1200 ) );
    $top_p = esc_attr( get_option( 'agustin_pia_top_p', '' ) );
    $pres  = esc_attr( get_option( 'agustin_pia_presence_penalty', '' ) );
    $freq  = esc_attr( get_option( 'agustin_pia_frequency_penalty', '' ) );
    ?>
    <table>
        <tr>
            <td style="padding-right:20px;">
                <label>temperature</label><br>
                <input type="number" step="0.1" min="0" max="2" name="agustin_pia_temperature" value="<?php echo $temp; ?>" style="width:90px;">
                <p class="description">
                    Controla lo “creativo” que es el texto. <br>
                    - <strong>0.0–0.3</strong>: muy preciso, menos creativo. <br>
                    - <strong>0.4–0.8</strong>: equilibrio (recomendado: 0.7). <br>
                    - <strong>1.0+</strong>: muy creativo, más riesgo de descontrol.
                </p>
            </td>
            <td style="padding-right:20px;">
                <label>max_tokens</label><br>
                <input type="number" min="1" name="agustin_pia_max_tokens" value="<?php echo $max; ?>" style="width:90px;">
                <p class="description">
                    Longitud máxima aproximada del artículo. <br>
                    - <strong>800–1500</strong>: artículo estándar. <br>
                    - <strong>2000+</strong>: artículos muy largos (puede consumir más).
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding-right:20px;">
                <label>top_p</label><br>
                <input type="number" step="0.05" min="0" max="1" name="agustin_pia_top_p" value="<?php echo $top_p; ?>" style="width:90px;">
                <p class="description">
                    Alternativa a <code>temperature</code>. Filtra el porcentaje de probabilidad acumulada de palabras. <br>
                    - Déjalo <strong>vacío</strong> para usar el valor por defecto del modelo. <br>
                    - Valores típicos: <strong>0.8–1.0</strong>.
                </p>
            </td>
            <td style="padding-right:20px;">
                <label>presence_penalty</label><br>
                <input type="number" step="0.1" min="-2" max="2" name="agustin_pia_presence_penalty" value="<?php echo $pres; ?>" style="width:90px;">
                <p class="description">
                    Penaliza o incentiva introducir temas nuevos. <br>
                    - Déjalo vacío para usar el valor por defecto. <br>
                    - <strong>0.0–0.5</strong>: ligero incentivo a no repetir temas. <br>
                    - Valores negativos: permiten más repetición.
                </p>
            </td>
            <td>
                <label>frequency_penalty</label><br>
                <input type="number" step="0.1" min="-2" max="2" name="agustin_pia_frequency_penalty" value="<?php echo $freq; ?>" style="width:90px;">
                <p class="description">
                    Penaliza palabras/frases repetidas. <br>
                    - Déjalo vacío para el valor por defecto. <br>
                    - <strong>0.0–0.5</strong>: reduce repetición en el texto. <br>
                    - Valores altos pueden hacer el texto raro; úsalo con moderación.
                </p>
            </td>
        </tr>
    </table>
    <?php
}


function agustin_pia_field_default_post_type() {
    $current = agustin_pia_get_default_post_type();
    ?>
    <select name="agustin_pia_default_post_type">
        <option value="ai_content" <?php selected( $current, 'ai_content' ); ?>>CPT "Contenido IA" (recomendado para proyectos)</option>
        <option value="post" <?php selected( $current, 'post' ); ?>>Entrada estándar</option>
        <option value="page" <?php selected( $current, 'page' ); ?>>Página</option>
    </select>
    <p class="description">Tipo de contenido que se creará por defecto (puedes sobrescribirlo desde el formulario o la API).</p>
    <?php
}

function agustin_pia_field_default_keyword() {
    $value = esc_attr( get_option( 'agustin_pia_default_keyword', 'tendencias de automatización' ) );
    echo '<input type="text" name="agustin_pia_default_keyword" value="' . $value . '" class="regular-text" />';
    echo '<p class="description">Keyword que se usará cuando el CRON ejecute la generación automática.</p>';
}

function agustin_pia_field_prompt_template() {
    $value = esc_textarea( agustin_pia_get_prompt_template() );
    echo '<textarea name="agustin_pia_prompt_template" rows="6" class="large-text code">' . $value . '</textarea>';
    echo '<p class="description">Usa {{keyword}} y {{site_name}} como variables. El contenido se generará en HTML listo para SEO.</p>';
}

function agustin_pia_field_default_categories() {
    $selected = (array) get_option( 'agustin_pia_default_categories', [] );

    $categories = get_terms( [
        'taxonomy'   => 'category',
        'hide_empty' => false,
    ] );

    echo '<select name="agustin_pia_default_categories[]" multiple style="min-width:250px; height:120px;">';
    foreach ( $categories as $cat ) {
        printf(
            '<option value="%d" %s>%s</option>',
            (int) $cat->term_id,
            in_array( $cat->term_id, $selected, true ) ? 'selected' : '',
            esc_html( $cat->name )
        );
    }
    echo '</select>';
    echo '<p class="description">Se aplicarán si el tipo de contenido soporta categorías (post / ai_content). Para crear nuevas categorías, usa Entradas → Categorías o el formulario del proyecto.</p>';
}

function agustin_pia_field_default_tags() {
    $selected = (array) get_option( 'agustin_pia_default_tags', [] );
    $tags     = get_terms(
        [
            'taxonomy'   => 'post_tag',
            'hide_empty' => false,
        ]
    );

    echo '<select name="agustin_pia_default_tags[]" multiple style="min-width:250px; height:120px;">';
    foreach ( $tags as $tag ) {
        printf(
            '<option value="%d" %s>%s</option>',
            (int) $tag->term_id,
            in_array( $tag->term_id, $selected, true ) ? 'selected' : '',
            esc_html( $tag->name )
        );
    }
    echo '</select>';
    echo '<p class="description">Se aplicarán si el tipo de contenido soporta etiquetas. También puedes crear etiquetas nuevas desde Entradas → Etiquetas.</p>';
}

function agustin_pia_field_enable_featured_image() {
    $value = (bool) get_option( 'agustin_pia_enable_featured_image', false );
    ?>
    <label>
        <input type="checkbox" name="agustin_pia_enable_featured_image" value="1" <?php checked( $value, true ); ?> />
        Generar imagen destacada con IA (OpenAI Images) con texto alternativo SEO-friendly
    </label>
    <?php
}

function agustin_pia_field_image_prompt_template() {
    $value = esc_textarea( agustin_pia_get_image_prompt_template() );
    echo '<textarea name="agustin_pia_image_prompt_template" rows="4" class="large-text code">' . $value . '</textarea>';
    echo '<p class="description">Usa {{keyword}} como variable. La descripción influye en la imagen generada.</p>';
}


/**
 * Render de la página de ajustes
 */
function agustin_pia_render_settings_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }
    ?>
    <div class="wrap">
        <h1>Publicador Automático IA</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields( 'agustin_pia_settings_group' );
            do_settings_sections( 'agustin-pia-settings' );
            submit_button();
            ?>
        </form>
        <hr>
        <h2>Cómo usar el plugin</h2>
        <ol>
            <li>Inserta tu API Key de OpenAI.</li>
            <li>Elige modelo y parámetros (temperature, max_tokens, etc.).</li>
            <li>Define el tipo de contenido por defecto (CPT IA, entrada o página).</li>
            <li>Configura categorías/etiquetas por defecto para SEO.</li>
            <li>Activa la imagen destacada IA si quieres.</li>
        </ol>
                <h3>Shortcode disponible</h3>
        <p>
            Para mostrar el formulario de generación en el frontend, usa:<br>
            <code>[ia_publicador_form]</code>
        </p>

    </div>
    <?php
}

function agustin_pia_field_rate_limit_per_minute() {
    $value = get_option( 'agustin_pia_rate_limit_per_minute', 10 );
    $value = intval( $value );
    if ( $value < 0 ) {
        $value = 0;
    }
    ?>
    <input type="number" min="0" step="1" name="agustin_pia_rate_limit_per_minute" value="<?php echo esc_attr( $value ); ?>" style="width:90px;">
    <p class="description">
        Número máximo de peticiones al generador de IA permitidas por minuto (global para todo el sitio).<br>
        - Pon <strong>0</strong> para desactivar el límite.<br>
        - Un valor típico puede ser <strong>5</strong> o <strong>10</strong> si solo lo usas tú.
    </p>
    <?php
}
