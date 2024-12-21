document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire

    const fileInput = document.getElementById('imageInput'); // Récupère l'élément input
    const outputDiv = document.getElementById('output'); // Zone pour afficher les messages et résultats

    // Étape 1 : Vérifier si un fichier a été sélectionné
    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>Veuillez choisir une image.</p>`;
        return; // Arrête le script
    }
    outputDiv.innerHTML = `<p>Étape 1 : Fichier sélectionné avec succès.</p>`;

    // Étape 2 : Créer une URL temporaire pour l'image
    const file = fileInput.files[0];
    const image = URL.createObjectURL(file);
    outputDiv.innerHTML += `<p>Étape 2 : Image prête pour l'analyse.</p>`;

    try {
        // Étape 3 : Lancer l'analyse avec Tesseract.js
        outputDiv.innerHTML += `<p>Étape 3 : Analyse de l'image en cours...</p>`;
        const result = await Tesseract.recognize(image, 'eng', {
            logger: (info) => {
                console.log(info); // Affiche les logs dans la console
                outputDiv.innerHTML += `<p>Progression : ${Math.round(info.progress * 100)}%</p>`;
            },
        });

        // Étape 4 : Afficher le texte extrait
        outputDiv.innerHTML += `<p>Étape 4 : Analyse terminée avec succès.</p>`;
        outputDiv.innerHTML += `<h3>Texte extrait :</h3><p>${result.data.text}</p>`;
    } catch (error) {
        // Gestion des erreurs
        console.error('Erreur détaillée :', error);
        outputDiv.innerHTML += `<h3>Erreur :</h3><p>${error.message}</p>`;
    }
});
