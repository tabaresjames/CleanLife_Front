import { useEffect, useState } from "react";
import api from "../services/api";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
}

const Productos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: "", descripcion: "", precio: 0 });
  const [editandoId, setEditandoId] = useState<number | null>(null);

  useEffect(() => {
    listarProductos();
  }, []);

  const listarProductos = async () => {
    try {
      const { data } = await api.get("/Productos");
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const limpiarFormulario = () => {
    setNuevoProducto({ nombre: "", descripcion: "", precio: 0 });
    setEditandoId(null);
  };

  const validarFormulario = () => {
    if (!nuevoProducto.nombre.trim() || !nuevoProducto.descripcion.trim() || nuevoProducto.precio <= 0) {
      alert("Complete todos los campos correctamente ❌");
      return false;
    }
    return true;
  };

  const manejarSubmit = async () => {
    if (!validarFormulario()) return;

    try {
      if (editandoId) {
        await api.put(`/Productos/${editandoId}`, nuevoProducto);
      } else {
        await api.post("/Productos", nuevoProducto);
      }
      listarProductos();
      limpiarFormulario();
    } catch (error) {
      console.error("Error en la operación:", error);
    }
  };

  const eliminarProducto = async (id: number) => {
    try {
      await api.delete(`/Productos/${id}`);
      listarProductos();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Productos 📦</h1>
      
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-4">{editandoId ? "Editar Producto" : "Crear Producto"}</h2>
        <div className="grid gap-3">
          <input
            type="text"
            placeholder="Nombre"
            className="border p-2 rounded-lg"
            value={nuevoProducto.nombre}
            onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
          />
          <input
            type="text"
            placeholder="Descripción"
            className="border p-2 rounded-lg"
            value={nuevoProducto.descripcion}
            onChange={(e) => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})}
          />
          <input
            type="number"
            placeholder="Precio"
            className="border p-2 rounded-lg"
            value={nuevoProducto.precio}
            onChange={(e) => setNuevoProducto({...nuevoProducto, precio: Number(e.target.value)})}
          />
          <div className="flex gap-2">
            <button
              onClick={manejarSubmit}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              {editandoId ? "Actualizar" : "Crear"}
            </button>
            {editandoId && (
              <button onClick={limpiarFormulario} className="bg-gray-400 text-white px-4 py-2 rounded-lg">
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {productos.map((producto) => (
          <div key={producto.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{producto.nombre}</h2>
              <p>Precio: ${producto.precio} | Desc: {producto.descripcion}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                    setNuevoProducto(producto) 
                    setEditandoId(producto.id)
                }}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
               >
                 Editar
               </button>
              <button
                onClick={() => eliminarProducto(producto.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Productos;