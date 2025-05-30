$(window).on('load', function () {


    const music = document.getElementById('audioFondo');
    const toggleBtn = document.getElementById('music-control');
    let isPlaying = false;


    // Set initial volume
    if (music) {
      music.volume = 0.3;
    }

    // Body click handler
    $('body').one('click', function() {
      if (music) {
      music.play();
      isPlaying = true;
      toggleBtn.src = 'img/musica-on-4.gif';
      }
    });

    // Toggle button handler
    toggleBtn?.addEventListener('click', function() {
      if (!music) return;
      
      if (!isPlaying) {
      music.play();
      toggleBtn.src = 'img/musica-on-4.gif';
      toggleBtn.style.width = '35px';
      } else {
      music.pause();
      toggleBtn.src = 'img/play.png'; // Assuming you have an off state image
      toggleBtn.style.width = '20px';

      }
      isPlaying = !isPlaying;
    });

  
    // 1. Efecto visual
    if ($("#luna").length && $("#luna").length) {
          const $luna = $('#luna');
        const $slides = $('#slides img');
        let current = 0;

        function startAnimation() {

            $luna.show().delay(4000).fadeOut(1500, function () {
                // Luego empezar a mostrar los slides en secuencia
                fadeSlides();
            });
        }

        function fadeSlides() {
            $slides.hide(); // Oculta todos
            $slides.eq(current).fadeIn(1500).delay(3000).fadeOut(1500, function () {
                current = (current + 1) % $slides.length;
                if (current === 0) {
                    // Al terminar todos los slides, volver a mostrar la luna y reiniciar
                    $luna.fadeIn(1000, function () {
                        startAnimation();
                    });
                } else {
                    fadeSlides();
                }
            });
        }

        startAnimation(); // Iniciar el ciclo
          
    }




  
    // Usar moment-timezone para manejar la zona horaria
    const targetDate = moment.tz('2025-06-07 17:00:00', 'America/Mexico_City').toDate().getTime(); // 7 de junio 5:00pm (hora de CDMX)
    let timer; // ✅ Declarado antes de usarse en clearInterval
  
    // 2. Función para actualizar la cuenta regresiva
    function updateCountdown() {
      const now = moment().tz('America/Mexico_City').toDate().getTime(); // Obtener la hora actual en la zona de CDMX
      const distance = targetDate - now;
  
      if (distance <= 0) {
        // 🎉 Ya es el gran día
        $('#activa').show();
        $('#reloj').hide();
        clearInterval(timer); // ✅ Ahora no lanza error
        return;
      }
  
      // ⏳ Aún falta
      $('#activa').hide();
      $('#reloj').show();
  
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
      $('#days').text(String(days).padStart(2, '0'));
      $('#hours').text(String(hours).padStart(2, '0'));
      $('#minutes').text(String(minutes).padStart(2, '0'));
      $('#seconds').text(String(seconds).padStart(2, '0'));
    }
  
    // 3. Iniciar el conteo
    updateCountdown(); // Ejecutar una vez al cargar
    timer = setInterval(updateCountdown, 1000); // Luego cada segundo
});
