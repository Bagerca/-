document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const trackSelect = document.getElementById('trackSelect');
    const currentTrack = document.getElementById('currentTrack');

    // Массив треков
    const tracks = [
        { name: 'Трек 1', path: 'assets/572355312-322680992.mp3' },
        { name: 'Caro Emerald - Tangled Up', path: 'assets/Caro Emerald, Tangled Up (Lokee Remix).mp3' },
        { name: 'Valhalla Calling', path: 'assets/VALHALLA_CALLING_by_Miracle_Of_Sound_ft_Peyton_Parrish_DUET_VERSION.mp3' }
    ];

    let currentTrackIndex = 0;

    // Функция загрузки трека
    function loadTrack(index) {
        if (index >= 0 && index < tracks.length) {
            currentTrackIndex = index;
            audio.src = tracks[currentTrackIndex].path;
            currentTrack.textContent = tracks[currentTrackIndex].name;
            trackSelect.value = tracks[currentTrackIndex].path;
            
            // Автовоспроизведение при загрузке
            audio.play().catch(error => {
                console.log('Автовоспроизведение заблокировано');
            });
        }
    }

    // Смена трека через select
    trackSelect.addEventListener('change', function() {
        const selectedPath = this.value;
        const trackIndex = tracks.findIndex(track => track.path === selectedPath);
        if (trackIndex !== -1) {
            loadTrack(trackIndex);
        }
    });

    // Кнопка воспроизведения
    playBtn.addEventListener('click', () => {
        audio.play();
    });

    // Кнопка паузы
    pauseBtn.addEventListener('click', () => {
        audio.pause();
    });

    // Предыдущий трек
    prevBtn.addEventListener('click', () => {
        let newIndex = currentTrackIndex - 1;
        if (newIndex < 0) newIndex = tracks.length - 1;
        loadTrack(newIndex);
    });

    // Следующий трек
    nextBtn.addEventListener('click', () => {
        let newIndex = currentTrackIndex + 1;
        if (newIndex >= tracks.length) newIndex = 0;
        loadTrack(newIndex);
    });

    // Регулятор громкости
    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value;
    });

    // Автопереход к следующему треку при окончании текущего
    audio.addEventListener('ended', () => {
        let newIndex = currentTrackIndex + 1;
        if (newIndex >= tracks.length) newIndex = 0;
        loadTrack(newIndex);
    });

    // Загрузка первого трека при старте
    loadTrack(0);
});
