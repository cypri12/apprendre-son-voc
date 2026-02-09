let extractedLines = [];
let frenchWords = [];
let germanWords = [];
let currentIndex = 0;

const STATUS = {
    IDLE: '',
    LOADING: 'Analyse en cours…',
    READY: 'Analyse terminée. Sélectionnez le côté du français pour commencer.',
    ERROR: 'Une erreur est survenue pendant l’analyse.',
};

const parseLine = (line) => {
    const separators = [' - ', '-', ':', '→', '=>', '='];
    for (const separator of separators) {
        if (line.includes(separator)) {
            const parts = line.split(separator).map((part) => part.trim()).filter(Boolean);
            if (parts.length === 2) {
                return parts;
            }
        }
    }
    return null;
};

const setStatus = (element, message, isError = false) => {
    if (!element) return;
    element.textContent = message;
    element.style.color = isError ? '#b00020' : '#004aad';
};

const resetGameState = () => {
    frenchWords = [];
    germanWords = [];
    currentIndex = 0;
    extractedLines = [];
};

const showCard = (container, restartButton) => {
    if (!container) return;

    if (currentIndex >= frenchWords.length) {
        container.innerHTML = '<h3>Félicitations, vous avez terminé !</h3>';
        if (restartButton) {
            restartButton.classList.remove('hidden');
        }
        return;
    }

    container.innerHTML = `
        <div class="card">${frenchWords[currentIndex]}</div>
        <input type="text" id="userAnswer" placeholder="Entrez la traduction">
        <button id="validateButton" class="button">Valider</button>
    `;

    const validateButton = document.getElementById('validateButton');
    validateButton?.addEventListener('click', () => {
        const userAnswer = document.getElementById('userAnswer')?.value.trim().toLowerCase();
        if (!userAnswer) {
            alert("Veuillez entrer une réponse.");
            return;
        }

        if (userAnswer === germanWords[currentIndex].toLowerCase()) {
            alert("Correct !");
        } else {
            alert(`Incorrect. La bonne réponse était : ${germanWords[currentIndex]}`);
        }

        currentIndex += 1;
        showCard(container, restartButton);
    });
};

const startGame = (instructions, gameSection, container, restartButton) => {
    instructions?.classList.add('hidden');
    gameSection?.classList.remove('hidden');
    restartButton?.classList.add('hidden');
    showCard(container, restartButton);
};

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('imageInput');
    const instructions = document.getElementById('instructions');
    const status = document.getElementById('uploadStatus');
    const confirmSideButton = document.getElementById('confirmSideButton');
    const gameSection = document.getElementById('game-section');
    const container = document.getElementById('card-container');
    const restartButton = document.getElementById('restartButton');
    const modal = document.getElementById('modal');
    const acceptButton = document.getElementById('acceptButton');
    const termsButton = document.getElementById('termsButton');
    const navMenu = document.getElementById('navMenu');
    const menuToggle = document.getElementById('menuToggle');

    if (modal && acceptButton) {
        modal.style.display = 'flex';
        acceptButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    termsButton?.addEventListener('click', () => {
        window.open('terms.html', '_blank');
    });

    menuToggle?.addEventListener('click', () => {
        navMenu?.classList.toggle('hidden');
    });

    restartButton?.addEventListener('click', () => {
        currentIndex = 0;
        showCard(container, restartButton);
    });

    if (!uploadForm || !fileInput) {
        console.error("Le formulaire d'upload (#uploadForm) est introuvable dans le DOM.");
        return;
    }

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!fileInput.files.length) {
            alert("Veuillez sélectionner une image.");
            return;
        }

        if (typeof Tesseract === 'undefined') {
            setStatus(status, 'Le moteur OCR est indisponible. Rechargez la page.', true);
            return;
        }

        const file = fileInput.files[0];
        const imageUrl = URL.createObjectURL(file);
        resetGameState();
        instructions?.classList.add('hidden');
        gameSection?.classList.add('hidden');
        container && (container.innerHTML = '');
        restartButton?.classList.add('hidden');
        setStatus(status, STATUS.LOADING);

        try {
            const result = await Tesseract.recognize(imageUrl, 'deu+fra', {
                langPath: 'https://tessdata.projectnaptha.com/4.0.0_best/',
                logger: (info) => console.log(info),
            });

            extractedLines = result.data.text
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean);

            if (!extractedLines.length) {
                setStatus(status, "Aucun texte détecté. Veuillez vérifier votre image.", true);
                return;
            }

            setStatus(status, STATUS.READY);
            instructions?.classList.remove('hidden');
        } catch (error) {
            console.error("Erreur lors de l'analyse :", error);
            setStatus(status, `${STATUS.ERROR} ${error.message}`, true);
        } finally {
            URL.revokeObjectURL(imageUrl);
        }
    });

    confirmSideButton?.addEventListener('click', () => {
        const langSideInput = document.querySelector('input[name="langSide"]:checked');

        if (!langSideInput) {
            alert("Veuillez sélectionner le côté français.");
            return;
        }

        const langSide = langSideInput.value;
        frenchWords = [];
        germanWords = [];

        extractedLines.forEach((line) => {
            const parts = parseLine(line);
            if (!parts) return;

            if (langSide === 'left') {
                frenchWords.push(parts[0]);
                germanWords.push(parts[1]);
            } else {
                frenchWords.push(parts[1]);
                germanWords.push(parts[0]);
            }
        });

        if (!frenchWords.length) {
            alert("Aucune paire valide détectée. Vérifiez votre image.");
            return;
        }

        currentIndex = 0;
        startGame(instructions, gameSection, container, restartButton);
    });
});
