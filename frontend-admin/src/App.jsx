




<<<<<<< HEAD
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import Login from "./pages/Authentification/login";
// import Dashboard from './pages/Dashboard/Dashboard';
// import Drivers from './pages/Drivers/Drivers';
// import DriverForm from './pages/Drivers/DriverForm';
// import Vehicles  from './pages/Vehicles/Vehicles';
// import VehicleForm from './pages/Vehicles/VehicleForm';
// import Clients from './pages/Clients/Clients';
// import Clients from './pages/Maintenance/Maintenance';
// import ProtectedRoute from './components/ProtectedRoute';


// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Navigate to="/login" replace />} />
//         <Route path="/login" element={<Login />} />
        
//         <Route 
//           path="/dashboard" 
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           } 
//         />
        
//         {<Route 
//           path="/drivers" 
//           element={
//             <ProtectedRoute>
//               <Drivers />
//             </ProtectedRoute>
//           } 
//         /> }

        
// <Route 
//   path="/drivers/add" 
//   element={
//     <ProtectedRoute>
//       <DriverForm />
//     </ProtectedRoute>
//   } 
// />

//     <Route 
//           path="/vehicles" 
//           element={
//             <ProtectedRoute>
//               <Vehicles />
//             </ProtectedRoute>
//           } 
//         />

//           <Route 
//           path="/vehicles/add" 
//           element={
//             <ProtectedRoute>
//               <VehicleForm />
//             </ProtectedRoute>
//           } 
//         />
//         <Route 
//           path="/clients" 
//           element={
//             <ProtectedRoute>
//               <Clients />
//             </ProtectedRoute>
//           } 
//         />

//         <Route 
//           path="/maintenance" 
//           element={
//             <ProtectedRoute>
//               <Maintenance />
//             </ProtectedRoute>
//           } 
//         />

//       </Routes>

   

//     </BrowserRouter>
//   );
// }


=======
>>>>>>> origin/frontend-admin
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Authentification/login";
import Dashboard from './pages/Dashboard/Dashboard';
import Drivers from './pages/Drivers/Drivers';
import DriverForm from './pages/Drivers/DriverForm';
<<<<<<< HEAD
import Vehicles from './pages/Vehicles/Vehicles';
import VehicleForm from './pages/Vehicles/VehicleForm';
import Clients from './pages/Clients/Clients';
import Maintenance from './pages/Maintenance/Maintenance';  // ✅ CORRIGÉ
import ProtectedRoute from './components/ProtectedRoute';

=======
import Vehicles  from './pages/Vehicles/Vehicles';
import VehicleForm from './pages/Vehicles/VehicleForm';
import Clients from './pages/Clients/Clients';
import ProtectedRoute from './components/ProtectedRoute';


>>>>>>> origin/frontend-admin
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
        
<<<<<<< HEAD
        <Route 
=======
        {<Route 
>>>>>>> origin/frontend-admin
          path="/drivers" 
          element={
            <ProtectedRoute>
              <Drivers />
            </ProtectedRoute>
          } 
<<<<<<< HEAD
        />

        <Route 
          path="/drivers/add" 
          element={
            <ProtectedRoute>
              <DriverForm />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/drivers/:id/edit" 
          element={
            <ProtectedRoute>
              <DriverForm />
            </ProtectedRoute>
          } 
        />

        <Route 
=======
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
>>>>>>> origin/frontend-admin
          path="/vehicles" 
          element={
            <ProtectedRoute>
              <Vehicles />
            </ProtectedRoute>
          } 
        />

<<<<<<< HEAD
        <Route 
=======
          <Route 
>>>>>>> origin/frontend-admin
          path="/vehicles/add" 
          element={
            <ProtectedRoute>
              <VehicleForm />
            </ProtectedRoute>
          } 
        />
<<<<<<< HEAD

        <Route 
          path="/vehicles/:id/edit" 
          element={
            <ProtectedRoute>
              <VehicleForm />
            </ProtectedRoute>
          } 
        />

=======
>>>>>>> origin/frontend-admin
        <Route 
          path="/clients" 
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          } 
        />

<<<<<<< HEAD
        {/* ✅ NOUVELLE ROUTE MAINTENANCE */}
        <Route 
          path="/maintenance" 
          element={
            <ProtectedRoute>
              <Maintenance />
            </ProtectedRoute>
          } 
        />

        {/* Route 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

        {/* <Route path="/drivers" element={<Drivers />} /> */}
<Route path="/drivers/add" element={<DriverForm />} />
<Route path="/drivers/edit/:id" element={<DriverForm />} />

      </Routes>
    </BrowserRouter>
  );
}

=======

      </Routes>

   

    </BrowserRouter>
  );
}
>>>>>>> origin/frontend-admin
