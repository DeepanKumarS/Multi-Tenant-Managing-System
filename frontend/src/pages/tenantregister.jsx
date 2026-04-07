import api from '../api/axiosInstance'
import {useState} from 'react'
import {toast} from 'react-toastify'
import {Link, useNavigate} from 'react-router-dom'

function TenantRegister(){
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [owner, setOwner] = useState("")
    const [name, setName] = useState("");
    const handleRegister = async (e) =>{
        e.preventDefault()
    try{
        await api.post("/tenant-register", {name, owner_id: owner, email, password}); 
        toast.success("Registeration successful!");
        // console.log(name, owner, email, password)
        navigate("/")
    } catch (e) {
        const status = e.response?.status
        const detail = e.response?.data?.detail
        if (status===400 && detail==="Email already exists"){
            toast.error("Email already exists!")
        }
        else if (status===400 && detail==="Invalid owner id") {
            toast.error("Invalid owner id")
        }
        else {
            toast.error("Something went wrong. Try again.")
        }
    }

    }
    return (
        <form className="card-form" onSubmit={handleRegister}>
            <h2>Tenant Register</h2>
            <label>Name</label><br/>
            <input type="text" value={name} onChange={(e)=>setName(e.target.value)} placeholder='name' required/><br/>
            <label>Owner id</label><br/>
            <input type="integer" value={owner} onChange={(e)=>setOwner(e.target.value)} placeholder='owner id' required/><br/>
            <label>Email</label><br/>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder='email' required/><br/>
            <label>Password</label><br/>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder='password' minLength={4} maxLength={100} required/><br/>
            <button className="btn btn-primary btn-full">Register</button>
            <p>Already have an account? <Link to ="/">Login here</Link> </p>
        </form>
    );
}

export default TenantRegister;