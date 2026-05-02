import nodemailer from "nodemailer";

export async function enviarReciboPago({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Cambia por tu proveedor SMTP si es necesario
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `CEA Conducir <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
