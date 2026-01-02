import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      {isLoggedIn && (
        <img src="logo.png" alt="Sports Logo" className="h-20 w-30" />
      )}

      {!isAuthPage && (
        <div className="flex gap-4">
       
        

          {isLoggedIn && (
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="bg-red-500 px-3 py-1 rounded cursor-pointer"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
