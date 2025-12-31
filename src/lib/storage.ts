// Storage utility functions for localStorage operations

export interface User {
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

export interface Profile {
  name: string;
  gender: 'L' | 'P';
  birthDate: string;
  weight: number;
  height: number;
  bmr: number;
  age: number;
  completedAt: string;
}

export interface FastingSession {
  method: string;
  startTime: string;
  duration: number; // in minutes
  status: 'active' | 'paused' | 'completed';
  pausedTime?: number; // remaining time when paused
}

export interface MealEntry {
  id: string;
  name: string;
  calories: number;
  timestamp: string;
}

export interface WorkoutEntry {
  id: string;
  date: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  completedAt: string;
}

// User management
export const getUsers = (): User[] => {
  const users = localStorage.getItem('ifjourney_users');
  return users ? JSON.parse(users) : [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('ifjourney_users', JSON.stringify(users));
};

export const findUser = (email: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const validateLogin = (email: string, password: string): User | null => {
  const user = findUser(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
};

// Session management
export const setLoggedInUser = (email: string, name: string): void => {
  localStorage.setItem('ifjourney_isLoggedIn', 'true');
  localStorage.setItem('ifjourney_userEmail', email);
  localStorage.setItem('ifjourney_userName', name);
};

export const getLoggedInUser = (): { isLoggedIn: boolean; email: string; name: string } => {
  return {
    isLoggedIn: localStorage.getItem('ifjourney_isLoggedIn') === 'true',
    email: localStorage.getItem('ifjourney_userEmail') || '',
    name: localStorage.getItem('ifjourney_userName') || '',
  };
};

export const logout = (): void => {
  localStorage.removeItem('ifjourney_isLoggedIn');
  localStorage.removeItem('ifjourney_userEmail');
  localStorage.removeItem('ifjourney_userName');
};

// Profile management
export const getProfile = (email: string): Profile | null => {
  const profile = localStorage.getItem(`ifjourney_profile_${email}`);
  return profile ? JSON.parse(profile) : null;
};

export const saveProfile = (email: string, profile: Profile): void => {
  localStorage.setItem(`ifjourney_profile_${email}`, JSON.stringify(profile));
};

export const calculateBMR = (gender: 'L' | 'P', weight: number, height: number, age: number): number => {
  if (gender === 'L') {
    return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
  } else {
    return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
  }
};

export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Fasting timer management
export const getFastingSession = (email: string): FastingSession | null => {
  const session = localStorage.getItem(`ifjourney_fasting_${email}`);
  return session ? JSON.parse(session) : null;
};

export const saveFastingSession = (email: string, session: FastingSession | null): void => {
  if (session) {
    localStorage.setItem(`ifjourney_fasting_${email}`, JSON.stringify(session));
  } else {
    localStorage.removeItem(`ifjourney_fasting_${email}`);
  }
};

// Meal plan management
export const getMealPlan = (email: string, date: string): MealEntry[] => {
  const meals = localStorage.getItem(`ifjourney_meal_${email}_${date}`);
  return meals ? JSON.parse(meals) : [];
};

export const saveMealPlan = (email: string, date: string, meals: MealEntry[]): void => {
  localStorage.setItem(`ifjourney_meal_${email}_${date}`, JSON.stringify(meals));
};

// Workout management
export const getWorkouts = (email: string, date: string): WorkoutEntry[] => {
  const workouts = localStorage.getItem(`ifjourney_workout_${email}_${date}`);
  return workouts ? JSON.parse(workouts) : [];
};

export const saveWorkout = (email: string, workout: WorkoutEntry): void => {
  const date = workout.date;
  const workouts = getWorkouts(email, date);
  workouts.push(workout);
  localStorage.setItem(`ifjourney_workout_${email}_${date}`, JSON.stringify(workouts));
};

// Get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Format date for display
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
