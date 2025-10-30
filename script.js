document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Базовые элементы DOM
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
    const albumImage = document.getElementById('albumImage');
    
    // Проверяем, что все элементы найдены
    if (!audio || !playPauseBtn || !visualizer) {
        console.error('Не найдены основные элементы DOM');
        return;
    }

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
        }
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;
    let audioContext, analyser, dataArray, bufferLength;
    let visualizerBars = [];
    let animationId = null;

    // Создание визуализатора
    function createVisualizer() {
        visualizer.innerHTML = '';
        visualizerBars = [];
        
        for (let i = 0; i < 30; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            bar.style.height = '1px';
            visualizer.appendChild(bar);
            visualizerBars.push(bar);
        }
    }

    // Инициализация аудиоанализатора
    function initAudioAnalyzer() {
        try {
            if (audioContext) return;
            
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            analyser.fftSize = 256;
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
        } catch (error) {
            console.error('Audio analyzer initialization failed:', error);
        }
    }

    // Визуализация звука
    function visualize() {
        if (!analyser || !isPlaying) return;
        
        try {
            analyser.getByteFrequencyData(dataArray);
            
            // Обновление визуализатора
            for (let i = 0; i < visualizerBars.length; i++) {
                const barIndex = Math.floor((i / visualizerBars.length) * bufferLength);
                const value = dataArray[barIndex] / 255;
                const height = 1 + (value * 69); // От 1px до 70px
                visualizerBars[i].style.height = `${height}px`;
            }
            
            animationId = requestAnimationFrame(visualize);
        } catch (error) {
            console.error('Visualization error:', error);
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }
    }

    // Обновление темы
    function updateTheme() {
        const currentColors = tracks[currentTrackIndex].colors;
        const neonColor = tracks[currentTrackIndex].neonColor;
        const visualizerColors = tracks[currentTrackIndex].visualizer;
        
        // Фон
        document.body.style.background = `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.secondary} 100%)`;
        
        // Прогресс-бар
        if (progress) {
            progress.style.background = `linear-gradient(90deg, ${currentColors.accent}, ${currentColors.primary})`;
        }
        
        // Кнопка play/pause
        if (playPauseBtn) {
            playPauseBtn.style.background = `linear-gradient(135deg, ${currentColors.accent}, ${currentColors.primary})`;
        }
        
        // Цвета визуализатора
        document.documentElement.style.setProperty('--visualizer-color-1', visualizerColors[0]);
        document.documentElement.style.setProperty('--visualizer-color-2', visualizerColors[1]);
        document.documentElement.style.setProperty('--neon-color', neonColor);
        document.documentElement.style.setProperty('--accent-color', currentColors.accent);
        
        // Обложка
        if (albumImage) {
            albumImage.style.backgroundImage = `url('${tracks[currentTrackIndex].cover}')`;
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
            if (progress) {
                progress.style.width = `${progressPercent}%`;
            }
            if (currentTime) {
                currentTime.textContent = formatTime(audio.currentTime);
            }
        }
    }

    // Загрузка трека
    function loadTrack(index, autoPlay = false) {
        if (index >= 0 && index < tracks.length) {
            currentTrackIndex = index;
            const track = tracks[currentTrackIndex];
            
            // Останавливаем текущее воспроизведение
            audio.pause();
            isPlaying = false;
            if (playPauseBtn) {
                playPauseBtn.textContent = '▶';
            }
            
            // Отменяем предыдущую анимацию
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            
            audio.src = track.path;
            if (currentTrack) currentTrack.textContent = track.name;
            if (currentArtist) currentArtist.textContent = track.artist;
            if (trackSelect) trackSelect.value = track.path;
            
            updateTheme();
            
            const onLoaded = function() {
                if (duration) {
                    duration.textContent = formatTime(audio.duration);
                }
                audio.removeEventListener('loadedmetadata', onLoaded);
                
                if (autoPlay) {
                    setTimeout(() => {
                        playTrack();
                    }, 100);
                }
            };
            
            if (audio.readyState >= 1) {
                onLoaded();
            } else {
                audio.addEventListener('loadedmetadata', onLoaded);
            }
        }
    }

    // Воспроизведение трека
    function playTrack() {
        audio.play().then(() => {
            isPlaying = true;
            if (playPauseBtn) {
                playPauseBtn.textContent = '⏸';
            }
            if (!analyser) {
                initAudioAnalyzer();
            }
            visualize();
        }).catch(error => {
            console.error('Playback failed:', error);
        });
    }

    // Обработчики событий
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (isPlaying) {
                audio.pause();
                isPlaying = false;
                playPauseBtn.textContent = '▶';
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            } else {
                playTrack();
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            let newIndex = currentTrackIndex - 1;
            if (newIndex < 0) newIndex = tracks.length - 1;
            loadTrack(newIndex, true);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            let newIndex = currentTrackIndex + 1;
            if (newIndex >= tracks.length) newIndex = 0;
            loadTrack(newIndex, true);
        });
    }

    if (trackSelect) {
        trackSelect.addEventListener('change', function() {
            const selectedPath = this.value;
            const trackIndex = tracks.findIndex(track => track.path === selectedPath);
            if (trackIndex !== -1) {
                loadTrack(trackIndex, true);
            }
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', () => {
            audio.volume = volumeSlider.value / 100;
        });
    }

    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            if (audio.duration) {
                const clickX = e.offsetX;
                const width = progressBar.offsetWidth;
                const clickTime = (clickX / width) * audio.duration;
                audio.currentTime = clickTime;
            }
        });
    }

    // Обработка клавиатуры
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
                if (audio.duration) {
                    audio.currentTime = Math.max(0, audio.currentTime - 5);
                }
                break;
            case 'ArrowRight':
                if (audio.duration) {
                    audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
                }
                break;
            case 'ArrowUp':
                if (volumeSlider) {
                    volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 10);
                    audio.volume = volumeSlider.value / 100;
                }
                break;
            case 'ArrowDown':
                if (volumeSlider) {
                    volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 10);
                    audio.volume = volumeSlider.value / 100;
                }
                break;
            case ' ':
                e.preventDefault();
                if (playPauseBtn) playPauseBtn.click();
                break;
        }
    });

    audio.addEventListener('timeupdate', updateProgress);

    audio.addEventListener('ended', () => {
        let newIndex = currentTrackIndex + 1;
        if (newIndex >= tracks.length) newIndex = 0;
        loadTrack(newIndex, true);
    });

    // Инициализация
    createVisualizer();
    loadTrack(0);
    
    // Попытка автовоспроизведения
    setTimeout(() => {
        audio.play().then(() => {
            isPlaying = true;
            if (playPauseBtn) playPauseBtn.textContent = '⏸';
            if (!analyser) initAudioAnalyzer();
            visualize();
        }).catch(error => {
            console.log('Autoplay blocked');
        });
    }, 1000);
});
