const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcrypt");
const PDFDocument = require("pdfkit");

const app = express();
const PORT = 3000;
const db = new sqlite3.Database("./db/database.sqlite");

// --- CONFIGURACIÓN DE MIDDLEWARES ---
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(
	session({
		secret: "cosecha-directa-2026",
		resave: false,
		saveUninitialized: false,
	}),
);

// --- FUNCIONES DE SERVICIO Y MIDDLEWARE (DEFINIDAS ANTES DE LAS RUTAS) ---

const logAction = (action, user_id) => {
	db.run("INSERT INTO system_logs (action, user_id) VALUES (?, ?)", [
		action,
		user_id,
	]);
};

const isAuthenticated = (req, res, next) => {
	if (!req.session || !req.session.user) {
		return res.redirect("/login");
	}
	next();
};

// Middleware para inicializar el carrito si no existe
app.use((req, res, next) => {
	if (req.session.user && !req.session.cart) {
		req.session.cart = [];
	}
	next();
});

// --- RUTAS ---

app.post("/cart/add", isAuthenticated, (req, res) => {
	const { productId, name, price } = req.body;
	req.session.cart.push({ productId, name, price: parseFloat(price) });
	res.redirect("/dashboard");
});

app.post("/cart/checkout", isAuthenticated, (req, res) => {
	console.log("Intentando finalizar compra..."); // <-- MIRA LA TERMINAL

	if (!req.session.cart || req.session.cart.length === 0) {
		console.log("El carrito está vacío o no existe");
		return res.redirect("/dashboard");
	}

	const invoiceId = "FAC-" + Date.now();
	const fecha = new Date().toISOString().split("T")[0];
	const userId = req.session.user.id;
	const totalCompra = req.session.cart.reduce(
		(sum, item) => sum + item.price,
		0,
	);
	const detallesFactura = JSON.stringify(req.session.cart);

	db.run(
		"INSERT INTO invoices (user_id, invoice_id, date, total, product_name, status) VALUES (?, ?, ?, ?, ?, ?)",
		[userId, invoiceId, fecha, totalCompra, detallesFactura, "pendiente"],
		(err) => {
			if (err) {
				console.error("Error al insertar factura:", err); // <-- MIRA LA TERMINAL
				return res.redirect("/dashboard?error=error_factura");
			}

			// 1. Registrar en Logs
			logAction(`Compra realizada: ${invoiceId}`, userId);

			// 2. Generar AgriToken
			db.run(
				"INSERT INTO AgriToken (invoice_id, valor_respaldo, estado) VALUES (?, ?, ?)",
				[invoiceId, totalCompra, "ACTIVO"],
				(err) => {
					if (err) console.error("Error al generar AgriToken:", err);
				},
			);

			// Actualización de stock
			req.session.cart.forEach((item) => {
				// Usamos db.run simple
				db.run(
					"UPDATE products SET quantity = quantity - 1 WHERE id = ?",
					[item.productId],
					(err) => {
						if (err)
							console.error("Error actualizando stock:", err);
					},
				);
			});

			req.session.cart = [];
			console.log("Compra exitosa!");
			req.session.save(() => {
				// Forzamos guardar la sesión
				res.redirect("/dashboard?msg=compra_exitosa");
			});
		},
	);
});

app.get('/', (req, res) => {
    res.render('index'); // Renderiza tu antiguo HTML ahora como EJS
});
app.get("/login", (req, res) => res.render("login", { error: null }));
app.get("/register", (req, res) => res.render("register", { error: null }));

app.post("/login", (req, res) => {
	const { email, password } = req.body;
	db.get(
		"SELECT * FROM users WHERE email = ?",
		[email],
		async (err, user) => {
			if (
				err ||
				!user ||
				!(await bcrypt.compare(password, user.password))
			) {
				return res.render("login", {
					error: "Credenciales incorrectas",
				});
			}
			req.session.user = user;
			logAction("Inicio de sesión", user.id);
			res.redirect("/dashboard");
		},
	);
});

app.post("/register", async (req, res) => {
	const { name, email, password } = req.body;
	const hash = await bcrypt.hash(password, 10);
	db.run(
		"INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
		[name, email, hash],
		(err) => {
			if (err)
				return res.render("register", { error: "Error al registrar" });
			res.redirect("/login");
		},
	);
});

app.get("/invoice/:invoice_id", isAuthenticated, (req, res) => {
	db.get(
		"SELECT * FROM invoices WHERE invoice_id = ?",
		[req.params.invoice_id],
		(err, inv) => {
			if (err || !inv)
				return res.status(404).send("Factura no encontrada");

			const doc = new PDFDocument({ margin: 50, size: "A4" });
			res.setHeader("Content-Type", "application/pdf");
			doc.pipe(res);

			// Encabezado
			doc.fontSize(20).text("FACTURA", { align: "left" });
			doc.fontSize(10).text(`Fecha: ${inv.date}`);
			doc.text(`N° de Factura: ${inv.invoice_id}`);
			doc.moveDown();

			// Línea divisoria
			doc.moveTo(50, 120).lineTo(550, 120).stroke();

			// Encabezados de tabla
			doc.fontSize(10).text("CANT.", 50, 130);
			doc.text("DESCRIPCIÓN", 100, 130);
			doc.text("IMPORTE", 450, 130, { align: "right" });
			doc.moveTo(50, 145).lineTo(550, 145).stroke();

			// Cuerpo de tabla
			let y = 160;
			const productos = JSON.parse(inv.product_name); // Recuperamos el JSON
			productos.forEach((item) => {
				doc.text("1", 50, y);
				doc.text(item.name, 100, y);
				doc.text(`$${item.price.toFixed(2)}`, 450, y, {
					align: "right",
				});
				y += 20;
			});

			// Totales
			doc.moveTo(350, y + 10)
				.lineTo(550, y + 10)
				.stroke();
			doc.fontSize(12).text(
				`TOTAL: $${inv.total.toFixed(2)}`,
				450,
				y + 20,
				{ align: "right", bold: true },
			);

			// Footer "Gracias"
			doc.fontSize(16).text("Gracias por su compra", 50, y + 60, {
				align: "center",
			});

			doc.end();
		},
	);
});

app.post("/order", isAuthenticated, (req, res) => {
	// Nota: Esta ruta queda como respaldo, puedes preferir usar /cart/add
	res.redirect("/dashboard");
});

app.post("/admin/update-order/:id", isAuthenticated, (req, res) => {
	const { status } = req.body;
	db.run(
		"UPDATE orders SET status = ? WHERE id = ?",
		[status, req.params.id],
		(err) => {
			if (!err)
				logAction(
					`Admin cambió orden ${req.params.id} a ${status}`,
					req.session.user.id,
				);
			res.redirect("/dashboard");
		},
	);
});

app.post("/admin/update-status/:invoice_id", isAuthenticated, (req, res) => {
	if (req.session.user.role !== "admin") return res.redirect("/dashboard");

	const { status } = req.body;
	const { invoice_id } = req.params; // Capturamos el ID de la URL

	console.log("Cambiando factura", invoice_id, "a estado", status); // Esto te ayudará a ver en consola si llega la info

	db.run(
		"UPDATE invoices SET status = ? WHERE invoice_id = ?",
		[status, invoice_id],
		(err) => {
			if (err) {
				console.error("Error al actualizar:", err);
			}
			res.redirect("/dashboard");
		},
	);
});

app.post("/admin/delete-order/:id", isAuthenticated, (req, res) => {
	if (req.session.user.role !== "admin") return res.redirect("/dashboard");
	db.run("DELETE FROM orders WHERE id = ?", [req.params.id], (err) => {
		if (!err)
			logAction(
				`Admin eliminó la orden ID ${req.params.id}`,
				req.session.user.id,
			);
		res.redirect("/dashboard");
	});
});

app.post("/delete-invoice/:id", isAuthenticated, (req, res) => {
	db.run(
		"DELETE FROM invoices WHERE invoice_id = ?",
		[req.params.id],
		(err) => {
			if (!err)
				logAction(
					`Usuario eliminó factura ${req.params.id}`,
					req.session.user.id,
				);
			res.redirect("/dashboard");
		},
	);
});

app.post("/admin/add-product", isAuthenticated, (req, res) => {
	if (req.session.user.role !== "admin") return res.redirect("/dashboard");
	const { name, price, quantity } = req.body;
	db.run(
		"INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)",
		[name, price, quantity],
		(err) => {
			if (!err)
				logAction(
					`Admin agregó producto: ${name}`,
					req.session.user.id,
				);
			res.redirect("/dashboard");
		},
	);
});

app.get("/dashboard", isAuthenticated, (req, res) => {
	db.all("SELECT * FROM products", (err, products) => {
		db.all(
			"SELECT orders.*, products.name, products.price FROM orders JOIN products ON orders.product_id = products.id WHERE orders.user_id = ?",
			[req.session.user.id],
			(err, myOrders) => {
				const isAdmin = req.session.user.role === "admin";

				// Configuración de consulta de facturas
				const query = isAdmin
					? "SELECT invoices.*, users.name as buyer_name FROM invoices JOIN users ON invoices.user_id = users.id"
					: "SELECT invoices.*, users.name as buyer_name FROM invoices JOIN users ON invoices.user_id = users.id WHERE invoices.user_id = ?";
				const params = isAdmin ? [] : [req.session.user.id];

				// Configuración de consulta de tokens (Dinámica para Admin y Cliente)
				let tokenQuery =
					"SELECT AgriToken.*, users.name as buyer_name FROM AgriToken JOIN invoices ON AgriToken.invoice_id = invoices.invoice_id JOIN users ON invoices.user_id = users.id";
				let tokenParams = [];

				if (!isAdmin) {
					tokenQuery += " WHERE invoices.user_id = ?";
					tokenParams = [req.session.user.id];
				}

				db.all(tokenQuery, tokenParams, (err, myTokens) => {
					db.all(query, params, (err, invoices) => {
						const totalGastado = isAdmin
							? 0
							: myOrders.reduce((sum, o) => sum + o.price, 0);

						db.all(
							"SELECT orders.*, products.name, users.name as user_name FROM orders JOIN products ON orders.product_id = products.id JOIN users ON orders.user_id = users.id",
							[],
							(err, allOrders) => {
								// --- CONSULTA DE LOGS CON JOIN PARA OBTENER EL NOMBRE ---
								const logQuery = `
                                    SELECT system_logs.*, users.name as user_name 
                                    FROM system_logs 
                                    LEFT JOIN users ON system_logs.user_id = users.id 
                                    ORDER BY fecha DESC LIMIT 50`;

								db.all(logQuery, [], (err, logs) => {
									res.render("dashboard", {
										user: req.session.user,
										products,
										myOrders,
										totalGastado,
										orders: allOrders,
										invoices: invoices || [],
										myTokens: myTokens || [],
										systemLogs: logs || [], // Ahora 'logs' incluye user_name
										cart: req.session.cart,
										msg: req.query.msg,
										error: req.query.error,
									});
								});
							},
						);
					});
				});
			},
		);
	});
});

// --- AHORA LAS RUTAS VAN FUERA Y AL MISMO NIVEL ---

app.get("/logout", (req, res) => {
	logAction("Cierre de sesión", req.session.user.id);
	req.session.destroy(() => res.redirect("/login"));
});

app.post("/admin/edit-product/:id", isAuthenticated, (req, res) => {
	if (req.session.user.role !== "admin") return res.redirect("/dashboard");
	const { price } = req.body;
	db.run(
		"UPDATE products SET price = ? WHERE id = ?",
		[price, req.params.id],
		(err) => {
			if (!err)
				logAction(
					`Admin editó producto ${req.params.id}`,
					req.session.user.id,
				);
			res.redirect("/dashboard");
		},
	);
});

app.post("/admin/delete-product/:id", isAuthenticated, (req, res) => {
	if (req.session.user.role !== "admin") return res.redirect("/dashboard");
	db.run("DELETE FROM products WHERE id = ?", [req.params.id], (err) => {
		if (!err)
			logAction(
				`Admin eliminó producto ${req.params.id}`,
				req.session.user.id,
			);
		res.redirect("/dashboard");
	});
});

// Y al final, el listen
app.listen(PORT, () => {
	console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
