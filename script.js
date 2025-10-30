document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const trackSelect = document.getElementById('trackSelect');
    const currentTrack = document.getElementById('currentTrack');
    const progressBar = document.getElementById('progressBar');
    const currentTime = document.getElementById('currentTime');
    const duration = document.getElementById('duration');
    const visualizer = document.getElementById('visualizer');
    const particles = document.getElementById('particles');

    // Массив треков
    const tracks = [
        { name: 'Трек 1', path: 'assets/572355312-322680992.mp3' },
        { name: 'Caro Emerald - Tangled Up', path: 'assets/Caro Emerald, Tangled Up (Lokee Remix).mp3' },
        { name: 'Valhalla Calling', path: 'assets/VALHALLA_CALLING_by_Miracle_Of_Sound_ft_Peyton_Parrish_DUET_VERSION.mp3' }
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;
    let audioContext, analyser, dataArray, bufferLength;

    // Создание частиц для фона
    function createParticles() {
        particles.innerHTML = '';
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.width = Math.random() * 20 + 5 + 'px';
            particle.style.height = particle.style.width;
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = Math.random() * 100 + 'vh';
            particle.style.animationDelay = Math.random() * 5 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particles.appendChild(particle);
        }
    }

    // Инициализация аудиоанализатора
    function initAudioAnalyzer() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        analyser.fftSize = 256;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
    }

    // Визуализация звука
    function visualize() {
        if (!analyser) return;
        
        analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        // Изменение фона в зависимости от громкости
        const intensity = average / 256;
        const hue = (intensity * 60 + 200) % 360;
        document.body.style.background = `linear-gradient(45deg, hsl(${hue}, 70%, 50%), hsl(${hue + 60}, 70%, 50%))`;
        
        // Создание волн визуализатора
        visualizer.innerHTML = '';
        const barWidth = (visualizer.offsetWidth / bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 256) * 300;
            const bar = document.createElement('div');
            bar.style.position = 'absolute';
            bar.style.left = x + 'px';
            bar.style.bottom = '0';
            bar.style.width = barWidth + 'px';
            bar.style.height = barHeight + 'px';
            bar.style.background = `hsl(${hue + i * 2}, 70%, 60%)`;
            bar.style.borderRadius = '2px';
            visualizer.appendChild(bar);
            x += barWidth + 1;
        }
        
        if (isPlaying) {
            requestAnimationFrame(visualize);
        }
    }

    // Форматирование времени
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Обновление прогресс-бара
    function updateProgress() {
        if (audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressBar.value = progress;
            currentTime.textContent = formatTime(audio.currentTime);
        }
    }

    // Загрузка трека
    function loadTrack(index) {
        if (index >= 0 && index < tracks.length) {
            currentTrackIndex = index;
            audio.src = tracks[currentTrackIndex].path;
            currentTrack.textContent = tracks[currentTrackIndex].name;
            trackSelect.value = tracks[currentTrackIndex].path;
            
            audio.addEventListener('loadedmetadata', function() {
                duration.textContent = formatTime(audio.duration);
            });
            
            if (isPlaying) {
                audio.play();
            }
        }
    }

    // Попытка автовоспроизведения
    function attemptAutoplay() {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                playPauseBtn.textContent = '⏸';
                if (!analyser) initAudioAnalyzer();
                visualize();
            }).catch(error => {
                showPlayMessage();
            });
        }
    }

    // Сообщение о необходимости запуска
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
                playPauseBtn.textContent = '⏸';
                if (!analyser) initAudioAnalyzer();
                visualize();
                message.remove();
            });
        });
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (document.body.contains(message)) {
                message.remove();
            }
        }, 10000);
    }

    // Обработчики событий
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            playPauseBtn.textContent = '▶';
        } else {
            audio.play().then(() => {
                isPlaying = true;
                playPauseBtn.textContent = '⏸';
                if (!analyser) initAudioAnalyzer();
                visualize();
            }).catch(error => {
                showPlayMessage();
            });
        }
    });

    prevBtn.addEventListener('click', () => {
        let newIndex = currentTrackIndex - 1;
        if (newIndex < 0) newIndex = tracks.length - 1;
        loadTrack(newIndex);
    });

    nextBtn.addEventListener('click', () => {
        let newIndex = currentTrackIndex + 1;
        if (newIndex >= tracks.length) newIndex = 0;
        loadTrack(newIndex);
    });

    trackSelect.addEventListener('change', function() {
        const selectedPath = this.value;
        const trackIndex = tracks.findIndex(track => track.path === selectedPath);
        if (trackIndex !== -1) {
            loadTrack(trackIndex);
        }
    });

    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value / 100;
    });

    progressBar.addEventListener('input', () => {
        if (audio.duration) {
            audio.currentTime = (progressBar.value / 100) * audio.duration;
        }
    });

    audio.addEventListener('timeupdate', updateProgress);

    audio.addEventListener('ended', () => {
        let newIndex = currentTrackIndex + 1;
        if (newIndex >= tracks.length) newIndex = 0;
        loadTrack(newIndex);
        if (isPlaying) {
            audio.play();
        }
    });

    // Инициализация
    createParticles();
    loadTrack(0);
    
    setTimeout(() => {
        attemptAutoplay();
    }, 1000);

    document.addEventListener('click', function firstClick() {
        if (!isPlaying) {
            attemptAutoplay();
        }
        document.removeEventListener('click', firstClick);
    });
});
