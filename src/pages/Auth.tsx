import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Clock, Mail, Lock, User, ArrowLeft, Chrome } from "lucide-react";
import { findUser, saveUser, setLoggedInUser, validateLogin } from "@/lib/storage";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = validateLogin(email, password);
      if (user) {
        setLoggedInUser(user.email, user.name);
        toast({
          title: "Berhasil masuk!",
          description: `Selamat datang kembali, ${user.name}!`,
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Gagal masuk",
          description: "Email atau password salah.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if user already exists
      if (findUser(email)) {
        toast({
          title: "Registrasi gagal",
          description: "Email sudah terdaftar. Silakan login.",
          variant: "destructive",
        });
        return;
      }

      // Validate inputs
      if (!name.trim()) {
        toast({
          title: "Registrasi gagal",
          description: "Nama lengkap wajib diisi.",
          variant: "destructive",
        });
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Registrasi gagal",
          description: "Password minimal 6 karakter.",
          variant: "destructive",
        });
        return;
      }

      // Save new user
      saveUser({
        email: email.toLowerCase(),
        password,
        name: name.trim(),
        createdAt: new Date().toISOString(),
      });

      setLoggedInUser(email.toLowerCase(), name.trim());
      
      toast({
        title: "Registrasi berhasil!",
        description: `Selamat datang, ${name}! Silakan lengkapi profil Anda.`,
      });
      
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Simulate Google login with a mock account
    const googleEmail = `user${Date.now()}@gmail.com`;
    const googleName = "Google User";

    let user = findUser(googleEmail);
    if (!user) {
      saveUser({
        email: googleEmail,
        password: "google-auth",
        name: googleName,
        createdAt: new Date().toISOString(),
      });
    }

    setLoggedInUser(googleEmail, googleName);
    toast({
      title: "Berhasil masuk dengan Google!",
      description: `Selamat datang, ${googleName}!`,
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen gradient-soft flex flex-col safe-area-inset">
      {/* Header */}
      <header className="container mx-auto px-4 py-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md animate-scale-in">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-3">
              <Clock className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">IFJourney</h1>
            <p className="text-sm text-muted-foreground">Mulai perjalanan IF Anda</p>
          </div>

          <Card variant="elevated">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">{isLogin ? "Masuk" : "Daftar"}</CardTitle>
              <CardDescription className="text-sm">
                {isLogin
                  ? "Masuk ke akun Anda untuk melanjutkan"
                  : "Buat akun baru untuk memulai"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button type="submit" variant="hero" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">atau</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={handleGoogleLogin}
              >
                <Chrome className="w-4 h-4 mr-2" />
                {isLogin ? "Masuk" : "Daftar"} dengan Google
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
                </span>
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-medium hover:underline"
                >
                  {isLogin ? "Daftar sekarang" : "Masuk"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;
