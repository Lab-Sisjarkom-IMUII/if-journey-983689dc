import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Clock, Play, Pause, RotateCcw, Utensils, Moon } from "lucide-react";
import { getFastingSession, saveFastingSession, FastingSession } from "@/lib/storage";

interface FastingTimerProps {
  userEmail: string;
}

const FASTING_METHODS = [
  { value: "12:12", fastingHours: 12, eatingHours: 12, label: "12:12 (Pemula)" },
  { value: "16:8", fastingHours: 16, eatingHours: 8, label: "16:8 (Populer)" },
  { value: "18:6", fastingHours: 18, eatingHours: 6, label: "18:6 (Menengah)" },
  { value: "20:4", fastingHours: 20, eatingHours: 4, label: "20:4 (Lanjutan)" },
];

const FastingTimer = ({ userEmail }: FastingTimerProps) => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState("16:8");
  const [session, setSession] = useState<FastingSession | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const savedSession = getFastingSession(userEmail);
    if (savedSession) {
      setSession(savedSession);
      setSelectedMethod(savedSession.method);
    }
  }, [userEmail]);

  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const calculateRemaining = () => {
      const startTime = new Date(session.startTime).getTime();
      const endTime = startTime + session.duration * 60 * 1000;
      const now = Date.now();
      return Math.max(0, Math.floor((endTime - now) / 1000));
    };

    setRemainingTime(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingTime(remaining);

      if (remaining <= 0) {
        setIsCompleted(true);
        const completedSession = { ...session, status: 'completed' as const };
        setSession(completedSession);
        saveFastingSession(userEmail, completedSession);
        
        toast({
          title: "🎉 Waktu puasa selesai!",
          description: "Selamat, saatnya makan. Jangan lupa catat!",
        });
        
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, userEmail, toast]);

  useEffect(() => {
    if (session?.status === 'paused' && session.pausedTime) {
      setRemainingTime(session.pausedTime);
    }
  }, [session]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMethodInfo = () => {
    return FASTING_METHODS.find(m => m.value === selectedMethod) || FASTING_METHODS[1];
  };

  const handleStart = () => {
    const method = getMethodInfo();
    const newSession: FastingSession = {
      method: selectedMethod,
      startTime: new Date().toISOString(),
      duration: method.fastingHours * 60,
      status: 'active',
    };
    setSession(newSession);
    saveFastingSession(userEmail, newSession);
    setIsCompleted(false);

    toast({
      title: "Timer puasa dimulai!",
      description: `Metode ${selectedMethod}: ${method.fastingHours} jam puasa.`,
    });
  };

  const handlePause = () => {
    if (!session) return;
    const pausedSession: FastingSession = {
      ...session,
      status: 'paused',
      pausedTime: remainingTime,
    };
    setSession(pausedSession);
    saveFastingSession(userEmail, pausedSession);
  };

  const handleResume = () => {
    if (!session || !session.pausedTime) return;
    const resumedSession: FastingSession = {
      ...session,
      startTime: new Date(Date.now() - (session.duration * 60 * 1000 - session.pausedTime * 1000)).toISOString(),
      status: 'active',
      pausedTime: undefined,
    };
    setSession(resumedSession);
    saveFastingSession(userEmail, resumedSession);
  };

  const handleReset = () => {
    setSession(null);
    saveFastingSession(userEmail, null);
    setRemainingTime(0);
    setIsCompleted(false);
  };

  const getProgress = () => {
    if (!session) return 0;
    const totalSeconds = session.duration * 60;
    return ((totalSeconds - remainingTime) / totalSeconds) * 100;
  };

  const getScheduleInfo = () => {
    if (!session) return null;
    const method = getMethodInfo();
    const startTime = new Date(session.startTime);
    const endTime = new Date(startTime.getTime() + session.duration * 60 * 1000);
    const eatingEndTime = new Date(endTime.getTime() + method.eatingHours * 60 * 60 * 1000);

    return {
      fastingStart: startTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      fastingEnd: endTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      eatingEnd: eatingEndTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const schedule = getScheduleInfo();
  const method = getMethodInfo();

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="gradient-primary text-primary-foreground py-3 px-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="w-5 h-5" />
          Timer Puasa IF
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Method Selection */}
        {!session && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Pilih Metode Puasa</label>
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Pilih metode" />
              </SelectTrigger>
              <SelectContent>
                {FASTING_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Timer Display */}
        <div className="text-center space-y-3">
          <div className="relative w-40 h-40 mx-auto">
            {/* Progress Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground font-mono">
                {formatTime(remainingTime)}
              </span>
              <span className="text-xs text-muted-foreground">
                {session?.status === 'active' ? 'Sisa waktu' : session?.status === 'paused' ? 'Dijeda' : isCompleted ? 'Selesai!' : 'Siap mulai'}
              </span>
            </div>
          </div>

          {/* Current Method Badge */}
          {session && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              <Moon className="w-3.5 h-3.5" />
              Metode {session.method}
            </div>
          )}
        </div>

        {/* Schedule Info */}
        {schedule && (
          <div className="grid grid-cols-2 gap-3">
            <Card variant="glass" className="p-3 text-center">
              <Moon className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-[10px] text-muted-foreground">Puasa</p>
              <p className="text-xs font-medium text-foreground">
                {schedule.fastingStart} - {schedule.fastingEnd}
              </p>
            </Card>
            <Card variant="glass" className="p-3 text-center">
              <Utensils className="w-4 h-4 mx-auto mb-1 text-accent" />
              <p className="text-[10px] text-muted-foreground">Makan</p>
              <p className="text-xs font-medium text-foreground">
                {schedule.fastingEnd} - {schedule.eatingEnd}
              </p>
            </Card>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!session ? (
            <Button variant="hero" className="flex-1 h-11" onClick={handleStart}>
              <Play className="w-4 h-4 mr-2" />
              Mulai Puasa
            </Button>
          ) : session.status === 'active' ? (
            <>
              <Button variant="outline" className="flex-1 h-11" onClick={handlePause}>
                <Pause className="w-4 h-4 mr-2" />
                Jeda
              </Button>
              <Button variant="ghost" size="icon" className="h-11 w-11" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          ) : session.status === 'paused' ? (
            <>
              <Button variant="hero" className="flex-1 h-11" onClick={handleResume}>
                <Play className="w-4 h-4 mr-2" />
                Lanjutkan
              </Button>
              <Button variant="ghost" size="icon" className="h-11 w-11" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button variant="hero" className="flex-1 h-11" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Mulai Baru
            </Button>
          )}
        </div>

        {/* Method Info */}
        {!session && (
          <div className="p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground">
            <p>
              <strong className="text-foreground">{method.label}</strong>: 
              Puasa {method.fastingHours} jam, makan {method.eatingHours} jam.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FastingTimer;
