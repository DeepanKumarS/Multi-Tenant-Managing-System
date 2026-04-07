import api from '../api/axiosInstance'
import {useState} from 'react'
import {toast} from 'react-toastify'
import {Link, useNavigate} from 'react-router-dom'

function UserRegister(){
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const handleRegister = async (e) =>{
        e.preventDefault()
    try{
        await api.post("/register", {name, email, password}); 
        toast.success("Registeration successful!");
        navigate("/")
    } catch (e) {
        const status = e.response?.status

        if (status===400){
            toast.error("Email already exists!")
        }
        else {
            toast.error("Something went wrong. Try again.")
        }
    }

    }
    return (
        <form className="card-form" onSubmit={handleRegister}>
            <h2>User Register</h2>
            <label>Name</label><br/>
            <input type="text" value={name} onChange={(e)=>setName(e.target.value)} placeholder='name' required/><br/>
            <label>Email</label><br/>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder='Email' required/><br/>
            <label>Password</label><br/>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder='Password' minLength={4} maxLength={100} required/><br/>
            <button className="btn btn-primary btn-full">Register</button>
            <p>Already have an account? <Link to ="/">Login here</Link> </p>
        </form>
    );
}

export default UserRegister;