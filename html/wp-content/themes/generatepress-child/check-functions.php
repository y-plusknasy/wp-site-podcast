<?php
// functions.php の構文チェック
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== Checking functions.php syntax ===\n\n";

$file = __DIR__ . '/functions.php';

if (!file_exists($file)) {
    die("Error: functions.php not found\n");
}

// 構文チェック
exec("php -l " . escapeshellarg($file), $output, $return);
echo implode("\n", $output) . "\n\n";

if ($return !== 0) {
    die("Syntax error found!\n");
}

// 実際にロードしてみる
echo "=== Loading functions.php ===\n";
try {
    require_once $file;
    echo "✓ Loaded successfully\n\n";
    
    // 関数の存在確認
    echo "=== Checking functions ===\n";
    $functions = [
        'get_firebase_storage',
        'upload_audio_to_firebase',
        'add_podcast_audio_meta_box',
        'render_podcast_audio_meta_box',
        'save_podcast_audio_meta_box',
        'process_audio_upload'
    ];
    
    foreach ($functions as $func) {
        if (function_exists($func)) {
            echo "✓ {$func} exists\n";
        } else {
            echo "✗ {$func} NOT FOUND\n";
        }
    }
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
