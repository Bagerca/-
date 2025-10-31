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

    // Создание визуализатора
    function createVisualizer() {
        visualizer.innerHTML = '';
        visualizerBars = [];
        
        for (let i = 0; i < 30; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            bar.style.height = '5px';
            // Убедимся, что столбец прижат ко дну
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

    // Функция для анализа спектральных характеристик
    function analyzeSpectralFeatures() {
        if (!analyser || !dataArray) return;
        
        // 1. Общая энергия (RMS)
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / bufferLength) / 255;
        
        // Сохраняем историю энергии для вычисления среднего
        energyHistory.push(rms);
        if (energyHistory.length > 30) { // 30 кадров истории
            energyHistory.shift();
        }
        
        // Вычисляем среднюю энергию
        energyAverage = energyHistory.reduce((a, b) => a + b) / energyHistory.length;
        
        // 2. Спектральный центроид (цветность звука)
        let weightedSum = 0;
        let energySum = 0;
        for (let i = 0; i < bufferLength; i++) {
            weightedSum += i * dataArray[i];
            energySum += dataArray[i];
        }
        spectralCentroid = energySum > 0 ? weightedSum / energySum : 0;
        
        // 3. Детекция битов с улучшенной логикой
        const bassEnergy = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10 / 255;
        const currentTime = Date.now();
        
        // Усложненная детекция битов
        isBeat = false;
        if (beatCooldown <= 0) {
            const threshold = energyAverage * 1.3 + 0.1; // Динамический порог
            if (bassEnergy > threshold && (currentTime - lastBeatTime) > 200) {
                isBeat = true;
                lastBeatTime = currentTime;
                currentPulseIntensity = 1.0;
                beatCooldown = 10; // Задержка между битами
            }
        } else {
            beatCooldown--;
        }
        
        return {
            rms,
            bassEnergy,
            spectralCentroid,
            isBeat
        };
    }

    // Детектор битов (ритма)
    function detectBeat(bassIntensity, currentTime) {
        // Если интенсивность баса превышает порог и прошло достаточно времени с последнего бита
        if (bassIntensity > beatThreshold && (currentTime - lastBeatTime) > 200) {
            beatDetected = true;
            lastBeatTime = currentTime;
            currentPulseIntensity = 1.0; // Максимальная интенсивность пульсации
            return true;
        }
        return false;
    }

    // Плавное затухание пульсации
    function updatePulseIntensity() {
        if (currentPulseIntensity > 0) {
            currentPulseIntensity -= 0.08; // Скорость затухания
            if (currentPulseIntensity < 0) currentPulseIntensity = 0;
        }
        beatDetected = false;
    }

    // Визуализация звука с расширенными триггерами
    function visualize() {
        if (!analyser || !isPlaying) return;
        
        try {
            analyser.getByteFrequencyData(dataArray);
            const features = analyzeSpectralFeatures();
            
            // Обновление визуализатора с разными триггерами (без изменения цветов)
            for (let i = 0; i < visualizerBars.length; i++) {
                const barIndex = Math.floor((i / visualizerBars.length) * bufferLength);
                const value = dataArray[barIndex] / 255;
                
                // Базовая высота от частот
                let baseHeight = Math.max(5, value * 110);
                
                // ДОПОЛНИТЕЛЬНЫЕ ЭФФЕКТЫ БЕЗ ИЗМЕНЕНИЯ ЦВЕТА:
                
                // 1. Усиление на битах (для всех столбцов)
                if (features.isBeat) {
                    baseHeight *= (1 + currentPulseIntensity * 0.3);
                }
                
                // 2. Разные эффекты для разных частотных диапазонов
                if (i < 10) { // Низкие частоты - реагируют на бас
                    const bassBoost = features.bassEnergy * 20;
                    baseHeight += bassBoost;
                } else if (i < 20) { // Средние частоты - реагируют на общую энергию
                    const energyBoost = features.rms * 15;
                    baseHeight += energyBoost;
                } else { // Высокие частоты - реагируют на спектральный центроид
                    const brightnessBoost = (spectralCentroid / bufferLength) * 25;
                    baseHeight += brightnessBoost;
                }
                
                visualizerBars[i].style.height = `${baseHeight}px`;
                
                // Сохраняем оригинальные цвета трека
                const currentColors = tracks[currentTrackIndex].visualizer;
                visualizerBars[i].style.background = `linear-gradient(to top, ${currentColors[0]}, ${currentColors[1]})`;
            }
            
            // Обновление неоновых линий с расширенной логикой (без изменения цвета)
            if (leftGlow && rightGlow) {
                // Высота зависит от общей энергии
                const minHeight = 15;
                const maxHeight = 80;
                const lineHeight = minHeight + (features.rms * (maxHeight - minHeight));
                
                leftGlow.style.height = `${lineHeight}%`;
                rightGlow.style.height = `${lineHeight}%`;
                
                // Яркость зависит от спектрального центроида
                const brightness = 0.6 + (spectralCentroid / bufferLength) * 0.4;
                leftGlow.style.opacity = brightness;
                rightGlow.style.opacity = brightness;
                
                // Сохраняем оригинальный цвет неона из трека
                const neonColor = tracks[currentTrackIndex].neonColor;
                
                // Свечение усиливается на битах
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
            
            // Обновление движения частиц с расширенной логикой (без изменения цвета)
            updateParticlesMovement(features);
            
            animationId = requestAnimationFrame(visualize);
        } catch (error) {
            console.error('Visualization error:', error);
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }
    }

    // Обновление движения частиц с расширенной логикой
    function updateParticlesMovement(features) {
        if (isParticlesTransitioning || particlesData.length === 0) return;
        
        const { rms, bassEnergy, spectralCentroid, isBeat } = features;
        
        // Разные типы движения для разных характеристик музыки
        const energyMovement = rms * 1.5; // Общая энергия
        const bassMovement = bassEnergy * 2.0; // Низкие частоты
        const spectralMovement = (spectralCentroid / bufferLength) * 1.0; // Тональность
        const beatBoost = isBeat ? 2.0 : 1.0; // Ударные
        
        particlesData.forEach((particleData, index) => {
            const particle = particleData.element;
            const time = Date.now() * 0.001;
            const individualOffset = index * 0.1;
            
            // Разное поведение для разных частиц
            let moveX, moveY;
            
            if (index % 3 === 0) {
                // Частицы, реагирующие на бас
                moveX = Math.sin(time * 0.5 + individualOffset) * bassMovement * 1.5;
                moveY = Math.cos(time * 0.3 + individualOffset) * bassMovement * 1.2;
            } else if (index % 3 === 1) {
                // Частицы, реагирующие на общую энергию
                moveX = Math.sin(time * 0.8 + individualOffset) * energyMovement;
                moveY = Math.cos(time * 0.6 + individualOffset) * energyMovement;
            } else {
                // Частицы, реагирующие на тональность
                moveX = Math.sin(time * 1.2 + individualOffset) * spectralMovement;
                moveY = Math.cos(time * 0.9 + individualOffset) * spectralMovement;
            }
            
            // Эффект "толчка" на битах
            const beatPushX = isBeat ? (Math.random() - 0.5) * 8 : 0;
            const beatPushY = isBeat ? (Math.random() - 0.5) * 6 : 0;
            
            // Размер частиц зависит от разных параметров
            let sizeVariation = 0;
            if (index % 4 === 0) {
                sizeVariation = bassEnergy * 5;
            } else if (index % 4 === 1) {
                sizeVariation = rms * 4;
            } else if (index % 4 === 2) {
                sizeVariation = spectralMovement * 3;
            } else {
                sizeVariation = (bassEnergy + rms) * 2;
            }
            
            const newSize = particleData.baseSize + sizeVariation * beatBoost;
            const newOpacity = Math.min(1, particleData.baseOpacity + rms * 0.3);
            
            // Применяем изменения
            const newLeft = particleData.baseLeft + moveX + beatPushX;
            const newTop = particleData.baseTop + moveY + beatPushY;
            
            particle.style.left = `${newLeft}vw`;
            particle.style.top = `${newTop}vh`;
            particle.style.width = `${newSize}px`;
            particle.style.height = `${newSize}px`;
            particle.style.opacity = newOpacity;
            
            // Сохраняем оригинальный цвет частиц из трека
            const currentColors = tracks[currentTrackIndex].colors;
            particle.style.background = currentColors.accent;
            
            // Динамическая скорость анимации
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
            
            // Начальная позиция (случайная)
            const startLeft = Math.random() * 100;
            const startTop = Math.random() * 100;
            const startSize = Math.random() * 15 + 5;
            const startOpacity = Math.random() * 0.3 + 0.1;
            
            // Конечная позиция (специфичная для трека)
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
            
            // Сохраняем данные частицы для анимации
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
        
        // Запускаем анимацию перехода
        startParticleTransition();
    }

    // Запуск анимации перехода частиц
    function startParticleTransition() {
        isParticlesTransitioning = true;
        particleTransitionProgress = 0;
        
        const transitionDuration = 800; // 0.8 секунды
        
        particlesData.forEach(particleData => {
            const particle = particleData.element;
            
            // Плавный переход к конечной позиции
            setTimeout(() => {
                particle.style.left = `${particleData.endLeft}vw`;
                particle.style.top = `${particleData.endTop}vh`;
                particle.style.width = `${particleData.endSize}px`;
                particle.style.height = `${particleData.endSize}px`;
                particle.style.opacity = particleData.endOpacity;
                particle.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                
                // Обновляем базовые позиции
                particleData.baseLeft = particleData.endLeft;
                particleData.baseTop = particleData.endTop;
                particleData.baseSize = particleData.endSize;
                particleData.baseOpacity = particleData.endOpacity;
            }, 50); // Небольшая задержка для красивого эффекта
        });
        
        // Завершаем переход
        setTimeout(() => {
            isParticlesTransitioning = false;
        }, transitionDuration);
    }

    // Обновление частиц при смене трека
    function updateParticles() {
        const currentColors = tracks[currentTrackIndex].colors;
        
        particlesData.forEach(particleData => {
            const particle = particleData.element;
            
            // Сохраняем текущую позицию как начальную
            particleData.startLeft = parseFloat(particle.style.left);
            particleData.startTop = parseFloat(particle.style.top);
            particleData.startSize = parseFloat(particle.style.width);
            particleData.startOpacity = parseFloat(particle.style.opacity);
            
            // Устанавливаем новые конечные позиции
            particleData.endLeft = (Math.random() * 80 + 10) + (Math.random() * 40 - 20);
            particleData.endTop = (Math.random() * 80 + 10) + (Math.random() * 40 - 20);
            particleData.endSize = Math.random() * 15 + 5;
            particleData.endOpacity = Math.random() * 0.3 + 0.1;
            
            // Меняем цвет
            particle.style.background = currentColors.accent;
        });
        
        // Запускаем анимацию перехода
        startParticleTransition();
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
        
        // Динамическое обновление стилей
        const style = document.createElement('style');
        style.textContent = `
            .volume-slider::-webkit-slider-thumb {
                background: ${currentColors.accent};
            }
        `;
        
        // Удаляем старые стили перед добавлением новых
        const oldStyle = document.getElementById('dynamic-neon-styles');
        if (oldStyle) oldStyle.remove();
        
        style.id = 'dynamic-neon-styles';
        document.head.appendChild(style);
        
        // Обложка
        albumImage.style.backgroundImage = `url('${tracks[currentTrackIndex].cover}')`;
        
        // Обновление частиц с новыми цветами и позициями
        if (particlesData.length === 0) {
            createParticles();
        } else {
            updateParticles();
        }
        
        // Сброс неоновых линий при смене трека
        if (leftGlow && rightGlow) {
            leftGlow.style.height = '15%';
            rightGlow.style.height = '15%';
            leftGlow.style.opacity = '0.8';
            rightGlow.style.opacity = '0.8';
            leftGlow.style.background = 'var(--neon-color)';
            rightGlow.style.background = 'var(--neon-color)';
            
            // Стабильное свечение без анимации мерцания
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
        
        // Сброс детектора битов
        beatDetected = false;
        currentPulseIntensity = 0;
        lastBeatTime = 0;
        currentMusicIntensity = 0;
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
            
            // Останавливаем текущее воспроизведение перед загрузкой нового трека
            audio.pause();
            isPlaying = false;
            playPauseBtn.textContent = '▶';
            
            // Отменяем предыдущую анимацию
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
                
                // Автоматически воспроизводим, если нужно
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
    createParticles(); // Создаем частицы при загрузке
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
