import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, LogOut, User, Calendar, Brain, Dumbbell, Utensils, 
  Scale, Ruler, Flame, ChevronRight, Home
} from "lucide-react";
import { getLoggedInUser, getProfile, logout, Profile } from "@/lib/storage";
import ProfileModal from "@/components/ProfileModal";
import FastingTimer from "@/components/FastingTimer";
import MealPlan from "@/components/MealPlan";
import WorkoutAI from "@/components/WorkoutAI";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [activeTab, setActiveTab] = useState<'timer' | 'meal' | 'workout'>('timer');

  useEffect(() => {
    const user = getLoggedInUser();
    if (!user.isLoggedIn) {
      navigate("/auth");
      return;
    }

    setUserEmail(user.email);
    setUserName(user.name);

    const userProfile = getProfile(user.email);
    if (userProfile) {
      setProfile(userProfile);
    } else {
      setShowProfileModal(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Berhasil logout",
      description: "Sampai jumpa kembali!",
    });
    navigate("/");
  };

  const handleProfileComplete = () => {
    const userProfile = getProfile(userEmail);
    setProfile(userProfile);
    setShowProfileModal(false);
  };

  const tabs = [
    { id: 'timer', label: 'Timer', icon: Clock },
    { id: 'meal', label: 'Makan', icon: Utensils },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
  ];

  return (
    <div className="min-h-screen gradient-soft pb-20">
      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        userEmail={userEmail}
        userName={userName}
        onComplete={handleProfileComplete}
      />

      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground leading-tight">IFJourney</h1>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="h-9 w-9">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-4">
        {/* Profile Card */}
        {profile && (
          <Card variant="elevated" className="overflow-hidden">
            <div className="gradient-primary p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-primary-foreground min-w-0 flex-1">
                  <h2 className="text-lg font-bold truncate">{profile.name}</h2>
                  <p className="text-primary-foreground/80 text-sm">
                    {profile.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {profile.age} thn
                  </p>
                </div>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2.5 rounded-xl bg-muted/50">
                  <Scale className="w-4 h-4 mx-auto mb-0.5 text-primary" />
                  <p className="text-base font-bold text-foreground">{profile.weight}</p>
                  <p className="text-[10px] text-muted-foreground">kg</p>
                </div>
                <div className="text-center p-2.5 rounded-xl bg-muted/50">
                  <Ruler className="w-4 h-4 mx-auto mb-0.5 text-teal" />
                  <p className="text-base font-bold text-foreground">{profile.height}</p>
                  <p className="text-[10px] text-muted-foreground">cm</p>
                </div>
                <div className="text-center p-2.5 rounded-xl bg-muted/50">
                  <Flame className="w-4 h-4 mx-auto mb-0.5 text-accent" />
                  <p className="text-base font-bold text-foreground">{profile.bmr}</p>
                  <p className="text-[10px] text-muted-foreground">BMR</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card
            variant="elevated"
            className="p-3 cursor-pointer hover:border-primary/30 active:scale-[0.98] transition-all"
            onClick={() => navigate("/weekly")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm">Dashboard</p>
                  <p className="text-[10px] text-muted-foreground">Mingguan</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          </Card>
          <Card
            variant="elevated"
            className="p-3 cursor-pointer hover:border-teal/30 active:scale-[0.98] transition-all"
            onClick={() => navigate("/insight")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-teal" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm">AI Insight</p>
                  <p className="text-[10px] text-muted-foreground">Analisis</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          </Card>
        </div>

        {/* Tab Content */}
        {profile && (
          <div className="animate-fade-in">
            {activeTab === 'timer' && <FastingTimer userEmail={userEmail} />}
            {activeTab === 'meal' && <MealPlan userEmail={userEmail} profile={profile} />}
            {activeTab === 'workout' && <WorkoutAI userEmail={userEmail} profile={profile} />}
          </div>
        )}

        {/* Locked State */}
        {!profile && (
          <Card variant="glass" className="p-6 text-center">
            <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Profil Belum Lengkap</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Lengkapi profil untuk mengakses semua fitur.
            </p>
            <Button variant="hero" onClick={() => setShowProfileModal(true)}>
              Lengkapi Profil
            </Button>
          </Card>
        )}
      </main>

      {/* Bottom Navigation */}
      {profile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50 safe-area-bottom">
          <div className="container mx-auto px-2">
            <div className="flex items-center justify-around py-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all min-w-[72px] ${
                    activeTab === tab.id
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 mb-1 ${activeTab === tab.id ? 'text-primary' : ''}`} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              ))}
              <button
                onClick={() => navigate("/weekly")}
                className="flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all min-w-[72px] text-muted-foreground hover:text-foreground"
              >
                <Calendar className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">Mingguan</span>
              </button>
              <button
                onClick={() => navigate("/insight")}
                className="flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all min-w-[72px] text-muted-foreground hover:text-foreground"
              >
                <Brain className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">Insight</span>
              </button>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Dashboard;
