import { useStore } from "@/context/StoreContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { isAdmin, setIsAdmin } = useStore();
  const [email, setEmail] = useState("admin@oakwoods.com");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const handleSave = async () => {
    if (!email.trim()) { toast.error("Email is required"); return; }
    if (!currentPass) { toast.error("Current password is required to make changes"); return; }

    try {
      await api.post("/auth/update", {
        email: email.trim(),
        currentPassword: currentPass,
        newPassword: newPass || undefined,
      });
      toast.success("Account settings updated successfully");
      setCurrentPass("");
      setNewPass("");
    } catch (error: any) {
      toast.error(error.response?.data?.msg || "Failed to update account");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader><CardTitle className="font-display text-lg">Account</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Email Address</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label>Current Password</Label><Input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} placeholder="Required for changes" /></div>
            <div><Label>New Password</Label><Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="New password (optional)" /></div>
            <Button onClick={handleSave} className="w-full sm:w-auto">Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader><CardTitle className="font-display text-lg">Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Admin Mode</p>
                <p className="text-xs text-muted-foreground">Toggle to switch between Admin and Viewer roles</p>
              </div>
              <Switch checked={isAdmin} onCheckedChange={setIsAdmin} />
            </div>
            {/* Added extra security item for visual balance */}
            <div className="flex items-center justify-between pt-4 border-t border-muted/30">
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Disabled</p>
              </div>
              <Button variant="outline" size="sm" disabled>Enable</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
