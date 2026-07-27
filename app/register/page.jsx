'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '../../lib/store/authStore';
import CaziniLogo from '../../components/CaziniLogo';

const NATIONALITIES = [
  'Afghan','Albanian','Algerian','American','Argentine','Armenian','Australian',
  'Austrian','Azerbaijani','Bahraini','Bangladeshi','Belarusian','Belgian',
  'Bolivian','Bosnian','Brazilian','British','Bulgarian','Burundian','Cambodian',
  'Cameroonian','Canadian','Chilean','Chinese','Colombian','Congolese','Croatian',
  'Cuban','Czech','Danish','Dutch','Ecuadorian','Egyptian','Eritrean','Estonian',
  'Ethiopian','Filipino','Finnish','French','Georgian','German','Ghanaian','Greek',
  'Guatemalan','Guinean','Haitian','Honduran','Hungarian','Indian','Indonesian',
  'Iranian','Iraqi','Irish','Israeli','Italian','Ivorian','Jamaican','Japanese',
  'Jordanian','Kazakhstani','Kenyan','Korean','Kurdish','Kuwaiti','Lebanese',
  'Libyan','Lithuanian','Malawian','Malaysian','Malian','Mauritanian','Mexican',
  'Moldovan','Moroccan','Mozambican','Myanmar','Namibian','Nepalese','Nigerian',
  'Norwegian','Pakistani','Palestinian','Panamanian','Peruvian','Polish','Portuguese',
  'Romanian','Russian','Rwandan','Saudi','Senegalese','Serbian','Sierra Leonean',
  'Somali','South African','South Sudanese','Spanish','Sri Lankan','Stateless',
  'Sudanese','Swedish','Swiss','Syrian','Tanzanian','Thai','Togolese','Tunisian',
  'Turkish','Ugandan','Ukrainian','Undetermined','Uruguayan','Uzbekistani',
  'Venezuelan','Vietnamese','Yemeni','Zambian','Zimbabwean','Other',
];

const inputClass = (hasError) =>
  `w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60 ${
    hasError ? 'border-red-500 focus:border-red-600' : 'border-gray-400 focus:border-primary-500'
  }`;

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);

  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', nationality: '',
    email: '', password: '', confirmPassword: '', phone: '', unhcr_id: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.date_of_birth) errs.date_of_birth = 'Date of birth is required';
    else {
      const age = (Date.now() - new Date(form.date_of_birth + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (age < 13) errs.date_of_birth = 'Must be at least 13 years old';
    }
    if (!form.nationality) errs.nationality = 'Nationality is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (form.phone && !/^\+?[\d\s\-().]{7,20}$/.test(form.phone)) errs.phone = 'Enter a valid phone number';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        date_of_birth: form.date_of_birth,
        nationality: form.nationality,
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };
      if (form.phone.trim())    payload.phone    = form.phone.trim();
      if (form.unhcr_id.trim()) payload.unhcr_id = form.unhcr_id.trim();

      await register(payload);
      router.push('/passport');
    } catch (err) {
      setServerError(err.message || 'Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-primary-600 to-primary-900 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-xs w-full">
          <div className="mb-10">
            <CaziniLogo markSize={46} wordmarkClassName="text-2xl" variant="light" />
          </div>
          <h2 className="text-2xl font-bold mb-4 leading-tight">Start your journey today</h2>
          <p className="text-primary-50 text-sm leading-relaxed mb-8">
            Create your portable credential passport in minutes. Free to use, works anywhere.
          </p>
          <ul className="space-y-3">
            {['Free digital credential wallet','UNHCR ID supported','Works across 30+ countries','Cryptographically secure'].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-primary-50">
                <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-xs">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-start justify-center px-6 py-10 bg-white overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="lg:hidden mb-8">
            <CaziniLogo markSize={38} wordmarkClassName="text-lg" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your passport</h1>
          <p className="text-gray-500 text-sm mb-8">Register to get your portable employment credential identity</p>

          {serverError && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="full_name">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                id="full_name" name="full_name" type="text" autoComplete="name"
                value={form.full_name} onChange={handleChange}
                placeholder="Your full legal name" disabled={loading}
                className={inputClass(errors.full_name)}
              />
              {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="date_of_birth">
                  Date of birth <span className="text-red-500">*</span>
                </label>
                <input
                  id="date_of_birth" name="date_of_birth" type="date"
                  value={form.date_of_birth} onChange={handleChange}
                  disabled={loading} max={new Date().toISOString().split('T')[0]}
                  className={inputClass(errors.date_of_birth)}
                />
                {errors.date_of_birth && <p className="mt-1 text-xs text-red-600">{errors.date_of_birth}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="nationality">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <select
                  id="nationality" name="nationality"
                  value={form.nationality} onChange={handleChange} disabled={loading}
                  className={inputClass(errors.nationality)}
                >
                  <option value="">Select…</option>
                  {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                {errors.nationality && <p className="mt-1 text-xs text-red-600">{errors.nationality}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email" name="email" type="email" autoComplete="email"
                value={form.email} onChange={handleChange}
                placeholder="you@example.com" disabled={loading}
                className={inputClass(errors.email)}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                    value={form.password} onChange={handleChange}
                    placeholder="Min. 8 characters" disabled={loading}
                    className={`${inputClass(errors.password)} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="confirmPassword">
                  Confirm password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword" name="confirmPassword" type={showConfirm ? 'text' : 'password'} autoComplete="new-password"
                    value={form.confirmPassword} onChange={handleChange}
                    placeholder="Repeat password" disabled={loading}
                    className={`${inputClass(errors.confirmPassword)} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="phone">
                  Phone <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  id="phone" name="phone" type="tel" autoComplete="tel"
                  value={form.phone} onChange={handleChange}
                  placeholder="+1 234 567 8901" disabled={loading}
                  className={inputClass(errors.phone)}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="unhcr_id">
                  UNHCR ID <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  id="unhcr_id" name="unhcr_id" type="text"
                  value={form.unhcr_id} onChange={handleChange}
                  placeholder="e.g. SYR-2024-001234" disabled={loading}
                  className={inputClass(false)}
                />
                <p className="mt-1 text-xs text-gray-500">UNHCR registration number if applicable</p>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : 'Create my passport'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
