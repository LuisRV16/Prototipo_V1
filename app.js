const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();
const mysql = require('mysql2');

const app = express();

app.use(express.json());
const PORT = 3000;

const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY);

DB_CONFIG = {
  'host': 'localhost',
  'user': 'root',
  'password': '1234',
  'database': 'prueba',
  multipleStatements: true
};

const connection = mysql.createConnection(DB_CONFIG);

connection.connect((err) => {
  if (err) {
    console.error('Error de conexión: ' + err.stack);
    return;
  }
  console.log('Conectado como ID: ' + connection.threadId);
});

function getTables() {
  return new Promise((resolve, reject) => {
    connection.query('show tables', (error, results) => {
      if (error) 
        reject (error);
      else
        resolve(results.map(row => Object.values(row)[0]));
    });
  });
}

function getCreateTableStatement(tableName) {
  return new Promise((resolve, reject) => {
    connection.query(`SHOW CREATE TABLE ${tableName}`, (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length > 0) {
        // Accede directamente a la clave 'Create Table'
        resolve(results[0]['Create Table']);
      } else {
        reject(new Error(`No se encontró la sentencia CREATE TABLE para la tabla: ${tableName}`));
      }
    });
  });
}


async function loadTables() {
  let allSchemes = [];
  let scheme = "";
  try {
    tables = await getTables();

    // Se hace uso de Promise.all para ejecutar todas las promesas de forma concurrente
    const schemePromises = tables.map(table => getCreateTableStatement(table));
    allSchemes = await Promise.all(schemePromises);

    allSchemes.forEach((scheme_table, index) => {
      scheme += `\n\n--- Esquema de la tabla ${tables[index]} ---\n`;
      scheme += scheme_table;
    });
    
  } catch (error) {
    console.error('Error al cargar los esquemas de las tablas:', error);
  }

  return scheme;
}

async function getResponse(prompt) {
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });
  return response.text;
}

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.post('/', async (req, res) => {
  let solicitud = (req.body.solicitud || '').trim();

  const scheme = await loadTables();

  // const response = await getResponse(solicitud);

  prompt = `Eres un asistente que tiene conocimiento de la base de datos llamada prueba.
  Se te será proporcionado el esquema de las tablas y en base a la solicitud hecha por el
  usuario, debes dar la o las consultas SQL necesarias para obtener la información de la
  base de datos. Debes devolver solamente el comando o los comandos SQL con su respectivo
  punto y coma los cuales no realicen una busqueda filtrada por medio de parametros o 
  palabras clave, sino, mas bien una busqueda general simplemente con lo que ya conoces
  e intuyas que pueda encontrarse ahí la información. Debes regresar la consulta sin
  comillas, saltos de linea ni texto adicional. 
  Si es mas de una consulta SQL, devuelvelas separadas por salto de linea.

  ---
  Esquema de las tablas de la base de datos:
  ${scheme}
  
  ---
  Solicitud hecha por el usuario: ${solicitud}`;

  const sql = await getResponse(prompt);

  const individualQueries = sql
    .split(';')
    .map(query => query.trim()) // Elimina espacios en blanco al inicio/final
    .filter(query => query.length > 0); // Filtra cadenas vacías

  connection.query(sql, async (error, results) => {

    let info = "";

    if (error) throw error;

    const allQueryResults = Array.isArray(results[0]) ? results : [results];

    allQueryResults.forEach((resultSet, index) => {

      const queryUsed = individualQueries[index];

      info += `--- Resultados para la Consulta:\n"${queryUsed};"\n`;

      resultSet.forEach(row => {
        // Convertimos cada fila (objeto) a una cadena JSON legible
        info += `${JSON.stringify(row, null, 2)}\n`;
      });

    });

    const context = `Basado en la siguiente información dada como contexto, responde la solicitud del usuario
    
    Contexto:
    ${info}

    Solicitud del usuario: ${solicitud}
    `;

    const response = await getResponse(context);

    console.log(`Tú: ${solicitud}`);
    console.log(`Prompt para preprocesamiento: ${prompt}`);
    console.log(`Preprocesamiento de las consultas para la base de datos: ${sql}`);
    console.log(`Prompt para contexto a la solicitud del usuario: ${context}`);
    console.log(`Respuesta del Bot: ${response}`);

    res.json({ respuesta: response });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

