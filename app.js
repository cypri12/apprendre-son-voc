let extractedLines = [];
let frenchWords = [];
let germanWords = [];
let currentTries = []; // Nombre d'essais pour chaque carte

document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output');
    const languageChoice = document.getElementById('languageChoice');

    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<p>Veuillez choisir une image.</p>`;
        return;
    }

    const file = fileInput.files[0];
    const image = URL.createObjectURL(file);

    outputDiv.innerHTML = `<p>Analyse en cours...</p>`;
    languageChoice.style.display = 'none';

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
        languageChoice.style.display = 'block';
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
    currentTries = [];

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
            currentTries.push(0); // Initialise les essais
        }
    });

    if (frenchWords.length === 0 || germanWords.length === 0) {
        alert("Aucune ligne valide détectée. Vérifiez le format du texte extrait.");
        return;
    }

    generateInteractiveCards();
});

function generateInteractiveCards() {
    const cardContainer = document.getElementById("card-container");
    cardContainer.innerHTML = "";

    frenchWords.forEach((word, index) => {
        const card = document.createElement("div");
        card.classList.add("flip-card");

        const cardInner = document.createElement("div");
        cardInner.classList.add("flip-card-inner");
        cardInner.setAttribute("data-index", index);

        const front = document.createElement("div");
        front.classList.add("flip-card-front");
        front.innerHTML = `<p>${word}</p>`;

        const back = document.createElement("div");
        back.classList.add("flip-card-back");
        back.innerHTML = `<p>${germanWords[index]}</p>`;

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Entrez la traduction";

        const button = document.createElement("button");
        button.textContent = "Valider";
        button.addEventListener("click", () => validateAnswer(index, input, cardInner));

        front.appendChild(input);
        front.appendChild(button);

        cardInner.appendChild(front);
        cardInner.appendChild(back);
        card.appendChild(cardInner);

        cardContainer.appendChild(card);
    });
}

function validateAnswer(index, input, cardInner) {
    const userAnswer = input.value.trim();
    if (!userAnswer) {
        alert("Veuillez entrer une réponse.");
        return;
    }

    if (userAnswer.toLowerCase() === germanWords[index].toLowerCase()) {
        cardInner.style.transform = "rotateY(180deg)";
    } else {
        currentTries[index]++;
        if (currentTries[index] >= 3) {
            alert(`La bonne réponse était : ${germanWords[index]}`);
            cardInner.style.transform = "rotateY(180deg)";
        } else {
            alert(`Incorrect. Essais restants : ${3 - currentTries[index]}`);
        }
    }
}
