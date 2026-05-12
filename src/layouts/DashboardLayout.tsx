import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Fijo */}
      <Sidebar />

      {/* Contenido Dinámico */}
      <main className="flex-1 p-8 ml-64"> {/* ml-64 es el ancho del sidebar */}
        <div className="max-w-7xl mx-auto">
          <Outlet /> {/* Aquí se renderizarán Productos, Ventas, etc. */}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;