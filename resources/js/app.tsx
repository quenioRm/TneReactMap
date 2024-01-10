import "../css/app.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Components/css/TextDecoration.css";

import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import axios from 'axios';
import Swal from "sweetalert2";

const appName = import.meta.env.VITE_APP_NAME || "TNEAPP";

axios.interceptors.response.use(
    response => {
      // Se a resposta for bem-sucedida, apenas retorne a resposta
      return response;
    },
    error => {
      // Se houver um erro, verifique se é um erro 403
      if (error.response && error.response.status === 403) {
        // Lidar com erro 403 aqui
        // console.error("Acesso negado. Você não tem permissão para acessar este recurso.");
        Swal.fire({
            position: "center",
            icon: "error",
            title: "Acesso negado. Você não tem permissão para acessar este recurso.",
            showConfirmButton: false,
            timer: 10000
        });

        setTimeout(() =>{
            window.location.href = '/';
        },10000)
      }
      // Retornar uma Promise de rejeição com o erro
      return Promise.reject(error);
    }
);

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob("./Pages/**/*.tsx"),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: "#4B5563",
    },
});
