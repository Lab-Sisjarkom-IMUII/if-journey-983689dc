import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Utensils, Flame, AlertTriangle } from "lucide-react";
import { getMealPlan, saveMealPlan, getTodayDate, MealEntry, Profile } from "@/lib/storage";

interface MealPlanProps {
  userEmail: string;
  profile: Profile | null;
}

const MealPlan = ({ userEmail, profile }: MealPlanProps) => {
  const { toast } = useToast();
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const today = getTodayDate();

  const dailyCalorieLimit = profile ? Math.round(profile.bmr * 1.2) : 2000;

  useEffect(() => {
    const savedMeals = getMealPlan(userEmail, today);
    setMeals(savedMeals);
  }, [userEmail, today]);

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const caloriePercentage = Math.min((totalCalories / dailyCalorieLimit) * 100, 100);
  const isOverLimit = totalCalories > dailyCalorieLimit;

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!foodName.trim() || !calories) {
      toast({
        title: "Data tidak lengkap",
        description: "Masukkan nama makanan dan kalori.",
        variant: "destructive",
      });
      return;
    }

    const calorieNum = parseInt(calories);
    if (isNaN(calorieNum) || calorieNum <= 0) {
      toast({
        title: "Kalori tidak valid",
        description: "Masukkan jumlah kalori yang valid.",
        variant: "destructive",
      });
      return;
    }

    const newMeal: MealEntry = {
      id: `meal_${Date.now()}`,
      name: foodName.trim(),
      calories: calorieNum,
      timestamp: new Date().toISOString(),
    };

    const updatedMeals = [...meals, newMeal];
    setMeals(updatedMeals);
    saveMealPlan(userEmail, today, updatedMeals);

    setFoodName("");
    setCalories("");

    const newTotal = updatedMeals.reduce((sum, meal) => sum + meal.calories, 0);
    if (newTotal > dailyCalorieLimit) {
      toast({
        title: "⚠️ Batas kalori terlampaui!",
        description: "Total kalori melebihi batas harian.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Makanan ditambahkan!",
        description: `${newMeal.name}: ${newMeal.calories} kal`,
      });
    }
  };

  const handleRemoveMeal = (id: string) => {
    const updatedMeals = meals.filter(m => m.id !== id);
    setMeals(updatedMeals);
    saveMealPlan(userEmail, today, updatedMeals);
    
    toast({
      title: "Makanan dihapus",
      description: "Item telah dihapus.",
    });
  };

  return (
    <Card variant="elevated">
      <CardHeader className="bg-accent/10 py-3 px-4">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <Utensils className="w-5 h-5 text-accent" />
          Meal Plan Hari Ini
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Calorie Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total Kalori</span>
            <span className={`text-xs font-medium ${isOverLimit ? 'text-destructive' : 'text-foreground'}`}>
              {totalCalories} / {dailyCalorieLimit} kal
            </span>
          </div>
          <Progress 
            value={caloriePercentage} 
            className={`h-2.5 ${isOverLimit ? '[&>div]:bg-destructive' : ''}`}
          />
          {isOverLimit && (
            <div className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Melebihi batas +{totalCalories - dailyCalorieLimit} kal</span>
            </div>
          )}
        </div>

        {/* Add Meal Form */}
        <form onSubmit={handleAddMeal} className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-3 space-y-1">
              <Label htmlFor="food-name" className="text-xs">Makanan</Label>
              <Input
                id="food-name"
                placeholder="Nasi goreng"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label htmlFor="food-calories" className="text-xs">Kalori</Label>
              <div className="relative">
                <Input
                  id="food-calories"
                  type="number"
                  placeholder="500"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="h-10"
                  min="1"
                />
              </div>
            </div>
          </div>
          <Button type="submit" variant="soft" className="w-full h-10">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Makanan
          </Button>
        </form>

        {/* Meal List */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-foreground">Catatan Makanan</h4>
          {meals.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Utensils className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Belum ada catatan makanan.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-sm truncate">{meal.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(meal.timestamp).toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs font-medium text-foreground">
                      {meal.calories} kal
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-60 hover:opacity-100"
                      onClick={() => handleRemoveMeal(meal.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Summary */}
        {meals.length > 0 && (
          <Card variant="glass" className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">Sisa Kalori</p>
                <p className={`text-lg font-bold ${isOverLimit ? 'text-destructive' : 'text-primary'}`}>
                  {Math.max(0, dailyCalorieLimit - totalCalories)} kal
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Total Item</p>
                <p className="text-lg font-bold text-foreground">{meals.length}</p>
              </div>
            </div>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default MealPlan;
