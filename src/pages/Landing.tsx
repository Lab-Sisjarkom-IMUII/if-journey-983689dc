import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Zap, Heart, Scale, ArrowRight, Check, Download } from "lucide-react";
import heroImage from "@/assets/hero-illustration.png";
import { useState, useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  const benefits = [
    {
      icon: Scale,
      title: "Kontrol Berat Badan",
      description: "Puasa intermiten membantu tubuh membakar lemak secara efektif.",
    },
    {
      icon: Zap,
      title: "Energi Stabil",
      description: "Rasakan energi yang lebih konsisten sepanjang hari.",
    },
    {
      icon: Heart,
      title: "Kesehatan Metabolik",
      description: "Tingkatkan sensitivitas insulin dan kesehatan jantung.",
    },
  ];

  const methods = [
    { name: "12:12", fasting: "12 jam", eating: "12 jam", level: "Pemula" },
    { name: "16:8", fasting: "16 jam", eating: "8 jam", level: "Populer" },
    { name: "18:6", fasting: "18 jam", eating: "6 jam", level: "Menengah" },
    { name: "20:4", fasting: "20 jam", eating: "4 jam", level: "Lanjutan" },
  ];

  return (
    <div className="min-h-screen gradient-soft">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">IFJourney</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="hidden sm:flex">
                Masuk
              </Button>
              <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
                <span className="hidden sm:inline">Daftar Gratis</span>
                <span className="sm:hidden">Daftar</span>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 animate-fade-in text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-light text-emerald-dark text-sm font-medium">
              <Zap className="w-4 h-4" />
              Mulai perjalanan sehatmu
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              IFJourney – Mulai{" "}
              <span className="text-gradient">Intermittent Fasting</span> Anda
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Temukan cara sehat untuk mengontrol berat badan dengan panduan IF yang dipersonalisasi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button variant="hero" size="lg" onClick={() => navigate("/auth")} className="w-full sm:w-auto">
                Mulai Sekarang
                <ArrowRight className="w-5 h-5" />
              </Button>
              {showInstallBtn && (
                <Button variant="outline" size="lg" onClick={handleInstall} className="w-full sm:w-auto">
                  <Download className="w-5 h-5" />
                  Install App
                </Button>
              )}
            </div>
          </div>
          <div className="relative animate-float order-first lg:order-last">
            <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl rounded-full" />
            <img
              src={heroImage}
              alt="Intermittent Fasting Illustration"
              className="relative w-full max-w-sm mx-auto lg:max-w-lg rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* What is IF Section */}
      <section className="py-12 md:py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Apa itu Intermittent Fasting?
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Intermittent Fasting (IF) adalah pola makan yang bergantian antara periode puasa dan makan. 
              Bukan tentang <em>apa</em> yang Anda makan, tapi <em>kapan</em> Anda makan.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Manfaat Intermittent Fasting
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              Rasakan perubahan positif dalam hidup Anda
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} variant="elevated" className="group hover:border-primary/30 active:scale-[0.98] transition-all">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Methods Section */}
      <section className="py-12 md:py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Pilih Metode Puasa Anda
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              Berbagai metode untuk setiap level
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {methods.map((method, index) => (
              <Card key={index} variant="elevated" className="hover:border-primary/30 active:scale-[0.98] transition-all">
                <CardContent className="p-4 md:p-6 text-center space-y-3">
                  <div className="text-2xl sm:text-3xl font-bold text-gradient">{method.name}</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-muted-foreground">Puasa: {method.fasting}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <span className="text-muted-foreground">Makan: {method.eating}</span>
                    </div>
                  </div>
                  <span className="inline-block px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                    {method.level}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Fitur Lengkap
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 md:gap-4 max-w-3xl mx-auto">
            {[
              "Timer puasa dengan notifikasi",
              "Tracking kalori harian",
              "Rekomendasi workout AI",
              "Dashboard mingguan",
              "Kalkulasi BMR otomatis",
              "Riwayat progress",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-card border border-border/50 active:scale-[0.98] transition-all">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm sm:text-base text-foreground font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Card variant="gradient" className="overflow-hidden">
            <div className="relative p-8 md:p-12 text-center">
              <div className="absolute inset-0 gradient-primary opacity-10" />
              <div className="relative space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Siap Memulai?
                </h2>
                <p className="text-base text-muted-foreground max-w-md mx-auto">
                  Bergabunglah dan mulai transformasi kesehatan Anda
                </p>
                <Button variant="hero" size="lg" onClick={() => navigate("/auth")} className="w-full sm:w-auto">
                  Mulai Gratis!
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-border safe-area-bottom">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground text-sm">IFJourney</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              © 2025 IFJourney. Mulai hidup sehat dengan IF.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
