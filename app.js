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
        });

        // Texte brut extrait
        const rawText = result.data.text;
        console.log('Texte brut extrait :', rawText);
        outputDiv.innerHTML = `<h3>Texte extrait de l'image :</h3><pre>${rawText}</pre>`;

        // Divise le texte en lignes
        const lines = rawText.split('\n').filter((line) => line.trim() !== '');
        console.log('Lignes détectées :', lines);

        // Sépare les lignes par langue
        const germanKeywords = ["und", "der", "das", "auf", "weil", "zu"]; // Mots-clés allemands
        const frenchKeywords = ["le", "la", "et", "dans", "parce", "que"]; // Mots-clés français

        const germanLines = [];
        const frenchLines = [];

        lines.forEach((line) => {
            const lowerLine = line.toLowerCase();
            if (germanKeywords.some((word) => lowerLine.includes(word))) {
                germanLines.push(line);
            } else if (frenchKeywords.some((word) => lowerLine.includes(word))) {
                frenchLines.push(line);
            }
        });

        // Affiche les résultats
        outputDiv.innerHTML += `<h3>Textes en Allemand :</h3>`;
        germanLines.forEach((line) => {
            outputDiv.innerHTML += `<p>${line}</p>`;
        });

        outputDiv.innerHTML += `<h3>Textes en Français :</h3>`;
        frenchLines.forEach((line) => {
            outputDiv.innerHTML += `<p>${line}</p>`;
        });

        // Si aucune ligne détectée dans une langue
        if (germanLines.length === 0) {
            outputDiv.innerHTML += `<p>Aucun texte détecté en Allemand.</p>`;
        }
        if (frenchLines.length === 0) {
            outputDiv.innerHTML += `<p>Aucun texte détecté en Français.</p>`;
        }
    } catch (error) {
        console.error('Erreur détaillée :', error); // Affiche l'erreur dans la console
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>${error.message}</p>`; // Affiche un message d'erreur
    }
});

