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
    const neonLines = [
        document.getElementById('neonLine1'),
        document.getElementById('neonLine2'),
        document.getElementById('neonLine3')
    ];

    // Массив треков с улучшенными цветовыми схемами и обложками
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
            cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
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
            cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
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
            cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
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
            cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
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
            cover: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
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
            cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            visualizer: ['#2c3e50', '#4ca1af'],
            neonColor: '#4ca1af'
        }
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;
    let audioContext, analyser, dataArray, bufferLength;
    let visualizerBars = [];
    let wasPlayingBeforeSwitch = false;

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
                
                // Цвета из текущего трека
                const currentColors = tracks[currentTrackIndex].visualizer;
                visualizerBars[i].style.background = `linear-gradient(to top, ${currentColors[0]}, ${currentColors[1]})`;
            }
            
            // Обновление неоновых линий
            const bass = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10;
            const mids = dataArray.slice(10, 50).reduce((a, b) => a + b) / 40;
            const highs = dataArray.slice(50, 100).reduce((a, b) => a + b) / 50;
            
            // Анимация линий в зависимости от частот
            neonLines[0].style.height = `${Math.max(10, (bass / 256) * 150)}px`;
            neonLines[1].style.height = `${Math.max(10, (mids / 256) * 150)}px`;
            neonLines[2].style.height = `${Math.max(10, (highs / 256) * 150)}px`;
            
            if (isPlaying) {
                requestAnimationFrame(visualize);
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
        
        // Ползунок громкости
        const style = document.createElement('style');
        style.textContent = `
            .volume-slider::-webkit-slider-thumb {
                background: ${currentColors.accent};
            }
        `;
        document.head.appendChild(style);
        
        // Обложка
        albumImage.style.backgroundImage = `url('${tracks[currentTrackIndex].cover}')`;
        
        // Пересоздание частиц с новыми цветами
        createParticles();
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

    // Изменение громкости
    function changeVolume(delta) {
        const newVolume = Math.max(0, Math.min(1, audio.volume + delta));
        audio.volume = newVolume;
        volumeSlider.value = newVolume * 100;
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
        audio.volume = volumeSlider.value / 100;
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
                changeVolume(0.1);
                break;
            case 'ArrowDown':
                changeVolume(-0.1);
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
