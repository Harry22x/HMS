import Homepage from "./Pages/HomePage";
import App from "./App";
import Login from "./Pages/Login";
import HostelPage from "./Pages/HostelPage";
import SignUpPage from "./Pages/SignUpPage";
import ManagerDashboard from "./Pages/ManagerDashboard";
import MyBookings from "./Pages/MyBookings";
import AdminDashboard from "./Pages/AdminDashboard";
import ProtectedRoutes from "./ProtectedRoutes";

const routes = [
    {path:"/",
      element:<App/>,
      children:[
        {path:"/",element:<Homepage/>},
        {path:"login",element:<Login/>},
        {path:"hostels/:id",element:<HostelPage/>},
        {path:"signup",element:<SignUpPage/>},
        { 
        path: "my-bookings", 
        element: (
          <ProtectedRoutes allowedRole="student">
            <MyBookings />
          </ProtectedRoutes>
        ) 
      },

      { 
        path: "manager-dashboard", 
        element: (
          <ProtectedRoutes allowedRole="manager">
            <ManagerDashboard />
          </ProtectedRoutes>
        ) 
      },

    
      { 
        path: "admin-dashboard", 
        element: (
          <ProtectedRoutes allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoutes>
        ) 
      }
      ]  
    }
]

export default routes