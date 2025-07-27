import { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

export default function Signup() {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullname, username, email, password, usertype: "staff" }), // Default "staff"
    });

    const data = await res.json();
    res.ok ? alert("Signup successful!") : setError(data.message);
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/bgimg.png')" }}
    >
      <div className="bg-white flex shadow-lg rounded-md overflow-hidden w-[800px]">
        {/* Left Section */}
        <div className="mt-15 w-1/2 p-8 flex flex-col items-center">
          <img src="/images/rhulogo.jpg" alt="Healthtrack Logo" className="w-32 h-32 mb-4" />
          <p className="text-center text-sm text-black">
            Join Healthtrack to manage patient records and analytics efficiently.
          </p>
        </div>

        {/* Right Section - Signup Form */}
        <div className="w-1/2 p-8 bg-white text-black">
          <h2 className="text-lg font-semibold text-center mb-6">Create an Account</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form className="space-y-4" onSubmit={handleSignup}>
            <input 
              type="text" placeholder="Full Name" 
              value={fullname} onChange={(e) => setFullname(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-black"
              required
            />
            <input 
              type="text" placeholder="Username" 
              value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-black"
              required
            />
            <input 
              type="email" placeholder="Email" 
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-black"
              required
            />
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-black pr-10"
                required
              />
              <span 
                className="absolute right-3 top-3 cursor-pointer text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiFillEyeInvisible size={22} /> : <AiFillEye size={22} />}
              </span>
            </div>

            <button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
            >
              SIGN UP
            </button>
          </form>
          <p className="text-sm text-center mt-4">
            Already have an account? <a href="/login" className="text-blue-600">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
