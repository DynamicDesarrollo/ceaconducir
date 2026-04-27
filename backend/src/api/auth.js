import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "cea_conducir_super_seguro";

export const login = async (req, res) => {
  const { correo, password } = req.body;

  try {
    const email = correo.trim().toLowerCase();

    const result = await pool.query(
      "SELECT * FROM usuarios WHERE LOWER(email) = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ msg: "Usuario no existe" });
    }

    const usuario = result.rows[0];

    const validPassword = await bcrypt.compare(password, usuario.password);

    if (!validPassword) {
      return res.status(400).json({ msg: "Contraseña incorrecta" });
    }

    // 🔐 TOKEN REAL
    const token = jwt.sign(
      { id: usuario.id, 
        email: usuario.email,
        rol: usuario.rol_id,
        empresa_id: usuario.empresa_id  },  
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      msg: "Login correcto",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
    });

  } catch (error) {
    console.error("ERROR LOGIN:", error);
    return res.status(500).json({ msg: "Error del servidor" });
  }
};