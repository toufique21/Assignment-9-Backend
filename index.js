import express from "express"
import { MongoClient } from 'mongodb';
import "dotenv/config"
import cors from "cors"

const app = express()
const port = 8000

app.use(express.json())
app.use(cors())

const client = new MongoClient(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.5hxu0j4.mongodb.net/`);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const connectedClient = await connectToMongoDB() 

app.get('/', (req, res) => {
  res.send('Mentor - Lagbe');
});

app.listen(port, () => {
  console.log(`Mentor-Lagbe listening on port ${port}`);
});