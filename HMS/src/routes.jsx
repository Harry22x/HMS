import Homepage from "./Pages/HomePage";
import App from "./App";
import Login from "./Pages/Login";
import HostelPage from "./Pages/HostelPage";
import SignUpPage from "./Pages/SignUpPage";

const routes = [
    {path:"/",
      element:<App/>,
      children:[
        {path:"/",element:<Homepage/>},
        {path:"login",element:<Login/>},
        {path:"hostels/:id",element:<HostelPage/>},
        {path:"/signup",element:<SignUpPage/>},
      ]  
    }
]

export default routes