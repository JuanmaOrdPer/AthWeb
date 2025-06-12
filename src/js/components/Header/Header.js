export class Header {
  constructor() {
    this.isMenuOpen = false;
    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const header = document.getElementById('header');
    if (!header) return;

    header.innerHTML = `
      <header class="main-header">
        <div class="container">
          <div class="logo">
            <a href="/">
              <i class="fas fa-running"></i>
              <span>AthCylWeb</span>
            </a>
          </div>
          
          <nav class="main-nav">
            <ul class="nav-list">
              <li class="nav-item">
                <a href="#inicio" class="nav-link active">Inicio</a>
              </li>
              <li class="nav-item">
                <a href="#proximas-carreras" class="nav-link">Próximas Carreras</a>
              </li>
              <li class="nav-item">
                <a href="#destacados" class="nav-link">Destacados</a>
              </li>
              <li class="nav-item">
                <a href="#contacto" class="nav-link">Contacto</a>
              </li>
              <li class="nav-item nav-cta">
                <a href="#registrar-carrera" class="btn btn-outline">Registrar Carrera</a>
              </li>
            </ul>
          </nav>
          
          <button class="mobile-menu-toggle" aria-label="Menú">
            <span class="menu-icon"></span>
          </button>
        </div>
      </header>
    `;
  }

  setupEventListeners() {
    // Toggle del menú móvil
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', () => this.toggleMenu());
    }

    // Cerrar menú al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isMenuOpen) {
          this.toggleMenu(false);
        }
        
        // Actualizar enlace activo
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      const isClickInside = document.querySelector('.main-nav').contains(e.target) || 
                          document.querySelector('.mobile-menu-toggle').contains(e.target);
      
      if (!isClickInside && this.isMenuOpen) {
        this.toggleMenu(false);
      }
    });

    // Cambiar header en scroll
    window.addEventListener('scroll', this.handleScroll);
  }

  toggleMenu(forceClose) {
    const body = document.body;
    const nav = document.querySelector('.main-nav');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    this.isMenuOpen = forceClose === false ? false : !this.isMenuOpen;
    
    if (this.isMenuOpen) {
      body.style.overflow = 'hidden';
      nav.classList.add('active');
      menuToggle?.classList.add('active');
    } else {
      body.style.overflow = '';
      nav.classList.remove('active');
      menuToggle?.classList.remove('active');
    }
  }

  handleScroll = () => {
    const header = document.querySelector('.main-header');
    if (!header) return;
    
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
}
