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
        role: "student" as "student" | "staff" | "admin",
    });
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

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
            setError(
                err instanceof Error ? err.message : "Authentication failed"
            );
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
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                />
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
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                            />
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
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                            />
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
                                    <option value="admin">Admin</option>
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
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Demo Accounts
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div>
                                <strong>Student:</strong>{" "}
                                dahiyaprateek@gmail.com / 123456
                            </div>
                            <div>
                                <strong>Staff:</strong> dahiya2@gmail.com /
                                123456
                            </div>
                            <div>
                                <strong>Admin:</strong> dahiya@gmail.com /
                                123456
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
