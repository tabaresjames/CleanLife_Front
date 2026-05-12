import { type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// IMPORTANTE: Tienes que importar el Login para poder usarlo
import Login from "./pages/Login"; 
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Inventario from "./pages/Inventario";
import Ventas from "./pages/Ventas";
import Sidebar from "./components/Sidebar";
import Movimiento from "./pages/Movimiento";

interface ProtectedLayoutProps {
  children: ReactNode;
  allowedRoles: string[];
}

const ProtectedLayout = ({ children, allowedRoles }: ProtectedLayoutProps) => {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol") || "";

  // Si no hay token, lo mandamos a la raíz (Login)
  if (!token) return <Navigate to="/" />;
  // Si el rol no coincide, lo devolvemos al Dashboard
  if (!allowedRoles.includes(rol)) return <Navigate to="/dashboard" />;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-100 min-h-screen">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* 1. LA RAIZ: Cámbiala de "./Login" a "/" únicamente */}
      <Route path="/" element={<Login />} /> 
      
      {/* 2. URLS en minúsculas (es mejor práctica) */}
      <Route path="/dashboard" element={
        <ProtectedLayout allowedRoles={["Admin", "Vendedor"]}>
          <Dashboard />
        </ProtectedLayout>
      } />
      
      <Route path="/ventas" element={
        <ProtectedLayout allowedRoles={["Admin", "Vendedor"]}>
          <Ventas />
        </ProtectedLayout>
      } />

      <Route path="/inventario" element={
        <ProtectedLayout allowedRoles={["Admin", "Vendedor"]}>
          <Inventario />
        </ProtectedLayout>
      } />

      <Route path="/productos" element={
        <ProtectedLayout allowedRoles={["Admin"]}>
          <Productos />
        </ProtectedLayout>
      } />

      <Route path="/movimiento" element={
        <ProtectedLayout allowedRoles={["Admin", "Vendedor"]}>
          <Movimiento />
        </ProtectedLayout>
      } />

      {/* 3. COMODÍN: Si escriben cualquier otra cosa, al Login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;