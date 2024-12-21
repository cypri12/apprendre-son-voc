document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page lors de la soumission

    const fileInput = document.getElementById('imageInput'); // Récupère l'élément input
    const outputDiv = document.getElementById('output'); // Zone d'affichage des messages

    // Vérifie si un fichier a été sélectionné
    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>Veuillez choisir une image.</p>`;
        return; // Arrête l'exécution
    }

    // Affiche le message "Analyse en cours..."
    outputDiv.innerHTML = `<p>Analyse en cours...</p>`;

    // Prépare l'image pour l'analyse
    const file = fileInput.files[0];
    const image = URL.createObjectURL(file); // Crée une URL temporaire pour l'image

    try {
        // Analyse l'image avec Tesseract.js
        const result = await Tesseract.recognize(image, 'eng'); // Langue anglaise par défaut

        // Remplace le message par le texte extrait
        outputDiv.innerHTML = `<h3>Texte extrait :</h3><p>${result.data.text}</p>`;
    } catch (error) {
        // Remplace le message par un message d'erreur
        console.error('Erreur détaillée :', error);
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>${error.message}</p>`;
    }
});
