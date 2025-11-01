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

    // Частотные диапазоны
    const FREQ_RANGES = {
        BASS: { start: 0, end: 10 },      // Низкие частоты (0-10)
        MID: { start: 10, end: 20 },      // Средние частоты (10-20)
        HIGH: { start: 20, end: 30 }      // Высокие частоты (20-30)
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
        
        // Получаем энергию по диапазонам
        const bassEnergy = getFrequencyEnergy(FREQ_RANGES.BASS);
        const midEnergy = getFrequencyEnergy(FREQ_RANGES.MID);
        const highEnergy = getFrequencyEnergy(FREQ_RANGES.HIGH);
        
        // Общая энергия (RMS)
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / bufferLength) / 255;
        
        // Сохраняем историю энергии для вычисления среднего
        energyHistory.push(rms);
        if (energyHistory.length > 30) {
            energyHistory.shift();
        }
        
        // Вычисляем среднюю энергию
        energyAverage = energyHistory.reduce((a, b) => a + b) / energyHistory.length;
        
        // Спектральный центроид
        let weightedSum = 0;
        let energySum = 0;
        for (let i = 0; i < bufferLength; i++) {
            weightedSum += i * dataArray[i];
            energySum += dataArray[i];
        }
        spectralCentroid = energySum > 0 ? weightedSum / energySum : 0;
        
        // Улучшенная детекция битов (только низкие частоты)
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

    // Визуализация звука с новой системой триггеров
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
                
                // РАСПРЕДЕЛЕНИЕ ПО ДИАПАЗОНАМ:
                if (i < 10) { 
                    // НИЗКИЕ ЧАСТОТЫ - бас + биты
                    const bassBoost = features.bassEnergy * 25;
                    const beatBoost = features.isBeat ? currentPulseIntensity * 40 : 0;
                    baseHeight += bassBoost + beatBoost;
                    
                } else if (i < 20) { 
                    // СРЕДНИЕ ЧАСТОТЫ - мелодия + общая энергия
                    const midBoost = features.midEnergy * 18;
                    const energyBoost = features.rms * 12;
                    baseHeight += midBoost + energyBoost;
                    
                } else { 
                    // ВЫСОКИЕ ЧАСТОТЫ - высокие + искры
                    const highBoost = features.highEnergy * 20;
                    baseHeight += highBoost;
                }
                
                visualizerBars[i].style.height = `${baseHeight}px`;
                
                // Сохраняем оригинальные цвета трека
                const currentColors = tracks[currentTrackIndex].visualizer;
                visualizerBars[i].style.background = `linear-gradient(to top, ${currentColors[0]}, ${currentColors[1]})`;
            }
            
            // Неоновые линии (оставляем как было)
            if (leftGlow && rightGlow) {
                const minHeight = 15;
                const maxHeight = 80;
                const lineHeight = minHeight + (features.rms * (maxHeight - minHeight));
                
                leftGlow.style.height = `${lineHeight}%`;
                rightGlow.style.height = `${lineHeight}%`;
                
                const brightness = 0.6 + (spectralCentroid / bufferLength) * 0.4;
                leftGlow.style.opacity = brightness;
                rightGlow.style.opacity = brightness;
                
                const neonColor = tracks[currentTrackIndex].neonColor;
                const baseBlur = 10;
                const pulseBlur = currentPulseIntensity * 30;
                const totalBlur = baseBlur + pulseBlur;
                
                leftGlow.style.boxShadow = 
                    `0 0 ${totalBlur}px ${neonColor},
                     0 0 ${totalBlur * 1.5}px ${neonColor},
                     0 0 ${totalBlur * 2}px ${neonColor},
                     inset 0 0 8px rgba(255, 255, 255, 0.2)`;
                
                rightGlow.style.boxShadow = 
                    `0 0 ${totalBlur}px ${neonColor},
                     0 0 ${totalBlur * 1.5}px ${neonColor},
                     0 0 ${totalBlur * 2}px ${neonColor},
                     inset 0 0 8px rgba(255, 255, 255, 0.2)`;
            }
            
            // Обновление движения частиц с новой системой
            updateParticlesMovement(features);
            
            // Обновление эффектов краев экрана
            analyzeEdgeEffects(features);
            updateSparkParticles();
            updateEnergySurge();
            
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
        const distance = 100 + Math.random() * 200;
        
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

    // Активация энергетических всплесков (ТОЛЬКО на биты)
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

    // Анализ триггеров для эффектов краев с новым распределением
    function analyzeEdgeEffects(features) {
        const { rms, bassEnergy, midEnergy, highEnergy, isBeat } = features;
        
        // ИСКРЫ - только высокие частоты
        if (highEnergy > 0.25 && sparkCooldown <= 0) {
            const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
            const sparkCount = Math.floor(highEnergy * 4);
            
            for (let i = 0; i < sparkCount; i++) {
                const randomCorner = corners[Math.floor(Math.random() * corners.length)];
                createSparkParticle(randomCorner, highEnergy);
            }
            
            sparkCooldown = 6;
        } else if (sparkCooldown > 0) {
            sparkCooldown--;
        }
        
        // ЭНЕРГЕТИЧЕСКИЕ ВСПЛЕСКИ - только на биты
        if (isBeat && !energySurgeActive) {
            const intensity = 0.4 + currentPulseIntensity * 0.3;
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
            
            // НОВОЕ РАСПРЕДЕЛЕНИЕ ЧАСТИЦ:
            if (index % 10 < 3) { // 30% - НИЗКИЕ ЧАСТОТЫ (крупные волны)
                moveX = Math.sin(time * 0.3 + individualOffset) * bassEnergy * 2.0;
                moveY = Math.cos(time * 0.2 + individualOffset) * bassEnergy * 1.8;
                
            } else if (index % 10 < 7) { // 40% - СРЕДНИЕ ЧАСТОТЫ (плавное движение)
                moveX = Math.sin(time * 0.7 + individualOffset) * midEnergy * 1.2;
                moveY = Math.cos(time * 0.5 + individualOffset) * midEnergy * 1.0;
                
            } else if (index % 10 < 9) { // 20% - ВЫСОКИЕ ЧАСТОТЫ (быстрая дрожь)
                moveX = Math.sin(time * 2.0 + individualOffset) * highEnergy * 0.8;
                moveY = Math.cos(time * 1.8 + individualOffset) * highEnergy * 0.6;
                
            } else { // 10% - БИТЫ (импульсные толчки)
                moveX = isBeat ? (Math.random() - 0.5) * 12 * currentPulseIntensity : 0;
                moveY = isBeat ? (Math.random() - 0.5) * 10 * currentPulseIntensity : 0;
            }
            
            // Размер частиц зависит от их типа
            let sizeVariation = 0;
            if (index % 10 < 3) { // Бас - крупные частицы
                sizeVariation = bassEnergy * 6;
            } else if (index % 10 < 7) { // Средние - средний размер
                sizeVariation = midEnergy * 4;
            } else { // Высокие и биты - мелкие частицы
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
