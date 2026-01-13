jQuery(document).ready(function($) {
    // プレイヤー要素の取得
    const $playerContainer = $('.sticky-player-placeholder');
    const $playerTitle = $playerContainer.find('h3');
    const $playPauseStatus = $playerContainer.find('.player-controls p');
    
    // オーディオオブジェクトの作成（HTMLには出力せずJSで管理、またはHTMLに追加してもよい）
    let audio = new Audio();
    let isPlaying = false;

    // 現在再生中のボタンへの参照
    let $currentButton = null;

    // ボタンクリック時の処理
    $('.podcast-play-button').on('click', function(e) {
        e.preventDefault();
        const $btn = $(this);
        const src = $btn.data('src');
        const title = $btn.data('title');

        if ($currentButton && $currentButton[0] === $btn[0] && isPlaying) {
            // 同じボタンを再度押した場合は一時停止
            audio.pause();
            isPlaying = false;
            $btn.text('▶ Play Episode');
            $playPauseStatus.text('Paused');
        } else {
            // 新しい曲、または一時停止からの再開
            if (audio.src !== src) {
                audio.src = src;
                $playerTitle.text(title);
                
                // 以前のボタンをリセット
                if ($currentButton) {
                    $currentButton.text('▶ Play Episode');
                }
            }
            
            audio.play();
            isPlaying = true;
            $currentButton = $btn;
            $btn.text('⏸ Pause Episode');
            $playPauseStatus.text('Now Playing...');
        }
    });

    // オーディオ自体のイベントリスナー
    audio.addEventListener('ended', function() {
        isPlaying = false;
        $playPauseStatus.text('Finished');
        if ($currentButton) {
            $currentButton.text('▶ Play Episode');
        }
    });

    // シンプルなプログレスバーのシミュレーション（あとで本格実装）
    audio.addEventListener('timeupdate', function() {
        // ここでプログレスバーを更新可能
    });
});
