
import api from '../api/axiosInstance'
import {useState} from 'react'
import {toast} from 'react-toastify'
import {Link, useNavigate} from 'react-router-dom'

function Login() {
    const [email, setEmail] = useState("");
    const [password,setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) =>{
        e.preventDefault()
        try{
            const response = await api.post("/login", {email, password});
            localStorage.setItem("token", response.data.access_token);
            localStorage.setItem("owner_id", response.data.owner_id);
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("user_id", response.data.user_id);

            // console.log(email, password)
            
            toast.success("Login successful!");
            navigate("/home")

        } catch (e) {
            const status = e.response?.status;
            const detail = e.response?.data?.detail;
            console.log(e.response?.data || e.message);
            toast.error("Login failed!");
            if (status === 401 && detail === "Invalid email"){
                toast.error("Wrong email, if you are a new user try registering first");
            }
            else if (status === 401 && detail === "Invalid password"){
                toast.error("Wrong password");
            }
            else{
                toast.error("Something went wrong. Try again.");
            }
        }
    };

    return (
        <form className="card-form" onSubmit={handleSubmit}>
            <h2>Login</h2>
            <label>Email</label><br/>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder='Email' required/><br/>
            <label>Password</label><br/>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder='Password' minLength={4} maxLength={100} required/><br/>
            <button className="btn btn-primary btn-full">Login</button>

            <p>Don't have an account? To register as owner: <Link to="/register">Register here</Link> </p>
            <p>Don't have an account? To register as tenant: <Link to="/tenant-register">Register here</Link> </p>
        </form>
    );
}
export default Login;