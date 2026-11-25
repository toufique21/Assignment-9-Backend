import { Router } from "express"
import { ObjectId } from "mongodb"

import { serialize } from "../serialize.js"
import { requireRole, varifyAPI } from "../middleware/auth.js"

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

function isOwner(request, email) {
  return request.user?.role === "admin" || request.user?.email === email
}

export function applicationRoutes(db) {
  const router = Router()
  const applications = db.collection("applications")
  const tuitions = db.collection("tuitions")

  router.get(
    "/",
    varifyAPI,
    requireRole("student", "tutor", "admin"),
    async (request, response) => {
      try {
        const { tutorEmail, studentEmail } = request.query
        const filter = {}

        if (tutorEmail) {
          if (!isOwner(request, tutorEmail)) {
            response.status(403).json({ message: "Access denied." })
            return
          }
          filter.tutorEmail = tutorEmail
        }

        if (studentEmail) {
          if (!isOwner(request, studentEmail)) {
            response.status(403).json({ message: "Access denied." })
            return
          }
          filter.studentEmail = studentEmail
        }

        if (!tutorEmail && !studentEmail && request.user.role !== "admin") {
          response.status(403).json({ message: "Access denied." })
          return
        }

        const list = await applications
          .find(filter)
          .sort({ appliedAt: -1 })
          .toArray()

        response.json(list.map(serialize))
      } catch (error) {
        fail(response, error)
      }
    }
  )

  router.post("/", varifyAPI, requireRole("student"), async (request, response) => {
    try {
      const {
        tuitionId,
        studentName,
        studentPhone,
        preferredSchedule,
        studentNote,
      } = request.body
      const studentEmail = request.user.email

      if (!ObjectId.isValid(tuitionId)) {
        response.status(400).json({ message: "Invalid tuition id." })
        return
      }

      const tuition = await tuitions.findOne({ _id: new ObjectId(tuitionId) })

      if (!tuition) {
        response.status(404).json({ message: "Tuition not found." })
        return
      }

      if (tuition.approvalStatus !== "approved" || !tuition.isActive) {
        response.status(400).json({ message: "Tuition is not available." })
        return
      }

      const duplicate = await applications.findOne({ tuitionId, studentEmail })
      if (duplicate) {
        response.status(409).json({
          message: "You have already applied for this tuition.",
        })
        return
      }

      const student = await db.collection("user").findOne(
        { email: studentEmail },
        { projection: { plan: 1 } }
      )
      const applicationCount = await applications.countDocuments({
        studentEmail,
      })

      if (student?.plan !== "pro" && applicationCount >= 5) {
        response.status(403).json({
          message:
            "Free students can apply to up to 5 tuitions. Upgrade to Premium to apply more.",
        })
        return
      }

      const document = {
        tuitionId,
        tuitionTitle: tuition.title,
        subject: tuition.subject,
        monthlyFee: Number(tuition.monthlyFee) || 0,
        tutorEmail: tuition.tutorEmail,
        tutorName: tuition.tutorName || "MentorLagbe Tutor",
        studentName: studentName || request.user.name || "Student",
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

  router.patch("/:id/status", varifyAPI, requireRole("tutor", "admin"), async (request, response) => {
    try {
      const { id } = request.params
      if (!validId(id, response)) return

      const application = await applications.findOne({ _id: new ObjectId(id) })
      if (!application) {
        response.status(404).json({ message: "Application not found." })
        return
      }
      if (!isOwner(request, application.tutorEmail)) {
        response.status(403).json({ message: "Access denied." })
        return
      }

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

  router.delete("/:id", varifyAPI, requireRole("student", "admin"), async (request, response) => {
    try {
      const { id } = request.params
      if (!validId(id, response)) return

      const application = await applications.findOne({ _id: new ObjectId(id) })
      if (!application) {
        response.status(404).json({ message: "Application not found." })
        return
      }
      if (!isOwner(request, application.studentEmail)) {
        response.status(403).json({ message: "Access denied." })
        return
      }

      if (application.status !== "pending") {
        response.status(400).json({
          message: "Only pending applications can be cancelled.",
        })
        return
      }

      await applications.deleteOne({ _id: new ObjectId(id) })
      response.json({ ok: true })
    } catch (error) {
      fail(response, error)
    }
  })

  return router
}
