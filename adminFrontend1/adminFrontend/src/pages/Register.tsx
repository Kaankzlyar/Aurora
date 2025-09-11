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

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user, register } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      toast.success("Registration successful! Welcome Admin!");
      // Kullanıcı otomatik login olacak, dashboard'a yönlendirilecek
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
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

      {/* Register Form with Page Transition */}
      <PageTransition>
        <div className="relative z-10 w-full max-w-lg px-4">
          <Card
            className="
      w-full
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
              text="Create Account"
              disabled={false}
              speed={3}
              className="text-3xl font-['Cinzel'] text-[#FFFFFF]"
            />
            <TextType
              text={[
                "Join Aurora Admin Panel",
                "Start managing your eCommerce",
                "Secure and Reliable",
                "Welcome aboard!",
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
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white text-sm">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="bg-black/20 border-[#C48913]/30 text-white placeholder:text-[#ADADAD]/50 focus:border-[#C48913] focus:ring-[#C48913]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white text-sm">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="bg-black/20 border-[#C48913]/30 text-white placeholder:text-[#ADADAD]/50 focus:border-[#C48913] focus:ring-[#C48913]/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-black/20 border-[#C48913]/30 text-white placeholder:text-[#ADADAD]/50 focus:border-[#C48913] focus:ring-[#C48913]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="bg-black/20 border-[#C48913]/30 text-white placeholder:text-[#ADADAD]/50 focus:border-[#C48913] focus:ring-[#C48913]/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#C48913] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#C48913] text-black font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg focus:ring-2 focus:ring-[#C48913] focus:ring-offset-black hover:border-[#C48913] focus:border-[#C48913] hover:scale-[1.02] hover:shadow-xl transform"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-white/70">Already have an account? </span>
                <Link 
                  to="/login" 
                  className="text-[#C48913] hover:text-[#D4AF37] underline underline-offset-4 transition-all duration-300 hover:scale-105"
                >
                  Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
    </div>
  );
};

export default Register;
