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
    const leftGlow = document.getElementById('leftGlow');
    const rightGlow = document.getElementById('rightGlow');
    const leftSpotlight = document.getElementById('leftSpotlight');
    const rightSpotlight = document.getElementById('rightSpotlight');
    const leftBeamDust = document.querySelector('.left-beam-dust');
    const rightBeamDust = document.querySelector('.right-beam-dust');

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
            neonColor: '#ff9a00',
            spotlightColor: 'rgba(255, 154, 0, 0.9)'
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
            neonColor: '#4a90e2',
            spotlightColor: 'rgba(74, 144, 226, 0.9)'
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
            neonColor: '#ff0000',
            spotlightColor: 'rgba(255, 0, 0, 0.9)'
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
            neonColor: '#ffd700',
            spotlightColor: 'rgba(255, 215, 0, 0.9)'
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
            neonColor: '#e84178',
            spotlightColor: 'rgba(232, 65, 120, 0.9)'
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
            neonColor: '#4ca1af',
            spotlightColor: 'rgba(76, 161, 175, 0.9)'
        }
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;
    let audioContext, analyser, dataArray, bufferLength;
    let visualizerBars = [];
    let animationId = null;
    
    // Переменные для ритмичного свечения
    let beatDetected = false;
    let lastBeatTime = 0;
    let beatThreshold = 0.7;
    let currentPulseIntensity = 0;

    // Переменные для анимации частиц
    let particlesData = [];
    let isParticlesTransitioning = false;
    let particleTransitionProgress = 0;
    let currentMusicIntensity = 0;

    // Новые переменные для расширенного анализа
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

    // Переменные для усиленных прожекторов
    let leftSpotlightAngle = -45;
    let rightSpotlightAngle = 45;
    let leftSpotlightTargetAngle = -45;
    let rightSpotlightTargetAngle = 45;
    let spotlightIntensity = 0.7;
    let lastBeatIntensity = 0;
    let lensFlareActive = false;

    // Частотные диапазоны
    const FREQ_RANGES = {
        BASS: { start: 0, end: 10 },
        MID: { start: 10, end: 20 },
        HIGH: { start: 20, end: 30 }
    };

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
                lastBeatIntensity = bassEnergy;
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

    // Обновление усиленных театральных прожекторов
    function updateSpotlights(features) {
        const { rms, bassEnergy, midEnergy, highEnergy, isBeat } = features;
        const time = Date.now() * 0.001;
        
        // МОЩНЫЕ ДВИЖЕНИЯ ПРОЖЕКТОРОВ
        
        // Левый прожектор - бас и ритм (мощные, размашистые движения)
        const leftBaseAngle = -45;
        
        // Бас создает мощные колебания
        const leftBassSwing = Math.sin(time * 0.4) * bassEnergy * 40;
        
        // Резкие удары на битах
        const leftBeatImpact = isBeat ? (Math.random() - 0.5) * 25 * currentPulseIntensity : 0;
        
        // Высокие частоты добавляют дрожание
        const leftVibration = Math.sin(time * 8) * highEnergy * 8;
        
        // Плавное движение к целевой позиции с инерцией
        leftSpotlightTargetAngle = leftBaseAngle + leftBassSwing + leftBeatImpact + leftVibration;
        leftSpotlightAngle += (leftSpotlightTargetAngle - leftSpotlightAngle) * 0.3;
        
        // Правый прожектор - мелодия и высокие частоты (плавные, изящные движения)
        const rightBaseAngle = 45;
        
        // Средние частоты создают плавные волны
        const rightMelodyWave = Math.sin(time * 0.6 + 1) * midEnergy * 35;
        
        // Высокие частоты - быстрая вибрация
        const rightHighVibration = Math.sin(time * 12) * highEnergy * 12;
        
        // Резкие движения на битах
        const rightBeatSnap = isBeat ? (Math.random() - 0.5) * 20 * currentPulseIntensity : 0;
        
        rightSpotlightTargetAngle = rightBaseAngle + rightMelodyWave + rightHighVibration + rightBeatSnap;
        rightSpotlightAngle += (rightSpotlightTargetAngle - rightSpotlightAngle) * 0.4;
        
        // ИНТЕНСИВНОСТЬ И ЭФФЕКТЫ
        
        // Базовая интенсивность
        const baseIntensity = 0.5;
        
        // Энергия музыки усиливает интенсивность
        const energyIntensity = rms * 0.6;
        
        // Биты создают вспышки
        const beatIntensity = isBeat ? currentPulseIntensity * 0.4 : 0;
        
        // Общая интенсивность
        const totalIntensity = Math.min(1, baseIntensity + energyIntensity + beatIntensity);
        
        // МАСШТАБИРОВАНИЕ И РАСШИРЕНИЕ
        
        // Базовый масштаб
        const baseScale = 1.0;
        
        // Энергия увеличивает размер луча
        const energyScale = rms * 1.2;
        
        // Биты создают резкое расширение
        const beatScale = isBeat ? currentPulseIntensity * 0.8 : 0;
        
        const totalScale = baseScale + energyScale + beatScale;
        
        // ПРИМЕНЕНИЕ ИЗМЕНЕНИЙ К ЛЕВОМУ ПРОЖЕКТОРУ
        if (leftSpotlight) {
            const leftCore = leftSpotlight.querySelector('.spotlight-core');
            const leftBeam = leftSpotlight.querySelector('.spotlight-beam');
            const leftGlow = leftSpotlight.querySelector('.spotlight-glow');
            const leftLensFlare = leftSpotlight.querySelector('.lens-flare');
            
            // Применяем поворот и масштаб
            leftCore.style.transform = `rotate(${leftSpotlightAngle}deg) scaleY(${totalScale})`;
            leftBeam.style.transform = `rotate(${leftSpotlightAngle}deg) scaleY(${totalScale * 1.1})`;
            
            // Интенсивность свечения
            leftCore.style.opacity = (totalIntensity * 0.9).toString();
            leftBeam.style.opacity = (totalIntensity * 0.7).toString();
            leftGlow.style.opacity = (totalIntensity * 1.1).toString();
            
            // Эффекты на битах
            if (isBeat) {
                leftCore.style.animation = 'corePulse 0.3s ease-in-out';
                leftBeam.style.animation = 'spotlightPulse 0.3s ease-in-out';
                leftSpotlight.style.animation = 'shake 0.2s ease-in-out';
                
                // Активация линз-флера на сильных битах
                if (bassEnergy > 0.3) {
                    leftLensFlare.style.opacity = '0.8';
                    setTimeout(() => {
                        leftLensFlare.style.opacity = '0';
                    }, 300);
                }
            }
        }
        
        // ПРИМЕНЕНИЕ ИЗМЕНЕНИЙ К ПРАВОМУ ПРОЖЕКТОРУ
        if (rightSpotlight) {
            const rightCore = rightSpotlight.querySelector('.spotlight-core');
            const rightBeam = rightSpotlight.querySelector('.spotlight-beam');
            const rightGlow = rightSpotlight.querySelector('.spotlight-glow');
            const rightLensFlare = rightSpotlight.querySelector('.lens-flare');
            
            // Применяем поворот и масштаб
            rightCore.style.transform = `rotate(${rightSpotlightAngle}deg) scaleY(${totalScale})`;
            rightBeam.style.transform = `rotate(${rightSpotlightAngle}deg) scaleY(${totalScale * 1.1})`;
            
            // Интенсивность свечения
            rightCore.style.opacity = (totalIntensity * 0.9).toString();
            rightBeam.style.opacity = (totalIntensity * 0.7).toString();
            rightGlow.style.opacity = (totalIntensity * 1.1).toString();
            
            // Эффекты на битах
            if (isBeat) {
                rightCore.style.animation = 'corePulse 0.3s ease-in-out';
                rightBeam.style.animation = 'spotlightPulse 0.3s ease-in-out';
                rightSpotlight.style.animation = 'shakeRight 0.2s ease-in-out';
                
                // Активация линз-флера на сильных битах
                if (midEnergy > 0.3) {
                    rightLensFlare.style.opacity = '0.8';
                    setTimeout(() => {
                        rightLensFlare.style.opacity = '0';
                    }, 300);
                }
            }
        }
        
        // ОБНОВЛЕНИЕ ЧАСТИЦ ПЫЛИ В ЛУЧАХ
        if (leftBeamDust && rightBeamDust) {
            const dustIntensity = Math.min(1, rms * 2 + (isBeat ? 0.3 : 0));
            leftBeamDust.style.opacity = dustIntensity.toString();
            rightBeamDust.style.opacity = dustIntensity.toString();
        }
    }

    // Визуализация звука с усиленными прожекторами
    function visualize() {
        if (!analyser || !isPlaying) return;
        
        try {
            analyser.getByteFrequencyData(dataArray);
            const features = analyzeSpectralFeatures();
            
            // Обновление визуализатора с новым распределением
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
                
                const currentColors = tracks[currentTrackIndex].visualizer;
                visualizerBars[i].style.background = `linear-gradient(to top, ${currentColors[0]}, ${currentColors[1]})`;
            }
            
            // НЕОНОВЫЕ ЛИНИИ
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
            
            // ОБНОВЛЕНИЕ УСИЛЕННЫХ ПРОЖЕКТОРОВ
            updateSpotlights(features);
            
            // Обновление движения частиц
            updateParticlesMovement(features);
            
            // Обновление эффектов краев экрана
            analyzeEdgeEffects(features);
            updateSparkParticles();
            updateEnergySurge();
            updateEdgeGlow(features);
            
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
        
        // Базовая интенсивность от общей энергии
        let baseIntensity = rms * 0.3;
        
        // Усиление на битах
        if (isBeat) {
            baseIntensity += currentPulseIntensity * 0.4;
        }
        
        // Дополнительное усиление от баса
        baseIntensity += bassEnergy * 0.2;
        
        edgeGlowIntensity = Math.min(1, baseIntensity);
        
        const currentColors = tracks[currentTrackIndex].colors;
        
        Object.values(edgeGlowElements).forEach(glow => {
            glow.style.opacity = edgeGlowIntensity.toString();
            glow.style.boxShadow = `0 0 ${20 + edgeGlowIntensity * 30}px ${currentColors.accent}`;
        });
    }

    // Анализ триггеров для эффектов краев с новым распределением
    function analyzeEdgeEffects(features) {
        const { rms, bassEnergy, midEnergy, highEnergy, isBeat } = features;
        
        // ИСКРЫ - больше частиц на высоких частотах и битах
        if ((highEnergy > 0.2 || (isBeat && highEnergy > 0.1)) && sparkCooldown <= 0) {
            const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
            // Увеличиваем количество искр
            const sparkCount = Math.floor((highEnergy * 6) + (isBeat ? 3 : 0));
            
            for (let i = 0; i < sparkCount; i++) {
                const randomCorner = corners[Math.floor(Math.random() * corners.length)];
                createSparkParticle(randomCorner, highEnergy);
            }
            
            sparkCooldown = 4; // Уменьшаем кулдаун для более частых искр
        } else if (sparkCooldown > 0) {
            sparkCooldown--;
        }
        
        // ЭНЕРГЕТИЧЕСКИЕ ВСПЛЕСКИ - только на биты
        if (isBeat && !energySurgeActive) {
            const intensity = 0.5 + currentPulseIntensity * 0.4;
            activateEnergySurge(intensity);
        }
    }

    // Обновление движения частиц с новой системой распределения
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

    // Создание частиц с анимацией перехода
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
    }

    // Обновление темы
    function updateTheme() {
        const currentColors = tracks[currentTrackIndex].colors;
        const neonColor = tracks[currentTrackIndex].neonColor;
        const spotlightColor = tracks[currentTrackIndex].spotlightColor;
        
        document.body.style.background = `linear-gradient(135deg, ${currentColors.primary} 0%, ${currentColors.secondary} 100%)`;
        progress.style.background = `linear-gradient(90deg, ${currentColors.accent}, ${currentColors.primary})`;
        playPauseBtn.style.background = `linear-gradient(135deg, ${currentColors.accent}, ${currentColors.primary})`;
        
        document.documentElement.style.setProperty('--neon-color', neonColor);
        document.documentElement.style.setProperty('--accent-color', currentColors.accent);
        document.documentElement.style.setProperty('--spotlight-color', spotlightColor);
        
        const style = document.createElement('style');
        style.textContent = `
            .volume-slider::-webkit-slider-thumb {
                background: ${currentColors.accent};
            }
        `;
        
        const oldStyle = document.getElementById('dynamic-neon-styles');
        if (oldStyle) oldStyle.remove();
        
        style.id = 'dynamic-neon-styles';
        document.head.appendChild(style);
        
        albumImage.style.backgroundImage = `url('${tracks[currentTrackIndex].cover}')`;
        
        if (particlesData.length === 0) {
            createParticles();
        } else {
            updateParticles();
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
        
        // Сброс прожекторов
        if (leftSpotlight && rightSpotlight) {
            const leftCore = leftSpotlight.querySelector('.spotlight-core');
            const leftBeam = leftSpotlight.querySelector('.spotlight-beam');
            const leftGlowEl = leftSpotlight.querySelector('.spotlight-glow');
            const rightCore = rightSpotlight.querySelector('.spotlight-core');
            const rightBeam = rightSpotlight.querySelector('.spotlight-beam');
            const rightGlowEl = rightSpotlight.querySelector('.spotlight-glow');
            
            leftCore.style.transform = 'rotate(-45deg) scaleY(1)';
            leftBeam.style.transform = 'rotate(-45deg) scaleY(1)';
            leftCore.style.opacity = '0.8';
            leftBeam.style.opacity = '0.6';
            leftGlowEl.style.opacity = '0.7';
            
            rightCore.style.transform = 'rotate(45deg) scaleY(1)';
            rightBeam.style.transform = 'rotate(45deg) scaleY(1)';
            rightCore.style.opacity = '0.8';
            rightBeam.style.opacity = '0.6';
            rightGlowEl.style.opacity = '0.7';
        }
        
        // Сброс частиц пыли
        if (leftBeamDust && rightBeamDust) {
            leftBeamDust.style.opacity = '0';
            rightBeamDust.style.opacity = '0';
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
        }
    }

    // Загрузка трека
    function loadTrack(index, autoPlay = false) {
        if (index >= 0 && index < tracks.length) {
            currentTrackIndex = index;
            const track = tracks[currentTrackIndex];
            
            audio.pause();
            isPlaying = false;
            playPauseBtn.textContent = '▶';
            
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            
            audio.src = track.path;
            currentTrack.textContent = track.name;
            currentArtist.textContent = track.artist;
            trackSelect.value = track.path;
            
            updateTheme();
            
            const onLoaded = function() {
                duration.textContent = formatTime(audio.duration);
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
            playPauseBtn.textContent = '⏸';
            if (!analyser) {
                initAudioAnalyzer();
            }
            visualize();
        }).catch(error => {
            console.error('Playback failed:', error);
            showPlayMessage();
        });
    }

    // Перемотка вперед/назад
    function seek(seconds) {
        if (audio.duration) {
            audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
        }
    }

    // Попытка автовоспроизведения
    function attemptAutoplay() {
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
            playTrack();
            message.remove();
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
                animationId = null;
            }
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
                volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 10);
                audio.volume = volumeSlider.value / 100;
                break;
            case 'ArrowDown':
                volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 10);
                audio.volume = volumeSlider.value / 100;
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
    createParticles();
    createEdgeGlow();
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
