import { db } from "./db.js"
import { serialize } from "./serialize.js"

export const DEMO_TUTOR_EMAIL = "tutor@mentorlagbe.com"

const image = {
  math: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
  physics: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
  coding: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
  ielts: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
  chemistry: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
  english: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
}

function makeTuition(tuition) {
  return {
    approvalStatus: "approved",
    isActive: true,
    createdAt: new Date().toISOString(),
    ...tuition,
  }
}

const publicTuitions = [
  makeTuition({
    title: "HSC Mathematics Mastery Batch",
    subject: "Mathematics",
    classLevel: "Class 11–12",
    mode: "Online",
    location: "Remote",
    monthlyFee: 4500,
    daysPerWeek: 3,
    bannerImage: image.math,
    description: "Exam-focused problem solving with weekly mock tests.",
    tutorName: "Rahim Ahmed",
    tutorEmail: "rahim@example.com",
  }),
  makeTuition({
    title: "Physics for HSC & Engineering",
    subject: "Physics",
    classLevel: "Class 11–12",
    mode: "Offline",
    location: "Dhaka",
    monthlyFee: 6000,
    daysPerWeek: 4,
    bannerImage: image.physics,
    description: "Concept building with lab-style practical sessions.",
    tutorName: "Sadia Karim",
    tutorEmail: "sadia@example.com",
  }),
  makeTuition({
    title: "Full-Stack Web Development",
    subject: "Programming",
    classLevel: "All Levels",
    mode: "Online",
    location: "Remote",
    monthlyFee: 8500,
    daysPerWeek: 2,
    bannerImage: image.coding,
    description: "Build and deploy real projects with modern JavaScript.",
    tutorName: "Tanvir Rahman",
    tutorEmail: "tanvir@example.com",
  }),
  makeTuition({
    title: "IELTS Intensive: Target 7.0+",
    subject: "IELTS",
    classLevel: "All Levels",
    mode: "Online",
    location: "Remote",
    monthlyFee: 5000,
    daysPerWeek: 4,
    bannerImage: image.ielts,
    description: "Speaking, writing and mock exams with personal feedback.",
    tutorName: "Nadia Islam",
    tutorEmail: "nadia@example.com",
  }),
  makeTuition({
    title: "Chemistry for Class 9–10",
    subject: "Chemistry",
    classLevel: "Class 9–10",
    mode: "Offline",
    location: "Chattogram",
    monthlyFee: 3500,
    daysPerWeek: 2,
    bannerImage: image.chemistry,
    description: "Board-aligned lessons with formula practice and quizzes.",
    tutorName: "Karim Sheikh",
    tutorEmail: "karim@example.com",
  }),
  makeTuition({
    title: "Spoken English Confidence Club",
    subject: "English",
    classLevel: "All Levels",
    mode: "Online",
    location: "Remote",
    monthlyFee: 3000,
    daysPerWeek: 3,
    bannerImage: image.english,
    description: "Small-group speaking practice with friendly corrections.",
    tutorName: "Jubair Hasan",
    tutorEmail: "jubair@example.com",
  }),
  makeTuition({
    title: "Primary School Math Foundations",
    subject: "Mathematics",
    classLevel: "Class 1–5",
    mode: "Offline",
    location: "Sylhet",
    monthlyFee: 2500,
    daysPerWeek: 2,
    bannerImage: image.math,
    description: "Playful number sense and homework support for young learners.",
    tutorName: "Farzana Akter",
    tutorEmail: "farzana@example.com",
  }),
  makeTuition({
    title: "SSC Physics Crash Course",
    subject: "Physics",
    classLevel: "Class 9–10",
    mode: "Online",
    location: "Remote",
    monthlyFee: 3800,
    daysPerWeek: 4,
    bannerImage: image.physics,
    description: "Board-style problem solving and revision in a short batch.",
    tutorName: "Rakibul Islam",
    tutorEmail: "rakibul@example.com",
  }),
  makeTuition({
    title: "Python for Absolute Beginners",
    subject: "Programming",
    classLevel: "All Levels",
    mode: "Online",
    location: "Remote",
    monthlyFee: 5500,
    daysPerWeek: 2,
    bannerImage: image.coding,
    description: "Learn Python by building small, practical projects.",
    tutorName: "Sabbir Ahmed",
    tutorEmail: "sabbir@example.com",
  }),
  makeTuition({
    title: "IELTS Writing Task 2 Lab",
    subject: "IELTS",
    classLevel: "All Levels",
    mode: "Online",
    location: "Remote",
    monthlyFee: 4200,
    daysPerWeek: 3,
    bannerImage: image.ielts,
    description: "Essay structure, vocabulary and timed writing feedback.",
    tutorName: "Tahmina Islam",
    tutorEmail: "tahmina@example.com",
  }),
  makeTuition({
    title: "Organic Chemistry Basics",
    subject: "Chemistry",
    classLevel: "Class 11–12",
    mode: "Offline",
    location: "Dhaka",
    monthlyFee: 4800,
    daysPerWeek: 3,
    bannerImage: image.chemistry,
    description: "Reaction mechanisms made simple with guided practice.",
    tutorName: "Mahmudul Hasan",
    tutorEmail: "mahmud@example.com",
  }),
]

const demoTuitions = [
  makeTuition({
    title: "HSC Mathematics Problem Solving",
    subject: "Mathematics",
    classLevel: "Class 11–12",
    mode: "Online",
    location: "Remote",
    monthlyFee: 4500,
    daysPerWeek: 3,
    bannerImage: image.math,
    description: "Exam-focused practice with weekly mock tests.",
    tutorName: "Demo Tutor",
    tutorEmail: DEMO_TUTOR_EMAIL,
  }),
  makeTuition({
    title: "IELTS Speaking Lab",
    subject: "IELTS",
    classLevel: "All Levels",
    mode: "Online",
    location: "Remote",
    monthlyFee: 4000,
    daysPerWeek: 2,
    bannerImage: image.ielts,
    description: "Fluency drills and mock speaking tests with feedback.",
    tutorName: "Demo Tutor",
    tutorEmail: DEMO_TUTOR_EMAIL,
    approvalStatus: "pending",
  }),
]

const studentApplicationSamples = [
  {
    title: "HSC Mathematics Mastery Batch",
    status: "pending",
    studentPhone: "+880 1711-000111",
    preferredSchedule: "Monday, Wednesday — 6 PM",
    studentNote: "I need extra practice on differentiation.",
  },
  {
    title: "Full-Stack Web Development",
    status: "accepted",
    studentPhone: "+880 1711-000222",
    preferredSchedule: "Saturday and Tuesday — 7 PM",
    studentNote: "I want to build a portfolio project.",
  },
  {
    title: "IELTS Intensive: Target 7.0+",
    status: "rejected",
    studentPhone: "+880 1711-000333",
    preferredSchedule: "Friday — 5 PM",
    studentNote: "Preparing for the IELTS exam next month.",
  },
]

function makeApplication(tuition, application) {
  return {
    tuitionId: tuition.id,
    tuitionTitle: tuition.title,
    subject: tuition.subject,
    monthlyFee: tuition.monthlyFee,
    tutorEmail: tuition.tutorEmail,
    tutorName: tuition.tutorName,
    status: "pending",
    appliedAt: new Date().toISOString(),
    ...application,
  }
}

export async function seedDatabase() {
  const tuitions = db.collection("tuitions")
  const applications = db.collection("applications")

  if ((await tuitions.countDocuments()) === 0) {
    await tuitions.insertMany([...publicTuitions, ...demoTuitions])
    console.log("Seeded tuition samples.")
  } else {
    // Add any newly introduced samples without touching existing listings.
    for (const tuition of publicTuitions) {
      await tuitions.updateOne(
        { title: tuition.title },
        { $setOnInsert: tuition },
        { upsert: true }
      )
    }
    console.log("Synced tuition samples.")
  }

  if ((await applications.countDocuments()) === 0) {
    const demoTuition = serialize(
      await tuitions.findOne({
        tutorEmail: DEMO_TUTOR_EMAIL,
        approvalStatus: "approved",
      })
    )

    if (demoTuition) {
      await applications.insertMany([
        makeApplication(demoTuition, {
          studentName: "Ayesha Rahman",
          studentEmail: "ayesha@example.com",
          studentPhone: "+880 1712-345678",
          preferredSchedule: "Monday, Wednesday, Friday — 6 PM",
          studentNote: "I need extra practice on calculus.",
        }),
        makeApplication(demoTuition, {
          studentName: "Mehedi Hasan",
          studentEmail: "mehedi@example.com",
          studentPhone: "+880 1819-876543",
          preferredSchedule: "Tuesday and Thursday — 7 PM",
          studentNote: "Preparing for the HSC board exam.",
          status: "accepted",
        }),
        makeApplication(demoTuition, {
          studentName: "Nusrat Jahan",
          studentEmail: "nusrat@example.com",
          studentPhone: "+880 1911-223344",
          preferredSchedule: "Friday — 5 PM",
          studentNote: "Looking for a weekend-only batch.",
          status: "rejected",
        }),
      ])
      console.log("Seeded application samples.")
    }
  }

  // Keep the demo student's applications connected to the current seed tuitions.
  for (const sample of studentApplicationSamples) {
    const tuition = serialize(await tuitions.findOne({ title: sample.title }))

    if (!tuition) continue

    await applications.updateOne(
      { tuitionId: tuition.id, studentEmail: "student@student.com" },
      {
        $setOnInsert: makeApplication(tuition, {
          ...sample,
          studentName: "Student",
          studentEmail: "student@student.com",
        }),
      },
      { upsert: true }
    )
  }
}
