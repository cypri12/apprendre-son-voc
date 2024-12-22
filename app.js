function splitImage(image, callback) {
    const img = new Image();
    img.src = image;
    img.onload = () => {
        const canvasLeft = document.createElement('canvas');
        const canvasRight = document.createElement('canvas');

        const ctxLeft = canvasLeft.getContext('2d');
        const ctxRight = canvasRight.getContext('2d');

        // Dimensions pour découper en deux colonnes
        const width = img.width / 2;
        const height = img.height;

        canvasLeft.width = width;
        canvasLeft.height = height;
        canvasRight.width = width;
        canvasRight.height = height;

        // Découpe la partie gauche
        ctxLeft.drawImage(img, 0, 0, width, height, 0, 0, width, height);
        // Découpe la partie droite
        ctxRight.drawImage(img, width, 0, width, height, 0, 0, width, height);

        // Convertit en base64 pour passer à Tesseract.js
        const leftImage = canvasLeft.toDataURL();
        const rightImage = canvasRight.toDataURL();

        callback(leftImage, rightImage);
    };
}

// Utilisation de la fonction pour analyser chaque colonne séparément
document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output');

    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>Veuillez choisir une image.</p>`;
        return;
    }

    outputDiv.innerHTML = `<p>Analyse en cours...</p>`;
    const file = fileInput.files[0];
    const image = URL.createObjectURL(file);

    splitImage(image, async (leftImage, rightImage) => {
        try {
            // Analyse de la colonne gauche
            const leftResult = await Tesseract.recognize(leftImage, 'deu+fra', {
                logger: (info) => console.log(info),
            });

            // Analyse de la colonne droite
            const rightResult = await Tesseract.recognize(rightImage, 'deu+fra', {
                logger: (info) => console.log(info),
            });

            // Affichage des résultats
            outputDiv.innerHTML = `<h3>Texte extrait (Colonne gauche) :</h3><pre>${leftResult.data.text}</pre>`;
            outputDiv.innerHTML += `<h3>Texte extrait (Colonne droite) :</h3><pre>${rightResult.data.text}</pre>`;
        } catch (error) {
            console.error('Erreur détaillée :', error);
            outputDiv.innerHTML = `<h3>Erreur :</h3><p>${error.message}</p>`;
        }
    });
});
