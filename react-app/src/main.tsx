import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./core/router/router.tsx";
import { HelmetProvider } from "react-helmet-async";
import AuthProvider from "./providers/AuthProvider.tsx";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

/**
 * Context object used for managing Helmet state, typically for server-side rendering (SSR).
 * This object can be passed to HelmetProvider to collect and render head tags on the server.
 *
 * @see https://github.com/nfl/react-helmet#server-usage
 */
const helmetContext = {};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider context={helmetContext}>
      <AuthProvider>
        <RouterProvider router={router} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnHover
          draggable
        />
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>
);
