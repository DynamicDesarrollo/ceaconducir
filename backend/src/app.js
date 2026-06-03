import express from 'express';
import cors from 'cors';


import authRoutes from './routes/auth.routes.js';
import estudiantesRoutes from './routes/estudiantes.routes.js';
import pagosRoutes from './routes/pagos.routes.js';
import egresosRoutes from './routes/egresos.routes.js';
//import categoriasEgresoRoutes from "./routes/categoriasEgreso.routes.js";
import vehiculosRoutes from './routes/vehiculos.routes.js';
import categoriasRoutes from "./routes/categorias.routes.js";
import combosRoutes from "./routes/combos.routes.js";
import tercerosRoutes from "./routes/terceros.routes.js";
import usuariosRoutes from './routes/usuarios.routes.js';



const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/egresos', egresosRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/combos', combosRoutes);
import matriculasRoutes from "./routes/matriculas.routes.js";
app.use('/api/matriculas', matriculasRoutes);
app.use("/api/terceros", tercerosRoutes);

app.use('/api/usuarios', usuariosRoutes);



export default app;