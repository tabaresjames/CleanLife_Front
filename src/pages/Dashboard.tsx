import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { ShoppingBag, AlertTriangle, TrendingUp, DollarSign, LogOut } from 'lucide-react';

// Interfaces para TypeScript
interface VentaSemanal {
  fecha: string;
  total: number;
}

interface AlertaStock {
  producto: string;
  cantidad: number;
}

interface StockItem {
  producto: string;
  cantidad: number;
}

// Formateador de moneda para evitar desbordamiento de texto
const moneyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalVentas: 0,
    ventasSemanales: [] as VentaSemanal[],
    alertasStock: [] as AlertaStock[],
    productosMasVendidos: [],
    stockActual: [] as StockItem[]
  });

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      const [ventasRes, semanalRes, alertasRes, topRes, stockRes] = await Promise.all([
        api.get("/Reportes/total-ventas"),
        api.get("/Reportes/ventas-semanales"),
        api.get("/Reportes/alertas-stock"),
        api.get("/Reportes/productos-mas-vendidos"),
        api.get("/Reportes/stock")
      ]);

      setStats({
        totalVentas: ventasRes.data.total,
        ventasSemanales: semanalRes.data,
        alertasStock: alertasRes.data,
        productosMasVendidos: topRes.data,
        stockActual: stockRes.data
      });
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };



  const formatKpiValue = (value: number) => {
    if (value >= 1000000) {
      // Usamos 2 decimales para que 24.84M sea mucho más exacto que 24.5M
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return moneyFormatter.format(value);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Panel Analítico</h1>
          <p className="text-gray-500">Bienvenido al control de CleanLife</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition shadow-sm"
        >
          <LogOut size={18} /> Salir
        </button>
      </div>

      {/* KPIs Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Ventas Totales"
          value={formatKpiValue(stats.totalVentas)} // Muestra "$24.84M"
          fullValue={moneyFormatter.format(stats.totalVentas)} // Muestra "$24.840.000"
          icon={<DollarSign className="text-green-600" />}
          color="bg-green-100"
        />
        <KpiCard
          title="Alertas de Stock"
          value={stats.alertasStock.length}
          icon={<AlertTriangle className="text-amber-600" />}
          color="bg-amber-100"
        />
        <KpiCard
          title="Productos"
          value={stats.stockActual.length}
          icon={<ShoppingBag className="text-blue-600" />}
          color="bg-blue-100"
        />
        <KpiCard
          title="Tendencia"
          value="Activa"
          icon={<TrendingUp className="text-purple-600" />}
          color="bg-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Ventas Semanales */}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="text-lg font-bold mb-4">Ventas de los últimos 7 día</h3>
          <div className="h-72 w-full">
            {/* 🚀 SOLO RENDERIZA SI HAY DATOS */}
            {stats.ventasSemanales.length > 0 ? (
              <ResponsiveContainer width="99%" height="100%">
                <LineChart data={stats.ventasSemanales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <YAxis
                    tickFormatter={(val) => {
                      
                      if (val >= 1000000) {
                        return `$${(val / 1000000).toFixed(1)}M`; // Ejemplo: $1.2M
                      } else if (val >= 1000) {
                        return `$${(val / 1000).toFixed(0)}k`;   // Ejemplo: $650k
                      } else {
                        return `$${val}`; // Para valores menores a 1000
                      }
                  
                    }}
                    padding={{top:20, bottom: 20}}
                    tick={{fontSize:14, fill:'#6b7280'}}
                    width={60} // 👈 Importante: Dale un ancho fijo al eje para que no "baile" el gráfico
                  />
                  <Tooltip formatter={(val: any) => moneyFormatter.format(Number(val || 0))} />
                  <Line type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Cargando datos...
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Stock (Aplica la misma lógica) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="text-lg font-bold mb-4">Distribución de Stock</h3>
          <div className="h-72 w-full">
            {stats.stockActual.length > 0 ? (
              <ResponsiveContainer width="99%" height="100%">
                <BarChart data={stats.stockActual}>
                  <XAxis dataKey="producto" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#6366F1" radius={[4, 4, 0, 0]}>
                    {stats.stockActual.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Cargando inventario...
              </div>
            )}
          </div>
        </div>

        {/* Tabla de Alertas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold mb-4 text-red-600 flex items-center gap-2">
            <AlertTriangle size={20} /> Productos por Agotarse
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b">
                  <th className="pb-3 font-medium">Producto</th>
                  <th className="pb-3 font-medium text-center">Cantidad Restante</th>
                  <th className="pb-3 font-medium text-right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {stats.alertasStock.map((item: AlertaStock, idx: number) => (
                  <tr key={idx} className="border-b last:border-none hover:bg-gray-50">
                    <td className="py-4 font-medium">{item.producto}</td>
                    <td className="py-4 text-center">{item.cantidad} unidades</td>
                    <td className="py-4 text-right">
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                        CRÍTICO
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon, color, fullValue }: any) => {
  const [showFull, setShowFull] = useState(false);

  return (
    <div
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-all"
      onClick={() => setShowFull(!showFull)} // Al hacer clic, alterna entre abreviado y completo
      title="Haz clic para ver el valor exacto" // Tooltip al pasar el mouse
    >
      <div className="flex items-center gap-4 w-full">
        <div className={`p-4 rounded-xl ${color} shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-500 font-medium truncate">{title}</p>
          <p className={`font-bold text-gray-800 leading-none transition-all ${showFull ? 'text-lg' : 'text-2xl'
            }`}>
            {showFull ? fullValue : value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;