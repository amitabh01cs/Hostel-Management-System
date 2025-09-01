import { useLocation } from "wouter";

const LoginButton = () => {
  const [, navigate] = useLocation();
  
  return (
    <button 
      onClick={() => navigate("/login")}
      className="inline-block bg-black text-white py-3 px-12 text-lg font-medium rounded hover:bg-neutral-800 transition duration-300 shadow-md"
    >
      LOGIN
    </button>
  );
};

export default LoginButton;
