document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const fileInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output'); // Zone d'affichage

    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>Veuillez choisir une image.</p>`;
        return;
    }

    outputDiv.innerHTML = `<p>Analyse en cours...</p>`;
    const file = fileInput.files[0];
    const image = URL.createObjectURL(file);

    try {
        // Analyse OCR avec Tesseract.js
        const result = await Tesseract.recognize(image, 'deu+fra', {
            logger: (info) => console.log(info),
            tessedit_pageseg_mode: 4, // Détection des colonnes
        });

        // Texte brut extrait
        const rawText = result.data.text;
        console.log('Texte brut extrait :', rawText);

        // Divise le texte en lignes
        const lines = rawText.split('\n').filter((line) => line.trim() !== '');
        console.log('Lignes détectées :', lines);

        // Séparation gauche/droite
        const pairs = lines.map((line) => {
            const parts = line.split(/\s{4,}/); // Sépare par au moins 4 espaces
            return parts.length === 2 ? { left: parts[0].trim(), right: parts[1].trim() } : null;
        }).filter(Boolean);

        if (pairs.length === 0) {
            console.log('Lignes détectées :', lines);
            throw new Error('Aucune paire de mots (gauche/droite) détectée. Vérifiez l\'image.');
        }

        // Affiche les paires
        outputDiv.innerHTML = `<h3>Paires de mots détectées :</h3>`;
        pairs.forEach((pair) => {
            outputDiv.innerHTML += `<p><strong>Allemand :</strong> ${pair.left} | <strong>Français :</strong> ${pair.right}</p>`;
        });

        // Interroge l'utilisateur (facultatif)
        startQuiz(pairs);
    } catch (error) {
        console.error('Erreur détaillée :', error);
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>${error.message}</p>`;
    }
});

// Fonction pour interroger l'utilisateur
function startQuiz(pairs) {
    const quizDiv = document.createElement('div');
    quizDiv.id = 'quiz';
    document.body.appendChild(quizDiv);

    let index = 0;

    const askQuestion = () => {
        if (index >= pairs.length) {
            quizDiv.innerHTML = `<h3>Quiz terminé !</h3>`;
            return;
        }

        const pair = pairs[index];
        quizDiv.innerHTML = `
            <p>Traduisez : <strong>${pair.left}</strong></p>
            <input type="text" id="answer" placeholder="Votre réponse">
            <button id="submitAnswer">Valider</button>
        `;

        document.getElementById('submitAnswer').addEventListener('click', () => {
            const answer = document.getElementById('answer').value.trim();
            if (answer.toLowerCase() === pair.right.toLowerCase()) {
                alert('Bonne réponse !');
            } else {
                alert(`Faux. La bonne réponse était : ${pair.right}`);
            }
            index++;
            askQuestion();
        });
    };

    askQuestion();
}
