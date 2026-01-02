import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });

      if (res.data.token) {
        login(res.data.token);
        navigate("/games");
      } else {
        alert("Invalid login response");
        setIsLoading(false);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed!");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <svg
          width="80px"
          height="80px"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <rect
              width="48"
              height="48"
              fill="white"
              fill-opacity="0.01"
            ></rect>
            <path
              d="M36 15C38.7614 15 41 12.7614 41 10C41 7.23858 38.7614 5 36 5C33.2386 5 31 7.23858 31 10C31 12.7614 33.2386 15 36 15Z"
              fill="#2F88FF"
              stroke="#ffffff"
              stroke-width="4"
            ></path>
            <path
              d="M12 16.7691L20.0031 13.998L31 19.2466L20.0031 27.4442L31 34.6834L24.0083 43.998"
              stroke="#ffffff"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
            <path
              d="M35.3198 21.6434L38.0015 23.1018L43.9998 17.4658"
              stroke="#ffffff"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
            <path
              d="M16.849 31.5454L13.8793 35.4572L4.00391 40.9964"
              stroke="#ffffff"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </g>
        </svg>

        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-white">
          Sign in to your account
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:outline-indigo-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full rounded-md bg-white/5 px-3 py-2 text-white outline outline-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:outline-indigo-500"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2 font-semibold text-white hover:bg-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing..." : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-400">
          Not a member?{" "}
          <a
            href="/register"
            className="font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
