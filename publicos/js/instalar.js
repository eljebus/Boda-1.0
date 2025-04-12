let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Previene que el navegador muestre el mensaje de instalación por defecto
    e.preventDefault();
    // Guarda el evento para que puedas dispararlo más tarde
    deferredPrompt = e;

    // Muestra un botón o mensaje para sugerir la instalación
    const installButton = document.getElementById('install-button');
    installButton.style.display = 'block';

    // Configurar un temporizador para ocultar el botón después de 30 segundos
    const hideButtonTimeout = setTimeout(() => {
        installButton.style.display = 'none';
    }, 30000); // 30 segundos

    installButton.addEventListener('click', () => {
        // Oculta el botón de instalación
        installButton.style.display = 'none';
        // Cancela el temporizador
        clearTimeout(hideButtonTimeout);
        // Muestra el cuadro de diálogo de instalación
        deferredPrompt.prompt();
        // Espera a que el usuario responda al cuadro de diálogo
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Usuario aceptó la instalación');
            } else {
                console.log('Usuario rechazó la instalación');
            }
            deferredPrompt = null;
        });
    });
});
