import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const validate = (form) => {
    const errors = {};
    if (!form.email.trim()) {
        errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Valid email likho (e.g. user@gmail.com)';
    }
    if (!form.password) {
        errors.password = 'Password required hai';
    } else if (form.password.length < 6) {
        errors.password = 'password should be of minimum 6 characters';
    }
    return errors;
};

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setServerError('');
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate('/chat');
        } catch (err) {
            setServerError(err.response?.data?.message || 'Login failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] relative overflow-hidden">

            {/* Background blobs */}
            <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] bg-teal-500 opacity-10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-80px] right-[-60px] w-[300px] h-[300px] bg-emerald-400 opacity-10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md mx-4">

                {/* Card */}
                <div className="bg-[#111827] border border-white/10 rounded-2xl shadow-2xl p-8">

                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg mb-3">
                            <span className="text-2xl">💬</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
                        <p className="text-sm text-gray-400 mt-1">Login in Chat-Room</p>
                    </div>

                    {/* Server Error */}
                    {serverError && (
                        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className={`w-full px-4 py-3 bg-[#1f2937] border rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-all focus:ring-2
                  ${errors.email
                                        ? 'border-red-500 focus:ring-red-500/30'
                                        : 'border-white/10 focus:border-teal-500 focus:ring-teal-500/20'}`}
                            />
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <span>⚠️</span> {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-3 bg-[#1f2937] border rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-all focus:ring-2 pr-12
                    ${errors.password
                                            ? 'border-red-500 focus:ring-red-500/30'
                                            : 'border-white/10 focus:border-teal-500 focus:ring-teal-500/20'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors text-lg"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <span>⚠️</span> {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 mt-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/20 text-sm tracking-wide"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Logging in...
                                </span>
                            ) : 'Login'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-xs text-gray-500">OR</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <p className="text-center text-sm text-gray-400">
                        Don't have account?{' '}
                        <Link to="/signup" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">
                            Signup
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;