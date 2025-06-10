import { Label } from "@/components/ui/label";
import { Sprout } from "lucide-react";

export default function ProfilePage() {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full gap-4">
            <div className="flex flex-col items-center">
                <div className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground">
                    <Sprout className="size-5" />
                </div>
                <Label className="text-2xl font-bold">Studify</Label>
            </div>
            <Label className="text-sm text-muted-foreground">
                Selecione um arquivo para visualizar
            </Label>
        </div>
    );
}