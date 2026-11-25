import { createHmac, timingSafeEqual } from "node:crypto"

function base64UrlDecode(value) {
    return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64")
}

function readBearerToken(header) {
    const parts = (header ?? "").trim().split(/\s+/)

    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
        return null
    }

    return parts[1]
}

/**
 * Verifies an HS256 JWT from the Authorization header and attaches the
 * decoded payload to `request.user`.
 */
export function requireAuth(request, response, next) {
    const token = readBearerToken(request.headers.authorization)

    if (!token) {
        return response
            .status(401)
            .json({ message: "Authorization token is required." })
    }

    const secret = process.env.JWT_SECRET

    if (!secret) {
        return response
            .status(500)
            .json({ message: "JWT_SECRET is not configured." })
    }

    const parts = token.split(".")

    if (parts.length !== 3) {
        return response.status(401).json({ message: "Invalid token." })
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts

    let header
    let payload
    let signature

    try {
        header = JSON.parse(base64UrlDecode(encodedHeader).toString("utf8"))
        payload = JSON.parse(base64UrlDecode(encodedPayload).toString("utf8"))
        signature = base64UrlDecode(encodedSignature)
    } catch {
        return response.status(401).json({ message: "Invalid token." })
    }

    if (!header || header.alg !== "HS256") {
        return response
            .status(401)
            .json({ message: "Unsupported token algorithm." })
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return response.status(401).json({ message: "Invalid token." })
    }

    const expectedSignature = createHmac("sha256", secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest()

    if (
        signature.length !== expectedSignature.length ||
        !timingSafeEqual(signature, expectedSignature)
    ) {
        return response.status(401).json({ message: "Invalid token." })
    }

    const now = Math.floor(Date.now() / 1000)

    if (typeof payload.exp === "number" && payload.exp <= now) {
        return response.status(401).json({ message: "Token has expired." })
    }

    if (typeof payload.nbf === "number" && payload.nbf > now) {
        return response.status(401).json({ message: "Token is not active yet." })
    }

    request.user = payload

    return next()
}
