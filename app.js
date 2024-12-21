document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page lors de la soumission

    const fileInput = document.getElementById('imageInput'); // Récupère l'élément input
    const outputDiv = document.getElementById('output'); // Zone d'affichage des messages

    // Étape 1 : Vérifie si un fichier a été sélectionné
    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>Veuillez choisir une image.</p>`;
        return; // Arrête l'exécution
    }
    outputDiv.innerHTML = `<p>Étape 1 : Fichier sélectionné avec succès.</p>`;

    // Étape 2 : Prépare l'image
    const file = fileInput.files[0];
    const image = URL.createObjectURL(file); // Crée une URL temporaire pour l'image
    outputDiv.innerHTML += `<p>Étape 2 : Image prête pour l'analyse.</p>`;

    try {
        // Étape 3 : Analyse l'image avec Tesseract.js
        outputDiv.innerHTML += `<p>Étape 3 : Analyse en cours...</p>`;
        const result = await Tesseract.recognize(image, 'eng', {
            logger: (info) => {
                console.log(info); // Log de progression
                outputDiv.innerHTML += `<p>Progression : ${Math.round(info.progress * 100)}%</p>`;
            },
        });

        // Étape 4 : Affiche le texte extrait
        outputDiv.innerHTML += `<p>Étape 4 : Analyse terminée avec succès.</p>`;
        outputDiv.innerHTML += `<h3>Texte extrait :</h3><p>${result.data.text}</p>`;
    } catch (error) {
        // Gestion des erreurs
        console.error('Erreur détaillée :', error);
        outputDiv.innerHTML += `<h3>Erreur :</h3><p>${error.message}</p>`;
    }
});
