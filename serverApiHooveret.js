const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const ftp = require("basic-ftp");

const app = express();
app.use(cors());
app.use(express.json());

// Crear una carpeta local 'imgs' para almacenar las imágenes descargadas
const IMG_DIR = path.join(__dirname, "imgs");
if (!fs.existsSync(IMG_DIR)) {
    fs.mkdirSync(IMG_DIR);
}

// Configuración del FTP
const FTP_CONFIG = {
    host: "",
    user: "",
    password: "",
    secure: true,
    secureOptions: { rejectUnauthorized: false },
    port: 21,
};

const JSON_FILE_PATH = "products.json";

// Servir imágenes de la carpeta local 'imgs'
app.use("/imgs", express.static(IMG_DIR));

// Endpoint para obtener los productos
app.get("/products", async (req, res) => {
    const client = new ftp.Client();
    try {
        // Conectar al servidor FTP
        await client.access(FTP_CONFIG);

        // Descargar el archivo JSON desde el servidor FTP
        await client.downloadTo(JSON_FILE_PATH, JSON_FILE_PATH);

        // Leer el archivo JSON
        const jsonData = fs.readFileSync(JSON_FILE_PATH, "utf8");
        const products = JSON.parse(jsonData);

        // Descargar las imágenes y guardarlas en la carpeta local 'imgs'
        for (const product of products.productos) {
            const imageUrl = product.imagen;
            const imageName = path.basename(imageUrl);
            const localImagePath = path.join(IMG_DIR, imageName);

            // Si la imagen aún no existe en el servidor local, la descargamos
            if (!fs.existsSync(localImagePath)) {
                console.log(`Descargando la imagen: ${imageUrl}`);
                try {
                    await client.downloadTo(localImagePath, imageUrl);
                    console.log(`Imagen descargada exitosamente: ${imageName}`);
                } catch (err) {
                    console.error(`Error descargando la imagen ${imageUrl}:`, err);
                    continue;
                }
            } else {
                console.log(`Imagen ya descargada: ${imageName}`);
            }

            // Actualizar la URL de la imagen para que sea relativa al servidor
            product.imagen = `/imgs/${imageName}`;
        }

        res.json(products);

    } catch (err) {
        console.error("Error al acceder al servidor FTP:", err);
        res.status(500).send("Error al obtener los datos del servidor FTP.");
    } finally {
        client.close();
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});