let extractedLines = []; // Stocker les lignes extraites
let frenchWords = []; // Stocker les mots en français
let germanWords = []; // Stocker les mots en allemand

document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output');
    const languageChoice = document.getElementById('languageChoice');
    const separationResult = document.getElementById('separationResult');
    const cardContainer = document.getElementById("card-container");

    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<p>Veuillez choisir une image.</p>`;
        return;
    }

    const file = fileInput.files[0];
    const image = URL.createObjectURL(file);

    outputDiv.innerHTML = `<p>Analyse en cours...</p>`;
    separationResult.innerHTML = ''; // Réinitialiser les résultats précédents
    languageChoice.style.display = 'none'; // Masquer la section de choix des côtés
    cardContainer.innerHTML = ''; // Réinitialiser les cartes

    try {
        // Analyse de l'image avec Tesseract.js
        const result = await Tesseract.recognize(image, 'deu+fra', {
            logger: (info) => console.log(info),
        });

        // Stocker les lignes extraites
        extractedLines = result.data.text.split('\n').filter(line => line.trim() !== '');
        console.log('Lignes extraites :', extractedLines);

        if (extractedLines.length === 0) {
            outputDiv.innerHTML = `<p>Texte non détecté dans l'image. Veuillez essayer une autre image.</p>`;
            return;
        }

        // Afficher le texte brut
        outputDiv.innerHTML = `<h3>Texte brut extrait :</h3><pre>${extractedLines.join('\n')}</pre>`;

        // Afficher la section pour demander les côtés
        languageChoice.style.display = 'block';
    } catch (error) {
        console.error('Erreur lors de l\'analyse :', error);
        outputDiv.innerHTML = `<p>Erreur lors de l'analyse. Veuillez réessayer.</p>`;
    }
});

// Séparer les lignes selon les tirets
document.getElementById('confirmSideButton').addEventListener('click', () => {
    const separationResult = document.getElementById('separationResult');
    const cardContainer = document.getElementById("card-container");
    const langSideInput = document.querySelector('input[name="langSide"]:checked');

    if (!langSideInput) {
        separationResult.innerHTML = `<p>Veuillez sélectionner de quel côté se trouve le texte en français.</p>`;
        return;
    }

    const langSide = langSideInput.value;

    if (extractedLines.length === 0) {
        separationResult.innerHTML = `<p>Aucune donnée à séparer. Analysez une image d'abord.</p>`;
        return;
    }

    frenchWords = [];
    germanWords = [];

    // Diviser chaque ligne en fonction du tiret
    extractedLines.forEach(line => {
        const parts = line.split('-'); // Supposons que les colonnes sont séparées par un tiret
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

    // Vérification des résultats
    if (frenchWords.length === 0 || germanWords.length === 0) {
        separationResult.innerHTML = `<p>Aucune ligne valide détectée. Vérifiez le format du texte extrait.</p>`;
        return;
    }

    // Générer les cartes dynamiquement
    frenchWords.forEach((word, index) => {
        const card = document.createElement("div");
        card.classList.add("card");

        const content = document.createElement("div");
        content.classList.add("content");

        const front = document.createElement("div");
        front.classList.add("front");
        front.textContent = word; // Mot en français

        const back = document.createElement("div");
        back.classList.add("back");
        back.textContent = germanWords[index]; // Traduction en allemand

        content.appendChild(front);
        content.appendChild(back);
        card.appendChild(content);

        cardContainer.appendChild(card);
    });
});
