import axios from 'axios'

const api = axios.create({
    baseURL: "http://127.0.0.1:8000"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    console.log("Request Interceptor");
    console.log(config)
    return config
})

api.interceptors.response.use(
    (response) => {
        
        console.log("Response Interceptor: GOOD");
        console.log(response);
        return response;
    }, 
    (error) => {
        console.log("Response Interceptor: BAD");
        console.log(error.response);
        const isLoginRoute = error.config?.url === "/login";
        if (error.response.status == 401 && !isLoginRoute) {
            localStorage.removeItem("token")
            window.location.href = "/login"
        }
        return Promise.reject(error)
    }
    
)

export default api