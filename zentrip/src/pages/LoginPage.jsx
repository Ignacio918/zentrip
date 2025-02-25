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

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    supabase.auth.signInWithPassword({
      email,
      password,
    })
      .then(({ error }) => {
        if (error) {
          setError(error.message);
        } else {
          navigate("/dashboard");
        }
      })
      .catch((error) => {
        setError("Ocurrió un error al intentar iniciar sesión");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError("");

    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    let authListener = null;
    let popupClosed = false;

    authListener = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        const userId = session.user.id;
        const userEmail = session.user.email;
        const userName = session.user.user_metadata?.full_name || userEmail.split("@")[0];

        console.log("Datos del usuario desde Google OAuth:", { userId, userEmail, userName });

        supabase
          .from("users")
          .upsert([{ id: userId, name: userName, email: userEmail }], { onConflict: "id" })
          .then(({ error: userError }) => {
            if (userError) {
              console.error("Error al insertar/actualizar usuario en users:", userError.message);
              setError(userError.message);
            } else {
              navigate("/dashboard");
            }
          })
          .catch((error) => {
            console.error("Error en upsert:", error.message);
            setError("Error al sincronizar datos del usuario");
          })
          .finally(() => {
            if (authListener && authListener.data && authListener.data.subscription) {
              authListener.data.subscription.unsubscribe(); // Usar data.subscription.unsubscribe()
            }
          });
      }
    });

    const popup = window.open(
      `https://szloqueilztpbdurfowm.supabase.co/auth/v1/authorize?provider=google&redirect_to=https://zentrip.vercel.app/dashboard`,
      "GoogleSignIn",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (!popup) {
      setError("No se pudo abrir el popup para la autenticación de Google.");
      setIsLoading(false);
      if (authListener && authListener.data && authListener.data.subscription) {
        authListener.data.subscription.unsubscribe();
      }
      return;
    }

    const interval = setInterval(() => {
      if (popup.closed && !popupClosed) {
        popupClosed = true;
        clearInterval(interval);
        if (authListener && authListener.data && authListener.data.subscription) {
          authListener.data.subscription.unsubscribe();
        }
        setIsLoading(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      if (authListener && authListener.data && authListener.data.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
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
            <div className="label-input-container">
              <TextField
                label="Email"
                placeholder="Ingresa tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                state={error ? "error" : "enabled"}
                type="email"
                disabled={isLoading}
                autocomplete="email"
              />
            </div>

            <div className="label-input-container">
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
                autocomplete="current-password"
              />
            </div>
          </div>

          <Link
            to="/forgot-password"
            className={`login-forgot-password ${isLoading ? "pointer-events-none opacity-50" : ""}`}
          >
            ¿Olvidaste tu contraseña?
          </Link>

          <button
            type="submit"
            className={`auth-button ${isLoading ? "button-loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> Ingresando...
              </>
            ) : (
              "Ingresar"
            )}
          </button>

          <div className="auth-divider" />

          <button
            type="button"
            onClick={handleGoogleLogin}
            className={`auth-google-button ${isLoading ? "button-loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> Conectando...
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
            <span
              className={`auth-link ${isLoading ? "pointer-events-none opacity-50" : ""}`}
              onClick={() => navigate("/register")}
              role="button"
            >
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