import Homepage from "./Pages/HomePage";
import App from "./App";
import Login from "./Pages/Login";
import HostelPage from "./Pages/HostelPage";
import SignUpPage from "./Pages/SignUpPage";
import ManagerDashboard from "./Pages/ManagerDashboard";

const routes = [
    {path:"/",
      element:<App/>,
      children:[
        {path:"/",element:<Homepage/>},
        {path:"login",element:<Login/>},
        {path:"hostels/:id",element:<HostelPage/>},
        {path:"signup",element:<SignUpPage/>},
        {path:"manager-dashboard",element:<ManagerDashboard/>}

      ]  
    }
]

export default routes