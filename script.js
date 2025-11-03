document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const audio = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const trackListBtn = document.getElementById('trackListBtn');
    const playbackModeBtn = document.getElementById('playbackModeBtn');
    const volumeSlider = document.getElementById('volumeSlider');
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
    const leftGlow = document.getElementById('leftGlow');
    const rightGlow = document.getElementById('rightGlow');
    const playerContainer = document.getElementById('playerContainer');
    const trackListPanel = document.getElementById('trackListPanel');
    const trackList = document.getElementById('trackList');
    const trackSearch = document.getElementById('trackSearch');

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
            cover: 'picture/TangledUp.jpg',
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
            cover: 'picture/ValhallaCalling.jpeg',
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
            cover: 'picture/Lust.jpeg',
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
            cover: 'picture/Puttin On The Ritz.jpg',
            visualizer: ['#141e30', '#ffd700'],
            neonColor: '#ffd700'
        },
        { 
            name: 'The Cigarette Duet (Cover)', 
            artist: 'Princess Chelsea',
            path: 'assets/The Cigarette Duet  Дуэт сигарет [Princess Chelsea] (Russian cover with ‪IgorCoolikov‬).m4a',
            colors: {
                primary: '#2d1b2e',
                secondary: '#4a2c4d',
                accent: '#e84178'
            },
            cover: 'picture/The Cigarette Duet.jpg',
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
            cover: 'picture/A Man Without Love.jpg',
            visualizer: ['#2c3e50', '#4ca1af'],
            neonColor: '#4ca1af'
        }
    ];

    // === ОПТИМИЗАЦИЯ 1: Предварительная инициализация анализатора ===
    let audioContext, analyser, dataArray, bufferLength, audioSource;
    
    // Инициализация аудио системы один раз
    function initAudioSystem() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            
            // Создаем источник один раз и переиспользуем
            audioSource = audioContext.createMediaElementSource(audio);
            audioSource.connect(analyser);
            analyser.connect(audioContext.destination);
            
            analyser.fftSize = 256;
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            
            console.log('Audio system initialized');
        } catch (error) {
            console.error('Audio system initialization failed:', error);
        }
    }

    // === ОПТИМИЗАЦИЯ 2: Предзагрузка треков ===
    const preloadedTracks = new Map();
    
    function preloadTrack(index) {
        return new Promise((resolve) => {
            if (preloadedTracks.has(index)) {
                resolve(preloadedTracks.get(index));
                return;
            }
            
            const track = tracks[index];
            const audioEl = new Audio();
            audioEl.src = track.path;
            audioEl.preload = 'metadata';
            
            const onLoaded = () => {
                preloadedTracks.set(index, {
                    ...track,
                    audioElement: audioEl,
                    duration: audioEl.duration,
                    ready: true
                });
                resolve(preloadedTracks.get(index));
                audioEl.removeEventListener('loadedmetadata', onLoaded);
            };
            
            if (audioEl.readyState >= 1) {
                onLoaded();
            } else {
                audioEl.addEventListener('loadedmetadata', onLoaded);
            }
            
            // Таймаут на случай ошибки
            setTimeout(() => {
                if (!preloadedTracks.has(index)) {
                    preloadedTracks.set(index, {
                        ...track,
                        audioElement: audioEl,
                        duration: 0,
                        ready: false
                    });
                    resolve(preloadedTracks.get(index));
                }
            }, 1000);
        });
    }
    
    // Предзагрузка соседних треков
    function preloadAdjacentTracks(currentIndex) {
        const indicesToPreload = [
            (currentIndex - 1 + tracks.length) % tracks.length,
            (currentIndex + 1) % tracks.length,
            (currentIndex + 2) % tracks.length
        ];
        
        indicesToPreload.forEach(index => {
            if (!preloadedTracks.has(index)) {
                preloadTrack(index);
            }
        });
    }

    let currentTrackIndex = 0;
    let isPlaying = false;
    let isTrackListOpen = false;
    
    // Режимы воспроизведения
    const PLAYBACK_MODES = {
        PLAYLIST: 0,
        SINGLE: 1,
        ONCE: 2
    };
    
    let playbackMode = PLAYBACK_MODES.PLAYLIST;
    
    let visualizerBars = [];
    let animationId = null;
    
    // Переменные для ритмичного свечения
    let beatDetected = false;
    let lastBeatTime = 0;
    let beatThreshold = 0.7;
    let currentPulseIntensity = 0;

    // === ОПТИМИЗАЦИЯ 4: Оптимизация частиц ===
    let particlesData = [];
    let cornerParticlesData = [];
    let isParticlesTransitioning = false;
    let currentMusicIntensity = 0;

    // Переменные для расширенного анализа
    let energyHistory = [];
    let energyAverage = 0;
    let spectralCentroid = 0;
    let isBeat = false;
    let beatCooldown = 0;

    // Переменные для эффектов краев экрана
    let sparkParticles = [];
    let lastSparkTime = 0;
    let sparkCooldown = 0;
    let energySurgeActive = false;
    let energySurgeIntensity = 0;

    // Переменные для краевого свечения
    let edgeGlowElements = {};
    let edgeGlowIntensity = 0;

    // Частотные диапазоны
    const FREQ_RANGES = {
        BASS: { start: 0, end: 10 },
        MID: { start: 10, end: 20 },
        HIGH: { start: 20, end: 30 }
    };

    // Функция для обновления отображения кнопки режима воспроизведения
    function updatePlaybackModeButton() {
        const icon = playbackModeBtn.querySelector('svg');
        switch(playbackMode) {
            case PLAYBACK_MODES.PLAYLIST:
                icon.innerHTML = '<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>';
                playbackModeBtn.title = 'Режим повтора: Весь плейлист';
                break;
            case PLAYBACK_MODES.SINGLE:
                icon.innerHTML = '<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>';
                playbackModeBtn.title = 'Режим повтора: Один трек';
                break;
            case PLAYBACK_MODES.ONCE:
                icon.innerHTML = '<path d="M5.64 3.64l1.42-1.42L20.36 18.22l-1.42 1.42L5.64 3.64zM7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>';
                playbackModeBtn.title = 'Режим воспроизведения: Один трек';
                break;
        }
        
        playbackModeBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            playbackModeBtn.style.transform = 'scale(1)';
        }, 200);
    }

    // Функция для переключения режима воспроизведения
    function togglePlaybackMode() {
        playbackMode = (playbackMode + 1) % 3;
        updatePlaybackModeButton();
    }

    // Функция для обновления ползунка громкости
    function updateVolumeSlider() {
        const volumeValue = volumeSlider.value;
        const accentColor = tracks[currentTrackIndex].colors.accent;
        
        volumeSlider.style.background = `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${volumeValue}%, rgba(255, 255, 255, 0.1) ${volumeValue}%, rgba(255, 255, 255, 0.1) 100%)`;
    }

    // Создание визуализатора
    function createVisualizer() {
        visualizer.innerHTML = '';
        visualizerBars = [];
        
        for (let i = 0; i < 30; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            bar.style.height = '5px';
            bar.style.alignSelf = 'flex-end';
            visualizer.appendChild(bar);
            visualizerBars.push(bar);
        }
    }

    // Получение энергии по частотным диапазонам
    function getFrequencyEnergy(range) {
        let sum = 0;
        const count = range.end - range.start;
        for (let i = range.start; i < range.end; i++) {
            sum += dataArray[i];
        }
        return sum / count / 255;
    }

    // Функция для анализа спектральных характеристик
    function analyzeSpectralFeatures() {
        if (!analyser || !dataArray) return;
        
        const bassEnergy = getFrequencyEnergy(FREQ_RANGES.BASS);
        const midEnergy = getFrequencyEnergy(FREQ_RANGES.MID);
        const highEnergy = getFrequencyEnergy(FREQ_RANGES.HIGH);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / bufferLength) / 255;
        
        energyHistory.push(rms);
        if (energyHistory.length > 30) {
            energyHistory.shift();
        }
        
        energyAverage = energyHistory.reduce((a, b) => a + b) / energyHistory.length;
        
        let weightedSum = 0;
        let energySum = 0;
        for (let i = 0; i < bufferLength; i++) {
            weightedSum += i * dataArray[i];
            energySum += dataArray[i];
        }
        spectralCentroid = energySum > 0 ? weightedSum / energySum : 0;
        
        const currentTime = Date.now();
        isBeat = false;
        if (beatCooldown <= 0) {
            const threshold = energyAverage * 1.4 + 0.15;
            if (bassEnergy > threshold && (currentTime - lastBeatTime) > 200) {
                isBeat = true;
                lastBeatTime = currentTime;
                currentPulseIntensity = 1.0;
                beatCooldown = 8;
            }
        } else {
            beatCooldown--;
        }
        
        return {
            rms,
            bassEnergy,
            midEnergy,
            highEnergy,
            spectralCentroid,
            isBeat
        };
    }

    // Плавное затухание пульсации
    function updatePulseIntensity() {
        if (currentPulseIntensity > 0) {
            currentPulseIntensity -= 0.08;
            if (currentPulseIntensity < 0) currentPulseIntensity = 0;
        }
        beatDetected = false;
    }

    // === ОПТИМИЗАЦИЯ 3: Плавный переход визуализации ===
    let isVisualizationTransitioning = false;
    let targetColors = null;
    let currentColors = null;
    let colorTransitionProgress = 0;

    function smoothColorTransition(startColor, endColor, progress) {
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? [
                parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16)
            ] : [0, 0, 0];
        };

        const rgbToHex = (r, g, b) => {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        };

        const startRgb = hexToRgb(startColor);
        const endRgb = hexToRgb(endColor);

        const r = Math.round(startRgb[0] + (endRgb[0] - startRgb[0]) * progress);
        const g = Math.round(startRgb[1] + (endRgb[1] - startRgb[1]) * progress);
        const b = Math.round(startRgb[2] + (endRgb[2] - startRgb[2]) * progress);

        return rgbToHex(r, g, b);
    }

    // Визуализация звука с плавными переходами
    function visualize() {
        if (!analyser || !isPlaying) return;
        
        try {
            analyser.getByteFrequencyData(dataArray);
            const features = analyzeSpectralFeatures();
            
            // Плавный переход цветов
            if (isVisualizationTransitioning && targetColors) {
                colorTransitionProgress += 0.05;
                if (colorTransitionProgress >= 1) {
                    colorTransitionProgress = 1;
                    isVisualizationTransitioning = false;
                    currentColors = targetColors;
                    targetColors = null;
                }
                
                const transitionColors = [
                    smoothColorTransition(currentColors[0], targetColors[0], colorTransitionProgress),
                    smoothColorTransition(currentColors[1], targetColors[1], colorTransitionProgress)
                ];
                
                // Обновление визуализатора с переходом цветов
                for (let i = 0; i < visualizerBars.length; i++) {
                    const barIndex = Math.floor((i / visualizerBars.length) * bufferLength);
                    const value = dataArray[barIndex] / 255;
                    
                    let baseHeight = Math.max(5, value * 110);
                    
                    if (i < 10) {
                        const bassBoost = features.bassEnergy * 25;
                        const beatBoost = features.isBeat ? currentPulseIntensity * 40 : 0;
                        baseHeight += bassBoost + beatBoost;
                    } else if (i < 20) {
                        const midBoost = features.midEnergy * 18;
                        const energyBoost = features.rms * 12;
                        baseHeight += midBoost + energyBoost;
                    } else {
                        const highBoost = features.highEnergy * 20;
                        baseHeight += highBoost;
                    }
                    
                    visualizerBars[i].style.height = `${baseHeight}px`;
                    visualizerBars[i].style.background = `linear-gradient(to top, ${transitionColors[0]}, ${transitionColors[1]})`;
                }
            } else {
                // Стандартное обновление
                for (let i = 0; i < visualizerBars.length; i++) {
                    const barIndex = Math.floor((i / visualizerBars.length) * bufferLength);
                    const value = dataArray[barIndex] / 255;
                    
                    let baseHeight = Math.max(5, value * 110);
                    
                    if (i < 10) {
                        const bassBoost = features.bassEnergy * 25;
                        const beatBoost = features.isBeat ? currentPulseIntensity * 40 : 0;
                        baseHeight += bassBoost + beatBoost;
                    } else if (i < 20) {
                        const midBoost = features.midEnergy * 18;
                        const energyBoost = features.rms * 12;
                        baseHeight += midBoost + energyBoost;
                    } else {
                        const highBoost = features.highEnergy * 20;
                        baseHeight += highBoost;
                    }
                    
                    visualizerBars[i].style.height = `${baseHeight}px`;
                    
                    const currentVizColors = tracks[currentTrackIndex].visualizer;
                    visualizerBars[i].style.background = `linear-gradient(to top, ${currentVizColors[0]}, ${currentVizColors[1]})`;
                }
            }
            
            // НЕОНОВЫЕ ЛИНИИ с плавным переходом
            if (leftGlow && rightGlow) {
                const minHeight = 15;
                const maxHeight = 85;
                const lineHeight = minHeight + (features.rms * 130);
                
                leftGlow.style.height = `${lineHeight}%`;
                rightGlow.style.height = `${lineHeight}%`;
                
                const brightness = 0.7 + (features.spectralCentroid / bufferLength) * 0.5;
                leftGlow.style.opacity = brightness;
                rightGlow.style.opacity = brightness;
                
                const neonColor = tracks[currentTrackIndex].neonColor;
                const baseBlur = 12;
                const pulseBlur = currentPulseIntensity * 35;
                
                leftGlow.style.boxShadow = 
                    `0 0 ${baseBlur + pulseBlur}px ${neonColor},
                     0 0 ${(baseBlur + pulseBlur) * 1.8}px ${neonColor},
                     0 0 ${(baseBlur + pulseBlur) * 2.5}px ${neonColor},
                     inset 0 0 10px rgba(255, 255, 255, 0.3)`;
                
                rightGlow.style.boxShadow = 
                    `0 0 ${baseBlur + pulseBlur}px ${neonColor},
                     0 0 ${(baseBlur + pulseBlur) * 1.8}px ${neonColor},
                     0 0 ${(baseBlur + pulseBlur) * 2.5}px ${neonColor},
                     inset 0 0 10px rgba(255, 255, 255, 0.3)`;
            }
            
            // Обновление движения частиц
            updateParticlesMovement(features);
            updateCornerParticles(features);
            
            // Обновление эффектов краев экрана
            analyzeEdgeEffects(features);
            updateSparkParticles();
            updateEnergySurge();
            updateEdgeGlow(features);
            
            updatePulseIntensity();
            
            animationId = requestAnimationFrame(visualize);
        } catch (error) {
            console.error('Visualization error:', error);
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }
    }

    // Создание частиц-искр
    function createSparkParticle(corner, intensity) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        
        const corners = {
            'top-left': { x: 0, y: 0 },
            'top-right': { x: window.innerWidth, y: 0 },
            'bottom-left': { x: 0, y: window.innerHeight },
            'bottom-right': { x: window.innerWidth, y: window.innerHeight }
        };
        
        const startPos = corners[corner];
        const angle = Math.random() * Math.PI / 2 + (Math.PI / 4 * ['top-left', 'top-right', 'bottom-right', 'bottom-left'].indexOf(corner));
        const speed = 2 + Math.random() * 3;
        
        const size = 2 + Math.random() * 4 * intensity;
        const currentColors = tracks[currentTrackIndex].colors;
        
        spark.style.width = `${size}px`;
        spark.style.height = `${size}px`;
        spark.style.background = currentColors.accent;
        spark.style.boxShadow = `0 0 ${size * 2}px ${currentColors.accent}`;
        spark.style.left = `${startPos.x}px`;
        spark.style.top = `${startPos.y}px`;
        spark.style.opacity = '0.8';
        
        document.getElementById('sparkParticles').appendChild(spark);
        
        const sparkData = {
            element: spark,
            startX: startPos.x,
            startY: startPos.y,
            velocityX: Math.cos(angle) * speed,
            velocityY: Math.sin(angle) * speed,
            life: 1.0,
            maxLife: 1.0
        };
        
        sparkParticles.push(sparkData);
        
        setTimeout(() => {
            if (spark.parentNode) {
                spark.parentNode.removeChild(spark);
            }
            sparkParticles = sparkParticles.filter(s => s.element !== spark);
        }, 1000);
    }

    // Обновление частиц-искр
    function updateSparkParticles() {
        sparkParticles.forEach((spark, index) => {
            spark.life -= 0.02;
            
            if (spark.life <= 0) {
                if (spark.element.parentNode) {
                    spark.element.parentNode.removeChild(spark.element);
                }
                sparkParticles.splice(index, 1);
                return;
            }
            
            const newX = parseFloat(spark.element.style.left) + spark.velocityX;
            const newY = parseFloat(spark.element.style.top) + spark.velocityY;
            
            spark.element.style.left = `${newX}px`;
            spark.element.style.top = `${newY}px`;
            spark.element.style.opacity = (spark.life * 0.8).toString();
            
            const scale = spark.life * 0.7 + 0.3;
            spark.element.style.transform = `scale(${scale})`;
        });
    }

    // Активация энергетических всплесков
    function activateEnergySurge(intensity) {
        energySurgeActive = true;
        energySurgeIntensity = intensity;
        
        const waves = [
            document.getElementById('energyTop'),
            document.getElementById('energyRight'),
            document.getElementById('energyBottom'),
            document.getElementById('energyLeft')
        ];
        
        const currentColors = tracks[currentTrackIndex].colors;
        
        waves.forEach(wave => {
            wave.style.opacity = intensity.toString();
            wave.style.background = `linear-gradient(${
                wave.classList.contains('top') || wave.classList.contains('bottom') ? '90deg' : '180deg'
            }, transparent, ${currentColors.accent}, transparent)`;
            
            wave.style.boxShadow = `0 0 ${intensity * 30}px ${currentColors.accent}`;
        });
        
        setTimeout(() => {
            energySurgeActive = false;
            waves.forEach(wave => {
                wave.style.opacity = '0';
                wave.style.boxShadow = 'none';
            });
        }, 300);
    }

    // Обновление энергетических всплесков
    function updateEnergySurge() {
        if (energySurgeActive && energySurgeIntensity > 0) {
            energySurgeIntensity -= 0.1;
            if (energySurgeIntensity < 0) energySurgeIntensity = 0;
            
            const waves = [
                document.getElementById('energyTop'),
                document.getElementById('energyRight'),
                document.getElementById('energyBottom'),
                document.getElementById('energyLeft')
            ];
            
            waves.forEach(wave => {
                wave.style.opacity = energySurgeIntensity.toString();
            });
        }
    }

    // Создание краевого свечения
    function createEdgeGlow() {
        const edges = ['top', 'right', 'bottom', 'left'];
        const edgeGlowContainer = document.getElementById('edgeGlow');
        
        edges.forEach(edge => {
            const glow = document.createElement('div');
            glow.className = `edge-glow ${edge}-glow`;
            edgeGlowContainer.appendChild(glow);
            edgeGlowElements[edge] = glow;
        });
    }

    // Обновление краевого свечения
    function updateEdgeGlow(features) {
        const { rms, bassEnergy, isBeat } = features;
        
        let baseIntensity = rms * 0.3;
        
        if (isBeat) {
            baseIntensity += currentPulseIntensity * 0.4;
        }
        
        baseIntensity += bassEnergy * 0.2;
        
        edgeGlowIntensity = Math.min(1, baseIntensity);
        
        const currentColors = tracks[currentTrackIndex].colors;
        
        Object.values(edgeGlowElements).forEach(glow => {
            glow.style.opacity = edgeGlowIntensity.toString();
            glow.style.boxShadow = `0 0 ${20 + edgeGlowIntensity * 30}px ${currentColors.accent}`;
        });
    }

    // Анализ триггеров для эффектов краев
    function analyzeEdgeEffects(features) {
        const { rms, bassEnergy, midEnergy, highEnergy, isBeat } = features;
        
        if ((highEnergy > 0.2 || (isBeat && highEnergy > 0.1)) && sparkCooldown <= 0) {
            const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
            const sparkCount = Math.floor((highEnergy * 6) + (isBeat ? 3 : 0));
            
            for (let i = 0; i < sparkCount; i++) {
                const randomCorner = corners[Math.floor(Math.random() * corners.length)];
                createSparkParticle(randomCorner, highEnergy);
            }
            
            sparkCooldown = 4;
        } else if (sparkCooldown > 0) {
            sparkCooldown--;
        }
        
        if (isBeat && !energySurgeActive) {
            const intensity = 0.5 + currentPulseIntensity * 0.4;
            activateEnergySurge(intensity);
        }
    }

    // Обновление движения частиц
    function updateParticlesMovement(features) {
        if (isParticlesTransitioning || particlesData.length === 0) return;
        
        const { rms, bassEnergy, midEnergy, highEnergy, isBeat } = features;
        
        particlesData.forEach((particleData, index) => {
            const particle = particleData.element;
            const time = Date.now() * 0.001;
            const individualOffset = index * 0.1;
            
            let moveX, moveY;
            
            if (index % 10 < 3) {
                moveX = Math.sin(time * 0.3 + individualOffset) * bassEnergy * 2.0;
                moveY = Math.cos(time * 0.2 + individualOffset) * bassEnergy * 1.8;
            } else if (index % 10 < 7) {
                moveX = Math.sin(time * 0.7 + individualOffset) * midEnergy * 1.2;
                moveY = Math.cos(time * 0.5 + individualOffset) * midEnergy * 1.0;
            } else if (index % 10 < 9) {
                moveX = Math.sin(time * 2.0 + individualOffset) * highEnergy * 0.8;
                moveY = Math.cos(time * 1.8 + individualOffset) * highEnergy * 0.6;
            } else {
                moveX = isBeat ? (Math.random() - 0.5) * 12 * currentPulseIntensity : 0;
                moveY = isBeat ? (Math.random() - 0.5) * 10 * currentPulseIntensity : 0;
            }
            
            let sizeVariation = 0;
            if (index % 10 < 3) {
                sizeVariation = bassEnergy * 6;
            } else if (index % 10 < 7) {
                sizeVariation = midEnergy * 4;
            } else {
                sizeVariation = highEnergy * 3;
            }
            
            const newSize = particleData.baseSize + sizeVariation;
            const newOpacity = Math.min(1, particleData.baseOpacity + rms * 0.3);
            
            const newLeft = particleData.baseLeft + moveX;
            const newTop = particleData.baseTop + moveY;
            
            particle.style.left = `${newLeft}vw`;
            particle.style.top = `${newTop}vh`;
            particle.style.width = `${newSize}px`;
            particle.style.height = `${newSize}px`;
            particle.style.opacity = newOpacity;
            
            const currentColors = tracks[currentTrackIndex].colors;
            particle.style.background = currentColors.accent;
            
            const transitionTime = Math.max(0.05, 0.2 - rms * 0.15);
            particle.style.transition = `all ${transitionTime}s ease-out`;
        });
    }

    // Создание угловых частиц
    function createCornerParticles() {
        const corners = [
            { left: '5%', top: '5%' },
            { left: '95%', top: '5%' },
            { left: '5%', top: '95%' },
            { left: '95%', top: '95%' }
        ];
        
        cornerParticlesData = [];
        const cornerParticlesContainer = document.getElementById('cornerParticles');
        cornerParticlesContainer.innerHTML = '';
        
        const particlesPerCorner = 8;
        
        corners.forEach((corner, cornerIndex) => {
            for (let i = 0; i < particlesPerCorner; i++) {
                const particle = document.createElement('div');
                particle.className = 'corner-particle';
                
                const size = Math.random() * 8 + 3;
                const opacity = Math.random() * 0.4 + 0.1;
                
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.opacity = opacity.toString();
                particle.style.left = corner.left;
                particle.style.top = corner.top;
                particle.style.position = 'fixed';
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '3';
                
                const currentColors = tracks[currentTrackIndex].colors;
                particle.style.background = currentColors.accent;
                particle.style.boxShadow = `0 0 ${size * 2}px ${currentColors.accent}`;
                
                cornerParticlesContainer.appendChild(particle);
                
                cornerParticlesData.push({
                    element: particle,
                    baseLeft: parseFloat(corner.left),
                    baseTop: parseFloat(corner.top),
                    baseSize: size,
                    baseOpacity: opacity,
                    cornerIndex: cornerIndex,
                    particleIndex: i,
                    angle: Math.random() * Math.PI * 2,
                    radius: Math.random() * 2 + 1,
                    orbitSpeed: Math.random() * 0.03 + 0.01
                });
            }
        });
    }

    // Обновление угловых частиц
    function updateCornerParticles(features) {
        const { rms, bassEnergy, midEnergy, highEnergy, isBeat } = features;
        const time = Date.now() * 0.001;
        
        cornerParticlesData.forEach(particleData => {
            const particle = particleData.element;
            const { cornerIndex, angle, radius, orbitSpeed } = particleData;
            
            const dynamicRadius = radius + (bassEnergy * 8);
            const dynamicSpeed = orbitSpeed * (0.5 + rms * 1.5);
            
            particleData.angle += dynamicSpeed;
            
            const orbitX = Math.cos(particleData.angle) * dynamicRadius;
            const orbitY = Math.sin(particleData.angle) * dynamicRadius;
            
            const newX = particleData.baseLeft + orbitX;
            const newY = particleData.baseTop + orbitY;
            
            const sizeVariation = (bassEnergy + highEnergy) * 6;
            const newSize = particleData.baseSize + sizeVariation;
            
            const newOpacity = Math.min(0.8, particleData.baseOpacity + rms * 0.4);
            
            const beatBoost = isBeat ? currentPulseIntensity * 0.3 : 0;
            
            particle.style.left = `${newX}%`;
            particle.style.top = `${newY}%`;
            particle.style.width = `${newSize}px`;
            particle.style.height = `${newSize}px`;
            particle.style.opacity = (newOpacity + beatBoost).toString();
            
            const currentColors = tracks[currentTrackIndex].colors;
            particle.style.background = currentColors.accent;
            particle.style.boxShadow = `0 0 ${newSize * 2}px ${currentColors.accent}`;
            
            particle.style.transition = `all 0.3s ease-out`;
        });
    }

    // === ОПТИМИЗАЦИЯ 4: Создание частиц с пулом объектов ===
    function createParticles() {
        particles.innerHTML = '';
        particlesData = [];
        
        const particleCount = 15;
        const currentColors = tracks[currentTrackIndex].colors;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const startLeft = Math.random() * 100;
            const startTop = Math.random() * 100;
            const startSize = Math.random() * 15 + 5;
            const startOpacity = Math.random() * 0.3 + 0.1;
            
            const endLeft = (Math.random() * 80 + 10) + (i % 3 - 1) * 20;
            const endTop = (Math.random() * 80 + 10) + (i % 2 - 0.5) * 30;
            const endSize = Math.random() * 15 + 5;
            const endOpacity = Math.random() * 0.3 + 0.1;
            
            particle.style.left = `${startLeft}vw`;
            particle.style.top = `${startTop}vh`;
            particle.style.width = `${startSize}px`;
            particle.style.height = `${startSize}px`;
            particle.style.opacity = startOpacity;
            particle.style.background = currentColors.accent;
            particle.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            particle.style.position = 'absolute';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            
            particles.appendChild(particle);
            
            particlesData.push({
                element: particle,
                startLeft: startLeft,
                startTop: startTop,
                startSize: startSize,
                startOpacity: startOpacity,
                endLeft: endLeft,
                endTop: endTop,
                endSize: endSize,
                endOpacity: endOpacity,
                baseLeft: endLeft,
                baseTop: endTop,
                baseSize: endSize,
                baseOpacity: endOpacity,
                velocityX: 0,
                velocityY: 0,
                movementIntensity: Math.random() * 0.5 + 0.5
            });
        }
        
        startParticleTransition();
    }

    // Запуск анимации перехода частиц
    function startParticleTransition() {
        isParticlesTransitioning = true;
        particleTransitionProgress = 0;
        
        const transitionDuration = 800;
        
        particlesData.forEach(particleData => {
            const particle = particleData.element;
            
            setTimeout(() => {
                particle.style.left = `${particleData.endLeft}vw`;
                particle.style.top = `${particleData.endTop}vh`;
                particle.style.width = `${particleData.endSize}px`;
                particle.style.height = `${particleData.endSize}px`;
                particle.style.opacity = particleData.endOpacity;
                particle.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                
                particleData.baseLeft = particleData.endLeft;
                particleData.baseTop = particleData.endTop;
                particleData.baseSize = particleData.endSize;
                particleData.baseOpacity = particleData.endOpacity;
            }, 50);
        });
        
        setTimeout(() => {
            isParticlesTransitioning = false;
        }, transitionDuration);
    }

    // Обновление частиц при смене трека
    function updateParticles() {
        const currentColors = tracks[currentTrackIndex].colors;
        
        particlesData.forEach(particleData => {
            const particle = particleData.element;
            
            particleData.startLeft = parseFloat(particle.style.left);
            particleData.startTop = parseFloat(particle.style.top);
            particleData.startSize = parseFloat(particle.style.width);
            particleData.startOpacity = parseFloat(particle.style.opacity);
            
            particleData.endLeft = (Math.random() * 80 + 10) + (Math.random() * 40 - 20);
            particleData.endTop = (Math.random() * 80 + 10) + (Math.random() * 40 - 20);
            particleData.endSize = Math.random() * 15 + 5;
            particleData.endOpacity = Math.random() * 0.3 + 0.1;
            
            particle.style.background = currentColors.accent;
        });
        
        startParticleTransition();
        
        updateCornerParticlesColors();
    }

    // Обновление цветов угловых частиц
    function updateCornerParticlesColors() {
        const currentColors = tracks[currentTrackIndex].colors;
        
        cornerParticlesData.forEach(particleData => {
            const particle = particleData.element;
            particle.style.background = currentColors.accent;
            particle.style.boxShadow = `0 0 ${particleData.baseSize * 2}px ${currentColors.accent}`;
        });
    }

    // Функция для отображения списка треков
    function renderTrackList() {
        trackList.innerHTML = '';
        
        tracks.forEach((track, index) => {
            const trackItem = document.createElement('div');
            trackItem.className = `track-item ${index === currentTrackIndex ? 'active' : ''}`;
            
            const progressPercent = index === currentTrackIndex ? (audio.currentTime / audio.duration * 100) || 0 : 0;
            
            trackItem.innerHTML = `
                <div class="track-item-cover" style="background-image: url('${track.cover}')"></div>
                <div class="track-item-info">
                    <div class="track-item-title">${track.name}</div>
                    <div class="track-item-artist">${track.artist}</div>
                    <div class="track-item-progress">
                        <div class="track-item-progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
                ${index === currentTrackIndex ? '<div class="now-playing-icon">▶</div>' : ''}
            `;
            
            trackItem.addEventListener('click', () => {
                loadTrack(index, true);
            });
            
            trackList.appendChild(trackItem);
        });
    }

    // Функция для фильтрации треков
    function filterTracks(searchTerm) {
        const filteredTracks = tracks.filter(track => 
            track.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            track.artist.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        trackList.innerHTML = '';
        
        filteredTracks.forEach((track, index) => {
            const originalIndex = tracks.findIndex(t => t.path === track.path);
            const trackItem = document.createElement('div');
            trackItem.className = `track-item ${originalIndex === currentTrackIndex ? 'active' : ''}`;
            
            const progressPercent = originalIndex === currentTrackIndex ? (audio.currentTime / audio.duration * 100) || 0 : 0;
            
            trackItem.innerHTML = `
                <div class="track-item-cover" style="background-image: url('${track.cover}')"></div>
                <div class="track-item-info">
                    <div class="track-item-title">${track.name}</div>
                    <div class="track-item-artist">${track.artist}</div>
                    <div class="track-item-progress">
                        <div class="track-item-progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
                ${originalIndex === currentTrackIndex ? '<div class="now-playing-icon">▶</div>' : ''}
            `;
            
            trackItem.addEventListener('click', () => {
                loadTrack(originalIndex, true);
            });
            
            trackList.appendChild(trackItem);
        });
    }

    // Функция переключения панели треков
    function toggleTrackList() {
        isTrackListOpen = !isTrackListOpen;
        
        if (isTrackListOpen) {
            playerContainer.classList.add('shifted');
            trackListPanel.classList.add('active');
            renderTrackList();
        } else {
            playerContainer.classList.remove('shifted');
            trackListPanel.classList.remove('active');
        }
    }

    // === ОПТИМИЗАЦИЯ 5: Асинхронная загрузка с плавными переходами ===
    let isTrackLoading = false;
    let nextTrackIndex = null;

    // Обновление темы с плавными переходами
    function updateTheme() {
        const currentColors = tracks[currentTrackIndex].colors;
        const neonColor = tracks[currentTrackIndex].neonColor;
        const visualizerColors = tracks[currentTrackIndex].visualizer;
        
        // Плавный переход фона
        document.body.style.background = `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.secondary} 100%)`;
        
        // Плавный переход прогресс-бара
        progress.style.background = `linear-gradient(90deg, ${currentColors.accent}, ${currentColors.primary})`;
        
        // Плавный переход кнопки play/pause
        playPauseBtn.style.background = `linear-gradient(135deg, ${currentColors.accent}, ${currentColors.primary})`;
        
        document.documentElement.style.setProperty('--neon-color', neonColor);
        document.documentElement.style.setProperty('--accent-color', currentColors.accent);
        
        const style = document.createElement('style');
        style.textContent = `
            .volume-slider::-webkit-slider-thumb {
                background: ${currentColors.accent};
            }
            .volume-slider::-moz-range-thumb {
                background: ${currentColors.accent};
            }
        `;
        
        const oldStyle = document.getElementById('dynamic-neon-styles');
        if (oldStyle) oldStyle.remove();
        
        style.id = 'dynamic-neon-styles';
        document.head.appendChild(style);
        
        // Плавное обновление изображения альбома
        albumImage.style.backgroundImage = `url('${tracks[currentTrackIndex].cover}')`;
        
        // Запуск плавного перехода цветов визуализатора
        isVisualizationTransitioning = true;
        colorTransitionProgress = 0;
        targetColors = visualizerColors;
        currentColors = visualizerColors; // Начальные цвета для перехода
        
        // Обновляем ползунок громкости
        updateVolumeSlider();
        
        // Обновляем частицы без полного пересоздания
        if (particlesData.length === 0) {
            createParticles();
        } else {
            updateParticles();
        }
        
        if (cornerParticlesData.length === 0) {
            createCornerParticles();
        } else {
            updateCornerParticlesColors();
        }
        
        if (leftGlow && rightGlow) {
            leftGlow.style.height = '15%';
            rightGlow.style.height = '15%';
            leftGlow.style.opacity = '0.8';
            rightGlow.style.opacity = '0.8';
            leftGlow.style.background = 'var(--neon-color)';
            rightGlow.style.background = 'var(--neon-color)';
            
            leftGlow.style.boxShadow = 
                `0 0 10px var(--neon-color),
                 0 0 20px var(--neon-color),
                 0 0 30px var(--neon-color),
                 inset 0 0 8px rgba(255, 255, 255, 0.2)`;
            
            rightGlow.style.boxShadow = 
                `0 0 10px var(--neon-color),
                 0 0 20px var(--neon-color),
                 0 0 30px var(--neon-color),
                 inset 0 0 8px rgba(255, 255, 255, 0.2)`;
        }
        
        // Обновляем список треков, если панель открыта
        if (isTrackListOpen) {
            renderTrackList();
        }
        
        beatDetected = false;
        currentPulseIntensity = 0;
        lastBeatTime = 0;
        currentMusicIntensity = 0;
        
        sparkParticles.forEach(spark => {
            if (spark.element.parentNode) {
                spark.element.parentNode.removeChild(spark.element);
            }
        });
        sparkParticles = [];
        
        const energyWaves = [
            document.getElementById('energyTop'),
            document.getElementById('energyRight'),
            document.getElementById('energyBottom'),
            document.getElementById('energyLeft')
        ];
        
        energyWaves.forEach(wave => {
            wave.style.opacity = '0';
            wave.style.boxShadow = 'none';
        });
        energySurgeActive = false;
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
            
            // Обновляем прогресс в списке треков, если панель открыта
            if (isTrackListOpen) {
                const activeTrackItem = trackList.querySelector('.track-item.active');
                if (activeTrackItem) {
                    const progressBar = activeTrackItem.querySelector('.track-item-progress-bar');
                    if (progressBar) {
                        progressBar.style.width = `${progressPercent}%`;
                    }
                }
            }
        }
    }

    // === ОПТИМИЗАЦИЯ 5: Асинхронная загрузка треков ===
    async function loadTrack(index, autoPlay = false) {
        if (isTrackLoading || index < 0 || index >= tracks.length) return;
        
        isTrackLoading = true;
        currentTrackIndex = index;
        const track = tracks[currentTrackIndex];
        
        // Предзагрузка соседних треков
        preloadAdjacentTracks(index);
        
        // Быстрое обновление UI
        audio.pause();
        isPlaying = false;
        playPauseBtn.querySelector('svg').innerHTML = '<path d="M8 5v14l11-7z"/>';
        currentTrack.textContent = track.name;
        currentArtist.textContent = track.artist;
        
        // Немедленное обновление темы
        updateTheme();
        
        try {
            // Используем предзагруженный трек если доступен
            const preloaded = preloadedTracks.get(index);
            if (preloaded && preloaded.ready) {
                audio.src = track.path;
                
                // Быстрая установка длительности если доступна
                if (preloaded.duration > 0) {
                    duration.textContent = formatTime(preloaded.duration);
                }
                
                if (autoPlay) {
                    await playTrack();
                }
            } else {
                // Стандартная загрузка
                audio.src = track.path;
                
                const onLoaded = function() {
                    duration.textContent = formatTime(audio.duration);
                    audio.removeEventListener('loadedmetadata', onLoaded);
                    
                    if (autoPlay) {
                        playTrack();
                    }
                };
                
                if (audio.readyState >= 1) {
                    onLoaded();
                } else {
                    audio.addEventListener('loadedmetadata', onLoaded);
                }
            }
        } catch (error) {
            console.error('Track loading error:', error);
        } finally {
            isTrackLoading = false;
        }
    }

    // Воспроизведение трека
    async function playTrack() {
        try {
            // Возобновляем аудиоконтекст если нужно
            if (audioContext && audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            
            await audio.play();
            isPlaying = true;
            playPauseBtn.querySelector('svg').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
            
            if (!animationId) {
                visualize();
            }
        } catch (error) {
            console.error('Playback failed:', error);
        }
    }

    // Перемотка вперед/назад
    function seek(seconds) {
        if (audio.duration) {
            audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
        }
    }

    // Обработчики событий
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            playPauseBtn.querySelector('svg').innerHTML = '<path d="M8 5v14l11-7z"/>';
        } else {
            playTrack();
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

    playbackModeBtn.addEventListener('click', togglePlaybackMode);

    trackListBtn.addEventListener('click', toggleTrackList);

    trackSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        if (searchTerm.trim() === '') {
            renderTrackList();
        } else {
            filterTracks(searchTerm);
        }
    });

    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value / 100;
        updateVolumeSlider();
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
                audio.volume = volumeSlider.value / 100;
                updateVolumeSlider();
                break;
            case 'ArrowDown':
                volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 10);
                audio.volume = volumeSlider.value / 100;
                updateVolumeSlider();
                break;
            case ' ':
                e.preventDefault();
                playPauseBtn.click();
                break;
        }
    });

    audio.addEventListener('timeupdate', updateProgress);

    // Обработчик окончания трека с учетом режима воспроизведения
    audio.addEventListener('ended', () => {
        switch(playbackMode) {
            case PLAYBACK_MODES.PLAYLIST:
                let newIndex = currentTrackIndex + 1;
                if (newIndex >= tracks.length) newIndex = 0;
                loadTrack(newIndex, true);
                break;
                
            case PLAYBACK_MODES.SINGLE:
                loadTrack(currentTrackIndex, true);
                break;
                
            case PLAYBACK_MODES.ONCE:
                audio.pause();
                isPlaying = false;
                playPauseBtn.querySelector('svg').innerHTML = '<path d="M8 5v14l11-7z"/>';
                break;
        }
    });

    // Обработка ошибок аудио
    audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        isTrackLoading = false;
    });

    // Инициализация
    function init() {
        createVisualizer();
        createParticles();
        createCornerParticles();
        createEdgeGlow();
        initAudioSystem();
        updatePlaybackModeButton();
        updateVolumeSlider();
        
        // Предзагрузка первого трека и соседних
        preloadTrack(0).then(() => {
            loadTrack(0);
            preloadAdjacentTracks(0);
        });
    }

    // Запуск инициализации
    init();
});
