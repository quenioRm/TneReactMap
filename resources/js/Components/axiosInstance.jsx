import axios from "axios";
import Swal from "sweetalert2";

const axiosInstance = axios.create({
    //   timeout: 5000,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const account = JSON.parse(localStorage.getItem("user"));

        if (account) {
            config.headers["Authorization"] = `Bearer ${account.api_token}`;
        }

        return config;
    },
    (error) => {
        console.log(error);
        return Promise.reject(error);
    },
);

axiosInstance.interceptors.response.use(
    (response) => {
        // Se a resposta for bem-sucedida, apenas retorne a resposta
        return response;
    },
    (error) => {
        // Se houver um erro, verifique se é um erro 403
        if (error.response && error.response.status === 403) {
            // Lidar com erro 403 aqui
            // console.error("Acesso negado. Você não tem permissão para acessar este recurso.");
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Acesso negado. Você não tem permissão para acessar este recurso.",
                showConfirmButton: false,
                timer: 10000,
            });

            setTimeout(() => {
                localStorage.clear();
                window.location.href = "/";
            }, 10000);
        }

        if (error.response && error.response.status === 401) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Acesso negado. Você não tem permissão para acessar este recurso.",
                showConfirmButton: false,
                timer: 10000,
            });

            setTimeout(() => {
                localStorage.clear();
                window.location.href = "/";
            }, 10000);
        }

        if (error.response && error.response.status === 524) {
            // Lidar com erro 403 aqui
            // console.error("Acesso negado. Você não tem permissão para acessar este recurso.");
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Sua conexão está lenta, atualize a página e tente novamente!.",
                showConfirmButton: false,
                timer: 10000,
            });
        }

        // Retornar uma Promise de rejeição com o erro
        return Promise.reject(error);
    },
);

export default axiosInstance;
