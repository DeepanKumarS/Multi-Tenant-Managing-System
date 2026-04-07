import api from '../api/axiosInstance'
import {useState} from 'react'

function TenantList({owner_id}) {
    const [value,setValue] = useState([]);
    const [ownerName,setOwnerName] = useState("");
    const [total, setTotal] =useState("");
    const [loading,setLoading] = useState(false);
    const getList = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/owner/${owner_id}/tenants`)
            setValue(response?.data?.tenants);
            setOwnerName(response?.data?.owner_name);
            setTotal(response?.data?.total_tenants);
            console.log(response.data)
        }catch (error){
            console.error("Failed to load users: ", error);
        }finally{
            setLoading(false);
        }
    }
    const deleteTenant = async (owner_id, tenant_id) => {
    try{
        await api.delete(`/owner/${owner_id}/tenants/${tenant_id}`);
        setValue(value.filter(t=> t.id !== tenant_id));
    } catch (error) {
        console.error("Delete failed", error);
        }
    }
        return (
            <div>
                <button className="btn btn-primary" onClick={getList}>Get tenants</button>
                {loading && <p>Loading...</p> }
                {value.length > 0 && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Sl No.</th>
                                <th>Tenant Id</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {value.map((val, index)=> (
                                <tr key={val.id}>
                                    <td>{index+1}</td>
                                    <td>{val.id}</td>
                                    <td>{val.name}</td>
                                    <td>{val.email}</td>
                                    <td> <button className="btn btn-danger" onClick={() => deleteTenant(owner_id,val.id)}>Delete</button> </td>
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


export default TenantList