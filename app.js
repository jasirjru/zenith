/**
 * ZENITH — Space Tourism 3D Interactive Engine
 * Three.js particle starfield, orbital planet, scroll reveals,
 * 3D card tilt, countdown timer, login scanner, counter animations
 */

(function () {
    'use strict';

    // ================================================================
    //  DOM REFERENCES
    // ================================================================
    const loginOverlay = document.getElementById('login-overlay');
    const loginParticlesContainer = document.getElementById('login-particles');
    const scannerTrigger = document.getElementById('scanner-trigger');
    const scannerLabel = document.getElementById('scanner-label');
    const loginEnterBtn = document.getElementById('login-enter-btn');
    const mainContent = document.getElementById('main-content');
    const mainNav = document.getElementById('main-nav');
    const cosmosCanvas = document.getElementById('cosmos-canvas');
    const reserveForm = document.getElementById('reserve-form');

    // ================================================================
    //  LOGIN PARTICLE FIELD (CSS-based floating dots)
    // ================================================================
    function spawnLoginParticles() {
        for (let i = 0; i < 40; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + 50 + '%';
            p.style.animationDelay = Math.random() * 6 + 's';
            p.style.animationDuration = (4 + Math.random() * 5) + 's';
            p.style.width = p.style.height = (1 + Math.random() * 2) + 'px';
            const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#ffffff'];
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            loginParticlesContainer.appendChild(p);
        }
    }
    spawnLoginParticles();

    // ================================================================
    //  LOGIN SCANNER INTERACTION
    // ================================================================
    let scanTriggered = false;

    function triggerScan() {
        if (scanTriggered) return;
        scanTriggered = true;

        scannerLabel.textContent = 'Scanning...';
        scannerTrigger.classList.add('authenticated');

        // Synthesize a confirmation chime
        playChime([440, 660, 880], 0.12, 0.4);

        setTimeout(() => {
            scannerLabel.textContent = 'Authenticated ✓';
            playChime([660, 880, 1100], 0.1, 0.3);
            setTimeout(enterApp, 600);
        }, 1200);
    }

    function enterApp() {
        loginOverlay.classList.add('hidden');
        mainContent.classList.add('visible');
        cosmosCanvas.style.pointerEvents = 'none';
        // Trigger scroll-based reveals for elements already in viewport
        setTimeout(checkReveals, 200);
    }

    scannerTrigger.addEventListener('click', triggerScan);
    loginEnterBtn.addEventListener('click', () => {
        playChime([440, 880], 0.1, 0.3);
        enterApp();
    });

    // ================================================================
    //  WEB AUDIO CHIME SYNTHESIZER
    // ================================================================
    function playChime(frequencies, volume, totalDuration) {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            frequencies.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                const start = ctx.currentTime + i * 0.12;
                gain.gain.setValueAtTime(volume, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + totalDuration);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(start);
                osc.stop(start + totalDuration);
            });
        } catch (e) { /* Audio context requires user gesture */ }
    }

    // ================================================================
    //  THREE.JS — COSMIC STARFIELD & PLANET
    // ================================================================
    let scene, camera, renderer;
    let starsMesh, planetMesh, atmosphereMesh, orbitRingMesh;
    let mouseX = 0, mouseY = 0;

    function initThreeJS() {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(0, 0, 5);

        renderer = new THREE.WebGLRenderer({
            canvas: cosmosCanvas,
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // === STAR FIELD ===
        const starCount = 6000;
        const starGeo = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            starPositions[i3]     = (Math.random() - 0.5) * 100;
            starPositions[i3 + 1] = (Math.random() - 0.5) * 100;
            starPositions[i3 + 2] = (Math.random() - 0.5) * 100;

            // Vary star colors: white, blue-white, cool blue
            const colorMix = Math.random();
            if (colorMix < 0.6) {
                starColors[i3] = 0.9; starColors[i3+1] = 0.92; starColors[i3+2] = 1.0;
            } else if (colorMix < 0.8) {
                starColors[i3] = 0.6; starColors[i3+1] = 0.7; starColors[i3+2] = 1.0;
            } else {
                starColors[i3] = 0.85; starColors[i3+1] = 0.85; starColors[i3+2] = 0.95;
            }
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        const starMat = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            sizeAttenuation: true
        });
        starsMesh = new THREE.Points(starGeo, starMat);
        scene.add(starsMesh);

        // === PLANET ===
        const planetGeo = new THREE.SphereGeometry(1.8, 64, 64);
        const planetMat = new THREE.MeshPhongMaterial({
            color: 0x0a1628,
            emissive: 0x0a1628,
            emissiveIntensity: 0.3,
            shininess: 30,
            transparent: true,
            opacity: 0.9
        });
        planetMesh = new THREE.Mesh(planetGeo, planetMat);
        planetMesh.position.set(4.5, -1.5, -8);
        scene.add(planetMesh);

        // === ATMOSPHERE GLOW ===
        const atmosGeo = new THREE.SphereGeometry(2.1, 64, 64);
        const atmosMat = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.08,
            side: THREE.BackSide
        });
        atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
        atmosphereMesh.position.copy(planetMesh.position);
        scene.add(atmosphereMesh);

        // === ORBIT RING ===
        const orbitGeo = new THREE.RingGeometry(2.8, 2.85, 128);
        const orbitMat = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide
        });
        orbitRingMesh = new THREE.Mesh(orbitGeo, orbitMat);
        orbitRingMesh.position.copy(planetMesh.position);
        orbitRingMesh.rotation.x = Math.PI * 0.35;
        scene.add(orbitRingMesh);

        // === LIGHTING ===
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const directional = new THREE.DirectionalLight(0xffffff, 1.2);
        directional.position.set(-5, 5, 5);
        scene.add(directional);

        const bluePoint = new THREE.PointLight(0x3b82f6, 2, 20);
        bluePoint.position.set(6, 2, -5);
        scene.add(bluePoint);

        const violetPoint = new THREE.PointLight(0x8b5cf6, 1.5, 15);
        violetPoint.position.set(-4, -3, -6);
        scene.add(violetPoint);

        // Mouse parallax tracking
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        window.addEventListener('resize', onResize);
        animate();
    }

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);

        const time = performance.now() * 0.001;

        // Slowly rotate star field
        if (starsMesh) {
            starsMesh.rotation.y += 0.0002;
            starsMesh.rotation.x += 0.0001;
        }

        // Rotate planet
        if (planetMesh) {
            planetMesh.rotation.y += 0.001;
        }

        // Orbit ring subtle rotation
        if (orbitRingMesh) {
            orbitRingMesh.rotation.z += 0.0005;
        }

        // Mouse-driven camera parallax
        camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 0.2 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }

    initThreeJS();

    // ================================================================
    //  SCROLL — NAV BACKGROUND & REVEAL ANIMATIONS
    // ================================================================
    const revealElements = document.querySelectorAll('.reveal-up');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    function checkReveals() {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.85) {
                el.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', () => {
        // Nav glass background on scroll
        if (mainNav) {
            mainNav.classList.toggle('scrolled', window.scrollY > 60);
        }
    });

    // ================================================================
    //  3D CARD TILT EFFECT
    // ================================================================
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const rotateX = (y - 0.5) * -8;
            const rotateY = (x - 0.5) * 8;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ================================================================
    //  ANIMATED NUMBER COUNTERS
    // ================================================================
    let countersAnimated = false;
    const statsSection = document.getElementById('stats');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersAnimated) {
                countersAnimated = true;
                animateCounters();
            }
        });
    }, { threshold: 0.3 });

    if (statsSection) counterObserver.observe(statsSection);

    function animateCounters() {
        document.querySelectorAll('.stat-number').forEach(el => {
            const target = parseFloat(el.dataset.target);
            const duration = 2000;
            const start = performance.now();

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const ease = 1 - Math.pow(1 - progress, 3);
                const current = target * ease;

                if (Number.isInteger(target)) {
                    el.textContent = Math.round(current);
                } else {
                    el.textContent = current.toFixed(1);
                }

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }
            requestAnimationFrame(update);
        });
    }

    // ================================================================
    //  COUNTDOWN TIMER (Next launch: 45 days from now)
    // ================================================================
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 45);

    function updateCountdown() {
        const now = new Date();
        const diff = launchDate - now;

        if (diff <= 0) return;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        const pad = (n) => String(n).padStart(2, '0');

        const cdDays = document.getElementById('cd-days');
        const cdHours = document.getElementById('cd-hours');
        const cdMins = document.getElementById('cd-mins');
        const cdSecs = document.getElementById('cd-secs');

        if (cdDays) cdDays.textContent = pad(days);
        if (cdHours) cdHours.textContent = pad(hours);
        if (cdMins) cdMins.textContent = pad(mins);
        if (cdSecs) cdSecs.textContent = pad(secs);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ================================================================
    //  RESERVATION FORM HANDLER
    // ================================================================
    if (reserveForm) {
        reserveForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('reserve-email');
            const btn = reserveForm.querySelector('.reserve-btn');

            if (email && email.value) {
                btn.textContent = 'You\'re on the list! 🚀';
                btn.style.background = 'linear-gradient(135deg, #22c55e, #06b6d4)';
                email.value = '';
                playChime([523, 659, 784], 0.1, 0.5);

                setTimeout(() => {
                    btn.textContent = 'Join Waitlist';
                    btn.style.background = '';
                }, 3000);
            }
        });
    }

    // ================================================================
    //  SMOOTH ANCHOR SCROLL
    // ================================================================
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Nav CTA scroll to reserve
    const navCtaBtn = document.getElementById('nav-cta-btn');
    if (navCtaBtn) {
        navCtaBtn.addEventListener('click', () => {
            const reserve = document.getElementById('reserve');
            if (reserve) reserve.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ================================================================
    //  BOARDING PASS MODAL HANDLER
    // ================================================================
    const boardingModal = document.getElementById('boarding-pass-modal');
    const btnViewPass = document.getElementById('btn-view-pass');
    const btnCommanderPass = document.getElementById('btn-commander-pass');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const navUserChip = document.getElementById('nav-user-chip');

    function openPassModal() {
        if (boardingModal) {
            boardingModal.classList.add('active');
            playChime([523, 659, 784, 1046], 0.1, 0.4);
        }
    }

    function closePassModal() {
        if (boardingModal) {
            boardingModal.classList.remove('active');
        }
    }

    if (btnViewPass) btnViewPass.addEventListener('click', openPassModal);
    if (btnCommanderPass) btnCommanderPass.addEventListener('click', openPassModal);
    if (navUserChip) navUserChip.addEventListener('click', openPassModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closePassModal);

    if (boardingModal) {
        boardingModal.addEventListener('click', (e) => {
            if (e.target === boardingModal) closePassModal();
        });
    }

    // Hero buttons
    const heroBookBtn = document.getElementById('hero-book-btn');
    if (heroBookBtn) {
        heroBookBtn.addEventListener('click', () => {
            const missions = document.getElementById('missions');
            if (missions) missions.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ================================================================
    //  FAQ ACCORDION
    // ================================================================
    document.querySelectorAll('.faq-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = btn.dataset.faq;
            const answer = document.getElementById('faq-' + idx);
            const item = btn.closest('.faq-item');
            const isOpen = btn.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-q').forEach(b => {
                b.classList.remove('active');
                b.closest('.faq-item').classList.remove('open');
            });
            document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));

            // Toggle current
            if (!isOpen) {
                btn.classList.add('active');
                item.classList.add('open');
                if (answer) answer.classList.add('open');
            }
        });
    });

    // ================================================================
    //  LIVE MISSION CLOCK — counts up from a reference launch time
    // ================================================================
    function updateMissionClock() {
        const launchTime = new Date('2026-07-22T10:00:00Z').getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - launchTime) / 1000);

        const days = Math.floor(elapsed / 86400);
        const hours = Math.floor((elapsed % 86400) / 3600);
        const mins = Math.floor((elapsed % 3600) / 60);

        const elD = document.getElementById('mc-d');
        const elH = document.getElementById('mc-h');
        const elM = document.getElementById('mc-m');

        if (elD) elD.textContent = String(days).padStart(2, '0');
        if (elH) elH.textContent = String(hours).padStart(2, '0');
        if (elM) elM.textContent = String(mins).padStart(2, '0');

        // Orbit approx: 90 min per orbit
        const orbits = Math.floor(elapsed / 5400);
        const elOrbits = document.getElementById('orbit-count');
        if (elOrbits) elOrbits.textContent = orbits;
    }
    updateMissionClock();
    setInterval(updateMissionClock, 60000);

    // ================================================================
    //  LIVE APP ALTITUDE FLICKER
    // ================================================================
    function flickerAltitude() {
        const el = document.getElementById('app-alt');
        if (!el) return;
        const base = 400.0;
        const jitter = (Math.random() - 0.5) * 0.4;
        el.textContent = (base + jitter).toFixed(1) + ' km';
    }
    setInterval(flickerAltitude, 3000);

    // ================================================================
    //  GAUGE ALT PULSE — subtle animation on scroll into view
    // ================================================================
    const gaugeArc = document.getElementById('gauge-alt');
    if (gaugeArc) {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    gaugeArc.style.strokeDashoffset = '50';
                    setTimeout(() => { gaugeArc.style.strokeDashoffset = '45'; }, 1000);
                    setTimeout(() => { gaugeArc.style.strokeDashoffset = '52'; }, 2000);
                    obs.disconnect();
                }
            });
        }, { threshold: 0.3 });
        obs.observe(gaugeArc);
    }

})();
