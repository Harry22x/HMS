import Homepage from "./Pages/HomePage";
import App from "./App";
import Login from "./Pages/Login";

const routes = [
    {path:"/",
      element:<App/>,
      children:[
        {path:"/",
            element:<Homepage/>
        },
        {path:"login",
            element:<Login/>
        }
      ]  
    }
]

export default routes