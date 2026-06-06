/*
  ANUM SALOON - INTERACTIVE ENGINE
  Architected by Antigravity
*/

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    // Initial Body Fade In
    gsap.to('body', { opacity: 1, duration: 1.2, ease: 'power2.out' });

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Hero Animations
    const heroTl = gsap.timeline();
    heroTl.from('.hero-content > *', {
        opacity: 0,
        y: 30,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out'
    })
    .from('.hero-bg', {
        opacity: 0,
        x: 50,
        duration: 1.2,
        ease: 'power3.out'
    }, '-=1');

    // Stats Counter Animation
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = parseFloat(stat.innerText);
        gsap.from(stat, {
            scrollTrigger: {
                trigger: stat,
                start: 'top 90%',
            },
            innerText: 0,
            duration: 2,
            snap: { innerText: 1 },
            ease: 'power1.out'
        });
    });

    // Services Filter Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            // Filter cards
            gsap.to(serviceCards, {
                opacity: 0,
                scale: 0.9,
                duration: 0.3,
                onComplete: () => {
                    serviceCards.forEach(card => {
                        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                            card.style.display = 'block';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                    
                    gsap.to(serviceCards, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.5,
                        stagger: 0.1,
                        ease: 'power2.out'
                    });
                }
            });
        });
    });

    // Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');

            // Close other items
            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));

            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Scroll Animations for Sections
    const fadeUpElements = document.querySelectorAll('.service-card, .about-content, .about-visual, .section-header, .stat-item');
    
    fadeUpElements.forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power3.out'
        });
    });

    // Parallax Effect for Hero
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        gsap.to('#hero-img', {
            y: scrolled * 0.4,
            duration: 0
        });
    });

    // Testimonial Slider (Simple Drag/Scroll simulation with GSAP)
    gsap.to('.testimonial-slider', {
        scrollTrigger: {
            trigger: '.testimonials-section',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1,
        },
        xPercent: -20, // Subtle movement as user scrolls
        ease: 'none'
    });

    // Gallery Missing Image Fallback
    const fallbackImage = "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80";
    document.querySelectorAll(".gallery-section img").forEach(img => {
        img.onerror = function () {
            this.src = fallbackImage;
        };
    });
});
