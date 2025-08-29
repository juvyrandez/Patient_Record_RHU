import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { FaTimes, FaLock, FaUser, FaSpinner } from "react-icons/fa";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Pre-fill username from cookie if rememberMe was checked
    const cookies = document.cookie.split(';');
    const rememberedUsername = cookies.find(cookie => cookie.trim().startsWith('rememberedUsername='));
    
    if (rememberedUsername) {
      const usernameValue = rememberedUsername.split('=')[1];
      setUsername(decodeURIComponent(usernameValue));
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include" // Important for cookies
      });

      const data = await res.json();

      if (res.ok) {
        // Set remember me cookie if needed
        if (rememberMe) {
          document.cookie = `rememberedUsername=${encodeURIComponent(username)}; max-age=${60 * 60 * 24 * 30}; path=/`;
        } else {
          document.cookie = "rememberedUsername=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        
        // Redirect based on user type
        switch (data.usertype) {
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
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");

    if (!forgotEmail) {
      setForgotError("Please enter your email address.");
      return;
    }

    // Simulate sending a password reset email
    setTimeout(() => {
      setForgotEmail("");
      setIsForgotPasswordOpen(false);
      alert("A password reset link has been sent to your email. Please check your inbox.");
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 p-4">
      <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row transform transition-all duration-500 hover:scale-[1.01]">
        {/* Left Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50/80 to-gray-100/80 relative">
          <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10 bg-repeat"></div>
          <div className="flex items-center justify-center space-x-6 mb-6 z-10">
            <img 
              src="/images/rhulogo.jpg" 
              alt="RHU Logo" 
              className="w-28 h-28 object-contain rounded-full shadow-md transform hover:scale-105 transition-transform duration-300" 
            />
            <img 
              src="/images/ourlogo.png" 
              alt="Healthtrack Logo" 
              className="w-32 h-auto object-contain transform hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Patient Record RHU</h3>
          <p className="text-center text-sm text-gray-600 px-6 leading-relaxed">
            Patient Records and Referral Management System with an Artificial Intelligence Approach for Intelligent Diagnosis Path Based on Patient Chief Complaints for the Rural Health Unit of Balingasag
          </p>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 bg-white/95">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 tracking-tight">Welcome Back</h2>

          {error && (
            <div className="text-red-500 text-sm text-center mb-6 p-3 bg-red-50 rounded-lg border border-red-200 animate-pulse">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 pl-12 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm transition-all duration-300 text-gray-800 placeholder-gray-400"
                required
                disabled={isLoading}
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                <FaUser className="w-5 h-5" />
              </span>
            </div>
            
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pl-12 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm transition-all duration-300 text-gray-800 placeholder-gray-400"
                required
                disabled={isLoading}
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                <FaLock className="w-5 h-5" />
              </span>
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <AiFillEyeInvisible size={22} /> : <AiFillEye size={22} />}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="rememberMe" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-green-600 hover:text-green-800 font-medium hover:underline"
                onClick={() => setIsForgotPasswordOpen(true)}
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-green-600 hover:text-green-800 font-medium hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md p-8 relative transform transition-all duration-300 scale-100 hover:scale-[1.02]">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setIsForgotPasswordOpen(false)}
              disabled={isLoading}
            >
              <FaTimes size={20} />
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Reset Your Password</h3>
            {forgotError && (
              <div className="text-red-500 text-sm text-center mb-4 p-2 bg-red-50 rounded-lg border border-red-200">
                {forgotError}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleForgotPassword}>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full p-4 pl-12 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm transition-all duration-300 text-gray-800 placeholder-gray-400"
                  required
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <FaUser className="w-5 h-5" />
                </span>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Send Reset Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}