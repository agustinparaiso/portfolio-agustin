jQuery(document).ready(function ($) {
    const $form   = $('#agustin-pia-form');
    const $result = $('#agustin-pia-result');

    if (!$form.length) return;

    const $postTypeSelect = $('#agustin_pia_post_type');
    const $parentWrapper  = $('.agustin-pia-parent-wrapper');

    const $searchInput  = $('#agustin_pia_product_search');
    const $searchBtn    = $('#agustin_pia_product_search_btn');
    const $resultsBox   = $('#agustin_pia_product_results');

    // Set para acumular productos seleccionados entre búsquedas
    const selectedProductIds = new Set();

    function updateParentVisibility() {
        const type = $postTypeSelect.val();
        if (type === 'page') {
            $parentWrapper.show();
        } else {
            $parentWrapper.hide();
            $('#agustin_pia_parent').val('');
        }
    }

    // Inicializar visibilidad al cargar
    updateParentVisibility();

    // Cambiar visibilidad al cambiar tipo de contenido
    $postTypeSelect.on('change', updateParentVisibility);

    // Renderizar resultados de productos en el contenedor
    function renderProductResults(products) {
        if (!products || !products.length) {
            $resultsBox.html('<em>No se han encontrado productos para esa búsqueda.</em>');
            return;
        }

        let html = '';
        products.forEach(function (p) {
            const id = String(p.id);
            const checked = selectedProductIds.has(id) ? ' checked' : '';
            const thumb = p.thumb
                ? '<img src="' + p.thumb + '" alt="' + (p.name || '') + '" class="agustin-pia-product-thumb">'
                : '<div class="agustin-pia-product-thumb agustin-pia-product-thumb--empty"></div>';

            html +=
                '<label class="agustin-pia-product-result-item">' +
                    thumb +
                    '<div class="agustin-pia-product-meta-row">' +
                        '<input type="checkbox" class="agustin-pia-product-existing" value="' + id + '"' + checked + '>' +
                        '<span class="agustin-pia-product-name">' + p.name + '</span>' +
                    '</div>' +
                '</label>';
        });

        $resultsBox.html(html);

        // Vincular cambios para mantener el Set actualizado
        $resultsBox.find('.agustin-pia-product-existing').on('change', function () {
            const id = $(this).val();
            if (this.checked) {
                selectedProductIds.add(id);
            } else {
                selectedProductIds.delete(id);
            }
        });
    }


    // Búsqueda de productos vía REST
    function doProductSearch() {
        if (!$searchInput.length || !$resultsBox.length) {
            return;
        }

        if (typeof AgustinPIA === 'undefined' || !AgustinPIA.productSearchUrl) {
            console.error('AgustinPIA.productSearchUrl no está definido.');
            $resultsBox.html('<em>Error de configuración: falta la URL de búsqueda de productos.</em>');
            return;
        }

        const term = $searchInput.val().trim();
        if (!term) return;

        $resultsBox.html('<em>Buscando productos…</em>');

        fetch(AgustinPIA.productSearchUrl + '?q=' + encodeURIComponent(term), {
            method: 'GET',
            headers: {
                'X-WP-Nonce': AgustinPIA.nonce,
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.code) {
                    console.error('Error REST búsqueda productos:', data);
                    $resultsBox.html('<em>Error al buscar productos.</em>');
                    return;
                }
                renderProductResults(data);
            })
            .catch(error => {
                console.error(error);
                $resultsBox.html('<em>Error inesperado al buscar productos.</em>');
            });
    }

    if ($searchBtn.length && $searchInput.length && $resultsBox.length) {
        $searchBtn.on('click', function (e) {
            e.preventDefault();
            doProductSearch();
        });

        // Buscar también con Enter en el campo de texto
        $searchInput.on('keypress', function (e) {
            if (e.which === 13) {
                e.preventDefault();
                doProductSearch();
            }
        });
    }

    // Envío del formulario principal
    $form.on('submit', function (e) {
        e.preventDefault();

        const keyword     = $('#agustin_pia_keyword').val();
        const authorName  = $('#agustin_pia_author_name').val();
        const postType    = $('#agustin_pia_post_type').val();
        const slug        = $('#agustin_pia_slug').val();
        const categories  = $('#agustin_pia_categories').val();
        const tags        = $('#agustin_pia_tags').val();
        const parentId    = $('#agustin_pia_parent').val();
        const postStatus  = $('#agustin_pia_status').val();
        const visibility  = $('#agustin_pia_visibility').val();

        const catLimit    = $('#agustin_pia_cat_limit').val();
        const catOrderby  = $('#agustin_pia_cat_orderby').val();
        const catOrder    = $('#agustin_pia_cat_order').val();

        // IDs seleccionados de categorías/etiquetas de entradas
        const selectedCatIds = [];
        $('.agustin-pia-cat-existing:checked').each(function () {
            selectedCatIds.push($(this).val());
        });

        const selectedTagIds = [];
        $('.agustin-pia-tag-existing:checked').each(function () {
            selectedTagIds.push($(this).val());
        });

        // IDs de categorías de producto seleccionadas
        const selectedProductCatIds = [];
        $('.agustin-pia-product-cat-existing:checked').each(function () {
            selectedProductCatIds.push($(this).val());
        });

        // IDs de productos seleccionados acumulados en el Set
        const selectedProductIdsArray = Array.from(selectedProductIds);

        if (!keyword) {
            return;
        }

        if (typeof AgustinPIA === 'undefined' || !AgustinPIA.restUrl) {
            console.error('AgustinPIA.restUrl no está definido.');
            $result
                .addClass('agustin-pia-result-error')
                .html('<p><strong>Error de configuración:</strong> falta la URL del endpoint.</p>');
            return;
        }

        $result
            .removeClass('agustin-pia-result-error agustin-pia-result-success')
            .addClass('agustin-pia-result-loading')
            .html('<p>Generando contenido con IA…</p>');

        fetch(AgustinPIA.restUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': AgustinPIA.nonce
            },
            body: JSON.stringify({
                keyword:                 keyword,
                author_name:             authorName,
                post_type:               postType,
                slug:                    slug,
                categories:              categories,
                tags:                    tags,
                categories_selected:     selectedCatIds,
                tags_selected:           selectedTagIds,
                parent_id:               parentId,
                post_status:             postStatus,
                visibility:              visibility,
                shop_products_selected:  selectedProductIdsArray,
                shop_cats_selected:      selectedProductCatIds,
                shop_cats_limit:         catLimit,
                shop_cats_orderby:       catOrderby,
                shop_cats_order:         catOrder,
                source:                  'frontend'
            })
        })
            .then(response => response.json())
            .then(data => {
                $result.removeClass('agustin-pia-result-loading');

                if (data.code) {
                    $result
                        .addClass('agustin-pia-result-error')
                        .html('<p><strong>Error:</strong> ' + (data.message || 'No se pudo generar el contenido') + '</p>');
                    return;
                }

                $result
                    .addClass('agustin-pia-result-success')
                    .html(
                        '<p><strong>Contenido creado correctamente.</strong></p>' +
                        '<p>Tipo: <code>' + data.post_type + '</code></p>' +
                        '<p><a href="' + data.url + '" target="_blank" rel="noopener">Ver contenido generado</a></p>'
                    );
            })
            .catch(error => {
                console.error(error);
                $result
                    .removeClass('agustin-pia-result-loading')
                    .addClass('agustin-pia-result-error')
                    .html('<p><strong>Error inesperado.</strong> Revisa la consola del navegador.</p>');
            });
    });
});
