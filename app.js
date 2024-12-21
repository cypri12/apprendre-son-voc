document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire

    const fileInput = document.getElementById('imageInput');
    if (fileInput.files.length === 0) { // Vérifie si un fichier a été sélectionné
        alert('Veuillez choisir une image.');
        return; // Arrête l'exécution si aucun fichier n'est sélectionné
    }

    const file = fileInput.files[0]; // Récupère le fichier sélectionné
    const image = URL.createObjectURL(file); // Crée une URL temporaire pour afficher l'image dans le navigateur

    // Charger Tesseract.js
    const { createWorker } = Tesseract; // Importer la fonction createWorker depuis Tesseract.js
    const worker = createWorker(); // Crée un nouveau worker pour exécuter l'analyse OCR

    document.getElementById('output').innerText = 'Analyse en cours...'; // Affiche un message pendant le traitement

    try {
        // Charger et initialiser Tesseract.js
        await worker.load(); // Charger le worker
        await worker.loadLanguage('eng'); // Charger les données linguistiques pour l'anglais (ou 'deu' pour l'allemand)
        await worker.initialize('eng'); // Initialiser le worker avec la langue choisie

        // Analyser l'image
        const { data: { text } } = await worker.recognize(image); // Effectuer l'OCR et récupérer le texte extrait

        // Afficher le texte extrait dans la page
        document.getElementById('output').innerHTML = `<h3>Texte extrait :</h3><p>${text}</p>`;
    } catch (error) {
        console.error('Erreur :', error); // Afficher l'erreur dans la console pour le débogage
        document.getElementById('output').innerText = 'Erreur lors de l\'analyse. Veuillez réessayer.';
    } finally {
        await worker.terminate(); // Libérer les ressources utilisées par le worker
    }
});
