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
    const transitionOverlay = document.getElementById('transitionOverlay');

    // Обновленный массив треков с новыми темами
    const tracks = [
        { 
            name: 'Трек 1', 
            path: 'assets/572355312-322680992.mp3',
            theme: {
                primary: 'hsl(230, 70%, 50%)',
                secondary: 'hsl(270, 70%, 50%)',
                accent: 'hsl(300, 80%, 60%)'
            }
        },
        { 
            name: 'Caro Emerald - Tangled Up', 
            path: 'assets/Caro Emerald, Tangled Up (Lokee Remix).mp3',
            theme: {
                primary: 'hsl(330, 70%, 50%)',
                secondary: 'hsl(10, 70%, 50%)',
                accent: 'hsl(40, 90%, 60%)'
            }
        },
        { 
            name: 'Valhalla Calling', 
            path: 'assets/VALHALLA_CALLING_by_Miracle_Of_Sound_ft_Peyton_Parrish_DUET_VERSION.mp3',
            theme: {
                primary: 'hsl(180, 70%, 30%)',
                secondary: 'hsl(220, 70%, 40%)',
                accent: 'hsl(280, 80%, 60%)'
            }
        },
        { 
            name: 'Marino - Lust', 
            path: 'assets/Marino - Lust (feat. Alexandria).m4a',
            theme: {
                primary: 'hsl(0, 0%, 0%)',        // Черный
                secondary: 'hsl(0, 100%, 15%)',   // Темно-красный
                accent: 'hsl(0, 100%, 45%)'       // Насыщенный красный
            }
        },
        { 
            name: 'Taco - Puttin\' On The Ritz', 
            path: 'assets/Taco - Puttin\' On The Ritz.m4a',
            theme: {
                primary: 'hsl(220, 30%, 15%)',    // Темно-синий (смокинг)
                secondary: 'hsl(0, 0%, 25%)',     // Темно-серый
                accent: 'hsl(45, 100%, 50%)'      // Золотой (элегантность)
            }
        },
        { 
            name: 'The Cigarette Duet', 
            path: 'assets/The Cigarette Duet  Дуэт сигарет [Princess Chelsea] (Russian cover with ‪IgorCoolikov‬).m4a',
            theme: {
                primary: 'hsl(330, 60%, 70%)',    // Розовый
                secondary: 'hsl(20, 30%, 30%)',   // Коричневый
                accent: 'hsl(330, 80%, 85%)'      // Светло-розовый
            }
        },
        { 
            name: 'A Man Without Love', 
            path: 'assets/A Man Without Love LYRICS Video Engelbert Humperdinck 1968 🌙 Moon Knight Episode 1.m4a',
            theme: {
                primary: 'hsl(220, 30%, 95%)',    // Белый с синим оттенком
                secondary: 'hsl(220, 20%, 85%)',  // Светло-серый
                accent: 'hsl(220, 50%, 70%)'      // Лунный синий
            }
        }
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;
    let audioContext, analyser, dataArray, bufferLength;
    let particleElements = [];
    let isTransitioning = false;

    // Улучшенное создание частиц
    function createParticles() {
        particles.innerHTML = '';
        particleElements = [];
        
        const particleCount = 25;
        const particleTypes = ['type1', 'type2', 'type3', 'type4', 'type5'];
        const currentTheme = tracks[currentTrackIndex].theme;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
            const size = Math.random() * 20 + 8; // Увеличил размер для лучшей видимости
            
            particle.className = `particle ${type}`;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = Math.random() * 100 + 'vh';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
            
            // Улучшенные градиенты для частиц
            const hue1 = getHue(currentTheme.primary) + Math.random() * 30 - 15;
            const hue2 = getHue(currentTheme.accent) + Math.random() * 30 - 15;
            
            particle.style.background = `radial-gradient(circle, 
                hsla(${hue1}, 80%, 70%, 0.8) 0%, 
                hsla(${hue2}, 80%, 60%, 0.5) 50%, 
                hsla(${hue1}, 80%, 50%, 0.3) 100%)`;
            
            // Добавляем тень для объема
            particle.style.boxShadow = `0 0 15px hsla(${hue2}, 80%, 60%, 0.4)`;
            
            particles.appendChild(particle);
            particleElements.push(particle);
        }
    }

    // Плавный переход между темами
    function transitionToTheme(newTheme, callback) {
        if (isTransitioning) return;
        isTransitioning = true;
        
        // Активируем оверлей перехода
        transitionOverlay.classList.add('active');
        
        // Ждем немного перед сменой темы
        setTimeout(() => {
            setTheme(newTheme);
            
            // Анимация смены трека в интерфейсе
            const playerContainer = document.querySelector('.player-container');
            playerContainer.classList.add('track-change-animation');
            
            // Убираем оверлей после смены темы
            setTimeout(() => {
                transitionOverlay.classList.remove('active');
                playerContainer.classList.remove('track-change-animation');
                isTransitioning = false;
                if (callback) callback();
            }, 800);
        }, 300);
    }

    // Установка цветовой темы
    function setTheme(theme) {
        document.documentElement.style.setProperty('--theme-color', theme.accent);
        document.documentElement.style.setProperty('--theme-glow', theme.accent + '80');
        
        document.body.style.background = `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`;
        
        // Пересоздаем частицы с новой темой
        createParticles();
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

    // Исправленная визуализация звука
    function visualize() {
        if (!analyser) return;
        
        analyser.getByteFrequencyData(dataArray);
        
        // Анализ разных частотных диапазонов
        const bass = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10;
        const mids = dataArray.slice(10, 50).reduce((a, b) => a + b) / 40;
        const highs = dataArray.slice(50, 100).reduce((a, b) => a + b) / 50;
        
        const average = (bass + mids + highs) / 3;
        const intensity = average / 256;
        
        // Динамическое обновление фона на основе музыки
        const currentTheme = tracks[currentTrackIndex].theme;
        const hueShift = intensity * 60;
        document.body.style.background = `linear-gradient(45deg, 
            hsl(${getHue(currentTheme.primary) + hueShift}, 70%, 50%), 
            hsl(${getHue(currentTheme.secondary) + hueShift}, 70%, 50%))`;
        
        // Анимация частиц в такт музыки
        animateParticles(bass, mids, highs);
        
        // Создание исправленного визуализатора
        createFrequencyBars(dataArray, bass, mids, highs);
        
        if (isPlaying) {
            requestAnimationFrame(visualize);
        }
    }

    // Получение hue из HSL цвета
    function getHue(hslColor) {
        const match = hslColor.match(/hsl\((\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    // Анимация частиц в такт музыки
    function animateParticles(bass, mids, highs) {
        particleElements.forEach((particle, index) => {
            const bassEffect = bass / 256;
            const midEffect = mids / 256;
            const highEffect = highs / 256;
            
            // Разные частицы реагируют на разные частоты
            if (particle.classList.contains('type1')) {
                particle.style.transform = `scale(${1 + bassEffect * 0.5})`;
            } else if (particle.classList.contains('type2')) {
                particle.style.opacity = 0.3 + midEffect * 0.7;
            } else if (particle.classList.contains('type3')) {
                particle.style.transform = `rotate(${highEffect * 360}deg) scale(${1 + highEffect * 0.3})`;
            } else if (particle.classList.contains('type4')) {
                particle.style.filter = `blur(${1 + bassEffect * 2}px) hue-rotate(${mids}deg)`;
            } else if (particle.classList.contains('type5')) {
                particle.style.opacity = 0.4 + highEffect * 0.6;
            }
        });
    }

    // Исправленное создание частотных полос визуализатора
    function createFrequencyBars(dataArray, bass, mids, highs) {
        const barCount = 60; // Уменьшил количество для лучшей производительности
        const visualizerWidth = window.innerWidth;
        const barWidth = Math.max(3, visualizerWidth / barCount - 2); // Минимальная ширина 3px
        const currentTheme = tracks[currentTrackIndex].theme;
        
        visualizer.innerHTML = '';
        
        for (let i = 0; i < barCount; i++) {
            const barValue = dataArray[Math.floor(i * bufferLength / barCount)];
            const barHeight = Math.max(10, (barValue / 256) * 150); // Минимальная высота 10px
            
            const bar = document.createElement('div');
            bar.style.width = barWidth + 'px';
            bar.style.height = barHeight + 'px';
            bar.style.margin = '0 1px';
            bar.style.background = `linear-gradient(to top, 
                ${currentTheme.accent}80, 
                ${currentTheme.accent})`;
            bar.style.borderRadius = '3px 3px 0 0';
            bar.style.boxShadow = `0 0 8px ${currentTheme.accent}80`;
            bar.style.transition = 'height 0.1s ease';
            
            visualizer.appendChild(bar);
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

    // Загрузка трека с плавным переходом
    function loadTrack(index) {
        if (index >= 0 && index < tracks.length && !isTransitioning) {
            const wasPlaying = isPlaying;
            
            if (wasPlaying) {
                audio.pause();
            }
            
            // Плавный переход к новой теме
            transitionToTheme(tracks[index].theme, () => {
                currentTrackIndex = index;
                audio.src = tracks[currentTrackIndex].path;
                currentTrack.textContent = tracks[currentTrackIndex].name;
                trackSelect.value = tracks[currentTrackIndex].path;
                
                audio.addEventListener('loadedmetadata', function() {
                    duration.textContent = formatTime(audio.duration);
                });
                
                if (wasPlaying) {
                    audio.play().then(() => {
                        isPlaying = true;
                        playPauseBtn.textContent = '⏸';
                        if (!analyser) initAudioAnalyzer();
                        visualize();
                    });
                }
            });
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
    });

    // Обработка изменения размера окна для визуализатора
    window.addEventListener('resize', function() {
        if (isPlaying && analyser) {
            visualize();
        }
    });

    // Инициализация
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
