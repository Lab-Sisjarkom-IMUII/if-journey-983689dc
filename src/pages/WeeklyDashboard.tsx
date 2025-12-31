import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Flame, Dumbbell, Clock, Utensils } from "lucide-react";
import { getLoggedInUser, getProfile, getMealPlan, getWorkouts, getFastingSession, Profile, MealEntry, WorkoutEntry, FastingSession } from "@/lib/storage";

interface DayData {
  date: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  meals: MealEntry[];
  workouts: WorkoutEntry[];
  fasting: FastingSession | null;
  totalCalories: number;
  totalBurned: number;
}

const WeeklyDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [userEmail, setUserEmail] = useState("");

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

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
    setUserEmail(user.email);
  }, [navigate]);

  // State untuk menyimpan tanggal yang dipilih (format YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Load week data
  useEffect(() => {
    if (!userEmail) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const week: DayData[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const meals = getMealPlan(userEmail, dateStr);
      const workouts = getWorkouts(userEmail, dateStr);
      
      let fasting: FastingSession | null = null;
      if (dateStr === todayStr) {
        fasting = getFastingSession(userEmail);
      }

      week.push({
        date: dateStr,
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        isToday: dateStr === todayStr,
        meals,
        workouts,
        fasting,
        totalCalories: meals.reduce((sum, m) => sum + m.calories, 0),
        totalBurned: workouts.reduce((sum, w) => sum + w.caloriesBurned, 0),
      });
    }

    setWeekData(week);

    // Set default selected date jika belum ada atau tanggal tidak ada di minggu ini
    if (!selectedDate || !week.find(d => d.date === selectedDate)) {
      const todayData = week.find(d => d.isToday);
      setSelectedDate(todayData ? todayData.date : week[0].date);
    }
  }, [userEmail, currentWeekStart, selectedDate]);

  // Dapatkan selectedDay berdasarkan selectedDate
  const selectedDay = weekData.find(d => d.date === selectedDate) || null;

  // Handler untuk memilih hari
  const handleDaySelect = (day: DayData) => {
    setSelectedDate(day.date);
  };

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const formatWeekRange = () => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    
    const startMonth = currentWeekStart.toLocaleDateString('id-ID', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('id-ID', { month: 'short' });

    if (startMonth === endMonth) {
      return `${currentWeekStart.getDate()} - ${endDate.getDate()} ${startMonth}`;
    }
    return `${currentWeekStart.getDate()} ${startMonth} - ${endDate.getDate()} ${endMonth}`;
  };

  const dailyCalorieLimit = profile ? Math.round(profile.bmr * 1.2) : 2000;

  return (
    <div className="min-h-screen gradient-soft pb-6">
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="h-9 w-9">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-base font-bold text-foreground">Dashboard Mingguan</h1>
              <p className="text-xs text-muted-foreground">Pantau progress IF Anda</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-4">
        {/* Week Navigation */}
        <Card variant="elevated">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={goToPreviousWeek} className="h-9 w-9">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-sm font-semibold text-foreground">{formatWeekRange()}</h2>
              <Button variant="ghost" size="icon" onClick={goToNextWeek} className="h-9 w-9">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Week Calendar - Horizontal Scroll on Mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {weekData.map((day) => (
            <Card
              key={day.date}
              variant={selectedDay?.date === day.date ? "highlight" : day.isToday ? "elevated" : "default"}
              className={`cursor-pointer transition-all active:scale-95 flex-shrink-0 min-w-[52px] ${
                selectedDay?.date === day.date ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleDaySelect(day)}
            >
              <CardContent className="p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground">{day.dayName}</p>
                <p className={`text-lg font-bold ${day.isToday ? 'text-primary' : 'text-foreground'}`}>
                  {day.dayNumber}
                </p>
                <div className="flex justify-center gap-0.5 mt-1">
                  {day.meals.length > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  )}
                  {day.workouts.length > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-teal" />
                  )}
                  {day.fasting && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {(() => {
                // Parse tanggal dengan benar untuk menghindari masalah timezone
                const [year, month, day] = selectedDay.date.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                return date.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                });
              })()}
            </h3>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-2">
              <Card variant="glass" className="p-3 text-center">
                <Utensils className="w-5 h-5 mx-auto mb-1 text-accent" />
                <p className="text-xl font-bold text-foreground">{selectedDay.totalCalories}</p>
                <p className="text-[10px] text-muted-foreground">Kalori Masuk</p>
              </Card>
              <Card variant="glass" className="p-3 text-center">
                <Flame className="w-5 h-5 mx-auto mb-1 text-destructive" />
                <p className="text-xl font-bold text-foreground">{selectedDay.totalBurned}</p>
                <p className="text-[10px] text-muted-foreground">Kalori Terbakar</p>
              </Card>
              <Card variant="glass" className="p-3 text-center">
                <Dumbbell className="w-5 h-5 mx-auto mb-1 text-teal" />
                <p className="text-xl font-bold text-foreground">{selectedDay.workouts.length}</p>
                <p className="text-[10px] text-muted-foreground">Sesi Workout</p>
              </Card>
              <Card variant="glass" className="p-3 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xl font-bold text-foreground">
                  {selectedDay.fasting ? selectedDay.fasting.method : '-'}
                </p>
                <p className="text-[10px] text-muted-foreground">Metode Puasa</p>
              </Card>
            </div>

            {/* Calorie Balance */}
            <Card variant="elevated">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm">Keseimbangan Kalori</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-center justify-between gap-1 p-3 rounded-xl bg-muted/50 text-center">
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground">Batas</p>
                    <p className="text-base font-bold text-foreground">{dailyCalorieLimit}</p>
                  </div>
                  <span className="text-muted-foreground">-</span>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground">Masuk</p>
                    <p className="text-base font-bold text-accent">{selectedDay.totalCalories}</p>
                  </div>
                  <span className="text-muted-foreground">+</span>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground">Bakar</p>
                    <p className="text-base font-bold text-teal">{selectedDay.totalBurned}</p>
                  </div>
                  <span className="text-muted-foreground">=</span>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground">Sisa</p>
                    <p className={`text-base font-bold ${
                      dailyCalorieLimit - selectedDay.totalCalories + selectedDay.totalBurned >= 0
                        ? 'text-primary'
                        : 'text-destructive'
                    }`}>
                      {dailyCalorieLimit - selectedDay.totalCalories + selectedDay.totalBurned}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meals List */}
            {selectedDay.meals.length > 0 && (
              <Card variant="elevated">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-accent" />
                    Catatan Makanan
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {selectedDay.meals.map((meal) => (
                      <div
                        key={meal.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm truncate">{meal.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(meal.timestamp).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-foreground ml-2">{meal.calories} kal</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Workouts List */}
            {selectedDay.workouts.length > 0 && (
              <Card variant="elevated">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-teal" />
                    Riwayat Workout
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2">
                    {selectedDay.workouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm">{workout.type}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {workout.duration} menit • {new Date(workout.completedAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-teal ml-2">{workout.caloriesBurned} kal</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {selectedDay.meals.length === 0 && selectedDay.workouts.length === 0 && !selectedDay.fasting && (
              <Card variant="glass" className="p-6 text-center">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">Belum ada aktivitas pada hari ini.</p>
              </Card>
            )}
          </div>
        )}

        {/* Back Button */}
        <Button variant="outline" className="w-full h-11" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </Button>
      </main>
    </div>
  );
};

export default WeeklyDashboard;
