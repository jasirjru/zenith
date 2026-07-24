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

        // === 3D FLEET OF CRAFT FLYING SIDEWISE IN BACKGROUND ===
        window.spacecraftFleet = [];
        
        function create3DSpacecraft(colorHex, scale = 1) {
            const craftGroup = new THREE.Group();

            // Main Fuselage / Hull (Cone)
            const hullGeo = new THREE.ConeGeometry(0.35 * scale, 1.6 * scale, 5);
            const hullMat = new THREE.MeshStandardMaterial({
                color: 0x1e293b,
                metalness: 0.8,
                roughness: 0.2,
                emissive: 0x0f172a
            });
            const hullMesh = new THREE.Mesh(hullGeo, hullMat);
            hullMesh.rotation.z = -Math.PI / 2; // Point sideways
            craftGroup.add(hullMesh);

            // Cockpit Glass
            const cockpitGeo = new THREE.SphereGeometry(0.22 * scale, 16, 16);
            const cockpitMat = new THREE.MeshPhysicalMaterial({
                color: colorHex,
                transmission: 0.6,
                opacity: 0.9,
                transparent: true,
                roughness: 0.1,
                ior: 1.5
            });
            const cockpitMesh = new THREE.Mesh(cockpitGeo, cockpitMat);
            cockpitMesh.position.set(0.2 * scale, 0.05 * scale, 0);
            craftGroup.add(cockpitMesh);

            // Delta Wings
            const wingGeo = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                 0.2 * scale, 0,  0.9 * scale, // Wing tip right
                -0.6 * scale, 0,  0.1 * scale, // Root back
                 0.4 * scale, 0,  0.1 * scale, // Root front
                 0.2 * scale, 0, -0.9 * scale, // Wing tip left
                -0.6 * scale, 0, -0.1 * scale,
                 0.4 * scale, 0, -0.1 * scale
            ]);
            wingGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            const wingMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, side: THREE.DoubleSide });
            const wingMesh = new THREE.Mesh(wingGeo, wingMat);
            craftGroup.add(wingMesh);

            // Plasma Thruster Glow
            const thrusterGeo = new THREE.SphereGeometry(0.12 * scale, 16, 16);
            const thrusterMat = new THREE.MeshBasicMaterial({ color: colorHex });
            const thrusterMesh = new THREE.Mesh(thrusterGeo, thrusterMat);
            thrusterMesh.position.set(-0.8 * scale, 0, 0);
            craftGroup.add(thrusterMesh);

            // Thruster Trail Particles
            const trailCount = 35;
            const trailGeo = new THREE.BufferGeometry();
            const trailPos = new Float32Array(trailCount * 3);
            for (let i = 0; i < trailCount; i++) {
                trailPos[i * 3]     = -0.8 * scale - (i * 0.08 * scale);
                trailPos[i * 3 + 1] = (Math.random() - 0.5) * 0.06 * scale;
                trailPos[i * 3 + 2] = (Math.random() - 0.5) * 0.06 * scale;
            }
            trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
            const trailMat = new THREE.PointsMaterial({
                size: 0.08 * scale,
                color: colorHex,
                transparent: true,
                opacity: 0.75,
                blending: THREE.AdditiveBlending
            });
            const trailPoints = new THREE.Points(trailGeo, trailMat);
            craftGroup.add(trailPoints);

            return { group: craftGroup, trailPoints };
        }

        // Spawn Craft 1 (Main Flagship Craft - Left to Right)
        const craft1 = create3DSpacecraft(0x3b82f6, 1.2);
        craft1.group.position.set(-18, 2.5, -4);
        craft1.speed = 0.035;
        craft1.direction = 1;
        craft1.baseY = 2.5;
        craft1.zDepth = -4;
        scene.add(craft1.group);
        window.spacecraftFleet.push(craft1);

        // Spawn Craft 2 (Sleek Scout Craft - Right to Left)
        const craft2 = create3DSpacecraft(0x8b5cf6, 0.85);
        craft2.group.position.set(18, -1.8, -6);
        craft2.group.rotation.y = Math.PI; // Face left
        craft2.speed = 0.025;
        craft2.direction = -1;
        craft2.baseY = -1.8;
        craft2.zDepth = -6;
        scene.add(craft2.group);
        window.spacecraftFleet.push(craft2);

        // Spawn Craft 3 (High Orbit Shuttle - Left to Right distant)
        const craft3 = create3DSpacecraft(0x06b6d4, 0.6);
        craft3.group.position.set(-22, 4.2, -10);
        craft3.speed = 0.018;
        craft3.direction = 1;
        craft3.baseY = 4.2;
        craft3.zDepth = -10;
        scene.add(craft3.group);
        window.spacecraftFleet.push(craft3);
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

        // Sidewise motion animation for 3D Spacecraft fleet
        if (window.spacecraftFleet) {
            window.spacecraftFleet.forEach((craft, idx) => {
                // Sidewise movement
                craft.group.position.x += craft.speed * craft.direction;
                
                // Gentle floating wave (Y-axis roll & bobbing)
                craft.group.position.y = craft.baseY + Math.sin(time * 1.5 + idx * 2) * 0.25;
                craft.group.rotation.x = Math.sin(time * 2 + idx) * 0.08; // Subtle pitch
                craft.group.rotation.z = Math.cos(time * 1.8 + idx) * 0.05 * craft.direction; // Subtle roll

                // Screen boundary wrapping (continuous sidewise loop)
                const boundX = 24;
                if (craft.direction === 1 && craft.group.position.x > boundX) {
                    craft.group.position.x = -boundX;
                } else if (craft.direction === -1 && craft.group.position.x < -boundX) {
                    craft.group.position.x = boundX;
                }
            });
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
    // ================================================================
    //  SPATIAL WEB AUDIO SYNTHESIZER & SOUND FX
    // ================================================================
    let audioCtx = null;
    let isMuted = true;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playBeep(freq = 440, duration = 0.08, type = 'sine') {
        if (isMuted) return;
        try {
            initAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch(e){}
    }

    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            isMuted = !isMuted;
            const iconOn = soundToggle.querySelector('.sound-icon-on');
            const iconOff = soundToggle.querySelector('.sound-icon-off');
            if (!isMuted) {
                if (iconOn) iconOn.style.display = 'block';
                if (iconOff) iconOff.style.display = 'none';
                soundToggle.style.borderColor = '#0071E3';
                playBeep(880, 0.15, 'sine');
            } else {
                if (iconOn) iconOn.style.display = 'none';
                if (iconOff) iconOff.style.display = 'block';
                soundToggle.style.borderColor = 'var(--border)';
            }
        });
    }

    // Attach subtle hover/click sound FX across interactive elements
    document.querySelectorAll('button, .nav-link, .card-btn, .color-btn, .tint-btn').forEach(el => {
        el.addEventListener('mouseenter', () => playBeep(320, 0.04, 'triangle'));
        el.addEventListener('click', () => playBeep(580, 0.08, 'sine'));
    });

    // ================================================================
    //  SPACESUIT CUSTOMIZER INTERACTION HANDLER
    // ================================================================
    const suitGlow = document.getElementById('suit-glow-bg');
    const suitWrapper = document.getElementById('suit-avatar-wrapper') || document.querySelector('.suit-avatar-wrapper');
    const visorOverlay = document.getElementById('visor-overlay');
    const badgeInsignia = document.getElementById('badge-insignia');
    const suitSpecTag = document.getElementById('suit-spec-tag');

    const colorMap = {
        blue: { color: '#0071E3', name: 'TITANIUM NEON BLUE' },
        violet: { color: '#BF5AF2', name: 'QUANTUM VIOLET' },
        emerald: { color: '#30D158', name: 'ORBITAL EMERALD' },
        gold: { color: '#FF9F0A', name: 'SOLAR GOLD' }
    };

    const tintMap = {
        gold: 'linear-gradient(135deg, rgba(255, 159, 10, 0.4), rgba(255, 215, 0, 0.1))',
        obsidian: 'linear-gradient(135deg, rgba(15, 15, 25, 0.8), rgba(0, 0, 0, 0.6))',
        iridescent: 'linear-gradient(135deg, rgba(0, 229, 255, 0.4), rgba(255, 0, 229, 0.2))'
    };

    // Accent Color Switcher
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const key = btn.dataset.color;
            if (colorMap[key]) {
                if (suitGlow) suitGlow.style.background = `radial-gradient(circle, ${colorMap[key].color}, transparent 70%)`;
                if (suitWrapper) {
                    suitWrapper.style.borderColor = colorMap[key].color;
                    suitWrapper.style.boxShadow = `0 0 35px ${colorMap[key].color}88`;
                }
                if (suitSpecTag) suitSpecTag.textContent = `SPECIFICATION: ${colorMap[key].name}`;
            }
        });
    });

    // Visor Tint Switcher
    document.querySelectorAll('.tint-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tint-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tint = btn.dataset.tint;
            if (visorOverlay && tintMap[tint]) {
                visorOverlay.style.background = tintMap[tint];
            }
        });
    });

    // Insignia Switcher
    document.querySelectorAll('.insignia-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.insignia-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (badgeInsignia) badgeInsignia.textContent = btn.dataset.patch;
        });
    });

    // ================================================================
    //  ORBITAL STARGAZER VIEWPORT SELECTION LOGIC
    // ================================================================
    document.querySelectorAll('.dest-node').forEach(node => {
        node.addEventListener('click', () => {
            document.querySelectorAll('.dest-node').forEach(n => n.classList.remove('active'));
            node.classList.add('active');

            const destName = document.getElementById('dest-name');
            const destDesc = document.getElementById('dest-desc');
            const destAlt = document.getElementById('dest-alt');
            const destTime = document.getElementById('dest-time');
            const destG = document.getElementById('dest-g');

            if (destName) destName.textContent = node.dataset.dest;
            if (destDesc) destDesc.textContent = node.dataset.desc;
            if (destAlt) destAlt.textContent = node.dataset.alt;
            if (destTime) destTime.textContent = node.dataset.time;
            if (destG) destG.textContent = node.dataset.g;

            playBeep(720, 0.1, 'sine');
        });
    });

    const solLockBtn = document.getElementById('sol-lock-btn');
    if (solLockBtn) {
        solLockBtn.addEventListener('click', () => {
            playBeep(980, 0.2, 'sine');
            const activeNode = document.querySelector('.dest-node.active');
            const targetName = activeNode ? activeNode.dataset.dest : 'Selected Orbit';
            solLockBtn.innerHTML = `<span>✓ ${targetName.toUpperCase()} LOCKED</span>`;
            solLockBtn.style.background = '#30D158';
            setTimeout(() => {
                solLockBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m12 8 4 4-4 4M8 12h8"/></svg><span>Lock Orbital Target</span>`;
                solLockBtn.style.background = '';
            }, 3000);
        });
    }

    // ================================================================
    //  QUANTUM LAUNCH FLIGHT SIMULATOR CONSOLE LOGIC
    // ================================================================
    const btnIgnite = document.getElementById('btn-ignite');
    const btnSimReset = document.getElementById('btn-sim-reset');
    const simRocket = document.getElementById('sim-rocket');
    const rocketFire = document.getElementById('rocket-fire');
    const simProgress = document.getElementById('sim-progress');
    const hudMach = document.getElementById('hud-mach');
    const hudAlt = document.getElementById('hud-alt');
    const hudG = document.getElementById('hud-g');
    const hudStatus = document.getElementById('hud-status');
    const simLogBox = document.getElementById('sim-log-box');

    let simInterval = null;
    let isLaunching = false;

    function addSimLog(msg) {
        if (!simLogBox) return;
        const line = document.createElement('div');
        line.className = 'log-line';
        line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        simLogBox.appendChild(line);
        simLogBox.scrollTop = simLogBox.scrollHeight;
    }

    if (btnIgnite) {
        btnIgnite.addEventListener('click', () => {
            if (isLaunching) return;
            isLaunching = true;
            playBeep(220, 0.4, 'sawtooth');

            if (rocketFire) rocketFire.style.opacity = '1';
            if (hudStatus) { hudStatus.textContent = 'IGNITION & LIFTOFF'; hudStatus.style.color = '#ff9f0a'; }
            addSimLog('MAIN ENGINES IGNITED. T-0 LIFTOFF!');

            let progress = 0;
            let alt = 0;
            let mach = 0;
            let gForce = 1.0;

            simInterval = setInterval(() => {
                progress += 1;
                alt += 4.0;
                mach += 0.25;
                gForce = Math.min(3.8, 1.0 + (progress * 0.03)).toFixed(1);

                if (simProgress) simProgress.style.width = `${progress}%`;
                if (hudMach) hudMach.textContent = mach.toFixed(2);
                if (hudAlt) hudAlt.textContent = `${alt.toFixed(1)} KM`;
                if (hudG) hudG.textContent = `${gForce} G`;

                // Move rocket graphic upward
                if (simRocket) simRocket.style.bottom = `${40 + (progress * 2.2)}px`;

                if (progress === 30) addSimLog('MAX Q PASSED. AERODYNAMIC PRESSURE NOMINAL.');
                if (progress === 60) addSimLog('STAGE 1 SEPARATION CONFIRMED.');
                if (progress === 90) addSimLog('APPROACHING ORBITAL INSERTION VELOCITY.');

                if (progress >= 100) {
                    clearInterval(simInterval);
                    if (rocketFire) rocketFire.style.opacity = '0';
                    if (hudStatus) { hudStatus.textContent = 'ORBIT ACHIEVED ✓'; hudStatus.style.color = '#30D158'; }
                    addSimLog('SUCCESS: COMMANDER JASIR IS IN ORBIT (400 KM)!');
                    playBeep(880, 0.3, 'sine');
                }
            }, 100);
        });
    }

    if (btnSimReset) {
        btnSimReset.addEventListener('click', () => {
            if (simInterval) clearInterval(simInterval);
            isLaunching = false;
            if (rocketFire) rocketFire.style.opacity = '0';
            if (simRocket) simRocket.style.bottom = '40px';
            if (simProgress) simProgress.style.width = '0%';
            if (hudMach) hudMach.textContent = '0.00';
            if (hudAlt) hudAlt.textContent = '0.0 KM';
            if (hudG) hudG.textContent = '1.0 G';
            if (hudStatus) { hudStatus.textContent = 'READY ON PAD'; hudStatus.style.color = '#3b82f6'; }
            addSimLog('Cockpit reset. Systems ready for re-ignition.');
            playBeep(440, 0.1, 'sine');
        });
    }

})();
