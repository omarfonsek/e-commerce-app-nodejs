const app = require("./server");
require('dotenv').config();

const port = process.env.PORT_APP || 4000;
app.listen(port, () => console.log(`Servidor escuchando en http://localhost:${port}`));
