import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // 1. Primero detenemos el recargo de página

    try {
      // 2. Enviamos la petición
      const response = await api.post("/Auth/login", {
        Email: email,
        Password: password
      });

      // 3. Extraemos el token de la respuesta
      const token = response.data.token;

      // 4. Decodificamos el token una sola vez
      const decoded: any = jwtDecode(token);

      // 5. Extraemos los claims (Asegurando que uid no sea undefined)
      const userRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      // 🔍 Buscamos en todas las ubicaciones posibles del ID
      const uid = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
        || decoded.nameid
        || decoded.sub;

      // 🛡️ VALIDACIÓN CRÍTICA: Solo guardamos si uid existe
      if (uid) {
        localStorage.setItem("token", token);
        localStorage.setItem("rol", userRole);
        localStorage.setItem("userId", uid.toString()); // Lo guardamos como string siempre
        navigate("/dashboard");
      } else {
        console.error("Token decodificado pero no se encontró el ID:", decoded);
        console.log(decoded);
        alert("Error de sesión: No se pudo encontrar el ID del usuario.");
      }
      // 7. Redirigimos
      navigate("/dashboard");

    } catch (error) {
      console.error("Error en el login:", error);
      alert("Credenciales incorrectas ❌");
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">

        <h1 className="text-3xl font-bold text-center mb-6">
          CleanLife
        </h1>

        <form
          className="space-y-4"
          onSubmit={handleLogin}
        >

          <div>
            <label className="block mb-1">
              Correo
            </label>

            <input
              type="email"
              placeholder="correo@cleanlife.com"
              className="w-full border rounded-lg px-3 py-2"

              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>

            <label className="block mb-1">
              Contraseña
            </label>

            <input
              type="password"
              placeholder="********"
              className="w-full border rounded-lg px-3 py-2"

              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

          </div>

          <button
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Iniciar sesión
          </button>

        </form>

      </div>

    </div>
  );
};

export default Login;