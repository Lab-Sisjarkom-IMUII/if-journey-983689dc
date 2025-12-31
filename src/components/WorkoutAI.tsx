import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell, Clock, Flame, Check, Sparkles } from "lucide-react";
import { saveWorkout, getWorkouts, getTodayDate, Profile, WorkoutEntry } from "@/lib/storage";

interface WorkoutAIProps {
  userEmail: string;
  profile: Profile | null;
}

interface WorkoutRecommendation {
  id: string;
  type: string;
  icon: string;
  duration: number;
  caloriesBurned: number;
  description: string;
  level: string;
}

const WorkoutAI = ({ userEmail, profile }: WorkoutAIProps) => {
  const { toast } = useToast();
  const [todayWorkouts, setTodayWorkouts] = useState<WorkoutEntry[]>([]);
  const today = getTodayDate();

  useEffect(() => {
    const workouts = getWorkouts(userEmail, today);
    setTodayWorkouts(workouts);
  }, [userEmail, today]);

  const getRecommendations = (): WorkoutRecommendation[] => {
    const baseCalorieMultiplier = profile ? profile.weight / 70 : 1;

    return [
      { id: "jogging", type: "Jogging", icon: "🏃", duration: 30, caloriesBurned: Math.round(250 * baseCalorieMultiplier), description: "Jogging santai untuk kardio", level: "Pemula" },
      { id: "cycling", type: "Bersepeda", icon: "🚴", duration: 30, caloriesBurned: Math.round(220 * baseCalorieMultiplier), description: "Bersepeda untuk endurance", level: "Pemula" },
      { id: "cardio", type: "Cardio Ringan", icon: "💪", duration: 30, caloriesBurned: Math.round(180 * baseCalorieMultiplier), description: "Cardio di rumah", level: "Pemula" },
      { id: "swimming", type: "Berenang", icon: "🏊", duration: 30, caloriesBurned: Math.round(300 * baseCalorieMultiplier), description: "Full body workout", level: "Menengah" },
      { id: "badminton", type: "Badminton", icon: "🏸", duration: 30, caloriesBurned: Math.round(200 * baseCalorieMultiplier), description: "Cardio & koordinasi", level: "Menengah" },
      { id: "yoga", type: "Yoga", icon: "🧘", duration: 30, caloriesBurned: Math.round(120 * baseCalorieMultiplier), description: "Fleksibilitas & relaksasi", level: "Pemula" },
    ];
  };

  const handleDoWorkout = (workout: WorkoutRecommendation) => {
    const newWorkout: WorkoutEntry = {
      id: `workout_${Date.now()}`,
      date: today,
      type: workout.type,
      duration: workout.duration,
      caloriesBurned: workout.caloriesBurned,
      completedAt: new Date().toISOString(),
    };

    saveWorkout(userEmail, newWorkout);
    setTodayWorkouts([...todayWorkouts, newWorkout]);

    toast({
      title: "🎉 Workout selesai!",
      description: `${workout.type}: ${workout.caloriesBurned} kalori terbakar`,
    });
  };

  const isWorkoutDone = (workoutId: string) => {
    return todayWorkouts.some(w => w.type.toLowerCase() === getRecommendations().find(r => r.id === workoutId)?.type.toLowerCase());
  };

  const recommendations = getRecommendations();
  const totalCaloriesBurned = todayWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);

  return (
    <Card variant="elevated">
      <CardHeader className="bg-teal/10 py-3 px-4">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <Sparkles className="w-5 h-5 text-teal" />
          Workout AI
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {todayWorkouts.length > 0 && (
          <Card variant="glass" className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">Hari Ini</p>
                <p className="text-lg font-bold text-teal">{todayWorkouts.length} sesi</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Terbakar</p>
                <p className="text-lg font-bold text-accent">{totalCaloriesBurned} kal</p>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-2">
          {recommendations.map((workout) => {
            const isDone = isWorkoutDone(workout.id);
            return (
              <Card key={workout.id} variant={isDone ? "highlight" : "default"} className={`p-3 ${isDone ? 'bg-primary/5' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="text-2xl flex-shrink-0">{workout.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-semibold text-foreground text-sm">{workout.type}</h4>
                        {isDone && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-primary/20 text-primary flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Done
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />{workout.duration}m
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Flame className="w-3 h-3 text-accent" />~{workout.caloriesBurned} kal
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant={isDone ? "soft" : "default"} size="sm" onClick={() => handleDoWorkout(workout)} className="h-9 flex-shrink-0">
                    <Dumbbell className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutAI;
