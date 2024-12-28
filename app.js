let extractedData = null; // Stocker les données extraites par Tesseract.js

document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output');
    const languageChoice = document.getElementById('languageChoice');
    const separationResult = document.getElementById('separationResult');

    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<p>Veuillez choisir une image.</p>`;
        return;
    }

    const file = fileInput.files[0];
    const image = URL.createObjectURL(file);

    outputDiv.innerHTML = `<p>Analyse en cours...</p>`;
    separationResult.innerHTML = ''; // Réinitialiser les résultats précédents
    languageChoice.style.display = 'none'; // Masquer la section de choix des côtés

    try {
        // Analyser l'image avec Tesseract.js
        const result = await Tesseract.recognize(image, 'deu+fra', {
            logger: (info) => console.log(info),
        });

        // Stocker les données extraites
        extractedData = result.data;
        console.log('Données extraites :', extractedData);

        // Afficher le texte brut extrait
        outputDiv.innerHTML = `<h3>Texte brut extrait :</h3><pre>${extractedData.text}</pre>`;

        // Afficher la section pour demander les côtés
        languageChoice.style.display = 'block';
    } catch (error) {
        console.error('Erreur lors de l\'analyse :', error);
        outputDiv.innerHTML = `<p>Erreur lors de l'analyse. Veuillez réessayer.</p>`;
    }
});

// Séparer le texte selon les colonnes
document.getElementById('confirmSideButton').addEventListener('click', () => {
    const separationResult = document.getElementById('separationResult');
    const langSideInput = document.querySelector('input[name="langSide"]:checked');

    if (!langSideInput) {
        separationResult.innerHTML = `<p>Veuillez sélectionner quel côté contient le texte en français.</p>`;
        return;
    }

    const langSide = langSideInput.value;

    if (!extractedData) {
        separationResult.innerHTML = `<p>Aucune donnée à séparer. Analysez une image d'abord.</p>`;
        return;
    }

    // Obtenir les mots extraits avec leurs positions
    const words = extractedData.words;

    // Trouver le centre horizontal moyen de l'image
    const centerX = (Math.max(...words.map(w => w.bbox.x1)) + Math.min(...words.map(w => w.bbox.x0))) / 2;

    // Classer les mots en colonnes gauche et droite
    const leftColumn = [];
    const rightColumn = [];

    words.forEach(word => {
        const wordCenterX = (word.bbox.x0 + word.bbox.x1) / 2;
        if (wordCenterX < centerX) {
            leftColumn.push(word.text);
        } else {
            rightColumn.push(word.text);
        }
    });

    // Classer en fonction du choix de l'utilisateur
    let frenchText, germanText;
    if (langSide === 'left') {
        frenchText = leftColumn;
        germanText = rightColumn;
    } else {
        frenchText = rightColumn;
        germanText = leftColumn;
    }

    // Afficher les résultats séparés
    separationResult.innerHTML = `<h3>Texte en Français :</h3>`;
    frenchText.forEach(line => {
        separationResult.innerHTML += `<p>${line}</p>`;
    });

    separationResult.innerHTML += `<h3>Texte en Allemand :</h3>`;
    germanText.forEach(line => {
        separationResult.innerHTML += `<p>${line}</p>`;
    });
});
