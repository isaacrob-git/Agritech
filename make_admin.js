const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/database.sqlite");

const miCorreo = "admin@gmail.com"; // <-- Pon tu correo aquí

db.serialize(() => {
	db.run(
		"UPDATE users SET role = 'admin' WHERE email = ?",
		[miCorreo],
		function (err) {
			if (err) {
				console.error("Error al actualizar:", err.message);
			} else if (this.changes > 0) {
				console.log("¡Éxito! Tu usuario ahora es administrador.");
			} else {
				console.log("No se encontró ningún usuario con ese correo.");
			}
		},
	);
});

db.close();
