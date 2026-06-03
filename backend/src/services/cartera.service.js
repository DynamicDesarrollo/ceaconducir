import { pool } from '../config/db.js';

// Recalcula el total pagado por el estudiante y actualiza su cuenta
export async function recalcularCuenta(estudiante_id) {
	// Suma todos los pagos del estudiante
	const pagos = await pool.query(
		'SELECT COALESCE(SUM(monto),0) as total FROM pagos WHERE estudiante_id = $1',
		[estudiante_id]
	);
	const total_pagado = Number(pagos.rows[0].total);

	// Obtiene el valor del curso
	const matricula = await pool.query(
		`SELECT total_curso
   		 FROM matriculas
   		 WHERE estudiante_id = $1`,
		[estudiante_id]
	);

	const total_curso =
		Number(matricula.rows[0]?.total_curso || 0);

	// Calcula saldo y estado
	const saldo = Math.max(total_curso - total_pagado, 0);
	let estado_pago = "Pendiente";
	if (saldo <= 0 && total_curso > 0) estado_pago = "Pagado";
	else if (total_pagado > 0) estado_pago = "Abonado";

	// Actualiza los campos en la tabla estudiantes
	await pool.query(
		'UPDATE matriculas SET total_pagado = $1,saldo = $2,estado = $3 WHERE estudiante_id = $4',
		[total_pagado, saldo, estado_pago, estudiante_id]
	);
	return { total_pagado, saldo, estado_pago };
}
