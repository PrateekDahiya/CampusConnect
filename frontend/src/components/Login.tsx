import { useState } from "react";
import { useAppStore } from "../stores/useAppStore";
import Button from "../components/Button";
import Card from "../components/Card";

export default function Login() {
    const { login, register, loading } = useAppStore();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "student" as "student" | "staff",
    });
    const [error, setError] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setErrors({});

        // Client-side validation
        const nextErrors: Record<string, string> = {};
        if (!formData.email.trim())
            nextErrors.email = "Please enter your email.";
        if (!formData.password.trim())
            nextErrors.password = "Please enter your password.";
        if (!isLoginMode && !formData.name.trim())
            nextErrors.name = "Please enter your full name.";
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }

        try {
            if (isLoginMode) {
                await login(formData.email, formData.password);
            } else {
                await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                });
            }
        } catch (err) {
            const msg =
                err instanceof Error ? err.message : "Authentication failed";
            setError(msg);
            // If backend returned field errors, show them inline
            const anyErr = err as any;
            if (anyErr && anyErr.responseData && anyErr.responseData.errors) {
                const fieldErrors: Record<string, string> = {};
                Object.entries(anyErr.responseData.errors).forEach(
                    ([k, v]: any) => {
                        fieldErrors[k] = v?.message || String(v);
                    }
                );
                setErrors(fieldErrors);
            }
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isLoginMode
                            ? "Sign in to your account"
                            : "Create your account"}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        CampusConnect - Your Campus Service Hub
                    </p>
                </div>

                <Card>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {!isLoginMode && (
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required={!isLoginMode}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.name}
                                    onChange={(e) => {
                                        handleInputChange(e as any);
                                        if (errors.name)
                                            setErrors((s) => ({
                                                ...s,
                                                name: "",
                                            }));
                                    }}
                                    placeholder="Enter your full name"
                                />
                                {errors.name && (
                                    <div className="text-red-600 text-sm mt-1">
                                        {errors.name}
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={formData.email}
                                onChange={(e) => {
                                    handleInputChange(e as any);
                                    if (errors.email)
                                        setErrors((s) => ({ ...s, email: "" }));
                                }}
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <div className="text-red-600 text-sm mt-1">
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={formData.password}
                                onChange={(e) => {
                                    handleInputChange(e as any);
                                    if (errors.password)
                                        setErrors((s) => ({
                                            ...s,
                                            password: "",
                                        }));
                                }}
                                placeholder="Enter your password"
                            />
                            <div className="mt-1 text-xs flex items-center justify-between">
                                <label className="flex items-center gap-2 text-slate-600">
                                    <input
                                        type="checkbox"
                                        className="inline-block"
                                        checked={showPassword}
                                        onChange={() =>
                                            setShowPassword((s) => !s)
                                        }
                                    />
                                    <span>Show password</span>
                                </label>
                                {errors.password && (
                                    <div className="text-red-600">
                                        {errors.password}
                                    </div>
                                )}
                            </div>
                        </div>

                        {!isLoginMode && (
                            <div>
                                <label
                                    htmlFor="role"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Role
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                >
                                    <option value="student">Student</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </div>
                                ) : isLoginMode ? (
                                    "Sign In"
                                ) : (
                                    "Sign Up"
                                )}
                            </Button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                className="text-sm text-blue-600 hover:text-blue-500"
                                onClick={() => {
                                    setIsLoginMode(!isLoginMode);
                                    setError("");
                                    setFormData({
                                        name: "",
                                        email: "",
                                        password: "",
                                        role: "student",
                                    });
                                    setErrors({});
                                }}
                            >
                                {isLoginMode
                                    ? "Don't have an account? Sign up"
                                    : "Already have an account? Sign in"}
                            </button>
                        </div>
                    </form>
                </Card>
                <div className="mt-8">
                    <Card>
                        <div className="text-sm text-slate-600">
                            Need help? Use your campus email to register. If you
                            have issues signing in, contact the admin.
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
