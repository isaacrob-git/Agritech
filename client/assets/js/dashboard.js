const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!user || !token) {
    window.location.href = "login.html";
}

const menu = document.getElementById("menu");
const content = document.getElementById("content");
const title = document.getElementById("title");

// -------------------------
// MENÚ POR ROL
// -------------------------
const menus = {
    agricultor: [
        "Dashboard",
        "Mis productos",
        "Nuevo producto",
        "Pedidos",
        "Contratos",
        "Perfil"
    ],
    comercio: [
        "Dashboard",
        "Marketplace",
        "Carrito",
        "Mis pedidos",
        "Contratos",
        "Perfil"
    ],
    transportista: [
        "Dashboard",
        "Viajes",
        "Historial",
        "Perfil"
    ],
    admin: [
        "Dashboard",
        "Usuarios",
        "Productos",
        "Pedidos",
        "Transportistas",
        "Contratos",
        "Reportes"
    ]
};

// -------------------------
// RENDER MENÚ
// -------------------------
function renderMenu() {
    const items = menus[user.rol] || [];

    menu.innerHTML = items.map(item => `
        <button onclick="navigate('${item}')"
            class="block w-full text-left p-2 rounded hover:bg-green-700">
            ${item}
        </button>
    `).join("");
}

renderMenu();

// -------------------------
// NAVEGACIÓN SIMPLE
// -------------------------
function navigate(section) {
    title.innerText = section;

    if (section === "Nuevo producto") {
        renderNewProduct();
    }

    if (section === "Mis productos") {
        renderMyProducts();
    }

    if (section === "Dashboard") {
        content.innerHTML = `<p>Bienvenido ${user.nombre}</p>`;
    }

    if (section === "Perfil") {
        content.innerHTML = `
            <div class="bg-white p-4 rounded">
                <p><b>Nombre:</b> ${user.nombre}</p>
                <p><b>Email:</b> ${user.email}</p>
                <p><b>Rol:</b> ${user.rol}</p>
            </div>
        `;
    }
}

// -------------------------
// NUEVO PRODUCTO (AGRICULTOR)
// -------------------------
function renderNewProduct() {
    content.innerHTML = `
        <div class="bg-white p-4 rounded shadow max-w-md">
            <h3 class="font-bold mb-4">Nuevo producto</h3>

            <form id="formProduct" class="space-y-2">
                <input id="nombre" placeholder="Nombre" class="w-full border p-2">
                <input id="cantidad" type="number" placeholder="Cantidad" class="w-full border p-2">
                <input id="precioKg" type="number" placeholder="Precio/kg" class="w-full border p-2">
                <input id="ubicacion" placeholder="Ubicación" class="w-full border p-2">

                <button class="bg-green-600 text-white p-2 w-full">
                    Guardar
                </button>
            </form>
        </div>
    `;

    document.getElementById("formProduct").addEventListener("submit", createProduct);
}

// -------------------------
// CREAR PRODUCTO API
// -------------------------
async function createProduct(e) {
    e.preventDefault();

    const body = {
        nombre: nombre.value,
        cantidad: cantidad.value,
        precioKg: precioKg.value,
        ubicacion: ubicacion.value
    };

    const res = await fetch("http://localhost:3000/api/products", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.message);
        return;
    }

    alert("Producto creado");
    navigate("Mis productos");
}

// -------------------------
// MIS PRODUCTOS
// -------------------------
async function renderMyProducts() {
    const res = await fetch("http://localhost:3000/api/products/me", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const data = await res.json();

    content.innerHTML = `
        <div class="bg-white p-4 rounded shadow">
            <h3 class="font-bold mb-4">Mis productos</h3>

            <table class="w-full">
                <tr>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Precio/kg</th>
                    <th>Ubicación</th>
                </tr>

                ${data.map(p => `
                    <tr class="border-t">
                        <td>${p.nombre}</td>
                        <td>${p.cantidad}</td>
                        <td>${p.precioKg}</td>
                        <td>${p.ubicacion}</td>
                    </tr>
                `).join("")}
            </table>
        </div>
    `;
}

// -------------------------
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// inicio
navigate("Dashboard");