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

  useEffect(() => {

    obtenerMovimientos();

  }, []);

  const obtenerMovimientos = async () => {

    try {

      const response = await api.get("/Movimientos");

      setMovimientos(response.data);

    } catch (error) {

      console.error(error);
    }
  };

  return (

    <div className="mt-10">

      <h1 className="text-3xl font-bold mb-6">
        Movimientos 📜
      </h1>

      <div className="grid gap-4">

        {movimientos.map((m) => (

          <div
            key={m.id}
            className="bg-white p-4 rounded-xl shadow"
          >

            <h2 className="font-bold">
              {m.producto.nombre}
            </h2>

            <p>
              Tipo: {m.tipo}
            </p>

            <p>
              Cantidad: {m.cantidad}
            </p>

            <p>
              Usuario: {m.usuario.email}
            </p>

            <p>
              Fecha: {new Date(m.fecha).toLocaleString()}
            </p>

            <p>
              {m.observacion}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
};

export default Movimientos;