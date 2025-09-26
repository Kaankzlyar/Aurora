import React, { useState } from "react";
import { Navigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ShinyText from "@/components/ShinyText";
import SilkBackground from "@/components/SilkBackground";
import TextType from "@/components/TextType";
import PageTransition from "@/components/PageTransition";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email, password });
      toast.success("Login successful!");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-black flex items-center justify-center">
      {/* Silk Background - Full Screen with Loading */}
      <SilkBackground
        speed={5}
        scale={1}
        color="#C48913"
        noiseIntensity={1.5}
        rotation={0}
      />

      {/* Login Form with Page Transition */}
      <PageTransition>
        <div className="relative z-10 w-full max-w-none px-4">
          <div className="mx-auto w-full max-w-4xl">
          <Card
            className="
      w-[400px]
      bg-gradient-to-b from-white/10 to-white/5           
      border border-white/10    
      rounded-2xl
      shadow-2xl
      backdrop-blur-xl          
      supports-[backdrop-filter]:bg-white/5
      transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl
          "
          >
          <CardHeader className="text-center space-y-4 px-8 py-6">
            <ShinyText
              text="Aurora Admin"
              disabled={false}
              speed={3}
              className="text-4xl font-['Cinzel'] text-[#FFFFFF]"
            />
            <TextType
              text={[
                "Welcome to Aurora Admin Panel",
                "Manage your eCommerce with ease",
                "Secure and Reliable",
                "Happy managing!",
              ]}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="|"
              className="text-[#C48913] text-lg font-medium"
              style={{
                fontFamily: "Montserrat",
                fontWeight: 500,
                letterSpacing: "0.02em",
                fontSize: "14px",
              }}
            />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/20 border-[#C48913]/30 text-white placeholder:text-[#ADADAD]/50 focus:border-[#C48913] focus:ring-[#C48913]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/20 border-[#C48913]/30 text-white placeholder:text-[#ADADAD]/50 focus:border-[#C48913] focus:ring-[#C48913]/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#C48913] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#C48913] text-black font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg focus:ring-2 focus:ring-[#C48913] focus:ring-offset-black hover:border-[#C48913] focus:border-[#C48913] hover:scale-[1.02] hover:shadow-xl transform"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-white/70">Don't have an account? </span>
                <Link 
                  to="/register" 
                  className="text-[#C48913] hover:text-[#D4AF37] underline underline-offset-4 transition-all duration-300 hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
          </div>
      </div>
    </PageTransition>
    </div>
  );
};

export default Login;
