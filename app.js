document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output');
    const langSide = document.querySelector('input[name="langSide"]:checked').value;

    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<p>Veuillez choisir une image.</p>`;
        return;
    }

    const file = fileInput.files[0];
    const image = URL.createObjectURL(file);

    outputDiv.innerHTML = `<p>Analyse en cours...</p>`;

    try {
        // Analyser l'image avec Tesseract.js
        const result = await Tesseract.recognize(image, 'deu+fra', {
            logger: (info) => console.log(info),
        });

        // Texte brut extrait
        const rawText = result.data.text;
        console.log('Texte brut extrait :', rawText);

        // Diviser le texte en lignes
        const lines = rawText.split('\n').filter((line) => line.trim() !== '');

        // Diviser les lignes en deux colonnes
        const midIndex = Math.floor(lines.length / 2);
        const leftColumn = lines.slice(0, midIndex);
        const rightColumn = lines.slice(midIndex);

        // Classer en fonction du choix de l'utilisateur
        let germanText, frenchText;
        if (langSide === 'left') {
            germanText = leftColumn;
            frenchText = rightColumn;
        } else {
            germanText = rightColumn;
            frenchText = leftColumn;
        }

        // Afficher les résultats
        outputDiv.innerHTML = `<h3>Texte en Allemand :</h3>`;
        germanText.forEach((line) => {
            outputDiv.innerHTML += `<p>${line}</p>`;
        });

        outputDiv.innerHTML += `<h3>Texte en Français :</h3>`;
        frenchText.forEach((line) => {
            outputDiv.innerHTML += `<p>${line}</p>`;
        });
    } catch (error) {
        console.error('Erreur lors de l\'analyse :', error);
        outputDiv.innerHTML = `<p>Erreur lors de l'analyse. Veuillez réessayer.</p>`;
    }
});
