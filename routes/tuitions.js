import { Router } from "express"
import { ObjectId } from "mongodb"

import { serialize } from "../serialize.js"

const editableFields = [
  "title",
  "subject",
  "classLevel",
  "mode",
  "location",
  "monthlyFee",
  "daysPerWeek",
  "bannerImage",
  "description",
]

function fail(response, error) {
  response.status(500).json({ message: error.message || "Request failed." })
}

function validId(id, response) {
  if (!ObjectId.isValid(id)) {
    response.status(400).json({ message: "Invalid tuition id." })
    return false
  }
  return true
}

export function tuitionRoutes(db) {
  const router = Router()
  const tuitions = db.collection("tuitions")
  const applications = db.collection("applications")

  router.get("/", async (request, response) => {
    try {
      const { tutorEmail, approvalStatus, isActive } = request.query
      const filter = {}

      if (tutorEmail) filter.tutorEmail = tutorEmail
      if (approvalStatus) filter.approvalStatus = approvalStatus
      if (isActive !== undefined) filter.isActive = isActive === "true"

      const list = await tuitions.find(filter).sort({ createdAt: -1 }).toArray()
      response.json(list.map(serialize))
    } catch (error) {
      fail(response, error)
    }
  })

  router.post("/", async (request, response) => {
    try {
      const {
        title,
        subject,
        classLevel,
        mode,
        location,
        monthlyFee,
        daysPerWeek,
        bannerImage,
        description,
        tutorEmail,
        tutorName,
      } = request.body

      if (!title || !subject || !tutorEmail) {
        response
          .status(400)
          .json({ message: "Title, subject and tutorEmail are required." })
        return
      }

      const document = {
        title,
        subject,
        classLevel,
        mode,
        location,
        monthlyFee: Number(monthlyFee) || 0,
        daysPerWeek: Number(daysPerWeek) || 1,
        bannerImage: bannerImage || "",
        description: description || "",
        tutorEmail,
        tutorName: tutorName || "Tutor",
        approvalStatus: "pending",
        isActive: true,
        createdAt: new Date().toISOString(),
      }

      const result = await tuitions.insertOne(document)
      response.status(201).json(serialize({ ...document, _id: result.insertedId }))
    } catch (error) {
      fail(response, error)
    }
  })

  router.patch("/:id/status", async (request, response) => {
    try {
      const { id } = request.params
      if (!validId(id, response)) return

      const { isActive } = request.body
      if (typeof isActive !== "boolean") {
        response.status(400).json({ message: "isActive must be a boolean." })
        return
      }

      const result = await tuitions.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { isActive } },
        { returnDocument: "after" }
      )

      if (!result) {
        response.status(404).json({ message: "Tuition not found." })
        return
      }

      response.json(serialize(result))
    } catch (error) {
      fail(response, error)
    }
  })

  router.patch("/:id", async (request, response) => {
    try {
      const { id } = request.params
      if (!validId(id, response)) return

      const updates = {}
      for (const field of editableFields) {
        if (field in request.body) updates[field] = request.body[field]
      }

      if ("monthlyFee" in updates) updates.monthlyFee = Number(updates.monthlyFee)
      if ("daysPerWeek" in updates) {
        updates.daysPerWeek = Number(updates.daysPerWeek)
      }

      const result = await tuitions.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updates },
        { returnDocument: "after" }
      )

      if (!result) {
        response.status(404).json({ message: "Tuition not found." })
        return
      }

      response.json(serialize(result))
    } catch (error) {
      fail(response, error)
    }
  })

  router.delete("/:id", async (request, response) => {
    try {
      const { id } = request.params
      if (!validId(id, response)) return

      await tuitions.deleteOne({ _id: new ObjectId(id) })
      await applications.deleteMany({ tuitionId: id })

      response.json({ ok: true })
    } catch (error) {
      fail(response, error)
    }
  })

  return router
}
