let extractedText = ''; // Stocker le texte brut extrait

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
    separationResult.innerHTML = ''; // Réinitialiser le résultat précédent
    languageChoice.style.display = 'none'; // Cacher la section de choix des côtés

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

        // Afficher la section pour demander les côtés
        languageChoice.style.display = 'block';
    } catch (error) {
        console.error('Erreur lors de l\'analyse :', error);
        outputDiv.innerHTML = `<p>Erreur lors de l'analyse. Veuillez réessayer.</p>`;
    }
});

// Séparer le texte selon le choix de l'utilisateur
document.getElementById('confirmSideButton').addEventListener('click', () => {
    const separationResult = document.getElementById('separationResult');
    const langSideInput = document.querySelector('input[name="langSide"]:checked');

    if (!langSideInput) {
        separationResult.innerHTML = `<p>Veuillez sélectionner quel côté contient le texte en français.</p>`;
        return;
    }

    const langSide = langSideInput.value;

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
    frenchText.forEach((line) => {
        separationResult.innerHTML += `<p>${line}</p>`;
    });

    separationResult.innerHTML += `<h3>Texte en Allemand :</h3>`;
    germanText.forEach((line) => {
        separationResult.innerHTML += `<p>${line}</p>`;
    });
});
