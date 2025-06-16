import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import App from "./App.tsx";
import { RouterProvider } from "./router/RouterProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider initialRoute="level-1">
      <App />
    </RouterProvider>
  </StrictMode>,
);
