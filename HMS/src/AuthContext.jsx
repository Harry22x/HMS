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
        return userData;
      }
      logout();
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const parseResponse = async (response) => {
    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message = data?.error || data?.message || response.statusText || "Request failed";
      throw new Error(message);
    }

    return data;
  };

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await parseResponse(response);
      const token = responseData.access_token;

      if (token) {
        localStorage.setItem("jwt", token);
        await checkSession(token);
        return { success: true };
      }

      return { success: false, errorMessage: "Login failed" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, errorMessage: error.message || "Login failed" };
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

  const signup = async (full_name, email, password, role) => {
    try {
      const response = await fetch('http://127.0.0.1:5555/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, email, password, role })
      });

      const responseData = await parseResponse(response);
      const token = responseData.access_token;
      localStorage.setItem('jwt', token);
      await checkSession(token);
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, errorMessage: error.message || "Signup failed" };
    }
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, checkSession, loading, signup }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);