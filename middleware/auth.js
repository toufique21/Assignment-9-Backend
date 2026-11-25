import { createHmac } from "node:crypto"

export function varifyAPI(req, res, next) {
    const header = req.headers.authorization || ""
    const token = header.startsWith("Bearer ") ? header.slice(7) : ""

    if (!token) {
        return res.status(401).json({ message: "No token provided." })
    }

    try {
        const [encodedHeader, encodedPayload, signature] = token.split(".")

        if (!encodedHeader || !encodedPayload || !signature) {
            throw new Error("Invalid token")
        }

        const expected = createHmac("sha256", process.env.JWT_SECRET)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest("base64url")

        if (signature !== expected) {
            throw new Error("Invalid token")
        }

        req.user = JSON.parse(
            Buffer.from(encodedPayload, "base64url").toString("utf8")
        )

        next()
    } catch {
        return res.status(401).json({ message: "Invalid token." })
    }
}
