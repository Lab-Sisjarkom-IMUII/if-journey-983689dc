import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, Flame, Dumbbell, Clock } from "lucide-react";
import { getLoggedInUser, getProfile, getMealPlan, getWorkouts, getFastingSession, getTodayDate, Profile } from "@/lib/storage";

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  message: string;
  icon: React.ReactNode;
}

const Insight = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const user = getLoggedInUser();
    if (!user.isLoggedIn) {
      navigate("/auth");
      return;
    }

    const userProfile = getProfile(user.email);
    if (!userProfile) {
      navigate("/dashboard");
      return;
    }

    setProfile(userProfile);
    generateInsights(user.email, userProfile);
  }, [navigate]);

  const generateInsights = (email: string, userProfile: Profile) => {
    const today = getTodayDate();
    const todayMeals = getMealPlan(email, today);
    const todayWorkouts = getWorkouts(email, today);
    const fastingSession = getFastingSession(email);

    const dailyCalorieLimit = Math.round(userProfile.bmr * 1.2);
    const totalCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
    const totalWorkoutCalories = todayWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);

    const newInsights: Insight[] = [];

    // Calorie insights
    if (totalCalories > dailyCalorieLimit) {
      newInsights.push({
        id: 'calorie_over',
        type: 'warning',
        title: 'Batas Kalori Terlampaui',
        message: `Total kalori hari ini (${totalCalories} kal) melebihi batas harian Anda (${dailyCalorieLimit} kal). Tambah aktivitas fisik atau kurangi asupan.`,
        icon: <AlertTriangle className="w-5 h-5" />,
      });
    } else if (totalCalories > 0 && totalCalories <= dailyCalorieLimit * 0.8) {
      newInsights.push({
        id: 'calorie_good',
        type: 'success',
        title: 'Asupan Kalori Terkontrol',
        message: `Bagus! Anda masih memiliki ${dailyCalorieLimit - totalCalories} kalori tersisa untuk hari ini.`,
        icon: <CheckCircle className="w-5 h-5" />,
      });
    }

    // Workout insights
    if (todayWorkouts.length === 0) {
      let weeklyWorkouts = 0;
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const workouts = getWorkouts(email, dateStr);
        weeklyWorkouts += workouts.length;
      }

      if (weeklyWorkouts === 0) {
        newInsights.push({
          id: 'no_workout_week',
          type: 'warning',
          title: 'Belum Ada Workout Minggu Ini',
          message: 'Aktivitas fisik sangat penting untuk kesehatan. Mulai dengan latihan ringan 30 menit!',
          icon: <Dumbbell className="w-5 h-5" />,
        });
      } else {
        newInsights.push({
          id: 'no_workout_today',
          type: 'info',
          title: 'Belum Workout Hari Ini',
          message: `Anda sudah ${weeklyWorkouts}x workout minggu ini. Tambah satu lagi hari ini!`,
          icon: <Dumbbell className="w-5 h-5" />,
        });
      }
    } else {
      newInsights.push({
        id: 'workout_done',
        type: 'success',
        title: 'Workout Selesai!',
        message: `Luar biasa! ${todayWorkouts.length}x workout hari ini, ${totalWorkoutCalories} kalori terbakar.`,
        icon: <Flame className="w-5 h-5" />,
      });
    }

    // Fasting insights
    if (fastingSession) {
      if (fastingSession.status === 'completed') {
        newInsights.push({
          id: 'fasting_complete',
          type: 'success',
          title: 'Puasa Selesai!',
          message: `Selamat menyelesaikan puasa ${fastingSession.method}. Saatnya makan bergizi!`,
          icon: <CheckCircle className="w-5 h-5" />,
        });
      } else if (fastingSession.status === 'active') {
        newInsights.push({
          id: 'fasting_active',
          type: 'info',
          title: 'Puasa Sedang Berjalan',
          message: `Sedang menjalani puasa ${fastingSession.method}. Tetap semangat & minum air putih!`,
          icon: <Clock className="w-5 h-5" />,
        });
      } else if (fastingSession.status === 'paused') {
        newInsights.push({
          id: 'fasting_paused',
          type: 'warning',
          title: 'Puasa Dijeda',
          message: 'Lanjutkan puasa untuk mendapatkan manfaat optimal dari IF.',
          icon: <Clock className="w-5 h-5" />,
        });
      }
    } else {
      newInsights.push({
        id: 'no_fasting',
        type: 'tip',
        title: 'Mulai Puasa IF',
        message: 'Belum memulai puasa hari ini. IF membantu kontrol berat badan & metabolisme.',
        icon: <Lightbulb className="w-5 h-5" />,
      });
    }

    // Tips
    const tips = [
      {
        id: 'tip_water',
        type: 'tip' as const,
        title: 'Tips Hidrasi',
        message: 'Minum minimal 8 gelas air putih per hari untuk metabolisme optimal.',
        icon: <Lightbulb className="w-5 h-5" />,
      },
      {
        id: 'tip_sleep',
        type: 'tip' as const,
        title: 'Tips Tidur',
        message: 'Tidur 7-8 jam per malam untuk regulasi hormon lapar.',
        icon: <Lightbulb className="w-5 h-5" />,
      },
      {
        id: 'tip_protein',
        type: 'tip' as const,
        title: 'Tips Protein',
        message: 'Konsumsi protein yang cukup untuk mempertahankan massa otot.',
        icon: <Lightbulb className="w-5 h-5" />,
      },
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    newInsights.push(randomTip);

    setInsights(newInsights);
  };

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-primary/10 border-primary/30 text-primary';
      case 'warning':
        return 'bg-destructive/10 border-destructive/30 text-destructive';
      case 'info':
        return 'bg-teal/10 border-teal/30 text-teal';
      case 'tip':
        return 'bg-accent/10 border-accent/30 text-accent';
      default:
        return 'bg-muted border-border text-foreground';
    }
  };

  return (
    <div className="min-h-screen gradient-soft pb-6">
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="h-9 w-9">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-base font-bold text-foreground">AI Insight</h1>
              <p className="text-xs text-muted-foreground">Analisis perjalanan IF Anda</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-4">
        {/* Header Card */}
        <Card variant="elevated" className="overflow-hidden">
          <div className="gradient-primary p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-primary-foreground">
                <h2 className="text-base font-bold">Analisis Harian</h2>
                <p className="text-primary-foreground/80 text-xs">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            {profile && (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-bold text-foreground">{profile.bmr}</p>
                  <p className="text-[10px] text-muted-foreground">BMR (kal)</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{Math.round(profile.bmr * 1.2)}</p>
                  <p className="text-[10px] text-muted-foreground">TDEE (kal)</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{profile.weight}</p>
                  <p className="text-[10px] text-muted-foreground">BB (kg)</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Insight Anda
          </h3>

          {insights.map((insight) => (
            <Card
              key={insight.id}
              className={`border-l-4 ${getInsightStyle(insight.type)}`}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getInsightStyle(insight.type)} flex-shrink-0`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm mb-0.5">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Back Button */}
        <Button variant="outline" className="w-full h-11" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </Button>
      </main>
    </div>
  );
};

export default Insight;
