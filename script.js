document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const audio = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const trackSelect = document.getElementById('trackSelect');
    const currentTrack = document.getElementById('currentTrack');
    const currentArtist = document.getElementById('currentArtist');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const currentTime = document.getElementById('currentTime');
    const duration = document.getElementById('duration');
    const visualizer = document.getElementById('visualizer');
    const albumArt = document.getElementById('albumArt');
    const albumImage = document.getElementById('albumImage');
    const particles = document.getElementById('particles');
    const leftGlow = document.querySelector('.left-side .neon-glow');
    const rightGlow = document.querySelector('.right-side .neon-glow');

    // Массив треков
    const tracks = [
        { 
            name: 'Tangled Up', 
            artist: 'Caro Emerald',
            path: 'assets/Caro Emerald, Tangled Up (Lokee Remix).mp3',
            colors: {
                primary: '#1a1a2e',
                secondary: '#16213e',
                accent: '#ff9a00'
            },
            cover: 'https://i.scdn.co/image/ab67616d0000b273cd30153be1ecdfea9b4abf52',
            visualizer: ['#ff9a00', '#ff2e63'],
            neonColor: '#ff9a00'
        },
        { 
            name: 'Valhalla Calling', 
            artist: 'Miracle Of Sound',
            path: 'assets/VALHALLA_CALLING_by_Miracle_Of_Sound_ft_Peyton_Parrish_DUET_VERSION.mp3',
            colors: {
                primary: '#0f1b2e',
                secondary: '#1d2b64',
                accent: '#4a90e2'
            },
            cover: 'https://i.ytimg.com/vi/7Pf6jY9t_1I/maxresdefault.jpg',
            visualizer: ['#1d2b64', '#4a90e2'],
            neonColor: '#4a90e2'
        },
        { 
            name: 'Lust', 
            artist: 'Marino ft. Alexandria',
            path: 'assets/Marino - Lust (feat. Alexandria).m4a',
            colors: {
                primary: '#1a0a0a',
                secondary: '#330000',
                accent: '#ff0000'
            },
            cover: 'https://i.scdn.co/image/ab67616d0000b273c10ff9923331db1916236dba',
            visualizer: ['#870000', '#ff0000'],
            neonColor: '#ff0000'
        },
        { 
            name: 'Puttin\' On The Ritz', 
            artist: 'Taco',
            path: 'assets/Taco - Puttin\' On The Ritz.m4a',
            colors: {
                primary: '#0a0a14',
                secondary: '#1a1a2e',
                accent: '#ffd700'
            },
            cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/dc/d5/1d/dcd51dee-de60-400c-f97a-6d3cb5c92b60/cover.jpg/600x600bf-60.jpg',
            visualizer: ['#141e30', '#ffd700'],
            neonColor: '#ffd700'
        },
        { 
            name: 'The Cigarette Duet', 
            artist: 'Princess Chelsea',
            path: 'assets/The Cigarette Duet  Дуэт сигарет [Princess Chelsea] (Russian cover with ‪IgorCoolikov‬).m4a',
            colors: {
                primary: '#2d1b2e',
                secondary: '#4a2c4d',
                accent: '#e84178'
            },
            cover: 'https://i.discogs.com/nKwEjkfokl7jQ0lAVt0lS4nYL5-VIS9FCWXO7qrQXXA/rs:fit/g:sm/q:90/h:600/w:585/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTY5MzEw/NjYtMTQ4OTY3NDIx/MS04MDU5LmpwZWc.jpeg',
            visualizer: ['#6d214f', '#e84178'],
            neonColor: '#e84178'
        },
        { 
            name: 'A Man Without Love', 
            artist: 'Engelbert Humperdinck',
            path: 'assets/A Man Without Love LYRICS Video Engelbert Humperdinck 1968 🌙 Moon Knight Episode 1.m4a',
            colors: {
                primary: '#0f1c2e',
                secondary: '#1f3a5c',
                accent: '#4ca1af'
            },
            cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/15/8d/e3/158de33b-a496-56f7-c302-002978906503/00602557548259.rgb.jpg/600x600bf-60.jpg',
            visualizer: ['#2c3e50', '#4ca1af'],
            neonColor: '#4ca1af'
        }
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;
    let audioContext, analyser, dataArray, bufferLength;
    let visualizerBars = [];
    let wasPlayingBeforeSwitch = false;
    let animationId = null;

    // Создание визуализатора
    function createVisualizer() {
        visualizer.innerHTML = '';
        visualizerBars = [];
        
        for (let i = 0; i < 40; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            bar.style.height = '5px';
            visualizer.appendChild(bar);
            visualizerBars.push(bar);
        }
    }

    // Инициализация аудиоанализатора
    function initAudioAnalyzer() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            analyser.fftSize = 128;
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
        } catch (error) {
            console.error('Audio analyzer initialization failed:', error);
        }
    }

    // Визуализация звука
    function visualize() {
        if (!analyser) return;
        
        try {
            analyser.getByteFrequencyData(dataArray);
            
            // Обновление визуализатора
            for (let i = 0; i < visualizerBars.length; i++) {
                const barIndex = Math.floor(i * 1.5);
                const value = dataArray[barIndex] / 255;
                const height = Math.max(5, Math.min(70, value * 70));
                visualizerBars[i].style.height = `${height}px`;
                
                const currentColors = tracks[currentTrackIndex].visualizer;
                visualizerBars[i].style.background = `linear-gradient(to top, ${currentColors[0]}, ${currentColors[1]})`;
            }
            
            // Логика для неоновых линий
            const bass = dataArray.slice(0, 20).reduce((a, b) => a + b) / 20;
            const mid = dataArray.slice(20, 60).reduce((a, b) => a + b) / 40;
            const high = dataArray.slice(60, 100).reduce((a, b) => a + b) / 40;
            
            // Комбинируем частоты для лучшего отклика
            const intensity = Math.min(1, (bass * 0.6 + mid * 0.3 + high * 0.1) / 180);
            
            // Вычисляем высоту линий (максимальная высота = 100% - 40px, чтобы не заходить на закругления)
            const maxHeight = 100; // 100% от контейнера
            const lineHeight = Math.min(maxHeight, Math.pow(intensity * 1.5, 1.2) * maxHeight);
            
            // Обновляем неоновые линии
            if (leftGlow && rightGlow) {
                leftGlow.style.height = `${lineHeight}%`;
                rightGlow.style.height = `${lineHeight}%`;
                
                // Динамическое изменение интенсивности свечения
                const glowIntensity = 0.6 + intensity * 0.4;
                leftGlow.style.opacity = glowIntensity;
                rightGlow.style.opacity = glowIntensity;
                
                // Динамическое изменение тени в зависимости от интенсивности
                const shadowBlur = 10 + intensity * 20;
                const shadowSpread = 5 + intensity * 15;
                leftGlow.style.boxShadow = 
                    `0 0 ${shadowBlur}px var(--neon-color),
                     0 0 ${shadowBlur * 2}px var(--neon-color),
                     0 0 ${shadowBlur * 3}px var(--neon-color)`;
                rightGlow.style.boxShadow = 
                    `0 0 ${shadowBlur}px var(--neon-color),
                     0 0 ${shadowBlur * 2}px var(--neon-color),
                     0 0 ${shadowBlur * 3}px var(--neon-color)`;
            }
            
            if (isPlaying) {
                animationId = requestAnimationFrame(visualize);
            }
        } catch (error) {
            console.error('Visualization error:', error);
        }
    }

    // Создание частиц
    function createParticles() {
        particles.innerHTML = '';
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 20 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${Math.random() * 100}vh`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            particle.style.background = tracks[currentTrackIndex].colors.accent;
            
            particles.appendChild(particle);
        }
    }

    // Обновление темы
    function updateTheme() {
        const currentColors = tracks[currentTrackIndex].colors;
        const neonColor = tracks[currentTrackIndex].neonColor;
        
        // Фон
        document.body.style.background = `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.secondary} 100%)`;
        
        // Прогресс-бар
        progress.style.background = `linear-gradient(90deg, ${currentColors.accent}, ${currentColors.primary})`;
        
        // Кнопка play/pause
        playPauseBtn.style.background = `linear-gradient(135deg, ${currentColors.accent}, ${currentColors.primary})`;
        
        // Неоновые линии
        document.documentElement.style.setProperty('--neon-color', neonColor);
        document.documentElement.style.setProperty('--accent-color', currentColors.accent);
        
        // Динамическое обновление стилей для неоновых линий
        const style = document.createElement('style');
        style.textContent = `
            .volume-slider::-webkit-slider-thumb {
                background: ${currentColors.accent};
            }
            .neon-glow {
                background: ${neonColor};
                box-shadow: 
                    0 0 10px ${neonColor},
                    0 0 20px ${neonColor},
                    0 0 30px ${neonColor};
            }
        `;
        
        // Удаляем старые стили перед добавлением новых
        const oldStyle = document.getElementById('dynamic-neon-styles');
        if (oldStyle) oldStyle.remove();
        
        style.id = 'dynamic-neon-styles';
        document.head.appendChild(style);
        
        // Обложка
        albumImage.style.backgroundImage = `url('${tracks[currentTrackIndex].cover}')`;
        
        // Пересоздание частиц с новыми цветами
        createParticles();
        
        // Сброс неоновых линий при смене трека
        if (leftGlow && rightGlow) {
            leftGlow.style.height = '0%';
            rightGlow.style.height = '0%';
            leftGlow.style.opacity = '0.8';
            rightGlow.style.opacity = '0.8';
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
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progress.style.width = `${progressPercent}%`;
            currentTime.textContent = formatTime(audio.currentTime);
        }
    }

    // Загрузка трека
    function loadTrack(index, autoPlay = false) {
        if (index >= 0 && index < tracks.length) {
            currentTrackIndex = index;
            const track = tracks[currentTrackIndex];
            
            // Сохраняем состояние воспроизведения
            wasPlayingBeforeSwitch = isPlaying;
            
            // Останавливаем текущее воспроизведение перед загрузкой нового трека
            audio.pause();
            isPlaying = false;
            playPauseBtn.textContent = '▶';
            
            // Отменяем предыдущую анимацию
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            
            audio.src = track.path;
            currentTrack.textContent = track.name;
            currentArtist.textContent = track.artist;
            trackSelect.value = track.path;
            
            updateTheme();
            
            const onLoaded = function() {
                duration.textContent = formatTime(audio.duration);
                audio.removeEventListener('loadedmetadata', onLoaded);
                
                // Автоматически воспроизводим, если нужно
                if (autoPlay || wasPlayingBeforeSwitch) {
                    setTimeout(() => {
                        audio.play().then(() => {
                            isPlaying = true;
                            playPauseBtn.textContent = '⏸';
                            if (!analyser) initAudioAnalyzer();
                            visualize();
                        }).catch(error => {
                            console.error('Playback failed:', error);
                            showPlayMessage();
                        });
                    }, 100);
                }
            };
            audio.addEventListener('loadedmetadata', onLoaded);
        }
    }

    // Перемотка вперед/назад
    function seek(seconds) {
        if (audio.duration) {
            audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
        }
    }

    // Плавное изменение громкости
    function smoothVolumeChange() {
        let targetVolume = volumeSlider.value / 100;
        const currentVolume = audio.volume;
        const diff = targetVolume - currentVolume;
        
        if (Math.abs(diff) > 0.01) {
            audio.volume = currentVolume + diff * 0.1;
            setTimeout(smoothVolumeChange, 50);
        }
    }

    // Попытка автовоспроизведения
    function attemptAutoplay() {
        // Сбрасываем текущее время трека перед воспроизведением
        audio.currentTime = 0;
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                playPauseBtn.textContent = '⏸';
                if (!analyser) initAudioAnalyzer();
                visualize();
            }).catch(error => {
                console.log('Autoplay blocked, showing message');
                showPlayMessage();
            });
        }
    }

    // Сообщение о необходимости запуска
    function showPlayMessage() {
        const message = document.createElement('button');
        message.className = 'autoplay-message';
        message.textContent = 'Нажмите для запуска музыки';
        
        message.addEventListener('click', function() {
            audio.play().then(() => {
                isPlaying = true;
                playPauseBtn.textContent = '⏸';
                if (!analyser) initAudioAnalyzer();
                visualize();
                message.remove();
            }).catch(error => {
                console.error('Playback failed:', error);
            });
        });
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (document.body.contains(message)) {
                message.remove();
            }
        }, 8000);
    }

    // Обработчики событий
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            playPauseBtn.textContent = '▶';
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        } else {
            audio.play().then(() => {
                isPlaying = true;
                playPauseBtn.textContent = '⏸';
                if (!analyser) initAudioAnalyzer();
                visualize();
            }).catch(error => {
                console.error('Playback failed:', error);
                showPlayMessage();
            });
        }
    });

    prevBtn.addEventListener('click', () => {
        let newIndex = currentTrackIndex - 1;
        if (newIndex < 0) newIndex = tracks.length - 1;
        loadTrack(newIndex, true);
    });

    nextBtn.addEventListener('click', () => {
        let newIndex = currentTrackIndex + 1;
        if (newIndex >= tracks.length) newIndex = 0;
        loadTrack(newIndex, true);
    });

    trackSelect.addEventListener('change', function() {
        const selectedPath = this.value;
        const trackIndex = tracks.findIndex(track => track.path === selectedPath);
        if (trackIndex !== -1) {
            loadTrack(trackIndex, true);
        }
    });

    volumeSlider.addEventListener('input', () => {
        smoothVolumeChange();
    });

    progressBar.addEventListener('click', (e) => {
        if (audio.duration) {
            const clickX = e.offsetX;
            const width = progressBar.offsetWidth;
            const clickTime = (clickX / width) * audio.duration;
            audio.currentTime = clickTime;
        }
    });

    // Обработка клавиатуры
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
                seek(-5);
                break;
            case 'ArrowRight':
                seek(5);
                break;
            case 'ArrowUp':
                volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 10);
                smoothVolumeChange();
                break;
            case 'ArrowDown':
                volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 10);
                smoothVolumeChange();
                break;
            case ' ':
                e.preventDefault();
                playPauseBtn.click();
                break;
        }
    });

    audio.addEventListener('timeupdate', updateProgress);

    audio.addEventListener('ended', () => {
        let newIndex = currentTrackIndex + 1;
        if (newIndex >= tracks.length) newIndex = 0;
        loadTrack(newIndex, true);
    });

    // Обработка ошибок аудио
    audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
    });

    // Инициализация
    createVisualizer();
    loadTrack(0);
    
    // Автовоспроизведение с задержкой
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
