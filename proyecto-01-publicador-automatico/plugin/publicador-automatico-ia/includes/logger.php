<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Log simple en wp-content/uploads/agustin-pia-log.log
 */
function agustin_pia_log( $message, $context = [] ) {
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG === true ) {
        $upload_dir = wp_upload_dir();
        $file       = trailingslashit( $upload_dir['basedir'] ) . 'agustin-pia-log.log';

        $entry = '[' . date( 'Y-m-d H:i:s' ) . '] ' . $message;
        if ( ! empty( $context ) ) {
            $entry .= ' ' . wp_json_encode( $context );
        }
        $entry .= PHP_EOL;

        @file_put_contents( $file, $entry, FILE_APPEND );
    }
}
