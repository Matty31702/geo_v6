import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./router.tsx";
import {  HelmetProvider } from 'react-helmet-async';

const helmetContext = {}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider context={helmetContext}>
    <RouterProvider router={router} />
    </HelmetProvider>
s    
  </StrictMode>
);
