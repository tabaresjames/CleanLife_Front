import { useEffect, useState } from "react";
import api from "../services/api";

interface Movimiento {
  id: number;
  tipo: string;
  cantidad: number;
  fecha: string;
  observacion: string;
  producto: {
    nombre: string;
  };
  usuario: {
    email: string;
  };
}

const Movimientos = () => {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  // Estado para controlar qué producto está desplegado
  const [productoAbierto, setProductoAbierto] = useState<string | null>(null);

  useEffect(() => {
    obtenerMovimientos();
  }, []);

  const obtenerMovimientos = async () => {
    try {
      // Llamada al nuevo controlador independiente
      const response = await api.get("/Movimientos");
      setMovimientos(response.data);
    } catch (error) {
      console.error("Error cargando movimientos:", error);
    }
  };

  // --- LÓGICA DE AGRUPAMIENTO ---
  const movimientosAgrupados = movimientos.reduce((acc, mov) => {
    const nombreProd = mov.producto.nombre;
    if (!acc[nombreProd]) {
      acc[nombreProd] = [];
    }
    acc[nombreProd].push(mov);
    return acc;
  }, {} as Record<string, Movimiento[]>);

  return (
    <div className="mt-10 max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-2">
        Historial por Producto 📜
      </h1>

      <div className="space-y-4">
        {Object.keys(movimientosAgrupados).length === 0 && (
          <p className="text-gray-500 text-center italic">No hay movimientos registrados.</p>
        )}

        {Object.keys(movimientosAgrupados).map((nombreProducto) => (
          <div 
            key={nombreProducto} 
            className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white transition-all"
          >
            {/* ENCABEZADO DEL TOGGLE (BOTÓN) */}
            <button
              onClick={() => setProductoAbierto(productoAbierto === nombreProducto ? null : nombreProducto)}
              className={`w-full flex justify-between items-center p-5 transition-colors ${
                productoAbierto === nombreProducto ? "bg-blue-50" : "bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {nombreProducto.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-lg text-gray-700">{nombreProducto}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm bg-gray-200 px-3 py-1 rounded-full text-gray-600">
                  {movimientosAgrupados[nombreProducto].length} movs
                </span>
                <span className={`transform transition-transform duration-300 ${productoAbierto === nombreProducto ? "rotate-180" : ""}`}>
                  🔽
                </span>
              </div>
            </button>

            {/* CUERPO DEL TOGGLE (LISTA DE MOVIMIENTOS) */}
            {productoAbierto === nombreProducto && (
              <div className="bg-white border-t border-gray-100 animate-fadeIn">
                {movimientosAgrupados[nombreProducto]
                  .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()) // Orden cronológico inverso
                  .map((m, index) => (
                    <div 
                      key={m.id} 
                      className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-2 ${
                        index !== movimientosAgrupados[nombreProducto].length - 1 ? "border-b border-gray-50" : ""
                      }`}
                    >
                      <div className="flex gap-4 items-start">
                        {/* Indicador visual de tipo */}
                        <div className={`mt-1 w-2 h-2 rounded-full ${m.tipo === 'entrada' ? 'bg-green-500' : 'bg-red-500'}`} />
                        
                        <div>
                          <p className="font-medium text-gray-800">
                            <span className={m.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                              {m.tipo.toUpperCase()}
                            </span>
                            {" "} — {m.cantidad} unidades
                          </p>
                          <p className="text-sm text-gray-500">{m.observacion || "Sin observación"}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            📅 {new Date(m.fecha).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">
                          Respo: {m.usuario.email.split('@')[0]}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Movimientos;