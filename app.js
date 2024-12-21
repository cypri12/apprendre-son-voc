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

    // Charger Tesseract.js
    const { createWorker } = Tesseract; // Importer la fonction createWorker depuis Tesseract.js
    const worker = createWorker(); // Crée un nouveau worker pour exécuter l'analyse OCR

    try {
        // Étape 3 : Charger le worker
        outputDiv.innerHTML += `<p>Étape 3 : Chargement de Tesseract.js...</p>`;
        await worker.load(); // Charger le worker
        outputDiv.innerHTML += `<p>Étape 3 : Tesseract.js chargé avec succès.</p>`;

        // Étape 4 : Charger et initialiser la langue
        outputDiv.innerHTML += `<p>Étape 4 : Chargement des données linguistiques...</p>`;
        await worker.loadLanguage('eng'); // Langue : anglais (ou 'deu' pour l'allemand)
        await worker.initialize('eng');
        outputDiv.innerHTML += `<p>Étape 4 : Données linguistiques chargées avec succès.</p>`;

        // Étape 5 : Analyser l'image
        outputDiv.innerHTML += `<p>Étape 5 : Analyse de l'image en cours...</p>`;
        const { data: { text } } = await worker.recognize(image); // Effectuer l'OCR et récupérer le texte extrait
        outputDiv.innerHTML += `<p>Étape 5 : Analyse terminée avec succès.</p>`;

        // Afficher le texte extrait
        outputDiv.innerHTML += `<h3>Texte extrait :</h3><p>${text}</p>`;
    } catch (error) {
        // En cas d'erreur, afficher un message clair pour chaque étape
        console.error('Erreur détaillée :', error);
        outputDiv.innerHTML += `<h3>Erreur :</h3><p>${error.message}</p>`;
    } finally {
        // Étape 6 : Libérer les ressources
        outputDiv.innerHTML += `<p>Étape 6 : Libération des ressources...</p>`;
        await worker.terminate();
        outputDiv.innerHTML += `<p>Étape 6 : Ressources libérées avec succès.</p>`;
    }
});
