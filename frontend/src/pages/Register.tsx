import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { registerUser, clearError, GenderType } from '../store/authSlice';
import { AppDispatch, RootState } from '../store';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const GENDERS: GenderType[] = ['male', 'female', 'non-binary', 'prefer-not-to-say'];

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    age: string;
    gender: GenderType | '';
}

export default function Register() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state: RootState) => state.auth);
    const [form, setForm] = useState<RegisterForm>({ name: '', email: '', password: '', age: '', gender: '' });

    const set = (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [field]: e.target.value }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        dispatch(clearError());
        const result = await dispatch(registerUser({
            name: form.name, email: form.email, password: form.password,
            age: form.age ? parseInt(form.age) : undefined,
            gender: form.gender || undefined,
        }));
        if (registerUser.fulfilled.match(result)) navigate('/onboarding');
    }

    return (
        <div className="page-container min-h-screen flex items-center justify-center p-4">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-highlight/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="heading-xl text-4xl mb-2">Join the Study</h1>
                    <p className="text-white/50 text-sm">Create your participant account</p>
                </div>

                <div className="glass-card-elevated p-8">
                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {([
                            { id: 'reg-name', label: 'Full Name', type: 'text', field: 'name', placeholder: 'Jane Doe', required: true },
                            { id: 'reg-email', label: 'Email', type: 'email', field: 'email', placeholder: 'you@example.com', required: true },
                            { id: 'reg-password', label: 'Password', type: 'password', field: 'password', placeholder: '8+ characters', required: true },
                            { id: 'reg-age', label: 'Age', type: 'number', field: 'age', placeholder: 'e.g. 22', required: false },
                        ] as const).map(({ id, label, type, field, placeholder, required }) => (
                            <div key={field}>
                                <label className="block text-xs font-heading text-white/60 mb-1.5 uppercase tracking-wider">{label}</label>
                                <input id={id} type={type} required={required} min={type === 'number' ? 13 : undefined} max={type === 'number' ? 100 : undefined}
                                    className="input-field" placeholder={placeholder}
                                    value={form[field]} onChange={set(field)} />
                            </div>
                        ))}

                        <div>
                            <label className="block text-xs font-heading text-white/60 mb-1.5 uppercase tracking-wider">Gender</label>
                            <select id="reg-gender" className="input-field" value={form.gender} onChange={set('gender')}>
                                <option value="">Prefer not to say</option>
                                {GENDERS.map(g => <option key={g} value={g} className="bg-primary capitalize">{g}</option>)}
                            </select>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2" id="reg-submit">
                            {loading ? <LoadingSpinner size="sm" /> : 'Create Account & Start →'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-white/40 mt-6">
                        Already registered?{' '}
                        <Link to="/login" className="text-highlight hover:underline font-medium">Sign in</Link>
                    </p>
                </div>

                <p className="text-center text-xs text-white/20 mt-4">
                    Your data is used only for research purposes. You will be assigned to Group A or B automatically.
                </p>
            </motion.div>
        </div>
    );
}
