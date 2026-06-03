import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { toast } from "react-toastify";
import {
  crearEstudiante,
  updateEstudiante,
} from "../api/estudiantes";
import FirmaPad from "../components/FirmaPad";
import {
  capturarFirmaWacom,
} from "../services/ceaConnect";

export default function FormEstudiante({
  onClose,
  onSaved,
  initialData,
}) {
  const isEdit = Boolean(initialData?.id);

  // NUEVOS ESTADOS PARA MATRÍCULA
  const [categoriaId, setCategoriaId] = useState("");
  const [tipoTramite, setTipoTramite] = useState("");
  const [solicitudRunt, setSolicitudRunt] = useState("");
  const [certificadoRunt, setCertificadoRunt] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [precioLista, setPrecioLista] = useState(0);
  const [descuento, setDescuento] = useState(0);

  // Cargar categorías al montar
  useEffect(() => {
    import("../api/categorias").then(({ getCategorias }) => {
      getCategorias().then((data) => {
        setCategorias(data || []);
      });
    });
  }, []);

  useEffect(() => {
    const categoria = categorias.find(
      c => c.id === categoriaId
    );

    if (categoria) {
      setPrecioLista(
        Number(categoria.precio_total || 0)
      );
    } else {
      setPrecioLista(0);
    }

  }, [categoriaId, categorias]);

  const valorFinal =
    Number(precioLista) -
    Number(descuento || 0);

  // =====================================
  // ESTADO
  // =====================================
  const [form, setForm] = useState({
    nombre: "",
    documento: "",
    tipo_documento: "CC",
    fecha_expedicion: "",
    telefono: "",
    direccion: "",
    email: "",
    foto: "",
    firma: "",
    huella: "",
    tipo_persona: "NATURAL",
    pep: "NO",
    origen_recursos: "SALARIO",
  });

  const [loading, setLoading] =
    useState(false);

  const [showWebcam, setShowWebcam] =
    useState(false);

  const webcamRef = useRef(null);

  // =====================================
  // CARGAR DATOS EDICIÓN
  // =====================================
  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre || "",
        documento: initialData.documento || "",
        tipo_documento: initialData.tipo_documento || "CC",
        fecha_expedicion: initialData.fecha_expedicion || "",
        telefono: initialData.telefono || "",
        direccion: initialData.direccion || "",
        email: initialData.email || "",
        foto: initialData.foto || "",
        firma: initialData.firma || "",
        huella: initialData.huella || "",
        tipo_persona: initialData.tipo_persona || "NATURAL",
        pep: initialData.pep || "NO",
        origen_recursos: initialData.origen_recursos || "SALARIO",
      });
    }
  }, [initialData]);

  // =====================================
  // VALIDACIONES
  // =====================================
  const soloNumeros = /^[0-9]+$/;

  const nombreRegex =
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // =====================================
  // HANDLE INPUTS
  // =====================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      (name === "documento" ||
        name === "telefono") &&
      value &&
      !soloNumeros.test(value)
    ) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================
  // VALIDAR FORM
  // =====================================
  const validar = () => {
    if (!form.nombre.trim()) {
      return "Nombre obligatorio";
    }

    if (!nombreRegex.test(form.nombre)) {
      return "Nombre inválido";
    }

    if (!form.documento.trim()) {
      return "Documento obligatorio";
    }

    if (!soloNumeros.test(form.documento)) {
      return "Documento inválido";
    }

    if (!form.telefono.trim()) {
      return "Teléfono obligatorio";
    }

    if (!soloNumeros.test(form.telefono)) {
      return "Teléfono inválido";
    }

    if (!form.direccion.trim()) {
      return "Dirección obligatoria";
    }

    if (!form.email.trim()) {
      return "Email obligatorio";
    }

    if (!emailRegex.test(form.email)) {
      return "Email inválido";
    }

    return null;
  };

  // =====================================
  // CAPTURAR FOTO
  // =====================================
  const capturePhoto = () => {
    try {
      const imageSrc =
        webcamRef.current?.getScreenshot();

      if (!imageSrc) {
        toast.error(
          "No se pudo capturar la foto"
        );
        return;
      }

      setForm((prev) => ({
        ...prev,
        foto: imageSrc,
      }));

      toast.success("Foto capturada");

      setShowWebcam(false);

    } catch (error) {
      console.error(error);

      toast.error(
        "Error capturando fotografía"
      );
    }
  };

  // =====================================
  // GUARDAR
  // =====================================
  const handleSubmit = async (e) => {

    e.preventDefault();
    const error = validar();
    if (error) {
      toast.error(error);
      return;
    }
    try {
      setLoading(true);
      if (isEdit) {
        await updateEstudiante(initialData.id, form);
        toast.success("Estudiante actualizado");
      } else {
        // Usar endpoint optimizado
        const { crearEstudianteConMatricula } = await import("../api/estudianteMatricula");
        await crearEstudianteConMatricula(
          {
            nombre: form.nombre,
            documento: form.documento,
            telefono: form.telefono,
            direccion: form.direccion,
            email: form.email,
            fecha_expedicion: form.fecha_expedicion,
            tipo_documento: form.tipo_documento,
            ciudad: form.ciudad,
            barrio: form.barrio,
            foto: form.foto,
            firma: form.firma,
            huella: form.huella,
            tipo_persona: form.tipo_persona,
            pep: form.pep === 'SI' ? true : false,
            origen_recursos: form.origen_recursos,
          },
          {
            categoria_id: categoriaId,
            tipo_tramite: tipoTramite,
            solicitud_runt: solicitudRunt,
            certificado_runt: certificadoRunt,

            precio_lista: precioLista,
            descuento: descuento,
            total_curso: valorFinal,
          }
        );
        toast.success("Estudiante y matrícula creados");
      }
      if (onSaved) onSaved();
      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar estudiante/matrícula");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/60
        backdrop-blur-sm
        p-3
        overflow-y-auto
      "
    >
      <div
        className="
          bg-white
          w-full
          max-w-5xl
          rounded-2xl
          shadow-2xl
          animate-fadeIn
          max-h-[92vh]
          overflow-hidden
          flex
          flex-col
        "
      >

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}
        <div
          className="
            bg-gradient-to-r
            from-yellow-400
            to-yellow-500
            px-6
            py-4
            flex
            items-center
            justify-between
          "
        >
          <h2 className="text-2xl font-bold text-black">
            {isEdit
              ? "Editar Estudiante"
              : "Nuevo Estudiante"}
          </h2>

          <button
            onClick={onClose}
            className="
              text-black
              text-2xl
              font-bold
              hover:scale-110
              transition
            "
          >
            ×
          </button>
        </div>

        {/* ================================= */}
        {/* BODY */}
        {/* ================================= */}
        <form
          onSubmit={handleSubmit}
          className="
            px-5
            py-4
            overflow-y-auto
            flex-1
          "
        >

          {/* ================================= */}
          {/* GRID PRINCIPAL */}
          {/* ================================= */}
          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-[2fr_320px]
              gap-5
              items-start
            "
          >

            {/* ================================= */}
            {/* DATOS PERSONALES */}
            {/* ================================= */}
            <div>
              <div
                className="
                  bg-gray-50
                  rounded-xl
                  p-5
                  border
                "
              >
                <h3 className="font-bold text-lg mb-4">
                  Información Personal
                </h3>

                <div
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-4
                  "
                >


                  <Input
                    label="Nombre Completo"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                  />

                  <Input
                    label="Documento"
                    name="documento"
                    value={form.documento}
                    onChange={handleChange}
                  />

                  {/* Tipo de Documento */}
                  <div>
                    <label className="text-sm font-medium">Tipo de Documento</label>
                    <select
                      name="tipo_documento"
                      value={form.tipo_documento}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="TI">Tarjeta de Identidad</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="PASAPORTE">Pasaporte</option>
                    </select>
                  </div>

                  {/* Fecha de Expedición */}
                  <div>
                    <Input
                      label="Fecha de Expedición"
                      name="fecha_expedicion"
                      type="date"
                      value={form.fecha_expedicion}
                      onChange={handleChange}
                    />
                  </div>

                  <Input
                    label="Teléfono"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                  />

                  <Input
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Dirección"
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                    />
                  </div>

                  {/* ========== CAMPOS ADICIONALES ========== */}
                  {/* Tipo de Persona */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Tipo de Persona</label>
                    <select
                      name="tipo_persona"
                      value={form.tipo_persona}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="NATURAL">Natural</option>
                      <option value="JURIDICA">Jurídica</option>
                    </select>
                  </div>

                  {/* Persona Expuesta Políticamente (PEP) */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">¿Es Persona Expuesta Políticamente (PEP)?</label>
                    <select
                      name="pep"
                      value={form.pep}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="NO">No</option>
                      <option value="SI">Sí</option>
                    </select>
                  </div>

                  {/* Origen de Recursos */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Origen de Recursos</label>
                    <select
                      name="origen_recursos"
                      value={form.origen_recursos}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="SALARIO">Salario</option>
                      <option value="HONORARIOS">Honorarios</option>
                      <option value="INDEPENDIENTE">Independiente</option>
                      <option value="PENSION">Pensión</option>
                      <option value="AHORROS">Ahorros</option>
                      <option value="OTROS">Otros</option>
                    </select>
                  </div>
                  {/* CATEGORÍA */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Categoría</label>
                    <select
                      value={categoriaId}
                      onChange={e => setCategoriaId(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">Seleccione</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre} - ${cat.precio_total?.toLocaleString('es-CO')}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* PRECIO LISTA */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">
                      Precio Lista
                    </label>

                    <input
                      type="text"
                      value={precioLista.toLocaleString("es-CO")}
                      readOnly
                      className="
      w-full
      border
      rounded-lg
      px-3
      py-2
      bg-gray-100
    "
                    />
                  </div>

                  {/* DESCUENTO */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">
                      Descuento
                    </label>

                    <input
                      type="number"
                      value={descuento}
                      onChange={(e) =>
                        setDescuento(
                          Number(e.target.value || 0)
                        )
                      }
                      className="
      w-full
      border
      rounded-lg
      px-3
      py-2
    "
                    />
                  </div>

                  {/* VALOR FINAL */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">
                      Valor Final
                    </label>

                    <input
                      type="text"
                      value={valorFinal.toLocaleString("es-CO")}
                      readOnly
                      className="
      w-full
      border
      rounded-lg
      px-3
      py-2
      bg-green-50
      font-bold
    "
                    />
                  </div>

                  {/* TIPO TRÁMITE */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Tipo Trámite</label>
                    <select
                      value={tipoTramite}
                      onChange={e => setTipoTramite(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">Seleccione</option>
                      <option value="LICENCIA INICIAL">Licencia Inicial</option>
                      <option value="RECATEGORIZACION">Recategorización</option>
                      <option value="VALIDACION">Validación</option>
                    </select>
                  </div>

                  {/* SOLICITUD RUNT */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Solicitud RUNT</label>
                    <input
                      type="text"
                      value={solicitudRunt}
                      onChange={e => setSolicitudRunt(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  {/* CERTIFICADO RUNT */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Certificado RUNT</label>
                    <input
                      type="text"
                      value={certificadoRunt}
                      onChange={e => setCertificadoRunt(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* ================================= */}
            {/* FOTO */}
            {/* ================================= */}
            <div className="h-full">

              <div
                className="
                  bg-gray-50
                  rounded-xl
                  p-4
                  border
                  h-full
                  flex
                  flex-col
                  items-center
                "
              >

                <h3 className="font-bold text-lg mb-4">
                  Fotografía
                </h3>

                {showWebcam ? (
                  <div className="w-full flex flex-col items-center">

                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      className="
                        w-full
                        rounded-xl
                        border
                        shadow
                      "
                    />

                    <div className="flex gap-2 mt-4">

                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="
                          bg-green-500
                          hover:bg-green-600
                          text-white
                          px-4
                          py-2
                          rounded-lg
                          transition
                        "
                      >
                        Capturar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowWebcam(false)
                        }
                        className="
                          bg-gray-500
                          hover:bg-gray-600
                          text-white
                          px-4
                          py-2
                          rounded-lg
                          transition
                        "
                      >
                        Cancelar
                      </button>

                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">

                    <div
                      className="
                        w-44
                        h-52
                        rounded-2xl
                        border
                        bg-gray-100
                        overflow-hidden
                        flex
                        items-center
                        justify-center
                        shadow-sm
                      "
                    >

                      {form.foto ? (
                        <img
                          src={form.foto}
                          alt="Foto estudiante"
                          className="
                            w-full
                            h-full
                            object-cover
                          "
                        />
                      ) : (
                        <span className="text-gray-400">
                          Sin fotografía
                        </span>
                      )}

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowWebcam(true)
                      }
                      className="
                        mt-3
                        bg-blue-500
                        hover:bg-blue-600
                        text-white
                        px-5
                        py-2
                        rounded-lg
                        transition
                      "
                    >
                      {form.foto
                        ? "Cambiar Foto"
                        : "Tomar Foto"}
                    </button>

                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================================= */}
          {/* FIRMA Y HUELLA */}
          {/* ================================= */}
          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-2
              gap-2
              mt-5
            "
          >

            {/* ================================= */}
            {/* FIRMA */}
            {/* ================================= */}
            <div
              className="
                bg-gray-50
                border
                rounded-xl
                p-5
              "
            >
              <h3 className="font-bold text-lg mb-4">
                Firma Digital
              </h3>

              <div
                className="
                  border
                  rounded-xl
                  overflow-hidden
                  bg-white
                "
              >
                <FirmaPad
                  onSave={(firma) => {
                    setForm((prev) => ({
                      ...prev,
                      firma,
                    }));
                  }}
                />

              </div>
              {/* BOTONES */}
              <div className="flex gap-2 mt-3">

                {/* BOTÓN WACOM */}
                <button
                  type="button"
                  onClick={async () => {

                    const data = await capturarFirmaWacom();

                    if (!data.ok) {
                      toast.error("No se pudo capturar firma");
                      return;
                    }

                    setForm((prev) => ({
                      ...prev,
                      firma: data.firma,
                    }));

                    console.log("Firma recibida:", data.firma);

                    toast.success("Firma capturada");
                  }}
                  className="
        bg-blue-500
        hover:bg-blue-600
        text-white
        px-4
        py-2
        rounded-lg
      "
                >
                  Firmar en Wacom
                </button>

              </div>

              {/* PREVIEW */}
              {form.firma && (
                <div className="mt-4">
                  <textarea
                    value={form.firma || ""}
                    readOnly
                    className="w-full h-20 border"
                  />
                  <img
                    src={form.firma}
                    alt="Firma"
                    className="
    h-24
    w-full
    object-contain
    bg-white
    border
    rounded-xl
    p-2
    shadow-sm
  "
                  />
                </div>
              )}
            </div>

            {/* ================================= */}
            {/* HUELLA */}
            {/* ================================= */}
            <div
              className="
                bg-gray-50
                border
                rounded-xl
                p-5
              "
            >
              <h3 className="font-bold text-lg mb-4">
                Huella Digital
              </h3>

              <div
                className="
                  h-[170px]
                  rounded-xl
                  border
                  bg-white
                  flex
                  items-center
                  justify-center
                  text-gray-400
                "
              >
                Próximamente
              </div>
            </div>
          </div>

          {/* ================================= */}
          {/* FOOTER */}
          {/* ================================= */}
          <div
            className="
              flex
              justify-end
              gap-3
              mt-6
              sticky
              bottom-0
              bg-white
              pt-3
              pb-1
            "
          >

            <button
              type="button"
              onClick={onClose}
              className="
                px-5
                py-2
                rounded-lg
                border
                border-gray-300
                hover:bg-gray-100
                transition
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`
                px-5
                py-2
                rounded-lg
                text-white
                font-semibold
                transition
                ${loading
                  ? "bg-gray-400"
                  : "bg-yellow-500 hover:bg-yellow-600"
                }
              `}
            >
              {loading
                ? "Guardando..."
                : isEdit
                  ? "Actualizar"
                  : "Guardar"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

// =====================================
// COMPONENTE INPUT
// =====================================
function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div>
      <label
        className="
          block
          mb-1
          text-sm
          font-semibold
          text-gray-700
        "
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        className="
          w-full
          border
          border-gray-300
          rounded-lg
          px-3
          py-2
          focus:outline-none
          focus:ring-2
          focus:ring-yellow-400
        "
      />
    </div>
  );
}