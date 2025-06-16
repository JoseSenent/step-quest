import { useState } from "react";
import { RouterContext } from "./RouterContext";

export type RouteModel =
  | "level-1"
  | "level-2"
  | "level-3"
  | "level-4"
  | "level-5";

export function RouterProvider({
  children,
  initialRoute = "level-1",
}: {
  children: React.ReactNode;
  initialRoute: RouteModel;
}) {
  const [route, setRoute] = useState<RouteModel>(
    () => (sessionStorage.getItem("route") as RouteModel) || initialRoute,
  );
  const navigate = (to: RouteModel) => {
    setRoute(to);
    sessionStorage.setItem("route", to);
  };

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}
