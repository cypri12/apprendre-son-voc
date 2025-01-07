let extractedLines = [];
let frenchWords = [];
let germanWords = [];
let currentIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const instructions = document.getElementById('instructions');

    if (!uploadForm) {
        console.error("Le formulaire 'uploadForm' est introuvable.");
        return;
    }

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const fileInput = document.getElementById('imageInput');
        if (!fileInput || !fileInput.files.length) {
            alert("Veuillez sélectionner une image.");
            return;
        }

        const file = fileInput.files[0];
        const image = URL.createObjectURL(file);

        document.querySelector('.upload-section').innerHTML += `<p>Analyse en cours...</p>`;

        try {
            const result = await Tesseract.recognize(image, 'deu+fra', {
                logger: (info) => console.log(info),
            });

            extractedLines = result.data.text.split('\n').filter(line => line.trim() !== '');
            console.log('Texte extrait :', extractedLines);

            if (!extractedLines.length) {
                alert("Aucun texte détecté. Veuillez réessayer.");
                return;
            }

            instructions.textContent = "Analyse terminée ! Voici les données extraites :";
            instructions.classList.remove('hidden');
        } catch (error) {
            console.error('Erreur lors de l\'analyse :', error);
            alert("Erreur lors de l'analyse de l'image.");
        }
    });
});
