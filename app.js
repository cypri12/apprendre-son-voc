let extractedLines = []; // Stocker les lignes extraites

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

        // Stocker les lignes extraites
        extractedLines = result.data.text.split('\n').filter(line => line.trim() !== '');
        console.log('Lignes extraites :', extractedLines);

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

    // Diviser chaque ligne en fonction du tiret
    const frenchText = [];
    const germanText = [];
    extractedLines.forEach(line => {
        const parts = line.split('-'); // Supposons que les colonnes sont séparées par un tiret
        if (parts.length === 2) {
            if (langSide === 'left') {
                frenchText.push(parts[0].trim());
                germanText.push(parts[1].trim());
            } else {
                frenchText.push(parts[1].trim());
                germanText.push(parts[0].trim());
            }
        }
    });

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
