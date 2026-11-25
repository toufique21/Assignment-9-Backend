import { createHmac, timingSafeEqual } from "node:crypto"

function verifyToken(request, response, next) {
    const header = request.headers.authorization || ""
    const token = header.startsWith("Bearer ") ? header.slice(7) : ""

    if (!token) {
        return response.status(401).json({ message: "No token provided." })
    }

    const secret = process.env.JWT_SECRET

    if (!secret) {
        return response
            .status(500)
            .json({ message: "JWT_SECRET is not configured." })
    }

    try {
        const [encodedHeader, encodedPayload, signature] = token.split(".")

        if (!encodedHeader || !encodedPayload || !signature) {
            throw new Error("Invalid token")
        }

        const tokenHeader = JSON.parse(
            Buffer.from(encodedHeader, "base64url").toString("utf8")
        )

        if (tokenHeader.alg !== "HS256") {
            throw new Error("Unsupported algorithm")
        }

        const expected = createHmac("sha256", secret)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest()
        const provided = Buffer.from(signature, "base64url")

        if (
            provided.length !== expected.length ||
            !timingSafeEqual(provided, expected)
        ) {
            throw new Error("Invalid signature")
        }

        const payload = JSON.parse(
            Buffer.from(encodedPayload, "base64url").toString("utf8")
        )

        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
            throw new Error("Invalid payload")
        }

        const now = Math.floor(Date.now() / 1000)

        if (typeof payload.exp !== "number" || payload.exp <= now) {
            throw new Error("Expired token")
        }

        request.user = payload

        return next()
    } catch {
        return response.status(401).json({ message: "Invalid token." })
    }
}

/** Requires a valid JWT on every request. */
export function varifyAPI(request, response, next) {
    return verifyToken(request, response, next)
}

/** Uses the user when a JWT is present, but still allows public requests. */
export function optionalAuth(request, response, next) {
    const header = request.headers.authorization || ""

    if (!header.startsWith("Bearer ")) {
        return next()
    }

    return verifyToken(request, response, next)
}

/** Allows only the given roles after varifyAPI has set request.user. */
export function requireRole(...roles) {
    return (request, response, next) => {
        if (!request.user) {
            return response.status(401).json({ message: "Unauthorized." })
        }

        if (!roles.includes(request.user.role)) {
            return response
                .status(403)
                .json({ message: "You do not have access to this resource." })
        }

        return next()
    }
}
