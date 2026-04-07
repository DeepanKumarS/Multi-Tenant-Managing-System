import api from '../api/axiosInstance'
import {useState} from 'react'
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify'

function CreateProperty() {
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [price, setPrice] = useState("");
    const owner_id = localStorage.getItem("user_id");
    const handleRequest = async (e) => {
        e.preventDefault()
        try{
            await api.post(`/owner/${owner_id}/property`,{name, address, price});
            toast.success("created property");
           
        }
        catch (err){
            console.error(err);
        }
    }

    return (
        <form className="card-form" onSubmit={handleRequest}>
            <h2>Create Property</h2>
            <label>Name</label><br/>
            <input type="text" value={name} onChange={(e)=>setName(e.target.value)} placeholder='Property name' minLength={3} maxLength={100} required/><br/>
            <label>Address</label><br/>
            <input type="text" value={address} onChange={(e)=>setAddress(e.target.value)} placeholder='address' minLength={10} maxLength={255} required/><br/>
            <label>Price</label><br/>
            <input type="number" value={price} onChange={(e)=>setPrice(e.target.value)} placeholder='price' minLength={4} maxLength={100} required/><br/>
            <button className="btn btn-primary btn-full">Create</button>
            <Link to="/home">Cancel</Link>
        </form>
    );
}

export default CreateProperty