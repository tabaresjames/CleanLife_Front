export const useAuth = () => {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");
  const rawUserId = localStorage.getItem("userId");

  // Validamos que no sea la palabra "undefined" en texto
  const validUserId = (rawUserId && rawUserId !== "undefined") ? Number(rawUserId) : null;

  return {
    token,
    rol,
    userId: validUserId, 
    estaLogueado: !!token,
    esAdmin: rol === "Admin",
    esVendedor: rol === "Vendedor"
  };
};