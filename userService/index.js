//userService
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URI}`;

const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Verbinden mit der Datenbank
async function connectToDatabase() {
  await mongoClient.connect();
  return mongoClient.db("userDB").collection("users");
}

// Endpunkt für die Registrierung
app.post("/register", async (req, res) => {
  console.log("calling register endpoint");

  const users = await connectToDatabase();

  const userData = {
    username: req.body.username,
    password: req.body.password,
  };
  console.log(userData);

  const existingUser = await users.findOne({ username: userData.username });
  if (existingUser) {
    return res.status(400).send("Benutzer existiert bereits");

    // console.log(`Benutzer ${userData.username} existiert bereits`)
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  userData.password = hashedPassword;

  await users.insertOne(userData);
  res.status(201).send("Benutzer erfolgreich registriert");

  console.log(`Benutzer ${userData.username} wurder registriert`);
});

// Endpunkt für Login
app.post("/login", async (req, res) => {
  const users = await connectToDatabase();
  const { username, password } = req.body;

  const user = await users.findOne({ username });
  if (!user) {
    return res.status(401).send("user existiert nicht");
  }

  const passwordisValid = await bcrypt.compare(password, user.password);
  if (!passwordisValid) {
    return res.status(401).send("Passwort faslch");
  }
  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  // Login Logik hier (z.B. Session-Erstellung)
  res.status(200).json({ token });
});

//Endpunkt zum Überprüfen des JWT:
app.get("/validate-token", authenticateToken, (req, res) => {
  // console.log("validation is in progress");
  res.status(200).send({ isValid: true, user: req.user });
});
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    console.log("Kein Token vorhanden");
    return res.status(401).send("Kein Token vorhanden");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Token ist ungültig");
    req.user = user;
    res.status(200).send({ isValid: true, user: req.user });
  });
}

const PORT = process.env.USERSERVICE_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Userservice läuft auf Port ${PORT}`);
});

