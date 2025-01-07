let extractedLines = [];
let frenchWords = [];
let germanWords = [];
let currentIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const instructions = document.getElementById('instructions');
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const fileInput = document.getElementById('imageInput');

            if (!fileInput.files.length) {
                alert("Veuillez sélectionner une image.");
                return;
            }

            const file = fileInput.files[0];
            const image = URL.createObjectURL(file);

            document.querySelector('.upload-section').innerHTML += `<p>Analyse en cours...</p>`;

            try {
                const result = await Tesseract.recognize(image, 'deu+fra', {
                    langPath: 'https://tessdata.projectnaptha.com/4.0.0_best/',
                    logger: (info) => console.log(info),
                });

                extractedLines = result.data.text.split('\n').filter(line => line.trim() !== '');
                console.log('Texte extrait :', extractedLines);

                if (!extractedLines.length) {
                    alert("Aucun texte détecté. Veuillez vérifier votre image.");
                    return;
                }

                if (instructions) {
                    instructions.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Erreur lors de l\'analyse :', error);
                alert("Erreur lors de l'analyse : " + error.message);
            }
        });
    } else {
        console.error("Le formulaire d'upload (#uploadForm) est introuvable dans le DOM.");
    }
});

// Configuration des cartes interactives
document.getElementById('confirmSideButton')?.addEventListener('click', () => {
    const langSideInput = document.querySelector('input[name="langSide"]:checked');

    if (!langSideInput) {
        alert("Veuillez sélectionner le côté français.");
        return;
    }

    const langSide = langSideInput.value;
    frenchWords = [];
    germanWords = [];

    extractedLines.forEach(line => {
        const parts = line.split('-');
        if (parts.length === 2) {
            if (langSide === 'left') {
                frenchWords.push(parts[0].trim());
                germanWords.push(parts[1].trim());
            } else {
                frenchWords.push(parts[1].trim());
                germanWords.push(parts[0].trim());
            }
        }
    });

    if (!frenchWords.length) {
        alert("Aucune paire valide détectée. Vérifiez votre image.");
        return;
    }

    startGame();
});

// Fonction pour démarrer le jeu
function startGame() {
    const instructions = document.getElementById('instructions');
    const gameSection = document.getElementById('game-section');

    if (instructions) instructions.classList.add('hidden');
    if (gameSection) gameSection.classList.remove('hidden');

    showCard();
}

// Afficher la carte actuelle
function showCard() {
    if (currentIndex >= frenchWords.length) {
        alert("Félicitations, vous avez terminé !");
        return;
    }

    const container = document.getElementById('card-container');
    if (container) {
        container.innerHTML = `
            <div class="card">${frenchWords[currentIndex]}</div>
            <input type="text" id="userAnswer" placeholder="Entrez la traduction">
            <button onclick="validateAnswer()" class="button">Valider</button>
        `;
    }
}

// Valider la réponse de l'utilisateur
function validateAnswer() {
    const userAnswer = document.getElementById('userAnswer')?.value.trim().toLowerCase();

    if (userAnswer === germanWords[currentIndex].toLowerCase()) {
        alert("Correct !");
        currentIndex++;
        showCard();
    } else {
        alert(`Incorrect. La bonne réponse était : ${germanWords[currentIndex]}`);
        currentIndex++;
        showCard();
    }
}
