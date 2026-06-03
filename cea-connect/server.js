const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());

app.use(
  express.json({
    limit: "20mb",
  })
);

// =====================================
// CARPETA PUBLICA
// =====================================
app.use(
  "/public",
  express.static(
    path.join(__dirname, "public")
  )
);

// =====================================
// TEST
// =====================================
app.get("/ping", (req, res) => {

  res.json({
    ok: true,
    app: "CEA Connect",
  });

});

// =====================================
// GUARDAR FIRMA
// =====================================
app.post("/firma", async (req, res) => {

  try {

    const { image } = req.body;

    if (!image) {

      return res.status(400).json({
        ok: false,
        error: "No se recibió imagen",
      });

    }

    // =====================================
    // LIMPIAR BASE64
    // =====================================
    const base64Data = image.replace(
      /^data:image\/png;base64,/,
      ""
    );

    // =====================================
    // RUTA ARCHIVO
    // =====================================
    const filePath = path.join(
      __dirname,
      "public",
      "firma.png"
    );

    // =====================================
    // GUARDAR IMAGEN
    // =====================================
    fs.writeFileSync(
      filePath,
      base64Data,
      "base64"
    );

    // =====================================
    // RESPUESTA
    // =====================================
    return res.json({
      ok: true,
      firma:
        "http://localhost:3005/public/firma.png?t=" +
        Date.now(),
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      ok: false,
      error: error.message,
    });

  }

});

// =====================================
// OBTENER FIRMA ACTUAL
// =====================================
app.get("/firma", async (req, res) => {

  return res.json({
    ok: true,
    firma:
      "http://localhost:3005/public/firma.png?t=" +
      Date.now(),
  });

});

// =====================================
// SERVIDOR
// =====================================
app.listen(3005, () => {

  console.log(
    "CEA Connect ejecutándose en puerto 3005"
  );

});