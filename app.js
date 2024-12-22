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
            tessedit_pageseg_mode: 6, // Mode pour détecter les colonnes
        });

        // Affiche le texte brut extrait
        const rawText = result.data.text;
        console.log('Texte brut extrait :', rawText);
        outputDiv.innerHTML = `<h3>Texte brut extrait :</h3><pre>${rawText}</pre>`;
    } catch (error) {
        console.error('Erreur détaillée :', error); // Affiche l'erreur dans la console
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>${error.message}</p>`; // Affiche un message d'erreur
    }
});
