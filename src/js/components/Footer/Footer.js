export class Footer {
  constructor() {
    this.currentYear = new Date().getFullYear();
    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const footer = document.getElementById('footer');
    if (!footer) return;

    footer.innerHTML = `
      <footer class="main-footer">
        <div class="container">
          <div class="footer-grid">
            <!-- Columna 1: Logo y descripción -->
            <div class="footer-col footer-about">
              <div class="footer-logo">
                <i class="fas fa-running"></i>
                <span>AthCylWeb</span>
              </div>
              <p class="footer-description">
                Tu portal de referencia para descubrir y participar en las mejores carreras populares 
                y eventos de atletismo a nivel mundial.
              </p>
              <div class="social-links">
                <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
              </div>
            </div>
            
            <!-- Columna 2: Enlaces rápidos -->
            <div class="footer-col">
              <h3 class="footer-title">Enlaces Rápidos</h3>
              <ul class="footer-links">
                <li><a href="#inicio">Inicio</a></li>
                <li><a href="#proximas-carreras">Próximas Carreras</a></li>
                <li><a href="#destacados">Carreras Destacadas</a></li>
                <li><a href="#como-funciona">¿Cómo funciona?</a></li>
                <li><a href="#testimonios">Testimonios</a></li>
              </ul>
            </div>
            
            <!-- Columna 3: Categorías -->
            <div class="footer-col">
              <h3 class="footer-title">Categorías</h3>
              <ul class="footer-links">
                <li><a href="#5k">Carreras 5K</a></li>
                <li><a href="#10k">Carreras 10K</a></li>
                <li><a href="#media-maraton">Media Maratón</a></li>
                <li><a href="#maraton">Maratón</a></li>
                <li><a href="#trail">Trail Running</a></li>
              </ul>
            </div>
            
            <!-- Columna 4: Contacto -->
            <div class="footer-col">
              <h3 class="footer-title">Contacto</h3>
              <ul class="footer-contact">
                <li>
                  <i class="fas fa-map-marker-alt"></i>
                  <span>Calle del Deporte, 123<br>37001 Salamanca, España</span>
                </li>
                <li>
                  <i class="fas fa-phone-alt"></i>
                  <a href="tel:+34923456789">+34 923 45 67 89</a>
                </li>
                <li>
                  <i class="fas fa-envelope"></i>
                  <a href="mailto:info@athcylweb.com">info@athcylweb.com</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div class="footer-bottom">
            <div class="copyright">
              &copy; ${this.currentYear} AthCylWeb. Todos los derechos reservados.
            </div>
            <div class="footer-legal">
              <a href="#">Términos y condiciones</a>
              <span>|</span>
              <a href="#">Política de privacidad</a>
              <span>|</span>
              <a href="#">Política de cookies</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  setupEventListeners() {
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}
