import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import { Layout } from "./Layout";
import { Home } from "./Home";
import { Login } from "./Login";
import { AuthProvider } from "./Auth";
import { AuthLayout } from "./AuthLayout";
import { Vehiculos } from "./Vehiculos";
import { VehiculoCrear } from "./VehiculoCrear";
import { VehiculoDetalles } from "./VehiculoDetalles";
import { Conductores } from "./Conductores";
import { ConductorCrear } from "./ConductorCrear";
import { ConductorDetalles } from "./ConductorDetalles";
import { Viajes } from "./Viajes";
import { ViajeCrear } from "./ViajeCrear";
import { ViajeDetalles } from "./ViajeDetalles";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />

            <Route path="vehiculos" element={<AuthLayout />}>
              <Route index element={<Vehiculos />} />
              <Route path="crear" element={<VehiculoCrear />} />
              <Route path=":id" element={<VehiculoDetalles />} />
            </Route>

            <Route path="conductores" element={<AuthLayout />}>
              <Route index element={<Conductores />} />
              <Route path="crear" element={<ConductorCrear />} />
              <Route path=":id" element={<ConductorDetalles />} />
            </Route>

            <Route path="viajes" element={<AuthLayout />}>
              <Route index element={<Viajes />} />
              <Route path="crear" element={<ViajeCrear />} />
              <Route path=":id" element={<ViajeDetalles />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);