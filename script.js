// JavaScript para la funcionalidad de la página

// Menú móvil
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
});

// Cerrar menú al hacer clic en un enlace
const navLinks = document.querySelectorAll('nav ul li a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
    });
});

// Filtrado de carreras (simulado)
const mesSelect = document.getElementById('mes');
const distanciaSelect = document.getElementById('distancia');

function filtrarCarreras() {
    const mes = mesSelect.value;
    const distancia = distanciaSelect.value;
    
    // Aquí iría la lógica real de filtrado
    console.log(`Filtrando por: Mes=${mes}, Distancia=${distancia}`);
    
    // Simulación de filtrado con animación
    const carreraCards = document.querySelectorAll('.carrera-card');
    
    carreraCards.forEach(card => {
        card.style.opacity = '0.5';
        card.style.transform = 'scale(0.95)';
    });
    
    setTimeout(() => {
        carreraCards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    }, 500);
}

mesSelect.addEventListener('change', filtrarCarreras);
distanciaSelect.addEventListener('change', filtrarCarreras);

// Formulario de newsletter
const newsletterForm = document.querySelector('.newsletter-form');

newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input').value;
    
    if (email) {
        // Simulación de envío
        newsletterForm.innerHTML = '<p class="success-message">¡Gracias por suscribirte! Recibirás nuestras actualizaciones.</p>';
    }
});

// Animación de scroll suave para los enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Efecto de aparición al hacer scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Aplicar el efecto a las secciones y tarjetas
document.querySelectorAll('section, .carrera-card, .destacado-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// Añadir clase para CSS
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
});
