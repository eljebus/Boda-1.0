class PhotoHandler {
  constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.selectedPhoto = null;
  }

  init() {
      document.addEventListener('DOMContentLoaded', () => {




          this.setupButtons();

          var elems = document.querySelectorAll('.fixed-action-btn');
          var instances = M.FloatingActionButton.init(elems, {'direction': 'left','hoverEnabled': false});
          var elems = document.querySelectorAll('.modal');
         
          var instances = M.Modal.init(elems, {});


          

          // Add event listener to elements with the class 'masonry-item'
          $('.masonry-item').on('click',this.setPhotoView.bind(this));

          $("#descargar").on("click", this.downloadPhoto.bind(this));
          $("#compartir").on("click", this.sharePhoto.bind(this));

          if (!navigator.share) {
            $("#compartir").hide();
          }

      });
  }


  setPhotoView(e) {
      const clickedElement = e.currentTarget;
      const imgElement = clickedElement.querySelector('img');
      if (imgElement) {
          const imgSrc = imgElement.src;
          console.log('Image source:', imgSrc);
          document.getElementById("modal-image").src = imgSrc;
          document.getElementById("photo-modal").style.top = "0%";
      }
  }

  setupButtons() {
      const galleryIcon = document.getElementById('galery-icon');
      const cameraIcon = document.getElementById('camera-icon');

      if (galleryIcon) {
          galleryIcon.addEventListener('click', () => this.openGallery());
      }

      if (cameraIcon) {
          cameraIcon.addEventListener('click', () => this.openNativeCamera());
      }
  }

  openGallery() {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';

      fileInput.addEventListener('change', (e) => {
          if (e.target.files.length > 0) {
              this.selectedPhoto = e.target.files[0];
              this.uploadPhoto();
          }
      });

      fileInput.click();
  }

  sharePhoto() {
      // Verificar si la API de compartir está disponible
     
      
      const img = document.querySelector(selector);
      if (!img || img.tagName !== 'IMG') return;
      
      // Si es URL web, compartir directamente
      if (img.src.startsWith('http')) {
        navigator.share({
          title, text, url: img.src
        }).catch(e => console.error(e));
        return;
      }
      
      // Convertir y compartir como archivo
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(blob => {
        const file = new File([blob], 'imagen.jpg', {type: 'image/jpeg'});
        
        if (navigator.canShare && navigator.canShare({files: [file]})) {
          navigator.share({
            title, text, files: [file]
          }).catch(e => console.error(e));
        } else {
          // Fallback: compartir la URL actual
          navigator.share({
            title, text, url: window.location.href
          }).catch(e => console.error(e));
        }
      }, 'image/jpeg', 0.9);
  }

async downloadPhoto() {
  try {
    const imgElement = document.querySelector('#modal-image');
    if (!imgElement || !imgElement.src) {
      throw new Error('No se puede encontrar la imagen');
    }

    // Configurar atributo crossOrigin
    imgElement.crossOrigin = 'Anonymous';
    
    // Recargar la imagen con headers CORS
    await new Promise((resolve, reject) => {
      imgElement.onload = resolve;
      imgElement.onerror = reject;
      const src = imgElement.src;
      imgElement.src = '';
      imgElement.src = src;
    });

    // Crear canvas
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);

    // Generar nombre de archivo con formato personalizado
    const fileName = this.generateCustomFileName(imgElement.src);

    // Convertir a Blob y descargar
    canvas.toBlob(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
    }, 'image/jpeg', 0.92);

  } catch (error) {
    console.error('Error al descargar:', error);
    this.directDownload(imgElement.src);
  }
}

  openNativeCamera() {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.capture = 'environment';

      // Set attributes to prioritize high-quality images
      fileInput.setAttribute('quality', 'high');
      fileInput.setAttribute('resolution', 'high');

      fileInput.addEventListener('change', (e) => {
          if (e.target.files.length > 0) {
              this.selectedPhoto = e.target.files[0];
              this.uploadPhoto();
          }
      });

      fileInput.click();
  }


  async  compressImage(file, maxWidth = 1024, quality = 0.75) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(maxWidth / img.width, 1);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob((blob) => {
              resolve(new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              }));
            }, 'image/jpeg', quality);
          };
        };
        reader.readAsDataURL(file);
      });
    }


    async uploadPhoto() {
      if (!this.selectedPhoto) return;
    
      const loadingElement = document.getElementById('cargando');
      const menuButton = document.getElementById('mainControl');
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (loadingElement) loadingElement.style.display = 'block';
      if (menuButton) menuButton.style.display = 'none';
    
      try {
        // 1. Comprimir primero
        const compressedFile = await this.compressImage(this.selectedPhoto);

        // 2. Verificación con SightEngine usando la imagen comprimida
        const isSafe = await this.checkWithSightEngine(compressedFile);
        if (!isSafe) {

          loadingElement.style.display = 'none';
          menuButton.style.display = 'block';

          throw new Error('La imagen no es apropiada para el álbum de boda');
        }
    
        // 3. Usar la imagen comprimida para subir
        const formData = new FormData();
        formData.append('photo', compressedFile);
    
        const response = await fetch(`/subir-foto?timestamp=${Date.now()}`, {
          method: 'POST',
          body: formData,
          headers: { 'Cache-Control': 'no-cache' }
        });
    
        if (!response.ok) throw new Error('Error al subir la foto');
        
        const json = await response.json();
        window.location.href = `/album?nueva=${encodeURIComponent(json.url)}`;
    
      } catch (error) {
        console.error('Error:', error);
        alert(error.message);
      } 
    }

    
    async checkWithSightEngine(file) {
    const API_KEY = '446432173';
    const API_SECRET = 'RoG7skkRWmXoyH4HkhyRjz3jpDzG4Ko9';
    
    const formData = new FormData();
    formData.append('media', file);
    formData.append('models', 'nudity,wad');
    formData.append('api_user', API_KEY);
    formData.append('api_secret', API_SECRET);

    try {
      const response = await fetch('https://api.sightengine.com/1.0/check.json', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      const MAX_NUDITY = 0.8;
      const MAX_ALCOHOL = 0.9;

      console.log("cambios 2");
    
      if (result.nudity && typeof result.nudity.safe === 'number') {
        console.log(`Resultado de nudity.safe: ${result.nudity.safe}`, 
          `| Umbral: ${MAX_NUDITY}`, 
          `| ¿Supera el límite?: ${result.nudity.safe > MAX_NUDITY}`);
      }
      
      if (result.nudity.safe < MAX_NUDITY) {
        console.warn('Contenido inapropiado detectado:', result.nudity);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error con SightEngine:", error);
      return true;
    }
  }


/* subida normal
    async  uploadPhoto() {
      // Verificamos que OpenCV.js haya cargado
      if (!cvLoaded) {
        console.error("OpenCV.js no se ha cargado aún.");
        alert("Por favor, espera mientras OpenCV.js se carga.");
        return;
      }
  
      if (!this.selectedPhoto) return;
  
      const loadingElement = document.getElementById('cargando');
      const menuButton = document.getElementById('mainControl');
      
      if (loadingElement) {
          loadingElement.style.display = 'block';
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (menuButton) menuButton.style.display = 'none';
  
      try {
        const imgElement = new Image();
        const imageUrl = URL.createObjectURL(this.selectedPhoto);
        imgElement.src = imageUrl;
  
        imgElement.onload = async () => {
          // Esperamos que OpenCV.js esté completamente cargado
          if (typeof cv === 'undefined' || typeof cv.imread !== 'function') {
            console.error('cv.imread no está disponible');
            alert('OpenCV.js no está disponible correctamente.');
            return;
          }
  
          // Cargar la imagen en OpenCV
          const mat = cv.imread(imgElement);  // Debería funcionar si la imagen está cargada correctamente
          cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY, 0);
          const edges = new cv.Mat();
          cv.Canny(mat, edges, 100, 200);
  
          const nonZeroCount = cv.countNonZero(edges);
  
          if (nonZeroCount > 10000) {
            alert('La imagen parece contener contenido inapropiado (demasiados bordes detectados).');
            mat.delete();
            edges.delete();
            if (loadingElement) loadingElement.style.display = 'none';
            if (menuButton) menuButton.style.pointerEvents = 'auto';
            return;
          }
  
          let processedFile;
          if (this.selectedPhoto.type.startsWith('image/')) {
            processedFile = await this.compressImage(this.selectedPhoto);
          } else {
            processedFile = this.selectedPhoto;
          }
  
          const formData = new FormData();
          formData.append('photo', processedFile);
  
          const uploadURL = `/subir-foto?timestamp=${Date.now()}`;
          const response = await fetch(uploadURL, {
              method: 'POST',
              body: formData,
              headers: { 'Cache-Control': 'no-cache' }
          });
  
          if (!response.ok) throw new Error('Error al subir la foto');
          
          const json = await response.json();
          const nuevaFotoURL = json.url;
          window.location.href = `/album?nueva=${encodeURIComponent(nuevaFotoURL)}`;
  
          mat.delete();
          edges.delete();
        };
      } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la imagen: ' + error.message);
      } finally {
        if (loadingElement) loadingElement.style.display = 'none';
        if (menuButton) menuButton.style.pointerEvents = 'auto';
      }
    }

    */


}

// Ejemplo de uso:
// <div id="photo-container"></div>
// <button id="gallery-icon">Abrir galería</button>
// <button id="camera-icon">Tomar foto</button>
const photoHandler = new PhotoHandler('photo-container');
photoHandler.init();