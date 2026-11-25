import cors from "cors"
import express from "express"
import "dotenv/config"

import { db } from "./db.js"
import { applicationRoutes } from "./routes/applications.js"
import { tuitionRoutes } from "./routes/tuitions.js"
import { seedDatabase } from "./seed.js"
import { varifyAPI } from "./middleware/auth.js"

const app = express()
const port = process.env.PORT || 8000

app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
  res.send("Mentor - Lagbe")
})

app.get("/api/health", (req, res) => {
  res.json({ ok: true })
})

await seedDatabase()

app.use("/tuitions", tuitionRoutes(db))
app.use("/applications", applicationRoutes(db))

app.listen(port, () => {
  console.log(`Mentor-Lagbe listening on port ${port}`)
})
