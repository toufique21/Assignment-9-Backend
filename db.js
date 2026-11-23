import { MongoClient } from "mongodb"
import "dotenv/config"

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.5hxu0j4.mongodb.net/`

const client = new MongoClient(uri)

export async function connectToMongoDB() {
  try {
    await client.connect()
    console.log("You successfully connected to MongoDB!")
    return client
  } catch (error) {
    console.error("MongoDB connection failed:", error)
    throw error
  }
}

const connectedClient = await connectToMongoDB()

// Your Atlas cluster already contains this database name (case-sensitive).
const dbName = process.env.MONGO_DB_NAME || "mentorLagbe"

export const db = connectedClient.db(dbName)
