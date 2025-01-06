let extractedLines = [];
let frenchWords = [];
let germanWords = [];
let currentIndex = 0;

// Écouteur pour le formulaire de téléchargement d'image
document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('imageInput');
    const instructions = document.getElementById('instructions');

    if (!fileInput.files.length) {
        alert("Veuillez sélectionner une image.");
        return;
    }

    const file = fileInput.files[0];
    const image = URL.createObjectURL(file);

    document.querySelector('.upload-section').innerHTML += `<p>Analyse en cours...</p>`;

    try {
        const result = await Tesseract.recognize(image, 'deu+fra', {
            logger: (info) => console.log(info),
        });

        extractedLines = result.data.text.split('\n').filter(line => line.trim() !== '');
        console.log('Texte extrait :', extractedLines);

        if (!extractedLines.length) {
            alert("Aucun texte détecté. Veuillez réessayer.");
            return;
        }

        instructions.classList.remove('hidden');
    } catch (error) {
        console.error('Erreur lors de l\'analyse :', error);
        alert("Erreur lors de l'analyse de l'image.");
    }
});

// Confirmation du côté français
document.getElementById('confirmSideButton').addEventListener('click', () => {
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

// Démarrage du jeu
function startGame() {
    document.getElementById('instructions').classList.add('hidden');
    document.getElementById('game-section').classList.remove('hidden');
    showCard();
}

// Affichage des cartes interactives
function showCard() {
    if (currentIndex >= frenchWords.length) {
        alert("Félicitations, vous avez terminé !");
        return;
    }

    const container = document.getElementById('card-container');
    container.innerHTML = `
        <div class="card">${frenchWords[currentIndex]}</div>
        <input type="text" id="userAnswer" placeholder="Entrez la traduction">
        <button onclick="validateAnswer()" class="button">Valider</button>
    `;
}

// Validation de la réponse
function validateAnswer() {
    const userAnswer = document.getElementById('userAnswer').value.trim().toLowerCase();

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

// Gestion des cookies
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('cookieModal');
    const acceptButton = document.getElementById('acceptCookies');

    // Vérifier si l'utilisateur a déjà accepté les cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');

    if (!cookiesAccepted) {
        modal.classList.remove('hidden');
    }

    acceptButton.addEventListener('click', () => {
        // Sauvegarder l'acceptation dans le stockage local
        localStorage.setItem('cookiesAccepted', 'true');
        modal.classList.add('hidden');
    });
});
