let extractedLines = [];
let frenchWords = [];
let germanWords = [];
let currentWordIndex = 0;

document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output');
    const instructions = document.getElementById('instructions');

    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<p>Veuillez choisir une image.</p>`;
        return;
    }

    const file = fileInput.files[0];
    const image = URL.createObjectURL(file);

    outputDiv.innerHTML = `<p>Analyse en cours...</p>`;
    instructions.classList.add('hidden');

    try {
        const result = await Tesseract.recognize(image, 'deu+fra', {
            logger: (info) => console.log(info),
        });

        extractedLines = result.data.text.split('\n').filter(line => line.trim() !== '');
        console.log('Lignes extraites :', extractedLines);

        if (extractedLines.length === 0) {
            outputDiv.innerHTML = `<p>Texte non détecté dans l'image. Veuillez essayer une autre image.</p>`;
            return;
        }

        outputDiv.innerHTML = `<h3>Texte brut extrait :</h3><pre>${extractedLines.join('\n')}</pre>`;
        instructions.classList.remove('hidden');
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
        const parts = line.split('-');
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

    openFlashcardWindow();
});

function openFlashcardWindow() {
    if (currentWordIndex >= frenchWords.length) {
        alert("Vous avez terminé toutes les cartes !");
        return;
    }

    const frenchWord = frenchWords[currentWordIndex];
    const germanWord = germanWords[currentWordIndex];
    currentWordIndex++;

    const newWindow = window.open("", "Flashcard", "width=400,height=600");

    if (!newWindow) {
        alert("Veuillez autoriser les fenêtres contextuelles pour afficher les cartes.");
        return;
    }

    newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Flashcard</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background: #f4f4f4;
                }
                .card {
                    width: 300px;
                    height: 400px;
                    perspective: 1000px;
                }
                .inner {
                    width: 100%;
                    height: 100%;
                    text-align: center;
                    transition: transform 0.8s;
                    transform-style: preserve-3d;
                }
                .front, .back {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.5rem;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }
                .front {
                    background: #ff6347;
                    color: white;
                }
                .back {
                    background: #4caf50;
                    color: white;
                    transform: rotateY(180deg);
                }
                button {
                    margin-top: 20px;
                    padding: 10px 20px;
                    font-size: 1rem;
                    border: none;
                    background: #2196f3;
                    color: white;
                    cursor: pointer;
                    border-radius: 5px;
                }
                button:hover {
                    background: #1e88e5;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="inner" id="flashcard">
                    <div class="front">${frenchWord}</div>
                    <div class="back">${germanWord}</div>
                </div>
            </div>
            <button id="reveal">Voir la réponse</button>
            <script>
                document.getElementById('reveal').addEventListener('click', () => {
                    document.getElementById('flashcard').style.transform = "rotateY(180deg)";
                });
            </script>
        </body>
        </html>
    `);

    newWindow.document.close();
}
