




import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Authentification/login";
import Dashboard from './pages/Dashboard/Dashboard';
import Drivers from './pages/Drivers/Drivers';
import DriverForm from './pages/Drivers/DriverForm';
import Vehicles  from './pages/Vehicles/Vehicles';
import VehicleForm from './pages/Vehicles/VehicleForm';
import Clients from './pages/Clients/Clients';
import ProtectedRoute from './components/ProtectedRoute';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {<Route 
          path="/drivers" 
          element={
            <ProtectedRoute>
              <Drivers />
            </ProtectedRoute>
          } 
        /> }

        
<Route 
  path="/drivers/add" 
  element={
    <ProtectedRoute>
      <DriverForm />
    </ProtectedRoute>
  } 
/>

    <Route 
          path="/vehicles" 
          element={
            <ProtectedRoute>
              <Vehicles />
            </ProtectedRoute>
          } 
        />

          <Route 
          path="/vehicles/add" 
          element={
            <ProtectedRoute>
              <VehicleForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/clients" 
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          } 
        />


      </Routes>

   

    </BrowserRouter>
  );
}
