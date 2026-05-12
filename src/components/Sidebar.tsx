import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Boxes, ShoppingCart, LogOut, LucideLayersMinus } from "lucide-react";

const Sidebar = () => {
  const rol = localStorage.getItem("rol") || "vendedor"; // Valor por defecto si no se encuentra el rol
  const location = useLocation();

  // Función para resaltar el enlace activo
  const activeClass = (path: string) => 
    location.pathname === path 
      ? "bg-blue-600 text-white" 
      : "text-gray-400 hover:bg-gray-800 hover:text-white";

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} />, roles: ["Admin", "Vendedor"] },
    { name: "Productos", path: "/productos", icon: <Package size={20} />, roles: ["Admin"] },
    { name: "Inventario", path: "/inventario", icon: <Boxes size={20} />, roles: ["Admin", "Vendedor"] },
    { name: "Ventas", path: "/ventas", icon: <ShoppingCart size={20} />, roles: ["Admin", "Vendedor"] },
    {name: "Movimiento", path: "/movimiento", icon: <LucideLayersMinus size={20} />, roles: ["Admin",] }
  ];
  

  return (
    <div className="flex flex-col w-64 h-screen bg-gray-950 border-r border-gray-800 p-5">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20"></div>
        <h2 className="text-xl font-bold tracking-tight text-white">CleanLife</h2>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          (item.roles.includes(rol)) && (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeClass(item.path)}`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        ))}
      </nav>

      <div className="pt-4 border-t border-gray-800">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 transition-colors">
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;