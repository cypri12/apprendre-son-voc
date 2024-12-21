document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const fileInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output'); // Zone d'affichage

    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>Veuillez choisir une image.</p>`;
        return;
    }

    outputDiv.innerHTML = `<p>Analyse en cours...</p>`;
    const file = fileInput.files[0];
    const image = URL.createObjectURL(file);

    try {
        // Analyse OCR avec Tesseract.js
        const result = await Tesseract.recognize(image, 'deu+fra', {
            logger: (info) => console.log(info), // Logs de progression
            tessedit_pageseg_mode: 4, // Détection de colonnes ou blocs alignés
        });

        // Affiche le texte brut extrait par Tesseract.js
        const rawText = result.data.text;
        console.log('Texte brut extrait :', rawText);
        outputDiv.innerHTML = `<h3>Texte brut extrait :</h3><pre>${rawText}</pre>`;

        // Divise le texte en lignes
        const lines = rawText.split('\n').filter((line) => line.trim() !== '');
        console.log('Lignes détectées :', lines);

        // Tente de détecter les colonnes
        const pairs = lines.map((line) => {
            const parts = line.split(/\s{4,}/); // Sépare par au moins 4 espaces
            return parts.length === 2 ? { left: parts[0].trim(), right: parts[1].trim() } : null;
        }).filter(Boolean);

        // Affiche les résultats des colonnes
        if (pairs.length > 0) {
            outputDiv.innerHTML += `<h3>Paires de mots détectées :</h3>`;
            pairs.forEach((pair) => {
                outputDiv.innerHTML += `<p><strong>Allemand :</strong> ${pair.left} | <strong>Français :</strong> ${pair.right}</p>`;
            });
        } else {
            outputDiv.innerHTML += `<h3>Aucune paire détectée :</h3><p>Le texte brut ne contient pas de colonnes détectables.</p>`;
        }
    } catch (error) {
        console.error('Erreur détaillée :', error);
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>${error.message}</p>`;
    }
});
