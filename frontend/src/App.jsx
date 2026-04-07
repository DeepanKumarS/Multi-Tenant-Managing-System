import Dashboard from './pages/dashboard.jsx';
import Login from './pages/login.jsx'
import UserRegister from './pages/register.jsx'
import TenantRegister from './pages/tenantregister.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ProtectedRoute from './protectedRoute/protectedRoute.jsx'
import CreateProperty from './pages/createProperty.jsx';

function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />}/>
        <Route path='/register' element={<UserRegister />}/>
        <Route path='/tenant-register' element={<TenantRegister />}/>
        <Route path='/home' element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
          }/>
          <Route path='/add-property' element={
          <ProtectedRoute>
            <CreateProperty />
          </ProtectedRoute>
          }/>
          
      </Routes>
    </BrowserRouter>
  );
}

export default App
