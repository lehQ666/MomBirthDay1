document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('memory-grid');
    if (!grid) return; // Скрипт срабатывает только на странице игры

    const modal = document.getElementById('win-modal');
    const restartBtn = document.getElementById('restart-btn');

    // Эмодзи для пар (6 пар = 12 карточек)
    const items = ['🌹', '🎂', '☕', '🎁', '💖', '📸'];
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
        
        cardsArray.forEach((symbol) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.symbol = symbol;

            card.innerHTML = `
                <div class="memory-card-inner">
                    <div class="memory-card-front"></div>
                    <div class="memory-card-back">${symbol}</div>
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
        
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');

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
