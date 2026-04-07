import api from '../api/axiosInstance'
import { useState } from 'react'

function TenantProperty({ owner_id }) {

    // ── Unassigned Tenants State ───────────────────────────
    const [unassignedTenants, setUnassignedTenants] = useState([]);
    const [unassignedTLoading, setUnassignedTLoading] = useState(false);

    // ── Unassigned Properties State ────────────────────────
    const [unassignedProperties, setUnassignedProperties] = useState([]);
    const [unassignedPLoading, setUnassignedPLoading] = useState(false);

    // ── Assigned (tenants with properties) State ───────────
    const [assigned, setAssigned] = useState([]);
    const [assignedLoading, setAssignedLoading] = useState(false);

    // ── Assign form state ──────────────────────────────────
    const [selectedTenant, setSelectedTenant] = useState("");
    const [selectedProperty, setSelectedProperty] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [assignLoading, setAssignLoading] = useState(false);

    // ── 1. Get unassigned tenants ──────────────────────────
    const getUnassignedTenants = async () => {
        setUnassignedTLoading(true);
        try {
            const res = await api.get(`/owner/${owner_id}/tenants/unassigned`);
            setUnassignedTenants(res.data.tenants);
        } catch (err) {
            console.error("Failed to load unassigned tenants", err);
        } finally {
            setUnassignedTLoading(false);
        }
    };

    // ── 2. Get unassigned properties ───────────────────────
    const getUnassignedProperties = async () => {
        setUnassignedPLoading(true);
        try {
            const res = await api.get(`/owner/${owner_id}/properties/unassigned`);
            setUnassignedProperties(res.data.properties);
        } catch (err) {
            console.error("Failed to load unassigned properties", err);
        } finally {
            setUnassignedPLoading(false);
        }
    };

    // ── 3. Get assigned tenants with their properties ──────
    const getAssigned = async () => {
        setAssignedLoading(true);
        try {
            const res = await api.get(`/owner/${owner_id}/tenants/properties`);
            setAssigned(res.data.tenants);
        } catch (err) {
            console.error("Failed to load assigned tenants", err);
        } finally {
            setAssignedLoading(false);
        }
    };

    // ── 4. Assign property to tenant ───────────────────────
    const assignProperty = async (e) => {
        e.preventDefault();
        setAssignLoading(true);
        try {
            await api.post(
                `/owner/${owner_id}/property/${selectedProperty}/tenant/${selectedTenant}`,
                { start_date: startDate + "T00:00:00", end_date: endDate + "T00:00:00" }
            );
            // refresh all lists after new assignment
            await Promise.all([getUnassignedTenants(), getUnassignedProperties(), getAssigned()]);
            setSelectedTenant(""); setSelectedProperty("");
            setStartDate(""); setEndDate("");
        } catch (err) {
            console.error("Assign failed", err);
        } finally {
            setAssignLoading(false);
        }
    };

    // ── 5. Delete assignment ───────────────────────────────
    const deleteAssignment = async (pt_id) => {
        try {
            await api.delete(`/owner/${owner_id}/tenant_property/${pt_id}`);
            await getAssigned(); // refresh assigned list
        } catch (err) {
            console.error("Delete assignment failed", err);
        }
    };

    // ── Render ─────────────────────────────────────────────
    return (
        <div>

            {/* ── Section 1: Unassigned Tenants ── */}
            <div style={{ marginTop: "0" }}>
                <button className="btn btn-primary" onClick={getUnassignedTenants}>Show Unassigned Tenants</button>
                {unassignedTLoading && <p>Loading...</p>}
                {unassignedTenants.length > 0 && (
                    <table className="data-table">
                        <thead><tr><th>#</th><th>ID</th><th>Name</th></tr></thead>
                        <tbody>
                            {unassignedTenants.map((t, i) => (
                                <tr key={t.id}>
                                    <td>{i + 1}</td>
                                    <td>{t.id}</td>
                                    <td>{t.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {unassignedTenants.length === 0 && !unassignedTLoading && <p>No unassigned tenants.</p>}
            </div>

            {/* ── Section 2: Unassigned Properties ── */}
            <div style={{ marginTop: "16px" }}>
                <button className="btn btn-primary" onClick={getUnassignedProperties}>Show Unassigned Properties</button>
                {unassignedPLoading && <p>Loading...</p>}
                {unassignedProperties.length > 0 && (
                    <table className="data-table">
                        <thead><tr><th>#</th><th>ID</th><th>Name</th><th>Address</th><th>Price</th></tr></thead>
                        <tbody>
                            {unassignedProperties.map((p, i) => (
                                <tr key={p.id}>
                                    <td>{i + 1}</td>
                                    <td>{p.id}</td>
                                    <td>{p.name}</td>
                                    <td>{p.address}</td>
                                    <td>{p.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {unassignedProperties.length === 0 && !unassignedPLoading && <p>No unassigned properties.</p>}
            </div>

            {/* ── Section 3: Assign form ── */}
            <div style={{ marginTop: "16px" }}>
                <h4>Assign Property to Tenant</h4>
                <form onSubmit={assignProperty}>
                    <div className="assign-form">
                        <div>
                            <label>Tenant ID</label>
                            <input type="number" value={selectedTenant} onChange={e => setSelectedTenant(e.target.value)} placeholder="Tenant ID" required />
                        </div>
                        <div>
                            <label>Property ID</label>
                            <input type="number" value={selectedProperty} onChange={e => setSelectedProperty(e.target.value)} placeholder="Property ID" required />
                        </div>
                        <div>
                            <label>Start Date</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                        </div>
                        <div>
                            <label>End Date</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                        </div>
                        <div className="assign-form-actions">
                            <button className="btn btn-success" type="submit" disabled={assignLoading}>
                                {assignLoading ? "Assigning..." : "Assign"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* ── Section 4: Assigned tenants with properties ── */}
            <div style={{ marginTop: "16px" }}>
                <button className="btn btn-primary" onClick={getAssigned}>Show Assigned Tenants with Properties</button>
                {assignedLoading && <p>Loading...</p>}
                {assigned.length > 0 && assigned.map(tenant => (
                    <div key={tenant.tenant_id} className="tenant-row">
                        <strong>{tenant.tenant_name}</strong> — Total: ${tenant.total_price}
                        {tenant.assigned_properties.length === 0
                            ? <p>No properties.</p>
                            : <table className="data-table">
                                <thead>
                                    <tr><th>Property</th><th>Address</th><th>Price</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {tenant.assigned_properties.map((p, i) => (
                                        <tr key={i}>
                                            <td>{p.property_name}</td>
                                            <td>{p.address}</td>
                                            <td>{p.price}</td>
                                            <td>
                                                <button className="btn btn-danger" onClick={() => deleteAssignment(p.pt_id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        }
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TenantProperty

