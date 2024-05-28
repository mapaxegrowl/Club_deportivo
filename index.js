const express = require("express");
const app = express();
const PORT = 3000;
const fs = require("fs");

/* Middleware */
app.use(express.json());

/* Variable global para almacenar los datos */
let data = { deportes: [] };

/* Función para leer los datos del archivo y almacenarlos en la variable global */
function loadData() {
    try {
        const archivo = fs.readFileSync("deportes.json", "utf8");
        if (archivo) {
            data = JSON.parse(archivo);
        }
    } catch (err) {
        console.error("Error al leer el archivo:", err);
    }
}

/* Cargar datos al iniciar el servidor */
loadData();

/* Ruta base */
app.get("/", (req, res) => {
    try {
        res.sendFile(`${__dirname}/public/index.html`);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/* Crear una ruta que reciba el nombre y precio de un nuevo deporte, lo persista en un archivo JSON */
app.get("/agregar", async (req, res) => {
    const { nombre, precio } = req.query;
    const deporte = {
        nombre,
        precio,
    };
    try {
        data.deportes.push(deporte); // Agregar el nuevo deporte al arreglo de deportes
        fs.writeFileSync("deportes.json", JSON.stringify(data)); // Guardar los datos actualizados en el archivo
        res.send("Deporte almacenado con éxito");
    } catch (error) {
        console.error("Error al guardar el deporte:", error);
        res.status(500).send("Error interno del servidor");
    }
});

/* Crear una ruta que al consultarse devuelva en formato JSON todos los deportes registrados */
app.get("/deportes", (req, res) => {
    res.json(data);
});

/* Crear una ruta que edite el precio de un deporte registrado utilizando los parámetros de la consulta y persista este cambio */

app.put("/editar", async (req, res) => {
    const { nombre, precio } = req.query;
    try {
        const deporte = data.deportes.find((deporte) => deporte.nombre === nombre);
        if (deporte) {
            deporte.precio = precio; // Actualizar el precio del deporte
            fs.writeFile("deportes.json", JSON.stringify(data), (err) => {
                if (err) throw err;
                console.log('Precio editado de forma correcta');
                res.send(`Precio editado de forma correcta`);
            });
        } else {
            res.status(404).send("Deporte no encontrado");
        }
    } catch (error) {
        console.error("Error al editar el precio del deporte:", error);
        res.status(500).send("Error interno del servidor");
    }
});


/* Crear una ruta que elimine un deporte solicitado desde el cliente y persista este cambio */
app.get("/eliminar", async (req, res) => {
    const { nombre } = req.query;
    try {
        const deportesFiltrados = data.deportes.filter((deporte) => deporte.nombre !== nombre);
        if (deportesFiltrados.length !== data.deportes.length) {
            data.deportes = deportesFiltrados; // Actualizar la lista de deportes eliminando el deporte especificado
            fs.writeFileSync("deportes.json", JSON.stringify(data)); // Guardar los datos actualizados en el archivo
            res.send("Deporte eliminado ");
        } else {
            res.status(404).send("Deporte no encontrado");
        }
    } catch (error) {
        console.error("Error al eliminar el deporte:", error);
        res.status(500).send("Error interno del servidor");
    }
});

/* Levantar Servidor */
app.listen(PORT, () => {
    console.log(`Conectado al puerto http://localhost:${PORT}`);
});
