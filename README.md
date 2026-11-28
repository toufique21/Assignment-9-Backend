# MentorLagbe Server

## Purpose

MentorLagbe Server is the Express REST API for the MentorLagbe tutoring marketplace. It stores tuitions and applications in MongoDB and enforces JWT authentication, role permissions, ownership checks, and Premium plan limits. The Next.js client mints JWTs from BetterAuth sessions and sends them as `Bearer` tokens to this API.

## Live URL

`http://localhost:8000`

Health check: `GET http://localhost:8000/api/health`

## Admin Credentials

| Field    | Value             |
| -------- | ----------------- |
| Email    | `Admin@admin.com` |
| Password | `Admin@admin.com` |
| Role     | `admin`           |

> Use these credentials for local/demo access only. Change them before deploying to production.

## Key Features

- Express 5 REST API with MongoDB persistence.
- JWT verification using a shared `JWT_SECRET`.
- Role-aware authorization for `student`, `tutor`, and `admin`.
- Ownership checks so users can only modify their own tuitions or applications.
- Public tuition listing restricted to approved and active records.
- Tutor tuition CRUD and active/inactive status control.
- Student application creation with duplicate prevention and free-plan limits.
- Tutor/admin application status updates.
- Student/admin application cancellation for pending applications only.
- Seeded sample tuitions for local development.
- CORS enabled for the Next.js client.

## Getting Started

```bash
npm install
node index.js
```

The server listens on `http://localhost:8000` by default.

## Environment

Create or update `.env` with the required values:

```env
PORT=8000
Client-URL=http://localhost:3000

MONGODB_URI=your-mongodb-uri
MONGO_DB_NAME=mentorLagbe

JWT_SECRET=same-secret-used-by-the-frontend
```

`JWT_SECRET` must match the frontend `JWT_SECRET`. The database name is `mentorLagbe` with that exact capitalization.

## Main Endpoints

| Method   | Endpoint                                          | Access                 |
| -------- | ------------------------------------------------- | ---------------------- |
| `GET`    | `/api/health`                                     | Public                 |
| `GET`    | `/tuitions?approvalStatus=approved&isActive=true` | Public                 |
| `GET`    | `/tuitions?tutorEmail=...`                        | Owner tutor or admin   |
| `POST`   | `/tuitions`                                       | Tutor                  |
| `PATCH`  | `/tuitions/:id`                                   | Owner tutor or admin   |
| `PATCH`  | `/tuitions/:id/status`                            | Owner tutor or admin   |
| `DELETE` | `/tuitions/:id`                                   | Owner tutor or admin   |
| `GET`    | `/applications?studentEmail=...`                  | Owner student or admin |
| `GET`    | `/applications?tutorEmail=...`                    | Owner tutor or admin   |
| `POST`   | `/applications`                                   | Student                |
| `PATCH`  | `/applications/:id/status`                        | Owner tutor or admin   |
| `DELETE` | `/applications/:id`                               | Owner student or admin |

Protected routes expect:

```http
Authorization: Bearer <jwt>
```

## NPM Packages Used

| Package   | Version   | Purpose                          |
| --------- | --------- | -------------------------------- |
| `express` | `^5.3.0`  | HTTP server and routing          |
| `cors`    | `^2.8.6`  | Cross-origin request support     |
| `dotenv`  | `^18.0.10` | Loads environment variables     |
| `mongodb` | `^7.9.1`  | MongoDB driver and ObjectId      |

JWT signature verification uses Node.js built-in `node:crypto`; no separate JWT package is required.
