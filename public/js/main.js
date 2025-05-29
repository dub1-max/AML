// DOM elements
const header = document.querySelector('header');
const backToTopBtn = document.getElementById('backToTop');
const openMenuBtn = document.getElementById('openMenu');
const closeMenuBtn = document.getElementById('closeMenu');
const navLinks = document.getElementById('navLinks');
const contactForm = document.getElementById('contactForm');
const newsletterForm = document.getElementById('newsletterForm');

// Header scroll effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
    backToTopBtn.classList.add('show');
  } else {
    header.classList.remove('scrolled');
    backToTopBtn.classList.remove('show');
  }
});

// Mobile menu toggle
openMenuBtn.addEventListener('click', () => {
  navLinks.classList.add('active');
});

closeMenuBtn.addEventListener('click', () => {
  navLinks.classList.remove('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links ul li a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// Back to top button
backToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Form submissions
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const company = document.getElementById('company').value;
    const message = document.getElementById('message').value;
    
    // Here you would typically send an API request to submit the form data
    console.log('Contact form submitted:', { name, email, company, message });
    
    // Show success message
    alert('Thank you for your message. We will get back to you soon!');
    
    // Reset the form
    contactForm.reset();
  });
}

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = newsletterForm.querySelector('input[type="email"]').value;
    
    // Here you would typically send an API request to submit the email
    console.log('Newsletter subscription:', email);
    
    // Show success message
    alert('Thank you for subscribing to our newsletter!');
    
    // Reset the form
    newsletterForm.reset();
  });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const navHeight = document.querySelector('header').offsetHeight;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Animation on scroll
const animateOnScroll = () => {
  const elements = document.querySelectorAll('.feature-card, .solution-card, .compliance-card, .pricing-card, .stat-box, .info-item');
  
  elements.forEach(element => {
    const elementPosition = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (elementPosition < windowHeight - 100) {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }
  });
};

// Set initial opacity and transform for animation elements
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.feature-card, .solution-card, .compliance-card, .pricing-card, .stat-box, .info-item');
  
  elements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  
  // Trigger the animation for elements in the initial viewport
  animateOnScroll();
  
  // Create a hero image placeholder until the actual image loads
  const heroImage = document.querySelector('.hero-image img');
  if (heroImage && !heroImage.complete) {
    heroImage.style.opacity = '0';
    heroImage.addEventListener('load', () => {
      heroImage.style.transition = 'opacity 0.5s ease';
      heroImage.style.opacity = '1';
    });
  }
});

// Listen for scroll events to trigger animations
window.addEventListener('scroll', animateOnScroll);

// Handle tab key navigation for accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-navigation');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-navigation');
});

// main.js - KYCSync landing page functionality

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const openMenu = document.getElementById('openMenu');
  const closeMenu = document.getElementById('closeMenu');
  const navLinks = document.getElementById('navLinks');
  
  if (openMenu) {
    openMenu.addEventListener('click', function() {
      navLinks.style.right = '0';
    });
  }
  
  if (closeMenu) {
    closeMenu.addEventListener('click', function() {
      navLinks.style.right = '-200px';
    });
  }
  
  // Back to top button functionality
  const backToTopButton = document.getElementById('backToTop');
  
  if (backToTopButton) {
    // Show button when user scrolls down 300px
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopButton.style.display = 'block';
      } else {
        backToTopButton.style.display = 'none';
      }
    });
    
    // Scroll to top when button clicked
    backToTopButton.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
});