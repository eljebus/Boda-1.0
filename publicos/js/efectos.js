$(window).on('load', function () {
    // 1. Efecto visual
    if ($("#luna").length && $("#principal").length) {
      $("#luna").fadeOut(2000, function () {
        $("#principal").hide().fadeIn(1000);
      });
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
