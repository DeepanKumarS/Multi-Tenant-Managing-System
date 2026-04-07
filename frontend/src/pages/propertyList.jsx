import api from '../api/axiosInstance'
import {useState} from 'react'

function PropertyList({owner_id, role}) {
    const [place,setPlace] = useState([]);
    const [ownerName,setOwnerName] = useState("");
    const [total, setTotal] =useState("");
    const [loading,setLoading] = useState(false);
    const [editId, seteditId] = useState(null);
    const [editData, seteditData] = useState({});
    const isOwner = role === "owner"

    // Get property 
    const getList = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/owner/${owner_id}/property`)
            setPlace(response?.data?.property);
            setOwnerName(response?.data?.owner_name);
            setTotal(response?.data?.property_count);
            console.log(response.data)
        }catch (error){
            console.error("Failed to load properties: ", error);
        }finally{
            setLoading(false);
        }
    }
    // Delete property
    const deleteProperty = async (owner_id, property_id) => {
        try{
            await api.delete(`/owner/${owner_id}/property/${property_id}`);
            setPlace(place.filter(t=> t.id !== property_id));
        } catch (error) {
            console.error("Delete failed", error);
            }
    }

    // Function to edit and update
    const startEdit = (val) => {
            seteditId(val.id);
            seteditData({name: val.name, address: val.address, price: val.price});
        }
    const updateProperty = async(owner_id, property_id) => {
        
        try {
            await api.put(`/owner/${owner_id}/property/${property_id}`, editData);
            setPlace(place.map(p=> p.id === property_id? {...p, ...editData}: p));
            seteditId(null);
            console.log("The data");
            console.log(editData);
        }
        catch (error){
           console.error("Update failed", error); 
        }
    }
    return (
        <div>
                <button className="btn btn-primary" onClick={getList}>Get Properties</button>
                {loading && <p>Loading...</p> }
                {place.length > 0 && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Sl No.</th>
                                <th>Property Id</th>
                                <th>Property Name</th>
                                <th>address</th>
                                <th>price</th>
                                {isOwner && <th>Action</th>}
                                
                            </tr>
                        </thead>
                        <tbody>
                            {place.map((val, index)=> (
                                <tr key={val.id}>
                                    <td>{index+1}</td>
                                    <td>{val.id}</td>
                                    <td>
                                        {editId === val.id? <input value={editData.name} onChange={(e)=>seteditData({...editData, name: e.target.value})} /> 
                                        : val.name}
                                    </td>
                                    <td>
                                        {editId === val.id? <input value={editData.address} onChange={(e)=>seteditData({...editData, address: e.target.value})} /> 
                                        : val.address}
                                    </td>
                                    <td>
                                        {editId === val.id? <input value={editData.price} onChange={(e)=>seteditData({...editData, price: e.target.value})} /> 
                                        : val.price}
                                    </td>
                                    {isOwner &&  (
                                        <td> 
                                            {editId === val.id? <button className="btn btn-success" onClick={() => updateProperty(owner_id,val.id)}>Save</button> 
                                         : <button className="btn btn-warning" onClick={() => startEdit(val)}>Edit</button>}
                                         <button className="btn btn-danger" onClick={() => deleteProperty(owner_id,val.id)}>Delete</button> 
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="3">Owner Name: {ownerName}</td>
                                <td colSpan="4">Total: {total}</td>
                            </tr>
                        </tfoot>
                    </table>
                )}
            </div>
    );


}

export default PropertyList