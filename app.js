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
            logger: (info) => console.log(info),
            tessedit_pageseg_mode: 6, // Mode adapté aux colonnes
        });

        // Texte brut extrait
        const rawText = result.data.text;
        console.log('Texte brut extrait :', rawText);
        outputDiv.innerHTML = `<h3>Texte brut extrait :</h3><pre>${rawText}</pre>`;

        // Divise le texte en lignes
        const lines = rawText.split('\n').filter((line) => line.trim() !== '');
        console.log('Lignes détectées :', lines);

        // Séparation gauche/droite
        const pairs = lines.map((line) => {
            const parts = line.split(/\s{2,}/); // Sépare par au moins 2 espaces
            return parts.length === 2 ? { left: parts[0].trim(), right: parts[1].trim() } : null;
        }).filter(Boolean);

        if (pairs.length === 0) {
            console.log('Lignes détectées :', lines);
            throw new Error('Aucune paire de mots (gauche/droite) détectée. Vérifiez l\'image.');
        }

        // Affiche les paires
        outputDiv.innerHTML = `<h3>Paires de mots détectées :</h3>`;
        pairs.forEach((pair) => {
            outputDiv.innerHTML += `<p><strong>Allemand :</strong> ${pair.left} | <strong>Français :</strong> ${pair.right}</p>`;
        });
    } catch (error) {
        console.error('Erreur détaillée :', error);
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>${error.message}</p>`;
    }
});
