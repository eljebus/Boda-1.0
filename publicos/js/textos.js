class Textos {
    constructor() {
        $(document).ready(() => {
            this.init();
            this.limpiarFormulario();
        });

        // Generar expresión regular avanzada para palabras prohibidas
        this.regexProhibidas = new RegExp(this.generarPatronesProhibidos(), "i");
    }

    init() {
        $("#formulario").hide();
        $("#pencil-icon").on("click", this.showForm.bind(this));
        $("#compartirTexto").on("click", this.saveText.bind(this));
    }

    showForm() {
        $("#formulario").toggle();
        $('html, body').animate({
            scrollTop: 0
        }, 500); // 500ms para animación suave al tope
    }

    // Lista completa de palabras prohibidas (incluyendo variantes)
    palabrasProhibidas = [
        // INSULTOS DIRECTOS
        'puta', 'puto', 'prostituta', 'prostituto', 'perra', 'perro', 'zorra', 'zorro',
        'cabrón', 'cabrona', 'pendejo', 'pendeja', 'mierda', 'verga', 'pito', 'polla',
        'marica', 'marik@', 'maric@', 'mariko', 'mar1k@', 'mar1c@',
        'chingado', 'chingada', 'jodido', 'jodida', 'pinche', 'putísima',
        
        // INSULTOS SOBRE INTELIGENCIA
        'pendejo', 'pendeja', 'estúpido', 'estúpida', 'imbécil', 'idiota', 'tarado', 'tarada',
        'mensito', 'mensita', 'tonto', 'tonta', 'baboso', 'babosa', 'pendejada', 'animal', 
        'retrasado', 'retrasada', 'bruto', 'bruta', 'burro', 'burra',
        
        // INSULTOS SOBRE ORIGEN/CLASE
        'naco', 'naca', 'indio', 'india', 'prieto', 'prieta', 'gato', 'gata', 'chaca', 'chacalón',
        'gata', 'fresa', 'mirrey', 'whitexican', 'pocho', 'pocha', 'chilango', 'chilanga',
        
        // INSULTOS SEXUALES
        'maricón', 'marica', 'joto', 'jota', 'puto', 'puta', 'culero', 'culera', 'sidoso', 'sidosoa',
        'prostituto', 'prostituta', 'cochino', 'cochina', 'puñetas', 'pajero', 'pajera', 'cogedor',
        
        // INSULTOS FAMILIARES
        'hijueputa', 'hijodeputa', 'hdp', 'madreaste', 'chingatumadre', 'chingasatumadre', 
        'mequetrefe', 'pendejada', 'pinche', 'putipobre', 'putifresas',
        
        // GROSERÍAS FUERTES
        'verga', 'pito', 'polla', 'coño', 'concha', 'chocha', 'panocha', 'pendejada', 'mamada',
        'mamón', 'mamona', 'mamadas', 'chingaderas', 'chingaquedito', 'chingaquedió',
        "marik","put",
        
        // VARIANTES CON NÚMEROS
        'p3nd3j0', 'p3nd3j4', 'p3nd3j@', 'p3nd3j0', 'p3nd3j0n', 'p3nd3j0n4',
        'm4r1c0n', 'm4r1c4', 'm4r1k0n', 'm4r1k4', 'm4r1c@', 'm4r1k@',
        'h1j0d3put4', 'h1j0d3pvt4', 'h1j0d3pvt@', 'h1j0d3pvt4',
        'c0j0n3s', 'c0j0n35', 'c0j0n3z', 'c0j0n3$',
        
        // VARIANTES CON SÍMBOLOS
        'p@t@s', 'p@t0s', 'p@t0$', 'p@t0z',
        'm@r1c@', 'm@r1k@', 'm@r1c0n', 'm@r1k0n', 'm@r1c0n3s',
        'h1j@d3put@', 'h1j@d3pvt@', 'h1j@d3pvt4',
        'c0j0n3$',"marik@","m4r1c@","m4r1k@","m4r1c0n3s","m4r1k0n3s","m4r1c0n3z","m4r1k0n3z",
        "put@","pvt@","pvt4","pvt4","pvt4","pvt4","pvt4","pvt4",
        
        // VARIANTES INVERSAS
        'atuplas', 'atup', 'adreim', 'redoj', 'oñoc', 'ojednep', 'norbac', 'aitsoh', 'atidlam',
        
        // VARIANTES CON MAYÚSCULAS Y MINÚSCULAS
        'PuTa', 'pUtA', 'PeNdEjO', 'PeNdEjA', 'CaBrOn', 'cAbRoN', 'MiErDa', 'mIeRdA',
        'HiJuEpUtA', 'JoDeR', 'ChInGa', 'MaMoN', 'MaMaDaS', 'MaMaDoN',
        
        // VARIANTES CON REPETICIÓN DE LETRAS
        'putaaaaa', 'putooooo', 'pendejoooo', 'pendejaaaaa', 'cabroooon', 'cabronnnn',
        'mierdaaaaa', 'vergaaaaa', 'pendejadaaaaa',
        
        // EXPRESIONES OFENSIVAS COMPUESTAS
        'hazme el chingado favor', 'no mames', 'no manches', 'qué chingados', 'qué pinche',
        'vete a la chingada', 'vete al carajo', 'vete al diablo', 'vete al demonio',
        
        // MODISMOS OFENSIVOS
        'me vale madre', 'me vale verga', 'me importa madre', 'me importa verga',
        'no me importa un carajo', 'no me importa un comino', 'no me importa un pepino',
        
        // PALABRAS DISFRAZADAS
        'p*ta', 'p#ta', 'p@ta', 'p&ta', 'pend*jo', 'pend#jo', 'pend@jo', 'pend&jo',
        'c*bron', 'c#bron', 'c@bron', 'c&bron', 'm*erda', 'm#erda', 'm@erda', 'm&erda',
        
        // REGIONALISMOS OFENSIVOS
        'chairo', 'chaira', 'fifí', 'nini', 'whitexican', 'mirrey', 'mirreina',
        'nacazo', 'naca', 'naco', 'prieto', 'prieta', 'indio', 'india', 'gato', 'gata',
        
        // PALABRAS DE DOBLE SENTIDO
        'cajeta', 'chupar', 'mamar', 'tirar', 'chingar', 'coger', 'joder', 'follar',
    ];

    contieneGroserias(texto) {
        return this.regexProhibidas.test(texto.toLowerCase());
    }

    limpiarFormulario() {
        $("#nombre").val('');
        $("#deseo").val('');
    }

    async saveText() {
        $("#compartirTexto").prop("disabled", true).html("Guardando...");
        const nombre = $("#nombre").val();
        const deseo = $("#deseo").val();

        if (this.contieneGroserias(nombre) || this.contieneGroserias(deseo)) {
            alert("Por favor, evita usar lenguaje inapropiado.");
            $("#compartirTexto").prop("disabled", false).html("Guardar");
            return;
        }

        try {
            const response = await $.post("/guardar-texto", { nombre, deseo });
            console.log("Texto guardado exitosamente:", response);
            this.limpiarFormulario();
            location.reload();
        } catch (error) {
            console.error("Error al guardar el texto:", error);
            alert("Hubo un error al guardar el texto. Por favor, intenta nuevamente.");
        } finally {
            $("#compartirTexto").prop("disabled", false).html("Guardar");
        }
    }

    // Generar patrones de expresiones regulares para palabras prohibidas
    generarPatronesProhibidos() {
        // Usamos TODAS las palabras prohibidas y escapamos caracteres especiales
        return this.palabrasProhibidas.map(palabra => {
            // Escapar caracteres especiales para regex
            let palabraEscapada = palabra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // Reemplazos adicionales para mayor cobertura
            return palabraEscapada
                .replace(/a/gi, '[a4@áàâäãåā]')
                .replace(/e/gi, '[e3€éèêëē]')
                .replace(/i/gi, '[i1!|íìîïī]')
                .replace(/o/gi, '[o0óòôöõøō]')
                .replace(/u/gi, '[uúùûüū]')
                .replace(/c/gi, '[cç]')
                .replace(/k/gi, '[kq]')
                .replace(/s/gi, '[s5$]')
                .replace(/t/gi, '[t7]')
                .replace(/b/gi, '[b8]')
                .replace(/g/gi, '[g9]')
                .replace(/l/gi, '[l1]');
        }).join("|");
    }
}

const miTextos = new Textos();