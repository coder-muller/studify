"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useSettings } from "@/hooks/useSettings";
import { useAutoSave } from "@/hooks/useAutoSave";
import { Switch } from "./ui/switch";

interface SettingsMenuProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export default function SettingsMenu({ isOpen, setIsOpen }: SettingsMenuProps) {
  const { setSettings, autoSave, vim } = useSettings();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Ajuste as opções do aplicativo conforme necessário.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Auto Save</span>
            <Switch
              checked={autoSave}
              onCheckedChange={() => {
                setSettings({ autoSave: !autoSave });
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Vim Mode</span>
            <Switch
              checked={vim}
              onCheckedChange={() => {
                setSettings({ vim: !vim });
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen?.(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

}

