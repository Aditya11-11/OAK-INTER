import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("/auth/login", { email, password });
            localStorage.setItem("token", response.data.access_token);
            toast.success("Welcome back!");
            navigate("/");
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background grain-texture">
            <div className="w-full max-w-[400px] animate-scale-in">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-primary-foreground text-2xl font-display font-bold">OW</span>
                    </div>
                </div>
                <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-sm">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-3xl font-display font-bold">Oak Woods</CardTitle>
                        <CardDescription className="text-base">
                            Enter your credentials to access the management system
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@oakwoods.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 border-muted-foreground/20 focus:border-primary"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 border-muted-foreground/20 focus:border-primary"
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full h-12 text-base font-medium shadow-lg" disabled={loading}>
                                {loading ? "Signing in..." : "Sign In"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
                <p className="mt-8 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Oak Woods & Interiors. All rights reserved.
                </p>
            </div>
        </div>
    );
}
