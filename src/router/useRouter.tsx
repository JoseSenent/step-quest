import { useContext } from "react";
import { RouterContext } from "./RouterContext";

// Hook para consumir la ruta desde cualquier componente
export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error("useRouter debe usarse dentro de <RouterProvider>");
  }
  return ctx;
}
