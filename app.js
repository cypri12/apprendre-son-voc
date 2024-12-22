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

    try {
        // Analyse OCR avec Tesseract.js
        const result = await Tesseract.recognize(image, 'deu+fra', {
            logger: (info) => console.log(info),
        });

        // Texte brut extrait
        const rawText = result.data.text;
        console.log('Texte brut extrait :', rawText);

        // Divise le texte en lignes
        const lines = rawText.split('\n').filter((line) => line.trim() !== '');
        console.log('Lignes détectées :', lines);

        // Fonction pour détecter la langue avec LibreTranslate
        async function detectLanguage(text) {
            const response = await fetch('https://libretranslate.de/detect', {
                method: 'POST',
                body: JSON.stringify({ q: text }),
                headers: { 'Content-Type': 'application/json' },
            });

            const result = await response.json();
            return result[0]?.language; // Retourne le code langue ('de' pour allemand, 'fr' pour français)
        }

        // Classe les lignes par langue
        const germanLines = [];
        const frenchLines = [];
        const unknownLines = [];

        for (const line of lines) {
            const lang = await detectLanguage(line);
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
