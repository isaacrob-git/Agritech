const API_URL = "http://localhost:3000/api";

let allProducts = [];

// =====================
// CARGAR PRODUCTOS
// =====================
async function fetchProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        const data = await res.json();

        allProducts = data;
        renderTable(data);

    } catch (err) {
        console.error("Error cargando productos:", err);
    }
}

// =====================
// RENDER TABLA (CORRECTO)
// =====================
function renderTable(data) {
    const body = document.getElementById("adminProductsBody");

    if (!body) return;

    body.innerHTML = data.map(p => `
        <tr class="border-b">

            <td class="p-3 font-bold text-navy_dark">
                ${p.nombre}
            </td>

            <td class="p-3">
                ${p.cantidad} Kg
            </td>

            <td class="p-3 font-bold">
                $${p.precioKg}
            </td>

            <td class="p-3 text-gray-600">
                ${p.ubicacion}
            </td>

            <td class="p-3 text-right">
                <button onclick="deleteProduct('${p._id}')"
                    class="text-red-500 hover:bg-red-50 px-3 py-1 rounded">
                    Eliminar
                </button>
            </td>

        </tr>
    `).join("");
}

// =====================
// CREAR PRODUCTO
// =====================
document.getElementById("productForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const cantidad = document.getElementById("cantidad").value;
    const precioKg = document.getElementById("precioKg").value;
    const ubicacion = document.getElementById("ubicacion").value;

    try {
        const res = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                nombre,
                cantidad,
                precioKg,
                ubicacion
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Error al crear producto");
            return;
        }

        document.getElementById("productForm").reset();
        fetchProducts();

    } catch (err) {
        console.error(err);
    }
});

// =====================
// ELIMINAR PRODUCTO
// =====================
async function deleteProduct(id) {
    try {
        await fetch(`${API_URL}/products/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        fetchProducts();

    } catch (err) {
        console.error(err);
    }
}

// =====================
// INIT
// =====================
fetchProducts();