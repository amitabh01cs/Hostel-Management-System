import { useState, FormEvent } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import { Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AdminType = "Varahmihir" | "Maitreyi" | "SuperAdmin";

export default function Login() {
  const [activeTab, setActiveTab] = useState<"student" | "admin" | "security">("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminType, setAdminType] = useState<AdminType>("Varahmihir");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resetFields = () => {
    setUsername("");
    setPassword("");
    setAdminType("Varahmihir");
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!username || !password || (activeTab === "admin" && !adminType)) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    if (activeTab === "student") {
      try {
        const res = await fetch("https://hostel-backend-module-production-iist.up.railway.app/api/student/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: username,
            password: password,
          }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok && data.success) {
          localStorage.setItem(
            "studentUser",
            JSON.stringify({
              studentId: data.studentId,
              name: data.full_name,
              email: data.email,
              mobile: data.mobile_no,
              course: data.course,
              room: data.room,
            })
          );
          toast({
            title: "Success",
            description: data.message || "You have been logged in successfully",
          });
          window.location.href = `/student/dashboard`;
        } else {
          toast({
            title: "Login Failed",
            description: data.message || "Invalid email/mobile or password",
            variant: "destructive",
          });
        }
      } catch (error) {
        setLoading(false);
        toast({
          title: "Error",
          description: "Server error, please try again later",
          variant: "destructive",
        });
      }
    } else if (activeTab === "admin") {
      try {
        const res = await fetch("https://hostel-backend-module-production-iist.up.railway.app/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username,
            password: password,
            adminType: adminType,
          }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok && data.success) {
          toast({
            title: "Success",
            description: data.message || "You have been logged in successfully",
          });
          localStorage.setItem(
            "adminUser",
            JSON.stringify({
              adminId: data.adminId,
              name: data.name,
              email: data.email,
              mobile: data.mobile,
              adminType: data.adminType,
            })
          );
          window.location.href = "/master/dashboard";
        } else {
          toast({
            title: "Login Failed",
            description: data.message || "Invalid credentials",
            variant: "destructive",
          });
        }
      } catch (error) {
        setLoading(false);
        toast({
          title: "Error",
          description: "Server error, please try again later",
          variant: "destructive",
        });
      }
    } else if (activeTab === "security") {
      try {
        const res = await fetch("https://hostel-backend-module-production-iist.up.railway.app/api/security/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok && data.success) {
          toast({
            title: "Success",
            description: data.message || "You have been logged in successfully",
          });
          localStorage.setItem(
            "securityUser",
            JSON.stringify({
              securityId: data.securityId,
              name: data.name,
              email: data.email,
              mobile: data.mobile,
              username: data.username,
            })
          );
          window.location.href = "/security/dashboard";
        } else {
          toast({
            title: "Login Failed",
            description: data.message || "Invalid credentials",
            variant: "destructive",
          });
        }
      } catch (error) {
        setLoading(false);
        toast({
          title: "Error",
          description: "Server error, please try again later",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <Helmet>
        <title>Login - IIST-IIP-IIMR Hostel Portal</title>
        <meta
          name="description"
          content="Login to the IIST-IIP-IIMR Hostel Portal to access hostel services."
        />
      </Helmet>
      <Header />
      <div className="w-full h-px bg-neutral-300 mb-10"></div>
      <div className="max-w-md w-full mx-auto px-4">
        {/* Tabs */}
        <div className="flex mb-4 bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          {["student", "admin", "security"].map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === tab
                  ? "bg-gray-200 text-black font-bold"
                  : "text-gray-700 hover:bg-gray-100 hover:text-black"
              }`}
              onClick={() => {
                setActiveTab(tab as "student" | "admin" | "security");
                resetFields();
              }}
              type="button"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        {/* Info message */}
        <div className="mb-4 px-4 py-3 bg-gray-100 rounded-lg border border-gray-300">
          <p className="text-gray-700 font-medium">
            {activeTab === "student"
              ? "Login with your student credentials"
              : activeTab === "admin"
              ? "Administrator access only"
              : "Security personnel login"}
          </p>
        </div>
        {/* Card */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold text-center mb-6 text-gray-800">
            {activeTab === "student"
              ? "Student Login"
              : activeTab === "admin"
              ? "Admin Login"
              : "Security Login"}
          </h2>
          <form onSubmit={handleLogin}>
            {/* Admin dropdown only for admin login */}
            {activeTab === "admin" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Admin Type
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  value={adminType}
                  onChange={(e) => setAdminType(e.target.value as AdminType)}
                >
                  <option value="Varahmihir">VARAHAMIHIR</option>
                  <option value="Maitreyi">MAITREYI</option>
                  <option value="SuperAdmin">SuperAdmin</option>
                </select>
              </div>
            )}
            {/* Username */}
            <div className="mb-4">
              <div className="flex items-center border border-gray-300 rounded-md mb-1 focus-within:ring-2 focus-within:ring-primary-blue focus-within:border-primary-blue transition-all">
                <div className="p-3 border-r border-gray-300 bg-gray-50">
                  <Mail size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder={activeTab === "student" ? "Email or Mobile Number" : "Username"}
                  className="w-full p-3 outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
                {username && (
                  <div className="px-3">
                    <CheckCircle size={18} className="text-green-500" />
                  </div>
                )}
              </div>
            </div>
            {/* Password */}
            <div className="mb-6">
              <div className="flex items-center border border-gray-300 rounded-md mb-1 focus-within:ring-2 focus-within:ring-primary-blue focus-within:border-primary-blue transition-all">
                <div className="p-3 border-r border-gray-300 bg-gray-50">
                  <Lock size={18} className="text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full p-3 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="px-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {password && (
                  <div className="px-3">
                    <CheckCircle size={18} className="text-green-500" />
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button type="button" className="text-xs text-primary-blue hover:underline">
                  Forgot Password?
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-black hover:bg-gray-800 text-white py-5 h-auto font-medium text-lg shadow-lg"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Continue"}
            </button>
          </form>
          <div className="mt-6 text-center flex flex-col space-y-3">
            <button
              onClick={() => (window.location.href = "/")}
              className="text-primary-blue hover:underline text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
