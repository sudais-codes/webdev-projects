document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });
    });

    // GSAP ScrollReveal Global
    gsap.registerPlugin(ScrollTrigger);

    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 85%",
                toggleActions: "play none none none",
                once: true
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        });
    });

    // Stats Counter Animation
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = +stat.getAttribute('data-target');
        gsap.to(stat, {
            scrollTrigger: {
                trigger: stat,
                start: "top 90%"
            },
            innerText: target,
            duration: 2,
            snap: { innerText: 1 },
            onUpdate: function() {
                const val = Math.ceil(this.targets()[0].innerText);
                const suffix = stat.getAttribute('data-suffix') || '';
                this.targets()[0].innerText = val + suffix;
            }
        });
    });

    // Progress Bars Animation
    const progressFills = document.querySelectorAll('.progress-fill');
    progressFills.forEach(fill => {
        const target = fill.getAttribute('data-width');
        gsap.to(fill, {
            scrollTrigger: {
                trigger: fill,
                start: "top 90%"
            },
            width: target,
            duration: 1.5,
            ease: "power2.out"
        });
    });

    // Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const wasActive = item.classList.contains('active');
            
            // Close all items
            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
            
            if (!wasActive) {
                item.classList.add('active');
            }
        });
    });

    // Contact Form Simulation
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button');
            const originalText = submitBtn.innerText;
            
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            setTimeout(() => {
                const successMsg = document.createElement('div');
                successMsg.className = 'glass-card';
                successMsg.style.position = 'fixed';
                successMsg.style.top = '50%';
                successMsg.style.left = '50%';
                successMsg.style.transform = 'translate(-50%, -50%)';
                successMsg.style.zIndex = '1001';
                successMsg.style.textAlign = 'center';
                successMsg.innerHTML = `<h3 style="color: var(--accent-blue)">Message Sent!</h3><p>I'll get back to you soon.</p>`;
                document.body.appendChild(successMsg);

                gsap.from(successMsg, { scale: 0, opacity: 0, duration: 0.5 });

                setTimeout(() => {
                    gsap.to(successMsg, { scale: 0, opacity: 0, duration: 0.5, onComplete: () => {
                        successMsg.remove();
                        contactForm.reset();
                        submitBtn.innerText = originalText;
                        submitBtn.disabled = false;
                    }});
                }, 3000);
            }, 1500);
        });
    }

    // Project Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card-container');
    
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                projectCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = 'block';
                        gsap.fromTo(card, {scale: 0.8, opacity: 0}, {scale: 1, opacity: 1, duration: 0.5});
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
});
