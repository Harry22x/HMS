import Homepage from "./Pages/HomePage";
import App from "./App";

const routes = [
    {path:"/",
      element:<App/>,
      children:[
        {path:"/",
            element:<Homepage/>
        }
      ]  
    }
]

export default routes