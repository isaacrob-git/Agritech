const formulario = document.getElementById("formLogin");

formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = formulario.email.value.trim();
    const password = formulario.password.value.trim();

    try {

        const respuesta = await fetch(`${API_URL}/auth/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            alert(data.message);
            return;
        }

        console.log(data);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        switch (data.user.rol) {

            case "agricultor":
                window.location.href = "dashboard/agricultor.html";
                break;

            case "comercio":
                window.location.href = "dashboard/comercio.html";
                break;

            case "transportista":
                window.location.href = "dashboard/transportista.html";
                break;

            case "admin":
                window.location.href = "dashboard/admin.html";
                break;

            default:
                alert("Rol no válido");
        }

    } catch (error) {

        console.error(error);

        alert("No se pudo conectar con el servidor.");

    }

});