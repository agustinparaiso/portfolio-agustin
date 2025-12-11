<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Shortcode principal del formulario de generación de contenido con IA.
 *
 * Solo se muestra a usuarios autenticados con capacidad de editar contenido.
 */
add_shortcode( 'ia_publicador_form', 'agustin_pia_shortcode_form' );

function agustin_pia_shortcode_form() {
    // Solo usuarios logueados con capacidad de edición pueden usar el generador
    if ( ! is_user_logged_in() || ! current_user_can( 'edit_posts' ) ) {
        return '<div class="agustin-pia-app-shell"><div class="agustin-pia-form-wrapper"><p>Debes iniciar sesión con un usuario con permisos de edición para generar contenido con IA.</p></div></div>';
    }

    $default_post_type = agustin_pia_get_default_post_type();

    // Categorías y etiquetas de entradas
    $categories = get_terms( [
        'taxonomy'   => 'category',
        'hide_empty' => false,
    ] );
    $tags = get_terms( [
        'taxonomy'   => 'post_tag',
        'hide_empty' => false,
    ] );

    // Páginas para página padre
    $pages = get_pages( [
        'sort_column' => 'post_title',
        'sort_order'  => 'ASC',
    ] );

    // WooCommerce: productos y categorías
    $has_woocommerce = function_exists( 'wc_get_products' );
    $product_cats    = [];

    if ( $has_woocommerce ) {
        $product_cats = get_terms( [
            'taxonomy'   => 'product_cat',
            'hide_empty' => false,
        ] );
    }

    ob_start();
    ?>
    <div class="agustin-pia-app-shell">
        <div class="agustin-pia-form-wrapper">
            <h2 class="agustin-pia-form-title">Generar contenido con IA</h2>
            <p class="agustin-pia-form-subtitle">
                Completa los campos y genera un artículo optimizado para SEO con un solo clic.
            </p>

            <form id="agustin-pia-form">
                <div class="agustin-pia-grid">
                    <!-- Columna izquierda -->
                    <div class="agustin-pia-col">
                        <div class="agustin-pia-field">
                            <label for="agustin_pia_keyword">Palabra clave o tema <span>*</span></label>
                            <input
                                type="text"
                                id="agustin_pia_keyword"
                                name="keyword"
                                required
                                placeholder="Ej: automatización de procesos con IA"
                            />
                            <small>Será la base del artículo y del SEO.</small>
                        </div>

                        <div class="agustin-pia-field">
                            <label for="agustin_pia_author_name">Nombre del autor para el artículo</label>
                            <input
                                type="text"
                                id="agustin_pia_author_name"
                                name="author_name"
                                placeholder="Ej: Agustín Paraíso"
                            />
                            <small>Se mostrará dentro del contenido generado (ej. “Por Agustín Paraíso”).</small>
                        </div>

                        <div class="agustin-pia-field">
                            <label for="agustin_pia_post_type">Tipo de contenido</label>
                            <select id="agustin_pia_post_type" name="post_type">
                                <option value="ai_content" <?php selected( $default_post_type, 'ai_content' ); ?>>
                                    CPT Contenido IA (recomendado para proyectos)
                                </option>
                                <option value="post" <?php selected( $default_post_type, 'post' ); ?>>
                                    Entrada (blog)
                                </option>
                                <option value="page" <?php selected( $default_post_type, 'page' ); ?>>
                                    Página
                                </option>
                            </select>
                            <small>Elige dónde se guardará el contenido generado.</small>
                        </div>

                        <div class="agustin-pia-field">
                            <label for="agustin_pia_status">Estado del contenido</label>
                            <select id="agustin_pia_status" name="post_status">
                                <option value="publish">Publicado</option>
                                <option value="draft">Borrador</option>
                                <option value="pending">Pendiente de revisión</option>
                            </select>
                            <small>Define si el contenido se publica directamente o queda como borrador.</small>
                        </div>

                        <div class="agustin-pia-field">
                            <label for="agustin_pia_visibility">Visibilidad</label>
                            <select id="agustin_pia_visibility" name="visibility">
                                <option value="public">Pública</option>
                                <option value="private">Privada (solo administradores y editores)</option>
                            </select>
                            <small>Solo aplica cuando el estado es “Publicado”.</small>
                        </div>

                        <div class="agustin-pia-field">
                            <label for="agustin_pia_slug">Slug (URL amigable opcional)</label>
                            <input
                                type="text"
                                id="agustin_pia_slug"
                                name="slug"
                                placeholder="ej: automatizacion-procesos-ia"
                            />
                            <small>Si lo dejas vacío, se generará automáticamente a partir de la palabra clave.</small>
                        </div>

                        <div class="agustin-pia-field agustin-pia-parent-wrapper">
                            <label for="agustin_pia_parent">Página padre (solo para Páginas)</label>
                            <select id="agustin_pia_parent" name="parent_id">
                                <option value="">— Sin página padre —</option>
                                <?php foreach ( $pages as $page ) : ?>
                                    <option value="<?php echo (int) $page->ID; ?>">
                                        <?php echo esc_html( $page->post_title ); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                            <small>Solo se aplicará si el tipo de contenido seleccionado es <strong>Página</strong>.</small>
                        </div>
                    </div>

                    <!-- Columna derecha -->
                    <div class="agustin-pia-col">
                        <div class="agustin-pia-field">
                            <label>Categorías existentes (opcional)</label>
                            <small>Marca una o varias. También puedes crear nuevas más abajo.</small>
                            <?php if ( ! empty( $categories ) ) : ?>
                                <div class="agustin-pia-tax-list">
                                    <?php foreach ( $categories as $cat ) : ?>
                                        <label class="agustin-pia-tax-item">
                                            <input
                                                type="checkbox"
                                                class="agustin-pia-cat-existing"
                                                value="<?php echo (int) $cat->term_id; ?>"
                                            >
                                            <span><?php echo esc_html( $cat->name ); ?></span>
                                        </label>
                                    <?php endforeach; ?>
                                </div>
                            <?php else : ?>
                                <em>No hay categorías creadas todavía.</em>
                            <?php endif; ?>
                        </div>

                        <div class="agustin-pia-field">
                            <label for="agustin_pia_categories">Nuevas categorías (opcional)</label>
                            <input
                                type="text"
                                id="agustin_pia_categories"
                                name="categories"
                                placeholder="Marketing, Automatización, IA"
                            />
                            <small>Nombres separados por comas. Se crearán y asignarán al contenido.</small>
                        </div>

                        <div class="agustin-pia-field">
                            <label>Etiquetas existentes (opcional)</label>
                            <small>Selecciona etiquetas existentes y añade nuevas si lo necesitas.</small>
                            <?php if ( ! empty( $tags ) ) : ?>
                                <div class="agustin-pia-tax-list">
                                    <?php foreach ( $tags as $tag ) : ?>
                                        <label class="agustin-pia-tax-item">
                                            <input
                                                type="checkbox"
                                                class="agustin-pia-tag-existing"
                                                value="<?php echo (int) $tag->term_id; ?>"
                                            >
                                            <span><?php echo esc_html( $tag->name ); ?></span>
                                        </label>
                                    <?php endforeach; ?>
                                </div>
                            <?php else : ?>
                                <em>No hay etiquetas creadas todavía.</em>
                            <?php endif; ?>
                        </div>

                        <div class="agustin-pia-field">
                            <label for="agustin_pia_tags">Nuevas etiquetas (opcional)</label>
                            <input
                                type="text"
                                id="agustin_pia_tags"
                                name="tags"
                                placeholder="procesos, productividad, IA aplicada"
                            />
                            <small>Nombres separados por comas.</small>
                        </div>
                    </div>
                </div>

                <?php if ( $has_woocommerce ) : ?>
                    <hr style="border-color:#1f2937;margin:1.5rem 0;">
                    <h3 class="agustin-pia-form-subtitle" style="margin-bottom:0.75rem;">
                        Productos de tu tienda para destacar en el artículo
                    </h3>

                    <div class="agustin-pia-grid">
                        <!-- Buscador de productos individuales -->
                        <div class="agustin-pia-col">
                            <div class="agustin-pia-field">
                                <label for="agustin_pia_product_search">Buscar productos por nombre</label>
                                <div class="agustin-pia-product-search-row">
                                    <input
                                        type="text"
                                        id="agustin_pia_product_search"
                                        placeholder="Ej: curso, plantilla, servicio..."
                                    />
                                    <button type="button" id="agustin_pia_product_search_btn" class="agustin-pia-secondary-btn">
                                        Buscar
                                    </button>
                                </div>
                                <small>Puedes buscar varias veces y marcar todos los productos que quieras enlazar.</small>
                            </div>

                            <div class="agustin-pia-field">
                                <label>Resultados de productos</label>
                                <div id="agustin_pia_product_results" class="agustin-pia-tax-list agustin-pia-product-results">
                                    <em>Haz una búsqueda para ver productos.</em>
                                </div>
                            </div>
                        </div>

                        <!-- Categorías de producto + configuración -->
                        <div class="agustin-pia-col">
                            <div class="agustin-pia-field">
                                <label>Categorías de producto</label>
                                <small>Selecciona categorías de tu tienda. Se mostrarán productos de estas categorías en formato tienda.</small>
                                <?php if ( ! empty( $product_cats ) && ! is_wp_error( $product_cats ) ) : ?>
                                    <div class="agustin-pia-tax-list agustin-pia-tax-list-scroll">
                                        <?php foreach ( $product_cats as $pcat ) : ?>
                                            <label class="agustin-pia-tax-item">
                                                <input
                                                    type="checkbox"
                                                    class="agustin-pia-product-cat-existing"
                                                    value="<?php echo (int) $pcat->term_id; ?>"
                                                >
                                                <span><?php echo esc_html( $pcat->name ); ?></span>
                                            </label>
                                        <?php endforeach; ?>
                                    </div>
                                <?php else : ?>
                                    <em>No hay categorías de producto definidas.</em>
                                <?php endif; ?>
                            </div>

                            <div class="agustin-pia-field">
                                <label for="agustin_pia_cat_limit">Productos por categoría</label>
                                <input
                                    type="number"
                                    id="agustin_pia_cat_limit"
                                    name="cat_limit"
                                    value="3"
                                    min="1"
                                    max="24"
                                />
                                <small>Cuántos productos mostrar en total para las categorías seleccionadas.</small>
                            </div>

                            <div class="agustin-pia-field">
                                <label for="agustin_pia_cat_orderby">Ordenar productos por</label>
                                <select id="agustin_pia_cat_orderby" name="cat_orderby">
                                    <option value="date">Fecha</option>
                                    <option value="title">Título</option>
                                    <option value="price">Precio</option>
                                    <option value="rand">Aleatorio</option>
                                </select>
                            </div>

                            <div class="agustin-pia-field">
                                <label for="agustin_pia_cat_order">Dirección del orden</label>
                                <select id="agustin_pia_cat_order" name="cat_order">
                                    <option value="DESC">Descendente</option>
                                    <option value="ASC">Ascendente</option>
                                </select>
                            </div>
                        </div>
                    </div>
                <?php endif; ?>

                <div class="agustin-pia-actions">
                    <button type="submit" class="agustin-pia-primary-btn">
                        Generar contenido con IA
                    </button>
                    <span class="agustin-pia-hint">
                        El contenido se creará y publicará automáticamente en WordPress según el estado y la visibilidad seleccionados.
                    </span>
                </div>
            </form>

            <div id="agustin-pia-result" class="agustin-pia-result">
                <p>El resultado aparecerá aquí después de generar el contenido.</p>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
