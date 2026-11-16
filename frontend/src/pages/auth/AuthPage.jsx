import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, ArrowRight, CalendarCheck2, Eye, EyeOff, HeartPulse, ShieldCheck, Stethoscope } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "../../components/common/FormInput.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getDisplayError, getRoleHome } from "../../utils/formatters.js";
import { isValidPassword } from "../../utils/validation.js";

const AuthPage = ({ mode = "login" }) => {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (isRegister && form.name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!isValidPassword(form.password)) next.password = "Use at least 8 characters and no more than 72 UTF-8 bytes.";
    if (isRegister && form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match.";
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const user = isRegister
        ? await register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
        : await login({ email: form.email.trim(), password: form.password });
      toast.success(isRegister ? "Your patient account is ready." : `Welcome back, ${user.name.split(" ")[0]}.`);
      const destination = location.state?.from?.pathname;
      navigate(destination?.startsWith(`/${user.role}`) ? destination : getRoleHome(user.role), { replace: true });
    } catch (error) {
      toast.error(getDisplayError(error, isRegister ? "Could not create your account." : "Could not sign you in."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-canvas lg:grid-cols-[1fr_0.92fr]">
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-12 xl:px-20">
        <Link to="/" className="flex w-fit items-center gap-2.5 text-medical">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-medical text-white"><Activity className="h-5 w-5" /></span>
          <span className="font-display text-xl font-extrabold tracking-tight">ClinicFlow</span>
        </Link>

        <div className="mx-auto my-auto w-full max-w-[440px] py-8 soft-enter">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sage-deep">{isRegister ? "Start your care journey" : "Welcome back"}</p>
              <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-[2.4rem]">
                {isRegister ? "Create your account" : "Sign in to ClinicFlow"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                {isRegister ? "Create a patient account to find a doctor and book a visit." : "Your care, appointments, and providers — all in one place."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {isRegister && (
                <FormInput
                  label="Full name"
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="e.g. Jamie Morgan"
                  value={form.name}
                  onChange={updateField}
                  error={errors.name}
                />
              )}
              <FormInput
                label="Email address"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={updateField}
                error={errors.email}
              />
              <FormInput
                label="Password"
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                maxLength={72}
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder={isRegister ? "At least 8 characters" : "Enter your password"}
                value={form.password}
                onChange={updateField}
                error={errors.password}
                trailing={(
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="rounded-lg p-2 text-slate-400 transition hover:text-medical" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              />
              {isRegister && (
                <FormInput
                  label="Confirm password"
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  maxLength={72}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={updateField}
                  error={errors.confirmPassword}
                />
              )}
              <button className="primary-button mt-2 w-full py-3.5" type="submit" disabled={loading}>
                {loading ? "Please wait…" : isRegister ? "Create patient account" : "Sign in"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              {isRegister ? "Already have an account?" : "New to ClinicFlow?"}{" "}
              <Link to={isRegister ? "/login" : "/register"} className="font-bold text-medical hover:text-sage-deep">
                {isRegister ? "Sign in" : "Create a patient account"}
              </Link>
            </p>
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted">
            <ShieldCheck className="h-4 w-4 text-sage-deep" /> Your health information stays private and secure.
          </p>
        </div>
        <div className="flex justify-between pb-3 text-[11px] text-slate-400">
          <span>© ClinicFlow</span>
          <span>Care that fits your life</span>
        </div>
      </section>

      <aside className="auth-pattern relative hidden overflow-hidden bg-medical px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute -right-32 -top-32 h-[440px] w-[440px] rounded-full border border-white/10" />
        <div className="absolute -bottom-40 -left-20 h-[480px] w-[480px] rounded-full bg-sage/20" />
        <div className="relative z-10 ml-auto flex max-w-[520px] items-center gap-2 self-end rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white/85">
          <span className="h-2 w-2 rounded-full bg-[#9BD4B7]" /> Thoughtful care, one visit at a time
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[500px]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A6D0C4]">A better care experience</p>
          <h2 className="mt-4 max-w-lg font-display text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
            Your health deserves a little more <span className="text-[#A6D0C4]">peace of mind.</span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
            Find trusted providers, book at a time that works, and keep every appointment in one clear place.
          </p>

          <div className="relative mx-auto mt-10 max-w-[410px]">
            <div className="absolute -left-5 top-12 z-20 rounded-2xl border border-white/50 bg-white p-4 text-medical shadow-2xl">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-sage"><CalendarCheck2 className="h-5 w-5" /></span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Appointment</p>
                  <p className="mt-0.5 text-xs font-bold text-ink">Your care, right on time</p>
                </div>
              </div>
            </div>
            <div className="relative mx-auto flex h-[268px] w-[268px] items-center justify-center rounded-[42%] border border-white/15 bg-[#335A73] shadow-2xl">
              <div className="absolute inset-5 rounded-[44%] border border-dashed border-white/20" />
              <div className="absolute bottom-8 h-28 w-48 rounded-t-[90px] bg-[#78A99C]" />
              <div className="absolute bottom-[118px] flex h-28 w-24 items-center justify-center rounded-[46%] bg-[#EAC7AC]">
                <div className="absolute -top-4 h-10 w-24 rounded-t-full bg-[#283F51]" />
                <span className="mt-8 h-1 w-8 rounded-full bg-[#9C6459]" />
              </div>
              <div className="absolute right-9 top-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sage shadow-lg"><HeartPulse className="h-6 w-6" /></div>
              <div className="absolute bottom-8 left-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F7F6] text-medical shadow-md"><Stethoscope className="h-5 w-5" /></div>
            </div>
            <div className="absolute -right-3 bottom-7 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-[#1D4059] px-4 py-2.5 text-xs text-white shadow-xl">
              <ShieldCheck className="h-4 w-4 text-[#A6D0C4]" /> Care you can count on
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/50">
          <span>Designed around your wellbeing</span>
          <span>ClinicFlow · Health, in harmony</span>
        </div>
      </aside>
    </main>
  );
};

export default AuthPage;
