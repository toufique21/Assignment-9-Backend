import { Router } from "express"
import { ObjectId } from "mongodb"

import { serialize } from "../serialize.js"

const statuses = ["pending", "accepted", "rejected"]

function fail(response, error) {
  response.status(500).json({ message: error.message || "Request failed." })
}

function validId(id, response) {
  if (!ObjectId.isValid(id)) {
    response.status(400).json({ message: "Invalid application id." })
    return false
  }
  return true
}

export function applicationRoutes(db) {
  const router = Router()
  const applications = db.collection("applications")

  router.get("/", async (request, response) => {
    try {
      const { tutorEmail } = request.query
      const filter = tutorEmail ? { tutorEmail } : {}

      const list = await applications
        .find(filter)
        .sort({ appliedAt: -1 })
        .toArray()

      response.json(list.map(serialize))
    } catch (error) {
      fail(response, error)
    }
  })

  router.post("/", async (request, response) => {
    try {
      const {
        tuitionId,
        tuitionTitle,
        subject,
        monthlyFee,
        tutorEmail,
        studentName,
        studentEmail,
        studentPhone,
        preferredSchedule,
        studentNote,
      } = request.body

      if (!tuitionId || !studentName || !studentEmail) {
        response.status(400).json({
          message: "tuitionId, studentName and studentEmail are required.",
        })
        return
      }

      const document = {
        tuitionId,
        tuitionTitle,
        subject,
        monthlyFee: Number(monthlyFee) || 0,
        tutorEmail,
        studentName,
        studentEmail,
        studentPhone: studentPhone || "",
        preferredSchedule: preferredSchedule || "",
        studentNote: studentNote || "",
        status: "pending",
        appliedAt: new Date().toISOString(),
      }

      const result = await applications.insertOne(document)
      response
        .status(201)
        .json(serialize({ ...document, _id: result.insertedId }))
    } catch (error) {
      fail(response, error)
    }
  })

  router.patch("/:id/status", async (request, response) => {
    try {
      const { id } = request.params
      if (!validId(id, response)) return

      const { status } = request.body
      if (!statuses.includes(status)) {
        response.status(400).json({ message: "Invalid application status." })
        return
      }

      const result = await applications.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status } },
        { returnDocument: "after" }
      )

      if (!result) {
        response.status(404).json({ message: "Application not found." })
        return
      }

      response.json(serialize(result))
    } catch (error) {
      fail(response, error)
    }
  })

  return router
}
