<?php
/**
 * GeneratePress child theme functions and definitions.
 *
 * Add your custom functions here.
 */

function generatepress_child_enqueue_scripts() {
    if ( is_rtl() ) {
        wp_enqueue_style( 'generatepress-rtl', trailingslashit( get_template_directory_uri() ) . 'rtl.css' );
    }
}
add_action( 'wp_enqueue_scripts', 'generatepress_child_enqueue_scripts', 100 );

/**
 * メインコンテンツの後に、PC用固定サイドバーを出力する
 * GeneratePressのフック 'generate_after_primary_content_area' を使用
 * (2カラムグリッドの右側として配置される)
 */
function generatepress_child_add_fixed_sidebar() {
    // モバイルでは非表示にする制御はCSSで行うが、HTML出力自体を制御しても良い
    ?>
    <aside class="custom-fixed-sidebar hide-on-mobile">
        <div class="sticky-player-placeholder">
            <h3>Player</h3>
            <div class="player-controls">
                <p>Play / Pause / Repeat</p>
                <div style="background:#555; height:4px; width:100%; margin:10px 0;"></div>
                <button>Download</button>
            </div>
        </div>
        
        
        <div class="ad-placeholder">
            Ad Space
        </div>
    </aside>
    <?php
}
add_action( 'generate_after_primary_content_area', 'generatepress_child_add_fixed_sidebar' );

/**
 * プレイヤー用のスクリプトとスタイルを読み込む
 */
function generatepress_child_enqueue_player_scripts() {
    // プレイヤー制御用JS
    wp_enqueue_script( 'podcast-player-js', get_stylesheet_directory_uri() . '/js/player.js', array('jquery'), '1.0', true );
    
    // スマートヘッダーJS
    wp_enqueue_script( 'smart-header-js', get_stylesheet_directory_uri() . '/js/smart-header.js', array('jquery'), '1.0', true );
}
add_action( 'wp_enqueue_scripts', 'generatepress_child_enqueue_player_scripts' );

/**
 * 各記事に「再生ボタン」を追加する
 * (GeneratePressのフック generate_after_entry_header を使用してタイトルの下に表示)
 */
function generatepress_child_add_play_button() {
    // デモ用にサンプルのMP3 URLを使用
    // 実際には get_post_meta() などで記事ごとの音声ファイルを取得する
    $audio_url = 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg'; 
    ?>
    <div class="podcast-play-button-wrapper">
        <button class="podcast-play-button" data-src="<?php echo esc_url($audio_url); ?>" data-title="<?php the_title_attribute(); ?>">
            ▶ Play Episode
        </button>
    </div>
    <?php
}
add_action( 'generate_after_entry_header', 'generatepress_child_add_play_button' );




