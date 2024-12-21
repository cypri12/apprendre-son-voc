document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const fileInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output'); // Zone d'affichage

    // Vérifie si un fichier a été sélectionné
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

        // Affiche le texte brut extrait par Tesseract.js
        const rawText = result.data.text; // Récupère le texte brut extrait
        console.log('Texte brut extrait :', rawText); // Affiche dans la console
        outputDiv.innerHTML = `<h3>Texte extrait de l'image :</h3><pre>${rawText}</pre>`; // Affiche sur la page
    } catch (error) {
        console.error('Erreur détaillée :', error); // Affiche les détails dans la console
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>${error.message}</p>`; // Affiche un message d'erreur
    }
});
