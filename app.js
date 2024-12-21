document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire

    const fileInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output');

    // Étape 1 : Vérifier si un fichier est sélectionné
    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>Veuillez choisir une image.</p>`;
        return; // Arrête l'exécution
    }
    outputDiv.innerHTML = `<p>Étape 1 : Fichier sélectionné avec succès.</p>`;

    // Étape 2 : Préparer l'image pour l'analyse
    const file = fileInput.files[0];
    const image = URL.createObjectURL(file); // Crée une URL temporaire pour l'image
    outputDiv.innerHTML += `<p>Étape 2 : Image préparée pour l'analyse.</p>`;

    try {
        // Étape 3 : Charger et analyser l'image avec Tesseract.js
        outputDiv.innerHTML += `<p>Étape 3 : Analyse de l'image en cours...</p>`;
        const result = await Tesseract.recognize(image, 'eng', {
            logger: (info) => {
                console.log(info); // Affiche les logs de progression dans la console
                outputDiv.innerHTML += `<p>Progression : ${Math.round(info.progress * 100)}%</p>`;
            },
        });
        outputDiv.innerHTML += `<p>Étape 3 : Analyse terminée avec succès.</p>`;

        // Afficher le texte extrait
        outputDiv.innerHTML += `<h3>Texte extrait :</h3><p>${result.data.text}</p>`;
    } catch (error) {
        console.error('Erreur détaillée :', error); // Affiche l'erreur dans la console
        outputDiv.innerHTML += `<h3>Erreur :</h3><p>${error.message}</p>`;
    }
});
