import { Router } from "express"
import { ObjectId } from "mongodb"

import { serialize } from "../serialize.js"
import {
  optionalAuth,
  requireRole,
  varifyAPI,
} from "../middleware/auth.js"

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

function isOwner(request, email) {
  return request.user?.role === "admin" || request.user?.email === email
}

export function tuitionRoutes(db) {
  const router = Router()
  const tuitions = db.collection("tuitions")
  const applications = db.collection("applications")

  router.get("/", optionalAuth, async (request, response) => {
    try {
      const { tutorEmail, approvalStatus, isActive } = request.query
      const filter = {}

      if (tutorEmail) {
        if (!isOwner(request, tutorEmail)) {
          response.status(403).json({ message: "Access denied." })
          return
        }
        filter.tutorEmail = tutorEmail
      } else if (
        approvalStatus !== "approved" ||
        isActive !== "true"
      ) {
        if (!request.user) {
          response.status(401).json({ message: "Unauthorized." })
          return
        }
        if (request.user.role !== "admin") {
          response.status(403).json({ message: "Access denied." })
          return
        }
      }

      if (approvalStatus) filter.approvalStatus = approvalStatus
      if (isActive !== undefined) filter.isActive = isActive === "true"

      const list = await tuitions.find(filter).sort({ createdAt: -1 }).toArray()
      const tutorEmails = [
        ...new Set(list.map((tuition) => tuition.tutorEmail).filter(Boolean)),
      ]

      const tutorUsers = tutorEmails.length
        ? await db
            .collection("user")
            .find(
              { email: { $in: tutorEmails } },
              {
                projection: {
                  name: 1,
                  email: 1,
                  image: 1,
                  role: 1,
                  bio: 1,
                  phone: 1,
                  createdAt: 1,
                },
              }
            )
            .toArray()
        : []

      const tutorProfiles = new Map(
        tutorUsers.map((user) => [user.email, serialize(user)])
      )

      response.json(
        list.map((tuition) => ({
          ...serialize(tuition),
          tutorProfile: tutorProfiles.get(tuition.tutorEmail) ?? null,
        }))
      )
    } catch (error) {
      fail(response, error)
    }
  })

  router.post("/", varifyAPI, requireRole("tutor"), async (request, response) => {
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
        tutorName,
      } = request.body
      const tutorEmail = request.user.email

      if (!title || !subject) {
        response.status(400).json({ message: "Title and subject are required." })
        return
      }

      const tutor = await db
        .collection("user")
        .findOne({ email: tutorEmail }, { projection: { plan: 1 } })
      const tuitionCount = await tuitions.countDocuments({ tutorEmail })

      if (tutor?.plan !== "pro" && tuitionCount >= 2) {
        response.status(403).json({
          message:
            "Free tutors can post up to 2 tuitions. Upgrade to Premium to post more.",
        })
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
        tutorName: tutorName || request.user.name || "Tutor",
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

  router.patch(
    "/:id/status",
    varifyAPI,
    requireRole("tutor", "admin"),
    async (request, response) => {
      try {
        const { id } = request.params
        if (!validId(id, response)) return

        const existing = await tuitions.findOne({ _id: new ObjectId(id) })
        if (!existing) {
          response.status(404).json({ message: "Tuition not found." })
          return
        }
        if (!isOwner(request, existing.tutorEmail)) {
          response.status(403).json({ message: "Access denied." })
          return
        }

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
    }
  )

  router.patch("/:id", varifyAPI, requireRole("tutor", "admin"), async (request, response) => {
    try {
      const { id } = request.params
      if (!validId(id, response)) return

      const existing = await tuitions.findOne({ _id: new ObjectId(id) })
      if (!existing) {
        response.status(404).json({ message: "Tuition not found." })
        return
      }
      if (!isOwner(request, existing.tutorEmail)) {
        response.status(403).json({ message: "Access denied." })
        return
      }

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

  router.delete("/:id", varifyAPI, requireRole("tutor", "admin"), async (request, response) => {
    try {
      const { id } = request.params
      if (!validId(id, response)) return

      const existing = await tuitions.findOne({ _id: new ObjectId(id) })
      if (!existing) {
        response.status(404).json({ message: "Tuition not found." })
        return
      }
      if (!isOwner(request, existing.tutorEmail)) {
        response.status(403).json({ message: "Access denied." })
        return
      }

      await tuitions.deleteOne({ _id: new ObjectId(id) })
      await applications.deleteMany({ tuitionId: id })

      response.json({ ok: true })
    } catch (error) {
      fail(response, error)
    }
  })

  return router
}
