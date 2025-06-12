import express from "express";
import cors from "cors";
import { initializeDatabase } from "./database.js";
import userRoutes from "./routes.js"; // Adicionado .js no final

const app = express();

app.use(cors()); // Libera o CORS
app.use(express.json());

initializeDatabase();

app.use("/usuarios", userRoutes);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});

