const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Nécessaire pour effectuer des requêtes vers LibreTranslate

const app = express();

// Activer CORS pour toutes les requêtes
app.use(cors());

// Parser le corps des requêtes au format JSON
app.use(bodyParser.json());

// Point de terminaison pour relayer les requêtes vers LibreTranslate
app.post('/detect', async (req, res) => {
    try {
        // Relaye la requête vers LibreTranslate
        const response = await fetch('https://libretranslate.de/detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body), // Relaye exactement les données reçues
        });

        // Récupère la réponse de LibreTranslate
        const result = await response.json();

        // Retourne le résultat au client
        res.json(result);
    } catch (error) {
        console.error('Erreur dans le proxy :', error);
        res.status(500).json({ error: 'Erreur lors de la communication avec LibreTranslate.' });
    }
});

// Lancer le serveur sur le port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur proxy en cours d'exécution sur http://localhost:${PORT}`);
});
