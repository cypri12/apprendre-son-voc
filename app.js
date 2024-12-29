let extractedLines = []; // Stocker les lignes extraites
let frenchWords = []; // Stocker les mots en français
let germanWords = []; // Stocker les mots en allemand
let currentCardIndex = 0; // Index de la carte actuelle

document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output');
    const languageChoice = document.getElementById('languageChoice');

    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<p>Veuillez choisir une image.</p>`;
        return;
    }

    const file = fileInput.files[0];
    const image = URL.createObjectURL(file);

    outputDiv.innerHTML = `<p>Analyse en cours...</p>`;
    languageChoice.style.display = 'none'; // Masquer la section de choix des côtés

    try {
        // Analyse de l'image avec Tesseract.js
        const result = await Tesseract.recognize(image, 'deu+fra', {
            logger: (info) => console.log(info),
        });

        // Stocker les lignes extraites
        extractedLines = result.data.text.split('\n').filter(line => line.trim() !== '');
        console.log('Lignes extraites :', extractedLines);

        if (extractedLines.length === 0) {
            outputDiv.innerHTML = `<p>Texte non détecté dans l'image. Veuillez essayer une autre image.</p>`;
            return;
        }

        // Afficher le texte brut
        outputDiv.innerHTML = `<h3>Texte brut extrait :</h3><pre>${extractedLines.join('\n')}</pre>`;

        // Afficher la section pour demander les côtés
        languageChoice.style.display = 'block';
    } catch (error) {
        console.error('Erreur lors de l\'analyse :', error);
        outputDiv.innerHTML = `<p>Erreur lors de l'analyse. Veuillez réessayer.</p>`;
    }
});

document.getElementById('confirmSideButton').addEventListener('click', () => {
    const langSideInput = document.querySelector('input[name="langSide"]:checked');

    if (!langSideInput) {
        alert("Veuillez sélectionner de quel côté se trouve le texte en français.");
        return;
    }

    const langSide = langSideInput.value;

    frenchWords = [];
    germanWords = [];

    extractedLines.forEach(line => {
        const parts = line.split('-'); // Supposons que les colonnes sont séparées par un tiret
        if (parts.length === 2) {
            if (langSide === 'left') {
                frenchWords.push(parts[0].trim());
                germanWords.push(parts[1].trim());
            } else {
                frenchWords.push(parts[1].trim());
                germanWords.push(parts[0].trim());
            }
        }
    });

    if (frenchWords.length === 0 || germanWords.length === 0) {
        alert("Aucune ligne valide détectée. Vérifiez le format du texte extrait.");
        return;
    }

    // Ouvrir une nouvelle fenêtre pour afficher les cartes
    openFlashcardWindow();
});

function openFlashcardWindow() {
    const newWindow = window.open("", "Flashcards", "width=400,height=600");

    if (!newWindow) {
        alert("La fenêtre contextuelle est bloquée. Veuillez autoriser les fenêtres contextuelles.");
        return;
    }

    newWindow.document.write(`
        <html>
            <head>
                <title>Cartes de vocabulaire</title>
                <style>
                    ${document.querySelector('style').innerText}
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="content" id="card-content">
                        <div class="front">${frenchWords[0]}</div>
                        <div class="back">${germanWords[0]}</div>
                    </div>
                </div>
                <button id="next-button">Suivant</button>
                <script>
                    let currentIndex = 0;

                    document.getElementById('next-button').addEventListener('click', () => {
                        currentIndex++;
                        if (currentIndex < ${frenchWords.length}) {
                            document.querySelector('.front').innerText = '${frenchWords[0]}';
                            document.querySelector('.back').innerText = '${germanWords[0]}';
                        } else {
                            alert('Vous avez terminé toutes les cartes !');
                            window.close();
                        }
                    });
                </script>
            </body>
        </html>
    `);
}
