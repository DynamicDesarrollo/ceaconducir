import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "cea_conducir_super_seguro";

export const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    // 🔥 IMPORTANTE: quitar "Bearer "
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Token requerido" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({ msg: "Token inválido" });
  }
};