let extractedLines = [];
let frenchWords = [];
let germanWords = [];
let currentIndex = 0;
let attempts = 0;

document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output');
    const instructions = document.getElementById('instructions');

    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<p>Veuillez choisir une image.</p>`;
        return;
    }

    const file = fileInput.files[0];
    const image = URL.createObjectURL(file);

    outputDiv.innerHTML = `<p>Analyse en cours...</p>`;
    instructions.classList.add('hidden');

    try {
        const result = await Tesseract.recognize(image, 'deu+fra', {
            logger: (info) => console.log(info),
        });

        extractedLines = result.data.text.split('\n').filter(line => line.trim() !== '');
        console.log('Lignes extraites :', extractedLines);

        if (extractedLines.length === 0) {
            outputDiv.innerHTML = `<p>Texte non détecté dans l'image. Veuillez essayer une autre image.</p>`;
            return;
        }

        outputDiv.innerHTML = `<h3>Texte brut extrait :</h3><pre>${extractedLines.join('\n')}</pre>`;
        instructions.classList.remove('hidden');
    } catch (error) {
        console.error('Erreur lors de l\'analyse :', error);
        outputDiv.innerHTML = `<p>Erreur lors de l'analyse. Veuillez réessayer.</p>`;
    }
});

document.getElementById('confirmSideButton').addEventListener('click', () => {
    const langSideInput = document.querySelector('input[name="langSide"]:checked');

    if (!langSideInput) {
        alert("Veuillez sélectionner de quel côté se trouve le texte en français.");
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

    if (frenchWords.length === 0 || germanWords.length === 0) {
        alert("Aucune ligne valide détectée. Vérifiez le format du texte extrait.");
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
        alert("Félicitations ! Vous avez terminé toutes les cartes.");
        return;
    }

    const container = document.getElementById('card-container');
    container.innerHTML = `
        <div class="card">${frenchWords[currentIndex]}</div>
        <input type="text" id="userAnswer" placeholder="Entrez la traduction">
        <button onclick="validateAnswer()">Valider</button>
    `;
}

function validateAnswer() {
    const userAnswer = document.getElementById('userAnswer').value.trim().toLowerCase();

    if (userAnswer === germanWords[currentIndex].toLowerCase()) {
        document.querySelector('.card').classList.add('correct');
        setTimeout(() => {
            currentIndex++;
            attempts = 0;
            showCard();
        }, 1000);
    } else {
        attempts++;
        if (attempts >= 3) {
            alert(`La bonne réponse était : ${germanWords[currentIndex]}`);
            currentIndex++;
            attempts = 0;
            showCard();
        } else {
            alert(`Incorrect. Essais restants : ${3 - attempts}`);
        }
    }
}
