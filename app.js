document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('imageInput');
    if (fileInput.files.length === 0) {
        alert('Veuillez charger une image.');
        return;
    }

    const file = fileInput.files[0];
    const image = URL.createObjectURL(file);

    // Charger Tesseract.js
    const { createWorker } = Tesseract;
    const worker = createWorker();

    document.getElementById('output').innerText = 'Analyse en cours...';

    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(image);

    await worker.terminate();

    // Afficher le texte extrait
    document.getElementById('output').innerHTML = `<h3>Texte extrait :</h3><p>${text}</p>`;
});
