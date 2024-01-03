require('dotenv').config();
const cors = require('cors');
const express = require('express');
const bcrypt = require('bcryptjs');
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'merry-christmas';

const app = express();
app.use(express.json()); // Express-Middleware zum Parsen von JSON-Daten
app.use(cors());

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URI}`;
const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Verbinden mit der Datenbank
async function connectToDatabase() {
    await mongoClient.connect();
    return mongoClient.db("userDB").collection("users");
}

// Endpunkt für die Registrierung
app.post('/register', async (req, res) => {
    console.log('register endpoint aufgerufen');
    
    const users = await connectToDatabase();

    const userData = {
        "username": req.body.username,
        "password": req.body.password
    };
    console.log(userData);
    console.log(userData.password);

    const existingUser = await users.findOne({ username: userData.username });
    if (existingUser) {
        console.log(`Benutzer ${userData.username} existiert bereits`);
        return res.status(400).send('Benutzer existiert bereits');
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;
    await users.insertOne(userData);
    res.status(201).send('Benutzer erfolgreich registriert');
    console.log(`Benutzer ${userData.username} wurde registriert`);
});

// Endpunkt für Login
app.post('/login', async (req, res) => {
    const users = await connectToDatabase();
    const { username, password } = req.body;


    const user = await users.findOne({ username });
    if (!user) {
        return res.status(401).send('User exestiert nicht.');
    }
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
        return res.status(401).send('Password ist falsch.');
    }
    console.log(`Benutzer ${username} wurde angemeldet`);
    const token = jwt.sign({username: user.username}, JWT_SECRET, {expiresIn: '1h'});
    res.status(200).send('Erfolgreich angemeldet');
});

//Endpunkt zum Überprüfen des JWT:
app.post('/verify-token', async (req, res) => {
    const token = req.body.token;
    if (!token) {
        return res.status(401).send('Kein Token vorhanden');
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).send('Token ist gültig');
    } catch (err) {
        res.status(401).send('Token ist ungültig');
    }
});

const PORT = process.env.USERSERVICE_PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
