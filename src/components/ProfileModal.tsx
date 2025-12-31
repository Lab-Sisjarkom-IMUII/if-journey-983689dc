import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Calendar, Ruler, Scale } from "lucide-react";
import { calculateAge, calculateBMR, saveProfile } from "@/lib/storage";

interface ProfileModalProps {
  isOpen: boolean;
  userEmail: string;
  userName: string;
  onComplete: () => void;
}

const ProfileModal = ({ isOpen, userEmail, userName, onComplete }: ProfileModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState(userName);
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [birthDate, setBirthDate] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate inputs
      if (!name.trim() || !birthDate || !weight || !height) {
        toast({
          title: "Data tidak lengkap",
          description: "Mohon lengkapi semua data profil Anda.",
          variant: "destructive",
        });
        return;
      }

      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);

      if (isNaN(weightNum) || isNaN(heightNum) || weightNum <= 0 || heightNum <= 0) {
        toast({
          title: "Data tidak valid",
          description: "Berat dan tinggi badan harus berupa angka positif.",
          variant: "destructive",
        });
        return;
      }

      const age = calculateAge(birthDate);
      if (age < 10 || age > 120) {
        toast({
          title: "Tanggal lahir tidak valid",
          description: "Mohon masukkan tanggal lahir yang valid.",
          variant: "destructive",
        });
        return;
      }

      const bmr = calculateBMR(gender, weightNum, heightNum, age);

      saveProfile(userEmail, {
        name: name.trim(),
        gender,
        birthDate,
        weight: weightNum,
        height: heightNum,
        bmr,
        age,
        completedAt: new Date().toISOString(),
      });

      toast({
        title: "Profil berhasil disimpan!",
        description: `BMR Anda: ${bmr} kalori/hari`,
      });

      onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Lengkapi Profil Anda</DialogTitle>
          <DialogDescription>
            Data ini diperlukan untuk menghitung kebutuhan kalori harian Anda dengan akurat.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="profile-name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>Jenis Kelamin</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as 'L' | 'P')}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="profile-birthdate">Tanggal Lahir</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="profile-birthdate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="pl-10"
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="profile-weight">Berat Badan (kg)</Label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="profile-weight"
                    type="number"
                    placeholder="60"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="pl-10"
                    required
                    min="20"
                    max="300"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Height */}
              <div className="space-y-2">
                <Label htmlFor="profile-height">Tinggi Badan (cm)</Label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="profile-height"
                    type="number"
                    placeholder="170"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="pl-10"
                    required
                    min="100"
                    max="250"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BMR Info */}
          <Card variant="gradient" className="bg-emerald-light/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Apa itu BMR?</strong><br />
                Basal Metabolic Rate (BMR) adalah jumlah kalori minimum yang dibutuhkan tubuh Anda untuk berfungsi saat istirahat. 
                Data ini akan digunakan untuk menghitung kebutuhan kalori harian Anda.
              </p>
            </CardContent>
          </Card>

          <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Profil"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
