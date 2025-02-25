import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import GoogleIcon from "../assets/icons/devicon_google.svg";
import EyeIcon from "../assets/icons/eye.svg";
import EyeOffIcon from "../assets/icons/eye-slash.svg";
import Logo from "../assets/logo_medium.svg";
import TextField from "../components/TextField";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        navigate("/dashboard"); // Redirigir al dashboard
      }
    } catch (error) {
      setError("Ocurrió un error al intentar iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: "https://zentrip.vercel.app/dashboard" },
      });

      if (error) {
        setError(error.message);
      } else {
        // Obtener la sesión después de la autenticación con Google
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const userId = sessionData.session.user.id;
        const userEmail = sessionData.session.user.email;
        const userName = sessionData.session.user.user_metadata?.full_name || userEmail.split("@")[0]; // Usar full_name de Google o email como nombre por defecto

        // Insertar o actualizar el usuario en la tabla 'users'
        const { error: userError } = await supabase
          .from("users")
          .upsert([{ id: userId, name: userName, email: userEmail }], { onConflict: "id" });

        if (userError) throw userError;

        navigate("/dashboard"); // Redirigir al dashboard
      }
    } catch (error) {
      setError("Ocurrió un error al intentar iniciar sesión con Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-container">
        <div className="auth-logo-container">
          <img src={Logo} alt="Zentrip Logo" className="auth-logo-image" />
        </div>
        <h2 className="auth-title">Inicia sesión en tu cuenta</h2>
        <p className="auth-description">
          Accede a tus planes de viaje y haz realidad tus ideas.
        </p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-inputs-container">
            <TextField
              label="Email"
              placeholder="Ingresa tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              state={error ? "error" : "enabled"}
              type="email"
              disabled={isLoading}
            />

            <TextField
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              state={error ? "error" : "enabled"}
              type={showPassword ? "text" : "password"}
              disabled={isLoading}
              icon={
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <img src={showPassword ? EyeOffIcon : EyeIcon} alt="Toggle password" />
                </button>
              }
            />
          </div>

          <Link
            to="/forgot-password"
            className={`login-forgot-password ${isLoading ? "pointer-events-none opacity-50" : ""}`}
          >
            ¿Olvidaste tu contraseña?
          </Link>

          <button type="submit" className={`auth-button ${isLoading ? "button-loading" : ""}`} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span> Ingresando...
              </>
            ) : (
              "Ingresar"
            )}
          </button>

          <div className="auth-divider" />

          <button type="button" className={`auth-google-button ${isLoading ? "button-loading" : ""}`} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Conectando...
              </>
            ) : (
              <>
                <img src={GoogleIcon} alt="Google" className="google-icon" />
                Ingresar con Google
              </>
            )}
          </button>

          <div className="auth-login-link">
            <span className="auth-text">¿Aún no te unes?</span>
            <span className={`auth-link ${isLoading ? "pointer-events-none opacity-50" : ""}`} onClick={() => navigate("/register")} role="button">
              Regístrate ahora
            </span>
          </div>
        </form>

        {error && <p className="auth-error">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;