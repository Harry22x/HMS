import Homepage from "./Pages/HomePage";
import App from "./App";
import Login from "./Pages/Login";
import HostelPage from "./Pages/HostelPage";

const routes = [
    {path:"/",
      element:<App/>,
      children:[
        {path:"/",element:<Homepage/>},
        {path:"login",element:<Login/>},
        {path:"hostels/:id",element:<HostelPage/>},
      ]  
    }
]

export default routes