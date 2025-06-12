import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

let connection;

function initializeDatabase() {
  connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  connection.connect((err) => {
    if (err) {
      console.error("Erro ao conectar ao banco de dados:", err.message);
    } else {
      console.log("Conectado ao banco de dados MySQL.");
      createTables();
    }
  });
}

function createTables() {
  const createUserTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      age INT NOT NULL,
      role VARCHAR(255) NOT NULL
    );
  `;

  connection.query(createUserTable, (err) => {
    if (err) {
      console.error("Erro ao criar tabela:", err.message);
    } else {
      console.log("Tabela 'users' criada ou já existe.");
    }
  });
}

function getConnection() {
  return connection;
}

export { initializeDatabase, getConnection };