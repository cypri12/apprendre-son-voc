document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output');

    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>Veuillez choisir une image.</p>`;
        return;
    }

    outputDiv.innerHTML = `<p>Analyse en cours...</p>`;
    const file = fileInput.files[0];
    const image = URL.createObjectURL(file);

    // Fonction pour auto-détecter la langue via LibreTranslate
    async function detectLanguageWithAuto(text) {
        const response = await fetch("https://fr.libretranslate.com/translate", {
            method: "POST",
            body: JSON.stringify({
                q: text,
                source: "auto",
                target: "fr", // On traduit en français pour valider la langue
                format: "text",
                api_key: "", // Si requis, ajoute une clé API
            }),
            headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();
        return result.source; // Retourne le code langue détecté (ex. : 'de', 'fr')
    }

    try {
        // Analyse OCR avec Tesseract.js
        const result = await Tesseract.recognize(image, 'deu+fra', {
            logger: (info) => console.log(info), // Logs de progression
        });

        // Texte brut extrait
        const rawText = result.data.text;
        console.log('Texte brut extrait :', rawText);

        // Divise le texte en lignes
        const lines = rawText.split('\n').filter((line) => line.trim() !== '');
        console.log('Lignes détectées :', lines);

        // Classe les lignes par langue
        const germanLines = [];
        const frenchLines = [];
        const unknownLines = [];

        for (const line of lines) {
            const lang = await detectLanguageWithAuto(line);
            console.log(`Langue détectée pour "${line}": ${lang}`);
            if (lang === 'de') {
                germanLines.push(line);
            } else if (lang === 'fr') {
                frenchLines.push(line);
            } else {
                unknownLines.push(line); // Ligne non catégorisée
            }
        }

        // Affiche les résultats
        outputDiv.innerHTML = `<h3>Textes en Allemand :</h3>`;
        germanLines.forEach((line) => {
            outputDiv.innerHTML += `<p>${line}</p>`;
        });

        outputDiv.innerHTML += `<h3>Textes en Français :</h3>`;
        frenchLines.forEach((line) => {
            outputDiv.innerHTML += `<p>${line}</p>`;
        });

        if (unknownLines.length > 0) {
            outputDiv.innerHTML += `<h3>Textes non catégorisés :</h3>`;
            unknownLines.forEach((line) => {
                outputDiv.innerHTML += `<p>${line}</p>`;
            });
        }
    } catch (error) {
        console.error('Erreur détaillée :', error);
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>${error.message}</p>`;
    }
});
