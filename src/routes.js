import express from "express";
import PDFDocument from "pdfkit";
import { getConnection } from "./database.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { name, email, password, age, role } = req.body;

  if (!name || !email || !password || !age || !role) {
    return res.status(400).json({ error: "Preencha todos os campos" });
  }

  const connection = getConnection();
  const query = `INSERT INTO users (name, email, password, age, role) VALUES (?, ?, ?, ?, ?)`;
  connection.query(query, [name, email, password, age, role], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Nome ou e-mail já cadastrados" });
      }
      return res.status(500).json({ error: "Erro ao cadastrar usuário", detalhes: err.message });
    }
    res.status(201).json({ mensagem: "Usuário criado com sucesso", id: result.insertId });
  });
});

router.get("/pdf/:id", (req, res) => {
  const { id } = req.params;
  const connection = getConnection();

  const query = `SELECT * FROM users WHERE id = ?`;
  connection.query(query, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const user = results[0];
    const doc = new PDFDocument();
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment;filename=usuario_${user.id}.pdf`,
        "Content-Length": pdfData.length,
      }).end(pdfData);
    });

    doc.fontSize(18).text("Ficha do Usuário", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Nome: ${user.name}`);
    doc.moveDown();
    doc.text(`Email: ${user.email}`);
    doc.moveDown();
    doc.text(`Função: ${user.role || "Não informado"}`);
    doc.moveDown();
    doc.text(`Idade: ${user.age} anos`);
    doc.moveDown(2);

    const dataAtual = new Date().toLocaleDateString("pt-BR");
    doc.fontSize(12).text(`Gerado em: ${dataAtual}`, { align: "right" });

    doc.end();
  });
});

router.get("/pdf", (req, res) => {
  const connection = getConnection();
  const query = `SELECT * FROM users`;

  connection.query(query, (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: "Nenhum usuário encontrado" });
    }

    const doc = new PDFDocument();
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment;filename=usuarios.pdf`,
        "Content-Length": pdfData.length,
      }).end(pdfData);
    });

    doc.fontSize(18).text("Lista de Usuários", { align: "center" });
    doc.moveDown();

    results.forEach((user) => {
      doc.fontSize(14).text(`Nome: ${user.name}`);
      doc.moveDown();
      doc.text(`Email: ${user.email}`);
      doc.moveDown();
      doc.text(`Função: ${user.role || "Não informado"}`);
      doc.moveDown();
      doc.text(`Idade: ${user.age} anos`);
      doc.moveDown(2);
    });

    const dataAtual = new Date().toLocaleDateString("pt-BR");
    doc.fontSize(12).text(`Gerado em: ${dataAtual}`, { align: "right" });

    doc.end();
  });
});

export default router;
