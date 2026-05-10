import axios from "axios";

const api = axios.create({
  baseURL: "https://schemasense-backend.onrender.com/api",
});

export default api;
