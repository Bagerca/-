document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const volumeSlider = document.getElementById('volumeSlider');

    // Автовоспроизведение при загрузке (может не работать в некоторых браузерах)
    audio.play().catch(error => console.log('Автовоспроизведение заблокировано'));

    playBtn.addEventListener('click', () => {
        audio.play();
    });

    pauseBtn.addEventListener('click', () => {
        audio.pause();
    });

    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value;
    });
});
