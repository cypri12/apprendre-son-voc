let extractedText = ''; // Stocker le texte brut extrait

document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output');
    const separateButton = document.getElementById('separateButton');
    const separationResult = document.getElementById('separationResult');

    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<p>Veuillez choisir une image.</p>`;
        return;
    }

    const file = fileInput.files[0];
    const image = URL.createObjectURL(file);

    outputDiv.innerHTML = `<p>Analyse en cours...</p>`;
    separationResult.innerHTML = ''; // Réinitialiser le résultat précédent
    separateButton.style.display = 'none'; // Cacher le bouton de séparation

    try {
        // Analyser l'image avec Tesseract.js
        const result = await Tesseract.recognize(image, 'deu+fra', {
            logger: (info) => console.log(info),
        });

        // Stocker le texte brut extrait
        extractedText = result.data.text;
        console.log('Texte brut extrait :', extractedText);

        // Afficher le texte brut
        outputDiv.innerHTML = `<h3>Texte brut extrait :</h3><pre>${extractedText}</pre>`;

        // Afficher le bouton de séparation
        separateButton.style.display = 'block';
    } catch (error) {
        console.error('Erreur lors de l\'analyse :', error);
        outputDiv.innerHTML = `<p>Erreur lors de l'analyse. Veuillez réessayer.</p>`;
    }
});

// Séparation du texte brut en deux parties : français et allemand
document.getElementById('separateButton').addEventListener('click', () => {
    const separationResult = document.getElementById('separationResult');

    if (!extractedText) {
        separationResult.innerHTML = `<p>Aucun texte à séparer. Analysez une image d'abord.</p>`;
        return;
    }

    // Diviser le texte en lignes
    const lines = extractedText.split('\n').filter((line) => line.trim() !== '');

    // Diviser les lignes en deux colonnes
    const midIndex = Math.floor(lines.length / 2);
    const leftColumn = lines.slice(0, midIndex);
    const rightColumn = lines.slice(midIndex);

    // Afficher les résultats séparés
    separationResult.innerHTML = `<h3>Texte en Français :</h3>`;
    leftColumn.forEach((line) => {
        separationResult.innerHTML += `<p>${line}</p>`;
    });

    separationResult.innerHTML += `<h3>Texte en Allemand :</h3>`;
    rightColumn.forEach((line) => {
        separationResult.innerHTML += `<p>${line}</p>`;
    });
});
