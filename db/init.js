const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/database.sqlite");

db.serialize(() => {
	console.log("Inicializando base de datos...");

	// 1. Usuarios
	db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT, 
        role TEXT DEFAULT 'user'
    )`);

	// 2. Productos
	db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        quantity INTEGER,
        farmer_id INTEGER,
        FOREIGN KEY(farmer_id) REFERENCES users(id)
    )`);

	// 3. Órdenes
	db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        user_id INTEGER,
        quantity INTEGER,
        status TEXT DEFAULT 'pendiente',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        tracking_code TEXT
    )`);

	// 4. Logística
	db.run(`CREATE TABLE IF NOT EXISTS logistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        transporter_name TEXT,
        status TEXT DEFAULT 'en_camino',
        FOREIGN KEY(order_id) REFERENCES orders(id)
    )`);

	// 5. Agritokens
	db.run(`CREATE TABLE IF NOT EXISTS AgriToken (
    id_token INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id TEXT,
    valor_respaldo REAL,
    estado TEXT
)`);

	// 6. Systemlogs
	db.run(`CREATE TABLE IF NOT EXISTS system_logs (
    id_log INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    user_id INTEGER,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

	// 7. Facturas (Tabla definitiva con product_name)

	db.run(`CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        invoice_id TEXT,
        date TEXT,
        total REAL,
        product_name TEXT,
        status TEXT DEFAULT 'pendiente'
    )`);

	// =========================
	// PRECARGA DE PRODUCTOS
	// =========================
	const stmt = db.prepare(`
        INSERT OR IGNORE INTO products (id, name, price, quantity, farmer_id) 
        VALUES (?, ?, ?, ?, ?)
    `);

	const productosIniciales = [
		[1, "Tomates", 2.5, 200, 2],
		[2, "Papas", 1.2, 500, 2],
		[3, "Zanahorias", 1.8, 300, 2],
		[4, "Cebollas", 1.5, 400, 2],
		[5, "Pimentones", 2.0, 150, 2],
	];

	productosIniciales.forEach((p) => {
		stmt.run(p);
	});

	stmt.finalize();
	console.log(
		"Base de datos estructurada y productos precargados correctamente.",
	);
});

db.close();
