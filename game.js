document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('memory-grid');
    if (!grid) return; // Скрипт срабатывает только на странице игры

    const modal = document.getElementById('win-modal');
    const restartBtn = document.getElementById('restart-btn');

    // Фото и эмодзи для пар (8 пар = 16 карточек)
    const items = [
        { src: 'img/photo_2026-04-19_14-42-48.jpg', emoji: '📸' },
        { src: 'img/photo_2026-04-19_14-42-57.jpg', emoji: '✨' },
        { src: 'img/photo_2026-04-19_14-43-01.jpg', emoji: '🌸' },
        { src: 'img/photo_2026-04-19_14-43-04.jpg', emoji: '💖' },
        { src: 'img/photo_2026-04-19_14-43-06.jpg', emoji: '🎂' },
        { src: 'img/photo_2026-04-19_14-43-09.jpg', emoji: '🎁' },
        { src: 'img/photo_2026-04-19_14-43-11.jpg', emoji: '🌹' },
        { src: 'img/photo_2026-04-19_14-43-13.jpg', emoji: '☀️' }
    ];
    let cardsArray = [...items, ...items];
    
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matchesFound = 0;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function createBoard() {
        grid.innerHTML = '';
        shuffle(cardsArray);
        matchesFound = 0;
        firstCard = null;
        secondCard = null;
        lockBoard = false;
        
        cardsArray.forEach((item) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.symbol = item.src; // Сравниваем по пути к фото

            card.innerHTML = `
                <div class="memory-card-inner">
                    <div class="memory-card-front"></div>
                    <div class="memory-card-back">
                        <img src="${item.src}" alt="photo" draggable="false">
                        <div class="card-emoji-overlay">${item.emoji}</div>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', flipCard);
            grid.appendChild(card);
        });
    }

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

        this.classList.add('flipped');

        if (!firstCard) {
            // Первый клик
            firstCard = this;
            return;
        }

        // Второй клик
        secondCard = this;
        checkForMatch();
    }

    function checkForMatch() {
        let isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        // Помечаем как угаданные
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        // Класс flipped ОСТАВЛЯЕМ, чтобы карточка не дернулась
        
        resetBoard();
        matchesFound++;
        
        // Проверка на выигрыш
        if(matchesFound === items.length) {
            setTimeout(() => {
                modal.classList.add('show');
            }, 600); // Небольшая пауза перед победным окном
        }
    }

    function unflipCards() {
        lockBoard = true;
        
        // Возвращаем карточки обратно, если не угадали
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }

    restartBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(createBoard, 400); // Ждем пока закроется модалка перед ререндером
    });

    // Начинаем игру
    createBoard();
});
