<?php
/**
 * Firebase接続テストスクリプト
 * 
 * 使い方:
 * 1. firebase-credentials.json をこのディレクトリに配置
 * 2. php test-firebase.php を実行
 */

require_once __DIR__ . '/vendor/autoload.php';

use Kreait\Firebase\Factory;

$serviceAccountPath = __DIR__ . '/v-ism-plusknasy-firebase-credentials.json';

echo "=== Firebase Connection Test ===\n\n";

// 認証情報ファイルの存在確認
if (!file_exists($serviceAccountPath)) {
    echo "❌ Error: firebase-credentials.json not found\n";
    echo "   Expected path: {$serviceAccountPath}\n\n";
    echo "📝 Next steps:\n";
    echo "   1. Download service account key from Firebase Console\n";
    echo "   2. Save it as 'firebase-credentials.json' in this directory\n";
    echo "   3. Run this test again\n";
    exit(1);
}

echo "✓ firebase-credentials.json found\n";

// Firebase接続テスト
try {
    echo "→ Connecting to Firebase...\n";
    
    $firebase = (new Factory)
        ->withServiceAccount($serviceAccountPath);
    
    $storage = $firebase->createStorage();
    $bucket = $storage->getBucket();
    
    echo "✓ Firebase connection successful!\n\n";
    echo "📦 Storage Information:\n";
    echo "   Bucket name: " . $bucket->name() . "\n\n";
    
    echo "🎉 Setup complete! You can now use Firebase Storage.\n";
    
} catch (Exception $e) {
    echo "❌ Firebase connection failed\n\n";
    echo "Error details:\n";
    echo "   " . $e->getMessage() . "\n\n";
    echo "📝 Troubleshooting:\n";
    echo "   - Check if the JSON file is valid\n";
    echo "   - Verify Firebase project settings\n";
    echo "   - Ensure Storage is enabled in Firebase Console\n";
    exit(1);
}
