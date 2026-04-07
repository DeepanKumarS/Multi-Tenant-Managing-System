import CreateProperty from './createProperty.jsx';
import TenantList from './tenantList.jsx';
import PropertyList from './propertyList.jsx';
import {Link, useNavigate} from 'react-router-dom'
import TenantProperty from './tenantProperty.jsx';

function Dashboard() {
    let owner_id = localStorage.getItem("owner_id");
    const role = localStorage.getItem("role");
    const id = localStorage.getItem("user_id");
    const navigate = useNavigate();
    if (role!=="tenant"){
        owner_id = id
    }

    const logout = () => { localStorage.clear(); navigate("/"); };

    return (
        <>
            <nav className="navbar">
                <span className="navbar-brand">MTMS</span>
                <div className="navbar-right">
                    <span className="navbar-role">{role}</span>
                    <button className="btn btn-ghost" style={{color:"#fff", borderColor:"rgba(255,255,255,0.3)"}} onClick={logout}>Logout</button>
                </div>
            </nav>

            <div className="page">
                <div className="user-info">
                    <strong>Welcome back!</strong>&nbsp; Logged in as <strong>{role}</strong> &nbsp;|&nbsp; ID: {id}
                    {role !== "owner" && <>&nbsp;|&nbsp; Owner ID: {owner_id}</>}
                </div>

                {role === "owner" && (
                    <div className="section-card">
                        <div className="section-card-header">
                            <h4>Tenants</h4>
                        </div>
                        <TenantList owner_id={id} />
                    </div>
                )}

                {role === "owner" && (
                    <div className="section-card">
                        <div className="section-card-header">
                            <h4>Tenant — Property Assignments</h4>
                            <Link className="btn btn-accent" to="/add-property">+ Add Property</Link>
                        </div>
                        <TenantProperty owner_id={id} />
                    </div>
                )}

                <div className="section-card">
                    <div className="section-card-header">
                        <h4>Properties</h4>
                    </div>
                    <PropertyList owner_id={owner_id} role={role}/>
                </div>
            </div>
        </>
    )
}

export default Dashboard


