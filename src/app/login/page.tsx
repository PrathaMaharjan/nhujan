"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });
        if (res?.error) {
            setError("Invalid credentials");
            setLoading(false);
        } else {
            router.push("/admin");
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">


                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-b border-white/30 text-white py-2 outline-none transition-colors focus:border-white placeholder:text-white/40"
                />
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent border-b border-white/30 text-white py-2 pr-10 outline-none transition-colors focus:border-white placeholder:text-white/40"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>

                {error && (
                    <p className="text-red-500 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 border border-white/50 text-white text-sm tracking-wide transition-all duration-200 hover:border-white hover:bg-white hover:text-black active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            LOGGING IN
                        </>
                    ) : (
                        "LOG IN"
                    )}
                </button>
            </form>
        </div>
    );
}