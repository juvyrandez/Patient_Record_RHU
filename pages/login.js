import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    const storedUser = localStorage.getItem("fullname");
    if (storedUser) {
      const userType = localStorage.getItem("usertype");
      redirectToDashboard(userType);
    }
  }, []);

  const redirectToDashboard = (userType) => {
    switch(userType) {
      case 'admin':
        router.push("/admin_dashboard");
        break;
      case 'staff':
        router.push("/staff_dashboard");
        break;
      case 'bhw':
        router.push("/bhw_dashboard");
        break;
      case 'doctor':
        router.push("/doctor_dashboard");
        break;
      default:
        router.push("/");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("fullname", data.fullname);
      localStorage.setItem("usertype", data.usertype);
      redirectToDashboard(data.usertype);
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700">
      <div className="bg-white flex shadow-xl rounded-lg overflow-hidden w-[900px]">
        {/* Left Section */}
        <div className="w-1/2 p-8 flex flex-col items-center justify-center bg-gradient-to-b from-white-50 to-white-100">
          <div className="flex items-center justify-center space-x-6 mb-8">
            <img 
              src="/images/rhulogo.jpg" 
              alt="RHU Logo" 
              className="w-32 h-32 object-contain" 
            />
            <img 
              src="/images/ourlogo.png" 
              alt="Healthtrack Logo" 
              className="w-36 h-auto object-contain"
            />
          </div>
          <p className="text-center text-sm text-gray-700 px-4">
            Healthtrack: Enhancing Patient Record Management, Disease Analytics, 
            and Barangay-Specific Reporting with Offline Capabilities for Rural 
            Health Unit (RHU) Balingasag.
          </p>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-1/2 p-10 bg-white">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Login to Your Account</h2>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4 p-2 bg-red-50 rounded">
              {error}
            </p>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-black w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-black w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiFillEyeInvisible size={22} /> : <AiFillEye size={22} />}
              </button>
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="rememberMe" 
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
            >
              LOGIN
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-green-600 hover:text-green-800 font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}