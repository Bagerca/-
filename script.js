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

    // Обновленный массив треков с улучшенными темами
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
                primary: 'hsl(0, 0%, 0%)',
                secondary: 'hsl(0, 100%, 20%)',
                accent: 'hsl(0, 100%, 50%)'
            }
        },
        { 
            name: 'Taco - Puttin\' On The Ritz', 
            path: 'assets/Taco - Puttin\' On The Ritz.m4a',
            theme: {
                primary: 'hsl(220, 40%, 15%)',
                secondary: 'hsl(0, 0%, 20%)',
                accent: 'hsl(45, 100%, 50%)'
            }
        },
        { 
            name: 'The Cigarette Duet', 
            path: 'assets/The Cigarette Duet  Дуэт сигарет [Princess Chelsea] (Russian cover with ‪IgorCoolikov‬).m4a',
            theme: {
                primary: 'hsl(330, 70%, 75%)',
                secondary: 'hsl(25, 40%, 35%)',
                accent: 'hsl(330, 90%, 90%)'
            }
        },
        { 
            name: 'A Man Without Love', 
            path: 'assets/A Man Without Love LYRICS Video Engelbert Humperdinck 1968 🌙 Moon Knight Episode 1.m4a',
            theme: {
                primary: 'hsl(220, 30%, 95%)',
                secondary: 'hsl(220, 20%, 80%)',
                accent: 'hsl(220, 50%, 70%)'
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
        
        const particleCount = 20;
        const particleTypes = ['circle', 'glow', 'spiral', 'wave'];
        const currentTheme = tracks[currentTrackIndex].theme;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
            const size = Math.random() * 25 + 10;
            
            particle.className = `particle ${type}`;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = Math.random() * 100 + 'vh';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 8) + 's';
            
            // Улучшенные градиенты для частиц
            const hue = getHue(currentTheme.accent) + Math.random() * 60 - 30;
            const saturation = 70 + Math.random() * 30;
            
            if (type === 'glow') {
                particle.style.background = `radial-gradient(circle, 
                    hsla(${hue}, ${saturation}%, 70%, 0.9) 0%, 
                    hsla(${hue}, ${saturation}%, 60%, 0.6) 50%, 
                    transparent 100%)`;
                particle.style.boxShadow = `0 0 30px hsla(${hue}, ${saturation}%, 60%, 0.7)`;
            } else {
                particle.style.background = `radial-gradient(circle, 
                    hsla(${hue}, ${saturation}%, 70%, 0.8) 0%, 
                    hsla(${hue}, ${saturation}%, 60%, 0.5) 70%, 
                    transparent 100%)`;
                particle.style.boxShadow = `0 0 20px hsla(${hue}, ${saturation}%, 60%, 0.5)`;
            }
            
            particles.appendChild(particle);
            particleElements.push(particle);
        }
    }

    // Плавный переход между темами
    function transitionToTheme(newTheme, callback) {
        if (isTransitioning) return;
        isTransitioning = true;
        
        transitionOverlay.classList.add('active');
        
        setTimeout(() => {
            setTheme(newTheme);
            
            const playerContainer = document.querySelector('.player-container');
            playerContainer.classList.add('track-change-animation');
            
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
        
        createParticles();
    }

    // Инициализация аудиоанализатора
    function initAudioAnalyzer() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            analyser.fftSize = 256;
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
        } catch (error) {
            console.log('Audio analyzer initialization failed:', error);
        }
    }

    // Исправленная визуализация звука
    function visualize() {
        if (!analyser) return;
        
        try {
            analyser.getByteFrequencyData(dataArray);
            
            const bass = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10;
            const mids = dataArray.slice(10, 50).reduce((a, b) => a + b) / 40;
            const highs = dataArray.slice(50, 100).reduce((a, b) => a + b) / 50;
            
            const average = (bass + mids + highs) / 3;
            const intensity = average / 256;
            
            const currentTheme = tracks[currentTrackIndex].theme;
            const hueShift = intensity * 60;
            document.body.style.background = `linear-gradient(45deg, 
                hsl(${getHue(currentTheme.primary) + hueShift}, 70%, 50%), 
                hsl(${getHue(currentTheme.secondary) + hueShift}, 70%, 50%))`;
            
            animateParticles(bass, mids, highs);
            createFrequencyBars(dataArray, bass, mids, highs);
            
            if (isPlaying) {
                requestAnimationFrame(visualize);
            }
        } catch (error) {
            console.log('Visualization error:', error);
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
            
            if (particle.classList.contains('circle')) {
                particle.style.transform = `scale(${1 + bassEffect * 0.3})`;
            } else if (particle.classList.contains('glow')) {
                particle.style.opacity = 0.4 + midEffect * 0.6;
            } else if (particle.classList.contains('spiral')) {
                particle.style.filter = `hue-rotate(${mids}deg)`;
            } else if (particle.classList.contains('wave')) {
                particle.style.transform = `scale(${1 + bassEffect * 0.2})`;
            }
        });
    }

    // Исправленное создание частотных полос визуализатора
    function createFrequencyBars(dataArray, bass, mids, highs) {
        const barCount = 80;
        const containerWidth = visualizer.parentElement.offsetWidth;
        const barWidth = Math.max(2, (containerWidth - (barCount - 1) * 2) / barCount);
        const currentTheme = tracks[currentTrackIndex].theme;
        
        // Очищаем и создаем новые полосы
        if (visualizer.children.length !== barCount) {
            visualizer.innerHTML = '';
            for (let i = 0; i < barCount; i++) {
                const bar = document.createElement('div');
                bar.style.width = barWidth + 'px';
                bar.style.margin = '0 1px';
                bar.style.borderRadius = '2px 2px 0 0';
                bar.style.transition = 'height 0.1s ease';
                visualizer.appendChild(bar);
            }
        }
        
        // Обновляем высоту полос
        for (let i = 0; i < barCount; i++) {
            const barIndex = Math.floor(i * bufferLength / barCount);
            const barValue = dataArray[barIndex];
            const barHeight = Math.max(5, (barValue / 256) * 150);
            const bar = visualizer.children[i];
            
            const hue = getHue(currentTheme.accent) + (i * 3);
            bar.style.height = barHeight + 'px';
            bar.style.background = `linear-gradient(to top, 
                hsla(${hue}, 80%, 60%, 0.8), 
                hsla(${hue}, 80%, 70%, 1))`;
            bar.style.boxShadow = `0 0 10px hsla(${hue}, 80%, 60%, 0.6)`;
        }
    }

    // Форматирование времени
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Обновление прогресс-бара
    function updateProgress() {
        if (audio.duration && !isNaN(audio.duration)) {
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
            
            transitionToTheme(tracks[index].theme, () => {
                currentTrackIndex = index;
                audio.src = tracks[currentTrackIndex].path;
                currentTrack.textContent = tracks[currentTrackIndex].name;
                trackSelect.value = tracks[currentTrackIndex].path;
                
                const onLoaded = function() {
                    duration.textContent = formatTime(audio.duration);
                    audio.removeEventListener('loadedmetadata', onLoaded);
                };
                audio.addEventListener('loadedmetadata', onLoaded);
                
                if (wasPlaying) {
                    audio.play().then(() => {
                        isPlaying = true;
                        playPauseBtn.textContent = '⏸';
                        if (!analyser) initAudioAnalyzer();
                        visualize();
                    }).catch(console.error);
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

    // Сообщение о необходимости запуска (без inline стилей)
    function showPlayMessage() {
        const message = document.createElement('button');
        message.className = 'autoplay-message';
        message.textContent = '🎵 Нажмите для запуска музыки 🎵';
        
        message.addEventListener('click', function() {
            audio.play().then(() => {
                isPlaying = true;
                playPauseBtn.textContent = '⏸';
                if (!analyser) initAudioAnalyzer();
                visualize();
                message.remove();
            }).catch(console.error);
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
        if (audio.duration && !isNaN(audio.duration)) {
            audio.currentTime = (progressBar.value / 100) * audio.duration;
        }
    });

    audio.addEventListener('timeupdate', updateProgress);

    audio.addEventListener('ended', () => {
        let newIndex = currentTrackIndex + 1;
        if (newIndex >= tracks.length) newIndex = 0;
        loadTrack(newIndex);
    });

    // Обработка изменения размера окна
    window.addEventListener('resize', function() {
        if (isPlaying && analyser) {
            visualize();
        }
    });

    // Инициализация
    loadTrack(0);
    
    // Задержка для автовоспроизведения
    setTimeout(() => {
        attemptAutoplay();
    }, 1000);

    // Обработка первого клика для автовоспроизведения
    const firstClickHandler = function() {
        if (!isPlaying) {
            attemptAutoplay();
        }
        document.removeEventListener('click', firstClickHandler);
    };
    document.addEventListener('click', firstClickHandler);
});
