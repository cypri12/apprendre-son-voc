// Exemples de données pour les cartes
const cards = [
    { question: "Bonjour", answer: "Guten Tag" },
    { question: "Merci", answer: "Danke" },
    { question: "Chat", answer: "Katze" },
];

let currentIndex = 0;

function loadCards() {
    const container = document.getElementById('card-container');
    container.innerHTML = ''; // Réinitialiser le conteneur

    if (currentIndex >= cards.length) {
        container.innerHTML = '<h3>Félicitations, vous avez terminé toutes les cartes !</h3>';
        return;
    }

    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
        <h3>${cards[currentIndex].question}</h3>
        <input type="text" id="userAnswer" placeholder="Entrez la réponse">
        <button onclick="validateAnswer()">Valider</button>
    `;
    container.appendChild(card);
}

function validateAnswer() {
    const userAnswer = document.getElementById('userAnswer').value.trim().toLowerCase();
    const correctAnswer = cards[currentIndex].answer.toLowerCase();

    if (userAnswer === correctAnswer) {
        alert("Correct !");
    } else {
        alert(`Incorrect. La bonne réponse était : ${cards[currentIndex].answer}`);
    }

    currentIndex++;
    loadCards();
}

// Charger les cartes au démarrage
document.addEventListener('DOMContentLoaded', loadCards);
