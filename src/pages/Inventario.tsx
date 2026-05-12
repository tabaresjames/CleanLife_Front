import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth"; // 1. Importamos el hook

interface Producto {
  id: number;
  nombre: string;
}

interface InventarioItem {
  id: number;
  productoId: number;
  cantidad: number;
  producto: { nombre: string };
}

const Inventario = () => {
  const { userId, esAdmin } = useAuth(); // 2. Extraemos lo que necesitamos
  
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  // 3. Inicializamos el movimiento con el userId del hook
  const [movimiento, setMovimiento] = useState({
    productoId: 0,
    cantidad: 0,
    usuarioId: userId || 0, 
    observacion: "",
  });

  // 4. Sincronizamos el userId en el estado cuando el Hook termine de cargar
  useEffect(() => {
    if (userId) {
      setMovimiento(prev => ({ ...prev, usuarioId: userId }));
    }
  }, [userId]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [invRes, prodRes] = await Promise.all([
        api.get("/Inventario"),
        api.get("/Productos"),
      ]);
      setInventario(invRes.data);
      setProductos(prodRes.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  const registrarProduccion = async () => {
    if (movimiento.productoId <= 0 || movimiento.cantidad <= 0 || !movimiento.observacion.trim()) {
      alert("Complete todos los campos correctamente ❌");
      return;
    }

    try {
      await api.post("/Inventario/entrada", movimiento);
      alert("Producción registrada ✅");
      
      // 5. Ajuste aquí: Al limpiar, mantenemos el userId real del hook
      setMovimiento({ 
        productoId: 0, 
        cantidad: 0, 
        usuarioId: userId || 0, 
        observacion: "" 
      });
      
      cargarDatos();
    } catch (error) {
      console.error("Error al registrar:", error);
      alert("No se pudo registrar la producción. Verifica tus permisos.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Inventario 📦</h1>

      {/* 6. Usamos 'esAdmin' del hook para la condición */}
      {esAdmin ? (
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">Registrar Producción 🏭</h2>
          <div className="grid gap-4">
            <select
              className="border p-2 rounded-lg"
              value={movimiento.productoId}
              onChange={(e) => setMovimiento({ ...movimiento, productoId: Number(e.target.value) })}
            >
              <option value={0}>Seleccione producto</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Cantidad producida"
              className="border p-2 rounded-lg"
              value={movimiento.cantidad}
              onChange={(e) => setMovimiento({ ...movimiento, cantidad: Number(e.target.value) })}
            />

            <input
              type="text"
              placeholder="Observación"
              className="border p-2 rounded-lg"
              value={movimiento.observacion}
              onChange={(e) => setMovimiento({ ...movimiento, observacion: e.target.value })}
            />

            <button
              onClick={registrarProduccion}
              className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Registrar Producción
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
          <p className="text-blue-700">
            Modo lectura: Como <strong>Vendedor</strong>, puedes visualizar el stock disponible, pero no registrar producción.
          </p>
        </div>
      )}

      {/* Lista de Inventario */}
      <div className="grid gap-4">
        {inventario.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
            <h2 className="text-xl font-semibold">{item.producto.nombre}</h2>
            <p className="font-bold text-blue-600">Stock: {item.cantidad}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventario;