document.addEventListener('DOMContentLoaded', function() {
    // --- ЭЛЕМЕНТЫ DOM ---
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
    const playlistSelector = document.getElementById('playlistSelector');

    // --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ СОСТОЯНИЯ ---
    let currentPlaylistName = "Библиотека";
    let currentTracks = playlists[currentPlaylistName];
    let currentTrackIndex = 0;
    let isPlaying = false;
    let isTrackListOpen = false;
    let isLiteMode = false; // <-- ПЕРЕМЕННАЯ ДЛЯ ОБЛЕГЧЕННОГО РЕЖИМА

    const PLAYBACK_MODES = {
        PLAYLIST: 0,
        SINGLE: 1,
        ONCE: 2
    };
    
    let playbackMode = PLAYBACK_MODES.PLAYLIST;
    
    let audioContext, analyser, dataArray, bufferLength, audioSource;
    
    let visualizerBars = [];
    let animationId = null;
    
    let beatDetected = false;
    let lastBeatTime = 0;
    let beatThreshold = 0.7;
    let currentPulseIntensity = 0;

    let particlesData = [];
    let cornerParticlesData = [];
    let isParticlesTransitioning = false;
    let particleTransitionProgress = 0;
    let currentMusicIntensity = 0;

    let energyHistory = [];
    let energyAverage = 0;
    let spectralCentroid = 0;
    let isBeat = false;
    let beatCooldown = 0;

    let sparkParticles = [];
    let lastSparkTime = 0;
    let sparkCooldown = 0;
    let energySurgeActive = false;
    let energySurgeIntensity = 0;

    let edgeGlowElements = {};
    let edgeGlowIntensity = 0;

    const FREQ_RANGES = {
        BASS: { start: 0, end: 10 },
        MID: { start: 10, end: 20 },
        HIGH: { start: 20, end: 30 }
    };

    // --- ИЗМЕНЕНИЕ 1: Создаем "маркерную доску" - один объект для данных о музыке ---
    // Этот объект будет обновляться каждый кадр, а не создаваться заново.
    let audioFeatures = {
        rms: 0,
        bassEnergy: 0,
        midEnergy: 0,
        highEnergy: 0,
        spectralCentroid: 0,
        isBeat: false
    };

    // --- НОВАЯ ФУНКЦИЯ ДЛЯ ПЕРЕКЛЮЧЕНИЯ ОБЛЕГЧЕННОГО РЕЖИМА ---
    function toggleLiteMode() {
        isLiteMode = !isLiteMode;
        const cornerParticlesContainer = document.getElementById('cornerParticles');
        const sparkParticlesContainer = document.getElementById('sparkParticles');

        if (isLiteMode) {
            console.log("Lite Mode Activated");
            // Очищаем контейнеры от существующих частиц
            cornerParticlesContainer.innerHTML = ''; 
            sparkParticlesContainer.innerHTML = '';
            // Добавляем класс к body для визуального отклика
            document.body.classList.add('lite-mode');
        } else {
            console.log("Lite Mode Deactivated");
            // При выключении режима, частицы будут созданы заново при смене трека или можно вызвать функцию их создания
            createCornerParticles(); 
            document.body.classList.remove('lite-mode');
        }
    }

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
    
    function togglePlaybackMode() {
        playbackMode = (playbackMode + 1) % 3;
        updatePlaybackModeButton();
    }
    
    function updateVolumeSlider() {
        const volumeValue = volumeSlider.value;
        const accentColor = currentTracks.length > 0 ? currentTracks[currentTrackIndex].colors.accent : '#ffffff';
        
        volumeSlider.style.background = `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${volumeValue}%, rgba(255, 255, 255, 0.1) ${volumeValue}%, rgba(255, 255, 255, 0.1) 100%)`;
    }

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

    function initAudioAnalyzer() {
        try {
            if (audioContext) {
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
                return;
            }
            
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            
            if (!audioSource) {
                audioSource = audioContext.createMediaElementSource(audio);
                audioSource.connect(analyser);
                analyser.connect(audioContext.destination);
            }
            
            analyser.fftSize = 256;
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            
            console.log('Audio analyzer initialized successfully');
        } catch (error) {
            console.error('Audio analyzer initialization failed:', error);
        }
    }

    function getFrequencyEnergy(range) {
        let sum = 0;
        const count = range.end - range.start;
        for (let i = range.start; i < range.end; i++) {
            sum += dataArray[i];
        }
        return sum / count / 255;
    }

    // --- ИЗМЕНЕНИЕ 2: Функция analyzeSpectralFeatures теперь не возвращает новый объект ---
    // Она напрямую изменяет глобальный объект audioFeatures.
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
        
        // Обновляем "маркерную доску"
        audioFeatures.rms = rms;
        audioFeatures.bassEnergy = bassEnergy;
        audioFeatures.midEnergy = midEnergy;
        audioFeatures.highEnergy = highEnergy;
        audioFeatures.spectralCentroid = spectralCentroid;
        audioFeatures.isBeat = isBeat;
    }

    function updatePulseIntensity() {
        if (currentPulseIntensity > 0) {
            currentPulseIntensity -= 0.08;
            if (currentPulseIntensity < 0) currentPulseIntensity = 0;
        }
        beatDetected = false;
    }

    // --- ИЗМЕНЕНИЕ 3: Функция visualize теперь использует глобальный audioFeatures ---
    function visualize() {
        if (!analyser || !isPlaying || currentTracks.length === 0) return;
        
        try {
            analyser.getByteFrequencyData(dataArray);
            
            // Просто вызываем функцию для обновления "доски".
            // Больше не нужно `const features = ...`
            analyzeSpectralFeatures(); 
            
            // Везде ниже вместо `features` мы используем `audioFeatures`
            for (let i = 0; i < visualizerBars.length; i++) {
                const barIndex = Math.floor((i / visualizerBars.length) * bufferLength);
                const value = dataArray[barIndex] / 255;
                
                let baseHeight = Math.max(5, value * 110);
                
                if (i < 10) {
                    const bassBoost = audioFeatures.bassEnergy * 25;
                    const beatBoost = audioFeatures.isBeat ? currentPulseIntensity * 40 : 0;
                    baseHeight += bassBoost + beatBoost;
                } else if (i < 20) {
                    const midBoost = audioFeatures.midEnergy * 18;
                    const energyBoost = audioFeatures.rms * 12;
                    baseHeight += midBoost + energyBoost;
                } else {
                    const highBoost = audioFeatures.highEnergy * 20;
                    baseHeight += highBoost;
                }
                
                visualizerBars[i].style.height = `${baseHeight}px`;
                
                const currentColors = currentTracks[currentTrackIndex].visualizer;
                visualizerBars[i].style.background = `linear-gradient(to top, ${currentColors[0]}, ${currentColors[1]})`;
            }
            
            if (leftGlow && rightGlow) {
                const minHeight = 15;
                const maxHeight = 85;
                const lineHeight = minHeight + (audioFeatures.rms * 130);
                
                leftGlow.style.height = `${lineHeight}%`;
                rightGlow.style.height = `${lineHeight}%`;
                
                const brightness = 0.7 + (audioFeatures.spectralCentroid / bufferLength) * 0.5;
                leftGlow.style.opacity = brightness;
                rightGlow.style.opacity = brightness;
                
                const neonColor = currentTracks[currentTrackIndex].neonColor;
                const neonColorRight = currentTracks[currentTrackIndex].neonColorRight || neonColor;
                const baseBlur = 12;
                const pulseBlur = currentPulseIntensity * 35;
                
                leftGlow.style.background = neonColor;
                leftGlow.style.boxShadow = 
                    `0 0 ${baseBlur + pulseBlur}px ${neonColor},
                     0 0 ${(baseBlur + pulseBlur) * 1.8}px ${neonColor},
                     0 0 ${(baseBlur + pulseBlur) * 2.5}px ${neonColor},
                     inset 0 0 10px rgba(255, 255, 255, 0.3)`;
                
                rightGlow.style.background = neonColorRight;
                rightGlow.style.boxShadow = 
                    `0 0 ${baseBlur + pulseBlur}px ${neonColorRight},
                     0 0 ${(baseBlur + pulseBlur) * 1.8}px ${neonColorRight},
                     0 0 ${(baseBlur + pulseBlur) * 2.5}px ${neonColorRight},
                     inset 0 0 10px rgba(255, 255, 255, 0.3)`;
            }
            
            // Передаем объект audioFeatures в другие функции
            updateParticlesMovement(audioFeatures);

            // --- ОБНОВЛЕНО: Добавляем проверку на isLiteMode ---
            if (!isLiteMode) {
                updateCornerParticles(audioFeatures);
                analyzeEdgeEffects(audioFeatures); // Эта функция создает искры
            }
            // ---------------------------------------------------

            updateSparkParticles();
            updateEnergySurge();
            updateEdgeGlow(audioFeatures);
            
            updatePulseIntensity();
            
            animationId = requestAnimationFrame(visualize);
        } catch (error) {
            console.error('Visualization error:', error);
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }
    }

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
        const currentColors = currentTracks[currentTrackIndex].colors;
        
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

    function activateEnergySurge(intensity) {
        energySurgeActive = true;
        energySurgeIntensity = intensity;
        
        const waves = [
            document.getElementById('energyTop'),
            document.getElementById('energyRight'),
            document.getElementById('energyBottom'),
            document.getElementById('energyLeft')
        ];
        
        const currentColors = currentTracks[currentTrackIndex].colors;
        
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

    function updateEdgeGlow(features) {
        if (currentTracks.length === 0) return;
        const { rms, bassEnergy, isBeat } = features;
        
        let baseIntensity = rms * 0.3;
        
        if (isBeat) {
            baseIntensity += currentPulseIntensity * 0.4;
        }
        
        baseIntensity += bassEnergy * 0.2;
        
        edgeGlowIntensity = Math.min(1, baseIntensity);
        
        const currentColors = currentTracks[currentTrackIndex].colors;
        
        Object.values(edgeGlowElements).forEach(glow => {
            glow.style.opacity = edgeGlowIntensity.toString();
            glow.style.boxShadow = `0 0 ${20 + edgeGlowIntensity * 30}px ${currentColors.accent}`;
        });
    }

    function analyzeEdgeEffects(features) {
        if (currentTracks.length === 0) return;
        const { highEnergy, isBeat } = features;
        
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

    function updateParticlesMovement(features) {
        if (isParticlesTransitioning || particlesData.length === 0 || currentTracks.length === 0) return;
        
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
            
            const currentColors = currentTracks[currentTrackIndex].colors;
            particle.style.background = currentColors.accent;
            
            const transitionTime = Math.max(0.05, 0.2 - rms * 0.15);
            particle.style.transition = `all ${transitionTime}s ease-out`;
        });
    }

    function createCornerParticles() {
        if (currentTracks.length === 0) return;
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
                
                const currentColors = currentTracks[currentTrackIndex].colors;
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

    function updateCornerParticles(features) {
        if (currentTracks.length === 0) return;
        const { rms, bassEnergy, highEnergy, isBeat } = features;
        
        cornerParticlesData.forEach(particleData => {
            const particle = particleData.element;
            const { radius, orbitSpeed } = particleData;
            
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
            
            const currentColors = currentTracks[currentTrackIndex].colors;
            particle.style.background = currentColors.accent;
            particle.style.boxShadow = `0 0 ${newSize * 2}px ${currentColors.accent}`;
            
            particle.style.transition = `all 0.3s ease-out`;
        });
    }

    function createParticles() {
        if (currentTracks.length === 0) return;
        particles.innerHTML = '';
        particlesData = [];
        
        const particleCount = 15;
        const currentColors = currentTracks[currentTrackIndex].colors;
        
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

    function updateParticles() {
        if (currentTracks.length === 0) return;
        const currentColors = currentTracks[currentTrackIndex].colors;
        
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

    function updateCornerParticlesColors() {
        if (currentTracks.length === 0) return;
        const currentColors = currentTracks[currentTrackIndex].colors;
        
        cornerParticlesData.forEach(particleData => {
            const particle = particleData.element;
            particle.style.background = currentColors.accent;
            particle.style.boxShadow = `0 0 ${particleData.baseSize * 2}px ${currentColors.accent}`;
        });
    }

    function renderTrackList() {
        trackList.innerHTML = '';
        
        if (currentTracks.length === 0) {
            trackList.innerHTML = '<div class="track-item-title" style="text-align: center; padding: 20px;">Плейлист пуст</div>';
            return;
        }

        currentTracks.forEach((track, index) => {
            const trackItem = document.createElement('div');
            const isTrackActive = audio.src.includes(track.path) && !audio.paused;
            trackItem.className = `track-item ${isTrackActive ? 'active' : ''}`;
            
            const progressPercent = isTrackActive ? (audio.currentTime / audio.duration * 100) || 0 : 0;
            
            trackItem.innerHTML = `
                <div class="track-item-cover" style="background-image: url('${track.cover}')"></div>
                <div class="track-item-info">
                    <div class="track-item-title">${track.name}</div>
                    <div class="track-item-artist">${track.artist}</div>
                    <div class="track-item-progress">
                        <div class="track-item-progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
                ${isTrackActive ? '<div class="now-playing-icon">▶</div>' : ''}
            `;
            
            trackItem.addEventListener('click', () => {
                const originalIndex = currentTracks.findIndex(t => t.path === track.path);
                loadTrack(originalIndex, true);
            });
            
            trackList.appendChild(trackItem);
        });
    }
    
    function filterTracks(searchTerm) {
        const filteredTracks = currentTracks.filter(track => 
            track.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            track.artist.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        trackList.innerHTML = '';
        
        if (filteredTracks.length === 0) {
            trackList.innerHTML = '<div class="track-item-title" style="text-align: center; padding: 20px;">Ничего не найдено</div>';
            return;
        }
        
        filteredTracks.forEach((track) => {
            const originalIndex = currentTracks.findIndex(t => t.path === track.path);
            const isTrackActive = audio.src.includes(track.path) && !audio.paused;
            const trackItem = document.createElement('div');
            trackItem.className = `track-item ${isTrackActive ? 'active' : ''}`;
            
            const progressPercent = isTrackActive ? (audio.currentTime / audio.duration * 100) || 0 : 0;
            
            trackItem.innerHTML = `
                <div class="track-item-cover" style="background-image: url('${track.cover}')"></div>
                <div class="track-item-info">
                    <div class="track-item-title">${track.name}</div>
                    <div class="track-item-artist">${track.artist}</div>
                    <div class="track-item-progress">
                        <div class="track-item-progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
                ${isTrackActive ? '<div class="now-playing-icon">▶</div>' : ''}
            `;
            
            trackItem.addEventListener('click', () => {
                loadTrack(originalIndex, true);
            });
            
            trackList.appendChild(trackItem);
        });
    }

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

    function updateTheme() {
        if (currentTracks.length === 0) return;

        const currentColors = currentTracks[currentTrackIndex].colors;
        const neonColor = currentTracks[currentTrackIndex].neonColor;
        const neonColorRight = currentTracks[currentTrackIndex].neonColorRight || neonColor;
        
        document.body.style.background = `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.secondary} 100%)`;
        progress.style.background = `linear-gradient(90deg, ${currentColors.accent}, ${currentColors.primary})`;
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
        
        albumImage.style.backgroundImage = `url('${currentTracks[currentTrackIndex].cover}')`;
        
        updateVolumeSlider();
        
        if (particlesData.length === 0) {
            createParticles();
        } else {
            updateParticles();
        }
        
        if (cornerParticlesData.length === 0 && !isLiteMode) {
            createCornerParticles();
        } else {
            updateCornerParticlesColors();
        }
        
        if (leftGlow && rightGlow) {
            leftGlow.style.height = '15%';
            rightGlow.style.height = '15%';
            leftGlow.style.opacity = '0.8';
            rightGlow.style.opacity = '0.8';
            
            leftGlow.style.background = neonColor;
            rightGlow.style.background = neonColorRight;
            
            leftGlow.style.boxShadow = 
                `0 0 10px ${neonColor},
                 0 0 20px ${neonColor},
                 0 0 30px ${neonColor},
                 inset 0 0 8px rgba(255, 255, 255, 0.2)`;
            
            rightGlow.style.boxShadow = 
                `0 0 10px ${neonColorRight},
                 0 0 20px ${neonColorRight},
                 0 0 30px ${neonColorRight},
                 inset 0 0 8px rgba(255, 255, 255, 0.2)`;
        }
        
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

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updateProgress() {
        if (audio.duration && !isNaN(audio.duration)) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progress.style.width = `${progressPercent}%`;
            currentTime.textContent = formatTime(audio.currentTime);
            
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

    function loadTrack(index, autoPlay = false) {
        if (index >= 0 && index < currentTracks.length) {
            currentTrackIndex = index;
            const track = currentTracks[currentTrackIndex];
            
            audio.pause();
            isPlaying = false;
            playPauseBtn.querySelector('svg').innerHTML = '<path d="M8 5v14l11-7z"/>';
            
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            
            audio.src = track.path;
            currentTrack.textContent = track.name;
            currentArtist.textContent = track.artist;
            
            updateTheme();
            
            const onLoaded = function() {
                duration.textContent = formatTime(audio.duration);
                audio.removeEventListener('loadedmetadata', onLoaded);
                
                if (autoPlay) {
                    setTimeout(() => playTrack(), 100);
                }
            };
            
            audio.addEventListener('loadedmetadata', onLoaded);
            audio.addEventListener('error', (e) => console.error('Error loading track:', track.path, e));
            
            audio.load();
        } else {
             currentTrack.textContent = 'Плейлист пуст';
             currentArtist.textContent = 'Выберите другой';
             albumImage.style.backgroundImage = 'none';
             duration.textContent = '0:00';
             progress.style.width = '0%';
        }
    }
    
    function playTrack() {
        if (currentTracks.length === 0) return;
        
        initAudioAnalyzer();
        
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                playPauseBtn.querySelector('svg').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
                
                if (!animationId) {
                    visualize();
                }
            }).catch(error => {
                console.error('Playback failed:', error);
                
                if (audioContext && audioContext.state === 'suspended') {
                    audioContext.resume().then(() => {
                        audio.play().then(() => {
                            isPlaying = true;
                            playPauseBtn.querySelector('svg').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
                            if (!animationId) {
                                visualize();
                            }
                        }).catch(e => console.error('Second playback attempt failed:', e));
                    });
                }
            });
        }
    }

    function seek(seconds) {
        if (audio.duration) {
            audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
        }
    }

    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            playPauseBtn.querySelector('svg').innerHTML = '<path d="M8 5v14l11-7z"/>';
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        } else {
            playTrack();
        }
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentTracks.length === 0) return;
        let newIndex = currentTrackIndex - 1;
        if (newIndex < 0) newIndex = currentTracks.length - 1;
        loadTrack(newIndex, true);
    });

    nextBtn.addEventListener('click', () => {
        if (currentTracks.length === 0) return;
        let newIndex = currentTrackIndex + 1;
        if (newIndex >= currentTracks.length) newIndex = 0;
        loadTrack(newIndex, true);
    });

    playbackModeBtn.addEventListener('click', togglePlaybackMode);
    trackListBtn.addEventListener('click', toggleTrackList);

    trackSearch.addEventListener('input', (e) => {
        filterTracks(e.target.value);
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

    // --- ОБНОВЛЕННЫЙ ОБРАБОТЧИК КЛАВИШ ---
    document.addEventListener('keydown', (e) => {
        // Проверяем, чтобы горячие клавиши не срабатывали при вводе в поле поиска
        if (e.target.id === 'trackSearch') return;

        switch(e.key.toLowerCase()) { // Используем toLowerCase для универсальности
            case 'arrowleft': 
                seek(-5); 
                break;
            case 'arrowright': 
                seek(5); 
                break;
            case 'arrowup':
                e.preventDefault();
                volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 10);
                audio.volume = volumeSlider.value / 100;
                updateVolumeSlider();
                break;
            case 'arrowdown':
                e.preventDefault();
                volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 10);
                audio.volume = volumeSlider.value / 100;
                updateVolumeSlider();
                break;
            case ' ': 
                e.preventDefault(); 
                playPauseBtn.click(); 
                break;
            case 'l': // <-- НАШ НОВЫЙ ОБРАБОТЧИК
                toggleLiteMode();
                break;
        }
    });

    audio.addEventListener('timeupdate', updateProgress);
    
    audio.addEventListener('ended', () => {
        if (currentTracks.length === 0) return;
        switch(playbackMode) {
            case PLAYBACK_MODES.PLAYLIST:
                let newIndex = currentTrackIndex + 1;
                if (newIndex >= currentTracks.length) newIndex = 0;
                loadTrack(newIndex, true);
                break;
            case PLAYBACK_MODES.SINGLE:
                loadTrack(currentTrackIndex, true);
                break;
            case PLAYBACK_MODES.ONCE:
                audio.pause();
                isPlaying = false;
                playPauseBtn.querySelector('svg').innerHTML = '<path d="M8 5v14l11-7z"/>';
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
                break;
        }
    });

    audio.addEventListener('error', (e) => console.error('Audio element error:', e));

    function populatePlaylistSelector() {
        for (const playlistName in playlists) {
            const option = document.createElement('option');
            option.value = playlistName;
            option.textContent = playlistName;
            playlistSelector.appendChild(option);
        }
    }

    function switchPlaylist(playlistName) {
        if (playlists[playlistName]) {
            currentPlaylistName = playlistName;
            currentTracks = playlists[playlistName];
            
            const isCurrentTrackInNewPlaylist = currentTracks.some(track => audio.src.includes(track.path));
            if (!isCurrentTrackInNewPlaylist) {
                audio.pause();
                isPlaying = false;
                playPauseBtn.querySelector('svg').innerHTML = '<path d="M8 5v14l11-7z"/>';
                if (animationId) cancelAnimationFrame(animationId);
                
                // Сбрасываем прогресс-бар и время, если плейлист пуст
                if (currentTracks.length === 0) {
                    progress.style.width = '0%';
                    currentTime.textContent = '0:00';
                }

                loadTrack(0); 
            }

            renderTrackList();
        }
    }

    playlistSelector.addEventListener('change', (e) => {
        switchPlaylist(e.target.value);
    });

    function initializePlayer() {
        populatePlaylistSelector();
        createVisualizer();
        createParticles();
        
        // --- ОБНОВЛЕНО: Добавляем проверку на isLiteMode ---
        if (!isLiteMode) {
            createCornerParticles();
        }
        
        createEdgeGlow();
        updatePlaybackModeButton();
        updateVolumeSlider();
        
        setTimeout(() => {
            loadTrack(0);
        }, 500);
    }
    
    initializePlayer();
});

window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    
    // Небольшая задержка для плавности (опционально)
    setTimeout(() => {
        preloader.classList.add('hide');
        
        // Полностью удаляем элемент из DOM после завершения анимации исчезновения
        setTimeout(() => {
            preloader.remove();
        }, 500); // 500ms соответствует времени transition в CSS
    }, 800); // Задержка показа прелоадера (можно уменьшить до 0)
});
