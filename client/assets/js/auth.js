function verificarSesion() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
        cerrarSesion();
        return;
    }

    try {
        const usuario = JSON.parse(user);
        return { token, usuario };
    } catch (error) {
        cerrarSesion();
    }
}

function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../login.html";
}