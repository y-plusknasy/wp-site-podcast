jQuery(document).ready(function($) {
    // --- 要素の取得 ---
    const $trackTitle = $('#player-track-title');
    const $currentTime = $('#player-current-time');
    const $duration = $('#player-duration');
    const $seekBar = $('#player-seek-bar');
    const $playBtn = $('#player-btn-play');
    const $rewindBtn = $('#player-btn-rewind');
    const $forwardBtn = $('#player-btn-forward');
    const $speedBtn = $('#player-btn-speed');
    const $volumeBar = $('#player-volume-bar');
    const $downloadBtn = $('#player-btn-download');

    // --- 状態管理 ---
    let audio = new Audio();
    let isPlaying = false;
    let playbackRates = [1.0, 1.25, 1.5, 2.0];
    let currentSpeedIndex = 0;
    
    // 現在再生中のボタン（記事内の）への参照
    let $currentArticleBtn = null;

    // --- ヘルパー関数 ---
    
    // 秒数を mm:ss 形式に変換
    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return m + ":" + (s < 10 ? "0" : "") + s;
    }

    // SVG定義
    const svgPlay = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    const svgPause = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

    // プレイヤーの再生状態を更新（ボタン表示など）
    function updatePlayState(playing) {
        if (playing) {
            var playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    // 再生開始成功
                    isPlaying = true;
                    $playBtn.html(svgPause);
                    $playBtn.css('padding-left', '0'); // SVG化したので位置調整リセット
                    if ($currentArticleBtn) {
                        // アイコンをWaveアニメーションに変更
                        const $iconParams = '<div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div>';
                        $currentArticleBtn.find('.icon-container').html($iconParams);
                        $currentArticleBtn.find('.text-container').text('Now Playing');
                        $currentArticleBtn.addClass('playing');
                    }
                })
                .catch(error => {
                    console.error("Playback failed:", error);
                    updatePlayState(false); // 状態を戻す
                });
            }
        } else {
            audio.pause();
            isPlaying = false;
            $playBtn.html(svgPlay); 
            $playBtn.css('padding-left', '2px'); // Playアイコンの視覚調整
            if ($currentArticleBtn) {
                // Now Playingの状態から、Pausedという表記に変更する（またはPlay Episodeに戻すか）
                // 要望としては「ポーズボタンを押したときと同じ挙動」なので、
                // ポーズ中は「一時停止アイコン + Paused」のような状態にするのが一般的だが、
                // ここでは再度押すと再生できることを示すため "Resume" あるいは元の "Play" に戻すのが自然。
                // いったん元の Play Episode に戻す仕様で実装済みだが、
                // 「Now Playing」のボタンを押したらポーズ、というロジックは既に実装済み（下記clickイベント内）。
                
                // ここでは見た目を「停止状態」に戻す
                $currentArticleBtn.find('.icon-container').html('▶');
                $currentArticleBtn.find('.text-container').text('Play Episode');
                $currentArticleBtn.removeClass('playing');
            }
        }
    }

    // --- イベントリスナー ---

    // グローバルなクリックロック（イベント多重発火防止）
    // --- イベントリスナー ---

    // 1. 記事内の再生ボタンクリック
    $(document).off('click', '.podcast-play-button').on('click', '.podcast-play-button', function(e) {
        e.preventDefault();

        const $btn = $(this);
        const src = $btn.data('src');
        const title = $btn.data('title');

        if ($currentArticleBtn && $currentArticleBtn[0] === $btn[0] && isPlaying) {

            // 同じ曲を再生中に押した -> 一時停止
            updatePlayState(false);
        } else {
             // 別の曲、または一時停止中
            if (audio.src !== src) {
                // 再生中のものがあれば確実に止める
                audio.pause();
                isPlaying = false;
                
                // アイコンリセット
                if ($currentArticleBtn) {
                    $currentArticleBtn.find('.icon-container').html('▶');
                    $currentArticleBtn.find('.text-container').text('Play Episode');
                    $currentArticleBtn.removeClass('playing');
                }

                // 新しいトラックをセット
                audio.src = src;
                audio.load();

                $trackTitle.text(title);
                // ダウンロードボタンの更新
                if ($downloadBtn.length) {
                    $downloadBtn.attr('href', src).removeClass('disabled');
                }
            }
            
            $currentArticleBtn = $btn;
            updatePlayState(true);
            $playBtn.css('padding-left', '0');
        }
    });


    // 2. プレイヤーの再生/一時停止ボタン
    $playBtn.on('click', function() {
        if (!audio.src) return; // 曲がセットされてなければ何もしない
        updatePlayState(!isPlaying);
    });

    // 3. 前後スキップ
    $rewindBtn.on('click', function() {
        if (!audio.src) return;
        audio.currentTime = Math.max(0, audio.currentTime - 15);
    });

    $forwardBtn.on('click', function() {
        if (!audio.src) return;
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 30);
    });

    // 4. 再生速度変更
    $speedBtn.on('click', function() {
        currentSpeedIndex = (currentSpeedIndex + 1) % playbackRates.length;
        const rate = playbackRates[currentSpeedIndex];
        audio.playbackRate = rate;
        $(this).text(rate + "x");
    });

    // 5. ボリューム変更
    const $volumeIcon = $('.volume-icon');
    let lastVolume = 1.0;
    
    $volumeBar.on('input', function() {
        const val = $(this).val();
        const vol = val / 100;
        audio.volume = vol;
        
        // アイコンのミュート状態更新
        if (vol === 0) {
            $volumeIcon.addClass('muted');
        } else {
            $volumeIcon.removeClass('muted');
            lastVolume = vol; // ミュート解除時の復帰用に記憶
        }
    });

    // ボリュームアイコンクリックでミュート切り替え
    $volumeIcon.on('click', function() {
        if (audio.volume > 0) {
             // ミュートにする
            lastVolume = audio.volume;
            audio.volume = 0;
            $volumeBar.val(0);
            $volumeIcon.addClass('muted');
        } else {
            // ミュート解除（元の音量に戻す。もし元が0なら50%にする）
            const targetVol = (lastVolume > 0) ? lastVolume : 0.5;
            audio.volume = targetVol;
            $volumeBar.val(targetVol * 100);
            $volumeIcon.removeClass('muted');
        }
    });

    // 6. シークバー操作（ドラッグ中）
    $seekBar.on('input', function() {
        const seekTo = audio.duration * ($(this).val() / 100);
        audio.currentTime = seekTo;
        $currentTime.text(formatTime(seekTo));
    });

    // --- Audio オブジェクトのイベント ---

    audio.addEventListener('timeupdate', function() {
        // 再生位置の更新
        const percent = (audio.currentTime / audio.duration) * 100;
        $seekBar.val(percent);
        $currentTime.text(formatTime(audio.currentTime));
    });

    audio.addEventListener('loadedmetadata', function() {
        // 総時間の更新
        $duration.text(formatTime(audio.duration));
    });

    audio.addEventListener('ended', function() {
        // 再生終了時
        updatePlayState(false);
        audio.currentTime = 0;
        $seekBar.val(0);
        $currentTime.text("0:00");
    });
    
    // エラーハンドリング
    audio.addEventListener('error', function(e) {
        console.error("Audio error", e);
        $trackTitle.text("Error loading audio.");
    });
});
