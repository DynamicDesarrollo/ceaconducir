import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

export const login = async (req, res) => {
    const { email, password } = req.body;

    const result = await pool.query(
        'SELECT * FROM usuarios WHERE email = $1',
        [email]
    );

    const user = result.rows[0];

    if (!user) return res.status(404).json({ msg: 'Usuario no existe' });

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(401).json({ msg: 'Password incorrecto' });

    const token = jwt.sign(
        {
            id: user.id,
            rol: user.rol_id,
            empresa_id: user.empresa_id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
    );

    res.json({ token });
};