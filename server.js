const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let players = {};
let sentTo = {};

function resetGameState() {
    players = {
        "pnd_usr_panchita_x99a": { name: "Panchita la pandita", bamboo: 100 },
        "pnd_coco_uuid_88f2b1":  { name: "CocoPandita", bamboo: 70 },
        "pnd_luli_uuid_33c9e4":  { name: "LuliPandita", bamboo: 60 },
        "pnd_maxi_uuid_77a1d9":  { name: "MaxiPandita", bamboo: 50 },
        "pnd_tito_uuid_55e8f2":  { name: "TitoPandita", bamboo: 40 },
        "pnd_milo_uuid_11b4c7":  { name: "MiloPandita", bamboo: 30 },
        "pnd_bubu_uuid_99c2e8":  { name: "BubuPandita", bamboo: 20 }
    };
    sentTo = {};
}

resetGameState();

const secretFlag = "427567426f756e74794769726c73436c7562";
// 👉 PON TU LINK DE GOOGLE FORMS AQUÍ:
const raffleUrl = "https://forms.gle/8kHtUMfkRqeScoPz6"; 

app.get('/api/state', (req, res) => {
    const won = players["pnd_usr_panchita_x99a"].bamboo >= 280;
    res.json({
        players,
        won,
        flag: won ? secretFlag : null,
        raffleLink: won ? raffleUrl : null // Solo se envía si ganó
    });
});

app.post('/api/reset', (req, res) => {
    resetGameState();
    res.json({ success: true, players });
});

app.post('/api/transfer', (req, res) => {
    let { from_id, to_id, amount } = req.body;
    amount = parseInt(amount);

    if (!players[from_id] || !players[to_id]) {
        return res.status(400).json({ success: false, message: "IDs de pandas inválidos." });
    }

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: "Cantidad de bambú inválida." });
    }

    if (from_id === "pnd_usr_panchita_x99a") {
        if (amount > 5) {
            return res.status(400).json({ success: false, message: "Error: Desde la interfaz solo puedes enviar un máximo de 5 de bambú." });
        }
        if (sentTo[to_id]) {
            return res.status(400).json({ success: false, message: "Error: Ya has enviado bambú a este panda. Solo puedes hacerlo una vez." });
        }
    }

    if (players[from_id].bamboo < amount) {
        return res.status(400).json({ success: false, message: "El panda origen no tiene suficiente bambú." });
    }

    players[from_id].bamboo -= amount;
    players[to_id].bamboo += amount;

    if (from_id === "pnd_usr_panchita_x99a") {
        sentTo[to_id] = true;
    }

    const won = players["pnd_usr_panchita_x99a"].bamboo >= 280;

    res.json({
        success: true,
        message: `Se transfirieron ${amount} de bambú correctamente.`,
        players,
        won,
        flag: won ? secretFlag : null,
        raffleLink: won ? raffleUrl : null // Se libera al ganar por IDOR
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});