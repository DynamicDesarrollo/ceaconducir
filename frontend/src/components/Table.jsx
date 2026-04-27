import { useState } from "react";

export default function Table({
  columns,
  data,
  renderActions,
  search = "",
}) {
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const fieldMap = {
    Nombre: "nombre",
    Documento: "documento",
    Teléfono: "telefono",
    Direccion: "direccion",
    Email: "email",
    Estado: "estado_pago",
    Concepto: "categoria", // 🔥 NUEVO
    Valor: "monto",        // 🔥 NUEVO
    Fecha: "fecha",        // 🔥 NUEVO
  };

  // 🔄 SORT
  const handleSort = (col) => {
    const colName = typeof col === "string" ? col : col.title;

    if (sortField === colName) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(colName);
      setSortDir("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;

    const field = fieldMap[sortField];
    if (!field) return 0;

    const aVal = (a[field] || "").toString().toLowerCase();
    const bVal = (b[field] || "").toString().toLowerCase();

    return sortDir === "asc"
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });

  // 🔍 Highlight
  const highlight = (text) => {
    if (!search) return text;

    const parts = text.split(new RegExp(`(${search})`, "gi"));

    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={i}>{part}</mark>
      ) : (
        part
      )
    );
  };

  // 🎨 Estado
  const renderEstado = (estado) => {
    const base = "px-2 py-1 rounded text-white text-xs font-semibold";

    if (estado === "Pagado")
      return <span className={`${base} bg-green-500`}>Pagado</span>;

    if (estado === "Pendiente")
      return <span className={`${base} bg-yellow-500`}>Pendiente</span>;

    if (estado === "Sin pago")
      return <span className={`${base} bg-red-500`}>Sin pago</span>;

    return <span className={`${base} bg-gray-400`}>{estado}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col, index) => {
              const title = typeof col === "string" ? col : col.title;

              return (
                <th
                  key={index}
                  onClick={() => handleSort(col)}
                  className="text-left p-3 cursor-pointer hover:bg-gray-200"
                >
                  {title}

                  {sortField === title && (
                    <span className="ml-1">
                      {sortDir === "asc" ? "⬆️" : "⬇️"}
                    </span>
                  )}
                </th>
              );
            })}

            {renderActions && <th className="p-3">Acciones</th>}
          </tr>
        </thead>

        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="text-center p-6 text-gray-400"
              >
                No hay resultados
              </td>
            </tr>
          ) : (
            sortedData.map((row, i) => (
              <tr
                key={row.id || i}
                className="border-t hover:bg-gray-50 transition"
              >
                {columns.map((col, j) => {
                  // 🔥 MODO PRO
                  if (typeof col === "object" && col.render) {
                    return (
                      <td key={j} className="p-3">
                        {col.render(row)}
                      </td>
                    );
                  }

                  // 🔵 MODO NORMAL (el que ya tenías)
                  const colName = typeof col === "string" ? col : col.title;
                  const field = fieldMap[colName];
                  const value = row[field] || "";

                  return (
                    <td key={j} className="p-3">
                      {colName === "Estado"
                        ? renderEstado(value)
                        : highlight(value.toString())}
                    </td>
                  );
                })}

                {renderActions && (
                  <td className="p-3">{renderActions(row)}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}