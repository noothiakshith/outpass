// middleware/auth.js
import jwt from "jsonwebtoken";

export const authenticateRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded; // attach user info (id, role, email) to request

      // Check if role is allowed
      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      }

      next(); // user is authorized
    } catch (err) {
      console.error(err);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
};
