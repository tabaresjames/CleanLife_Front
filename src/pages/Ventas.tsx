import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth"; 

interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

interface ItemVenta {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

const Ventas = () => {
  const { userId } = useAuth(); 
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ItemVenta[]>([]);
  const [productoId, setProductoId] = useState(0);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      const res = await api.get("/Productos");
      setProductos(res.data);
    } catch (error: any) {
      console.error("Error al traer productos:", error);
    }
  };

  const agregarAlCarrito = () => {
    if (productoId === 0 || cantidad <= 0) {
      alert("Seleccione producto y cantidad válida ❌");
      return;
    }

    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    const existente = carrito.find(c => c.productoId === productoId);

    if (existente) {
      setCarrito(carrito.map(c =>
        c.productoId === productoId
          ? { ...c, cantidad: c.cantidad + cantidad }
          : c
      ));
    } else {
      setCarrito([
        ...carrito,
        {
          productoId,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad
        }
      ]);
    }
    setProductoId(0);
    setCantidad(1);
  };

  const eliminarItem = (id: number) => {
    setCarrito(carrito.filter(c => c.productoId !== id));
  };

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const registrarVenta = async () => {
  if (carrito.length === 0) return;

  // 1. Intentamos obtener el ID del hook, y si no, directamente del storage
  const idDesdeStorage = localStorage.getItem("userId"); // Asegúrate que el nombre coincida con el que usas en el Login
  const idFinal = userId || idDesdeStorage;

  // 2. Convertimos y validamos
  const idNumerico = parseInt(idFinal?.toString() || "0", 10);

  // SI SIGUE SIENDO NaN o 0, DETENEMOS TODO
  if (isNaN(idNumerico) || idNumerico === 0) {
    console.error("DEBUG: userId actual es:", userId, "Storage es:", idDesdeStorage);
    alert("Error: No se encontró tu sesión de usuario. Por favor, sal y vuelve a entrar ❌");
    return;
  }

  const ventaData = {
    usuarioId: idNumerico, // Ahora sí garantizado que es un número
    detalles: carrito.map(item => ({
      productoId: item.productoId,
      cantidad: item.cantidad
    }))
  };

  try {
    console.log("Enviando al Backend:", ventaData);

    // 🚀 ESTA ES LA LÍNEA QUE FALTABA:
    const res = await api.post("/Ventas", ventaData);

    // Si el backend responde bien (status 200/201)
    console.log("Respuesta del servidor:", res.data);
    alert(`Venta registrada con éxito! 💰 Total: $${res.data.total?.toLocaleString()}`);
    
    setCarrito([]); // Solo limpiamos si la API respondió OK
  } catch (error: any) {
    console.error("Error en la petición:", error.response?.data || error.message);
    
    // Mostramos el error real que viene del BadRequest del backend
    const mensajeError = error.response?.data || "Error al procesar la venta ❌";
    alert(typeof mensajeError === 'string' ? mensajeError : "Error en los datos de venta");
  }
};

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Registrar Venta 🛒</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LADO IZQUIERDO: SELECCIÓN */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Selección de Productos</h2>
          
          <label className="block text-sm font-medium text-gray-600 mb-1">Producto</label>
          <select
            value={productoId}
            onChange={(e) => setProductoId(Number(e.target.value))}
            className="border border-gray-200 p-3 rounded-xl w-full mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value={0}>Seleccione un producto...</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} - ${p.precio.toLocaleString()}
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium text-gray-600 mb-1">Cantidad</label>
          <input
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            className="border border-gray-200 p-3 rounded-xl w-full mb-6 outline-none"
            min="1"
          />

          <button
            onClick={agregarAlCarrito}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Agregar al Carrito
          </button>
        </div>

        {/* LADO DERECHO: CARRITO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Resumen de Venta</h2>
          
          <div className="flex-grow overflow-y-auto max-h-[300px] mb-4">
            {carrito.length === 0 ? (
              <div className="text-center py-10 text-gray-400 italic">El carrito está vacío</div>
            ) : (
              carrito.map(item => (
                <div key={item.productoId} className="flex justify-between items-center mb-3 bg-gray-50 p-3 rounded-lg">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.nombre}</p>
                    <p className="text-sm text-gray-500">{item.cantidad} unidad(es)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-600">${(item.precio * item.cantidad).toLocaleString()}</span>
                    <button 
                      onClick={() => eliminarItem(item.productoId)}
                      className="p-1 hover:bg-red-100 rounded-full text-red-500 transition-colors"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-medium">Total a pagar:</span>
              <span className="text-2xl font-black text-gray-800">${total.toLocaleString()}</span>
            </div>
            
            <button
              onClick={registrarVenta}
              disabled={carrito.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
                carrito.length === 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 shadow-green-200'
              }`}
            >
              Confirmar Venta 💰
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ventas;