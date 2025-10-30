document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const trackSelect = document.getElementById('trackSelect');
    const currentTrack = document.getElementById('currentTrack');

    // Массив треков
    const tracks = [
        { name: 'Трек 1', path: 'assets/572355312-322680992.mp3' },
        { name: 'Caro Emerald - Tangled Up', path: 'assets/Caro Emerald, Tangled Up (Lokee Remix).mp3' },
        { name: 'Valhalla Calling', path: 'assets/VALHALLA_CALLING_by_Miracle_Of_Sound_ft_Peyton_Parrish_DUET_VERSION.mp3' }
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;

    // Функция загрузки трека
    function loadTrack(index) {
        if (index >= 0 && index < tracks.length) {
            currentTrackIndex = index;
            audio.src = tracks[currentTrackIndex].path;
            currentTrack.textContent = tracks[currentTrackIndex].name;
            trackSelect.value = tracks[currentTrackIndex].path;
        }
    }

    // Функция для попытки автовоспроизведения
    function attemptAutoplay() {
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Автовоспроизведение успешно
                isPlaying = true;
                console.log('Автовоспроизведение запущено');
            }).catch(error => {
                // Автовоспроизведение заблокировано
                console.log('Автовоспроизведение заблокировано, требуется взаимодействие');
                showPlayMessage();
            });
        }
    }

    // Показать сообщение о необходимости клика
    function showPlayMessage() {
        const message = document.createElement('div');
        message.innerHTML = '🎵 Нажмите для запуска музыки 🎵';
        message.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255,255,255,0.9);
            color: #333;
            padding: 15px 25px;
            border-radius: 25px;
            cursor: pointer;
            z-index: 1000;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: pulse 2s infinite;
        `;
        
        // Добавляем CSS анимацию
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: translateX(-50%) scale(1); }
                50% { transform: translateX(-50%) scale(1.05); }
                100% { transform: translateX(-50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        message.addEventListener('click', function() {
            audio.play().then(() => {
                isPlaying = true;
                message.remove();
            });
        });
        
        document.body.appendChild(message);
        
        // Автоудаление через 10 секунд
        setTimeout(() => {
            if (document.body.contains(message)) {
                message.remove();
            }
        }, 10000);
    }

    // Обработчики событий
    trackSelect.addEventListener('change', function() {
        const selectedPath = this.value;
        const trackIndex = tracks.findIndex(track => track.path === selectedPath);
        if (trackIndex !== -1) {
            loadTrack(trackIndex);
            if (isPlaying) {
                audio.play();
            }
        }
    });

    playBtn.addEventListener('click', () => {
        audio.play();
        isPlaying = true;
    });

    pauseBtn.addEventListener('click', () => {
        audio.pause();
        isPlaying = false;
    });

    prevBtn.addEventListener('click', () => {
        let newIndex = currentTrackIndex - 1;
        if (newIndex < 0) newIndex = tracks.length - 1;
        loadTrack(newIndex);
        if (isPlaying) {
            audio.play();
        }
    });

    nextBtn.addEventListener('click', () => {
        let newIndex = currentTrackIndex + 1;
        if (newIndex >= tracks.length) newIndex = 0;
        loadTrack(newIndex);
        if (isPlaying) {
            audio.play();
        }
    });

    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value;
    });

    audio.addEventListener('ended', () => {
        let newIndex = currentTrackIndex + 1;
        if (newIndex >= tracks.length) newIndex = 0;
        loadTrack(newIndex);
        if (isPlaying) {
            audio.play();
        }
    });

    // Попытка автовоспроизведения при загрузке
    loadTrack(0);
    
    // Небольшая задержка для улучшения шансов автовоспроизведения
    setTimeout(() => {
        attemptAutoplay();
    }, 500);

    // Также пробуем автовоспроизведение при любом взаимодействии с страницей
    document.addEventListener('click', function firstClick() {
        if (!isPlaying) {
            attemptAutoplay();
        }
        document.removeEventListener('click', firstClick);
    });
});
