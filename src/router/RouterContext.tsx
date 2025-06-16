import { createContext } from "react";
import type { RouteModel } from "./RouterProvider";

export type RouterContextType = {
  route: RouteModel;
  navigate: (to: RouteModel) => void;
};

export const RouterContext = createContext<RouterContextType | undefined>(
  undefined,
);
