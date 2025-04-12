window.onload = function () {
    // Realizar una solicitud AJAX al backend para verificar la fecha
    fetch('/api/verificar-fecha')
        .then(response => response.json())
        .then(data => {
            const albumElement = document.querySelector('#album');
            const textosElement = document.querySelector('#textos');

            if (!data.mostrarContenido) {
                // Si no se debe mostrar el contenido, ocultar los elementos
                if (albumElement) {
                    albumElement.style.display = 'none';
                }
                if (textosElement) {
                    textosElement.style.display = 'none';
                }

                // Añadir texto al body
                const nuevoTexto = document.createElement('div');
                nuevoTexto.id = 'hastaFecha';
                nuevoTexto.innerHTML = `
                    <CENTER>
                        <h5>Esta función estará disponible el día de nuestra boda</h5>
                        <i class="material-icons" style="color: rgb(0, 140, 255); font-size: 48px;">favorite</i>
                        <br>
                        <a href="/" class="waves-effect waves-light btn">Volver</a>
                    </CENTER>
                `;
                document.body.appendChild(nuevoTexto);
            }
        })
        .catch(error => console.error('Error al verificar la fecha:', error));
};
