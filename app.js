let extractedLines = [];
let frenchWords = [];
let germanWords = [];
let currentIndex = 0;

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

    document.querySelector('.upload-section').innerHTML = `<p>Analyse en cours...</p>`;

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

function startGame() {
    document.getElementById('instructions').classList.add('hidden');
    document.getElementById('game-section').classList.remove('hidden');
    showCard();
}

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
// Afficher la boîte modale au chargement de la page
window.addEventListener('load', () => {
    const modal = document.getElementById('modal');
    const acceptButton = document.getElementById('acceptButton');

    modal.style.display = 'flex';

    acceptButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
});
