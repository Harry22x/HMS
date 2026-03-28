import { createContext, useContext, useState, useEffect } from "react";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  


  const checkSession = async (token) => {
    try {
      const response = await fetch("/api/check_session", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        //console.log(userData)
        return userData;
      }
      logout();
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email,password) => {
    try{

const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }
  
      const responseData = await response.json();
      const token = responseData.access_token; 
  
      if (token) {
        localStorage.setItem("jwt", token); 
        const userdata = await checkSession(token);  
        await userdata
        //console.log(userdata)
        return true

        //userdata.role == "Organizer" ? (navigate('/organizer-dashboard')) :(navigate("/"))
        //navigate("/");
      }
    }

    catch(error){
        console.error("Login error:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) checkSession(token);
    else setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, checkSession, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// This is the "useAuth" hook you've heard about!
export const useAuth = () => useContext(AuthContext);