document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Анимация появления элементов при скролле (Scroll Reveal) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Опционально можно перестать отслеживать, чтобы анимация была один раз
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => observer.observe(el));


    // --- 2. Эффект разного угла поворота для фотокарточек ---
    const photoCards = document.querySelectorAll('.photo-card');
    photoCards.forEach(card => {
        // Рандомный поворот от -3 до 3 градусов
        const randomRot = Math.random() * 6 - 3;
        card.style.setProperty('--rotate', `${randomRot}deg`);
    });


    // --- 3. Анимация частиц на фоне (Canvas) ---
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles;

        function initParticles() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = [];

            const numParticles = window.innerWidth < 768 ? 100 : 300;

            for (let i = 0; i < numParticles; i++) {
                const colors = ['255, 255, 255', '255, 182, 193', '255, 228, 225']; // Белые, светло-розовые, нежные
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 3 + 0.5,
                    vx: Math.random() * 1 - 0.5,
                    vy: Math.random() * -1 - 0.2, // Медленно плывут вверх/в стороны
                    opacity: Math.random() * 0.8 + 0.2,
                    pulsateSpeed: Math.random() * 0.05 + 0.01,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                // Мерцание (смена прозрачности)
                p.opacity += p.pulsateSpeed;
                if(p.opacity > 1) { p.opacity = 1; p.pulsateSpeed = -p.pulsateSpeed; }
                if(p.opacity < 0.1) { p.opacity = 0.1; p.pulsateSpeed = -p.pulsateSpeed; }

                ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
                ctx.fill();
                
                // Обновляем позицию
                p.x += p.vx;
                p.y += p.vy;

                // Если частица уходит за экран, возвращаем её с другой стороны
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;
            });

            requestAnimationFrame(drawParticles);
        }

        let lastParticleWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            // Пересоздаем частицы только если изменилась ширина экрана (а не при скролле на мобильном)
            if (window.innerWidth !== lastParticleWidth) {
                lastParticleWidth = window.innerWidth;
                initParticles();
            }
        });
        initParticles();
        drawParticles();
    }


    // --- 4. Интерактивная кнопка "Обнять маму" ---
    const hugBtn = document.getElementById('hug-btn');
    const heartsContainer = document.getElementById('hearts-container');

    if (hugBtn && heartsContainer) {
        hugBtn.addEventListener('click', (e) => {
            // Эффект пульсации самой кнопки при клике
            hugBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                hugBtn.style.transform = 'scale(1)';
            }, 150);

            // Создаем сердечки
            createHearts(e.clientX, e.clientY);
        });
    }

    function createHearts(x, y) {
        const numHearts = 12; // Увеличим количество
        const heartsContent = ['❤️', '💖', '🌸', '✨'];
        
        // Получаем координаты контейнера, чтобы правильно позиционировать сердечки внутри него
        // независимо от прокрутки страницы
        const containerRect = heartsContainer.getBoundingClientRect();

        for (let i = 0; i < numHearts; i++) {
            const heart = document.createElement('div');
            heart.classList.add('floating-heart');
            
            const randomContent = heartsContent[Math.floor(Math.random() * heartsContent.length)];
            heart.textContent = randomContent;

            let clientX = x;
            let clientY = y;
            
            // Если координаты не переданы, берем центр кнопки
            if (!x || !y) {
                const btnRect = hugBtn.getBoundingClientRect();
                clientX = btnRect.left + btnRect.width / 2;
                clientY = btnRect.top + btnRect.height / 2;
            }

            // Переводим из экранных координат во внутренние координаты контейнера
            const startX = clientX - containerRect.left;
            // Чуть-чуть приподнимем старт, чтобы они вылетали прямо из-под кнопки
            const startY = clientY - containerRect.top - 10; 

            // Рандомный разброс
            const offsetX = Math.random() * 80 - 40;
            const offsetY = Math.random() * 30 - 15;

            heart.style.left = `${startX + offsetX}px`;
            heart.style.top = `${startY + offsetY}px`;
            
            // Рандомный размер
            const scale = Math.random() * 0.8 + 0.6;
            heart.style.fontSize = `${2 * scale}rem`;

            heartsContainer.appendChild(heart);

            // Удаляем элемент после завершения анимации
            setTimeout(() => {
                heart.remove();
            }, 2000);
        }
    }

    // --- 4.5. «Втягивающееся пространство» на первом экране ---
    const spiderCanvas = document.getElementById('spiderweb-canvas');
    if (spiderCanvas) {
        const sCtx = spiderCanvas.getContext('2d');
        let sWidth, sHeight;
        let points = [];
        const mouse = { x: -1000, y: -1000 };
        const heroSection = document.getElementById('hero');

        heroSection.addEventListener('mousemove', (e) => {
            const rect = spiderCanvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        heroSection.addEventListener('mouseleave', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        // Добавляем поддержку касаний для мобильных устройств (чтобы паутинка магнитилась к пальцу)
        heroSection.addEventListener('touchmove', (e) => {
            const rect = spiderCanvas.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
        }, { passive: true });

        heroSection.addEventListener('touchend', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        function initSpiderweb() {
            sWidth = spiderCanvas.width = heroSection.offsetWidth;
            sHeight = spiderCanvas.height = heroSection.offsetHeight;
            points = [];
            
            // Увеличиваем шаг для более редких и элегантных нитей
            const spacing = window.innerWidth < 768 ? 70 : 110;
            
            for (let x = -spacing; x <= sWidth + spacing; x += spacing) {
                for (let y = -spacing; y <= sHeight + spacing; y += spacing) {
                    // Добавляем случайное смещение, чтобы разрушить квадратную геометрию сетки
                    // Это дает ту самую "органичность" и естественность
                    const offsetX = (Math.random() - 0.5) * spacing * 0.9;
                    const offsetY = (Math.random() - 0.5) * spacing * 0.9;
                    points.push({ 
                        baseX: x + offsetX, 
                        baseY: y + offsetY, 
                        x: x + offsetX, 
                        y: y + offsetY,
                        phase: Math.random() * Math.PI * 2
                    });
                }
            }
        }

        function drawSpiderweb() {
            sCtx.clearRect(0, 0, sWidth, sHeight);
            
            // 1. Физика точек (втягивание + завихрение + дыхание)
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                const dx = mouse.x - p.baseX;
                const dy = mouse.y - p.baseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                const interactionRadius = 350;
                if (dist < interactionRadius && mouse.x > -100) {
                    const force = Math.pow((interactionRadius - dist) / interactionRadius, 1.2);
                    
                    const targetX = p.baseX + dx * force * 0.85;
                    const targetY = p.baseY + dy * force * 0.85;
                    
                    const angle = force * Math.PI * 0.5;
                    const swirlX = Math.cos(angle) * (targetX - mouse.x) - Math.sin(angle) * (targetY - mouse.y) + mouse.x;
                    const swirlY = Math.sin(angle) * (targetX - mouse.x) + Math.cos(angle) * (targetY - mouse.y) + mouse.y;

                    p.x += (swirlX - p.x) * 0.15;
                    p.y += (swirlY - p.y) * 0.15;
                } else {
                    p.x += (p.baseX - p.x) * 0.05;
                    p.y += (p.baseY - p.y) * 0.05;
                }
                
                p.phase += 0.02;
                p.x += Math.sin(p.phase) * 0.4;
                p.y += Math.cos(p.phase) * 0.4;
            }
            
            // 2. Отрисовка органичных нитей 
            sCtx.lineWidth = 1;
            const connectRadius = window.innerWidth < 768 ? 120 : 170;
            
            for (let i = 0; i < points.length; i++) {
                const p1 = points[i];
                for (let j = i + 1; j < points.length; j++) {
                    const p2 = points[j];
                    const distToPoint = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                    
                    if (distToPoint < connectRadius) {
                        // Плавное затухание прозрачности нити при отдалении точек
                        // Никаких резких обрывов или грубой геометрии
                        const alpha = (1 - distToPoint / connectRadius) * 0.5;
                        sCtx.strokeStyle = `rgba(128, 0, 32, ${alpha})`;
                        
                        sCtx.beginPath();
                        sCtx.moveTo(p1.x, p1.y);
                        
                        // Изогнутые нити (делаем легкий органичный изгиб)
                        const cx = (p1.x + p2.x) / 2 + Math.sin(p1.phase) * 15;
                        const cy = (p1.y + p2.y) / 2 + Math.cos(p2.phase) * 15;
                        
                        sCtx.quadraticCurveTo(cx, cy, p2.x, p2.y);
                        sCtx.stroke();
                    }
                }
            }
            
            // 3. Отрисовка росинок (узлов)
            sCtx.fillStyle = 'rgba(128, 0, 32, 0.4)';
            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                sCtx.beginPath();
                sCtx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
                sCtx.fill();
            }
            
            requestAnimationFrame(drawSpiderweb);
        }

        let lastSpiderWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            // Игнорируем изменение высоты экрана на мобилках при скролле (исправление дергания паутинки)
            if (window.innerWidth !== lastSpiderWidth) {
                lastSpiderWidth = window.innerWidth;
                initSpiderweb();
            }
        });
        initSpiderweb();
        drawSpiderweb();
    }
});
