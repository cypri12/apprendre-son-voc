document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire

    const fileInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output');

    // Étape 1 : Vérifier si un fichier est sélectionné
    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>Veuillez choisir une image.</p>`;
        return; // Arrête l'exécution
    }
    outputDiv.innerHTML = `<p>Fichier sélectionné avec succès. Analyse en cours...</p>`;

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('apikey', 'VOTRE_CLE_API'); // Remplace par ta clé API
    formData.append('language', 'eng'); // Spécifie la langue (par ex. 'eng' pour anglais ou 'fre' pour français)
    formData.append('file', file);

    try {
        // Envoi de la requête à l'API OCR.space
        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        // Vérifier si l'analyse a réussi
        if (result.IsErroredOnProcessing) {
            throw new Error(result.ErrorMessage || 'Une erreur est survenue lors du traitement.');
        }

        // Afficher le texte extrait
        const text = result.ParsedResults[0].ParsedText;
        outputDiv.innerHTML = `<h3>Texte extrait :</h3><p>${text}</p>`;
    } catch (error) {
        console.error('Erreur détaillée :', error);
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>${error.message}</p>`;
    }
});
