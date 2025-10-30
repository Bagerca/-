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

    // Массив треков с цветовыми темами
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
                primary: 'hsl(320, 70%, 40%)',
                secondary: 'hsl(350, 70%, 50%)',
                accent: 'hsl(20, 90%, 60%)'
            }
        },
        { 
            name: 'Taco - Puttin\' On The Ritz', 
            path: 'assets/Taco - Puttin\' On The Ritz.m4a',
            theme: {
                primary: 'hsl(50, 80%, 50%)',
                secondary: 'hsl(80, 70%, 40%)',
                accent: 'hsl(120, 90%, 60%)'
            }
        },
        { 
            name: 'The Cigarette Duet', 
            path: 'assets/The Cigarette Duet  Дуэт сигарет [Princess Chelsea] (Russian cover with ‪IgorCoolikov‬).m4a',
            theme: {
                primary: 'hsl(280, 50%, 30%)',
                secondary: 'hsl(200, 40%, 40%)',
                accent: 'hsl(160, 60%, 50%)'
            }
        }
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;
    let audioContext, analyser, dataArray, bufferLength;
    let particleElements = [];
    let isTransitioning = false;

    // Создание улучшенных частиц
    function createParticles() {
        particles.innerHTML = '';
        particleElements = [];
        
        const particleCount = 30;
        const particleTypes = ['type1', 'type2', 'type3', 'type4'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
            const size = Math.random() * 25 + 5;
            
            particle.className = `particle ${type}`;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = Math.random() * 100 + 'vh';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 8) + 's';
            particle.style.background = `radial-gradient(circle, 
                rgba(255,255,255,0.8) 0%, 
                rgba(255,255,255,0.4) 50%, 
                rgba(255,255,255,0.2) 100%)`;
            particle.style.filter = 'blur(1px)';
            
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
        
        // Обновляем цвет частиц
        particleElements.forEach(particle => {
            particle.style.background = `radial-gradient(circle, 
                ${theme.accent}80 0%, 
                ${theme.secondary}60 50%, 
                ${theme.primary}40 100%)`;
        });
    }

    // Инициализация аудиоанализатора
    function initAudioAnalyzer() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        analyser.fftSize = 512;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
    }

    // Визуализация звука с улучшенными эффектами
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
        
        // Создание визуализатора с разными стилями для частот
        visualizer.innerHTML = '';
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
                particle.style.filter = `blur(${1 + bassEffect * 3}px) hue-rotate(${mids}deg)`;
            }
        });
    }

    // Создание частотных полос визуализатора
    function createFrequencyBars(dataArray, bass, mids, highs) {
        const barCount = 80;
        const visualizerWidth = visualizer.offsetWidth;
        const barWidth = visualizerWidth / barCount;
        const currentTheme = tracks[currentTrackIndex].theme;
        
        for (let i = 0; i < barCount; i++) {
            const barValue = dataArray[Math.floor(i * bufferLength / barCount)];
            const barHeight = (barValue / 256) * 200;
            const hue = getHue(currentTheme.accent) + (i * 360 / barCount);
            
            const bar = document.createElement('div');
            bar.style.position = 'absolute';
            bar.style.left = i * barWidth + 'px';
            bar.style.bottom = '0';
            bar.style.width = (barWidth - 1) + 'px';
            bar.style.height = barHeight + 'px';
            bar.style.background = `hsl(${hue}, 80%, 60%)`;
            bar.style.borderRadius = '2px 2px 0 0';
            bar.style.boxShadow = `0 0 10px hsl(${hue}, 80%, 60%)`;
            bar.style.transform = `scaleY(${1 + (bass / 256) * 0.5})`;
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
