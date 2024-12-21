document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const fileInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output'); // Zone de sortie

    // Vérifie si un fichier est sélectionné
    if (fileInput.files.length === 0) {
        outputDiv.innerHTML = `<h3>Erreur :</h3><p>Veuillez choisir une image.</p>`;
        return;
    }

    // Affiche "Analyse en cours..."
    outputDiv.innerHTML = `<p>Analyse en cours...</p>`;

    const file = fileInput.files[0];
    const image = URL.createObjectURL(file);

    try {
        // Analyse OCR avec Tesseract.js
        const result = await Tesseract.recognize(image, 'eng+deu'); // Ajout du support pour allemand et anglais/français
        const rawText = result.data.text; // Texte brut extrait

        // Divise le texte par lignes
        const lines = rawText.split('\n').filter((line) => line.trim() !== '');

        // Sépare les colonnes
        const pairs = lines.map((line) => {
            const parts = line.split(/\s{2,}|\t/); // Sépare par espaces multiples ou tabulation
            return parts.length === 2 ? { left: parts[0], right: parts[1] } : null;
        }).filter(Boolean); // Supprime les lignes mal formées

        if (pairs.length === 0) {
            throw new Error('Aucune paire de mots (gauche/droite) détectée.');
        }

        // Affiche les paires dans la console pour vérifier
        console.log('Paires détectées :', pairs);

        // Affiche les paires pour l'utilisateur
        outputDiv.innerHTML = `<h3>Paires de mots détectées :</h3>`;
        pairs.forEach((pair) => {
            outputDiv.innerHTML += `<p><strong>Gauche :</strong> ${pair.left} | <strong>Droite :</strong> ${pair.right}</p>`;
        });

        // Stocke les paires pour une future interrogation
        startQuiz(pairs); // Lance les questions
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
