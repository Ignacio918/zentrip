import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import GoogleIcon from '../assets/icons/devicon_google.svg';
import EyeIcon from '../assets/icons/eye.svg';
import EyeOffIcon from '../assets/icons/eye-slash.svg';
import Logo from '../assets/logo_medium.svg';
import TextField from '../components/TextField';
import '../styles/RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formValidation, setFormValidation] = useState({
    fullName: { isValid: false, message: '' },
    email: { isValid: false, message: '' },
    password: { isValid: false, message: '' },
    confirmPassword: { isValid: false, message: '' },
  });

  const validateFullName = (name) => {
    if (!name.trim())
      return { isValid: false, message: 'El nombre es requerido' };
    if (name.length < 3)
      return { isValid: false, message: 'Mínimo 3 caracteres' };
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name))
      return { isValid: false, message: 'Solo letras' };
    return { isValid: true, message: 'Nombre válido' };
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return { isValid: false, message: 'El email es requerido' };
    if (!emailRegex.test(email))
      return { isValid: false, message: 'Email inválido' };
    return { isValid: true, message: 'Email válido' };
  };

  const validatePassword = (pass) => {
    if (!pass) return { isValid: false, message: 'La contraseña es requerida' };
    if (pass.length < 8)
      return { isValid: false, message: 'Mínimo 8 caracteres' };
    if (!/[A-Z]/.test(pass))
      return { isValid: false, message: 'Debe incluir mayúscula' };
    if (!/[0-9]/.test(pass))
      return { isValid: false, message: 'Debe incluir número' };
    if (!/[!@#$%^&*]/.test(pass))
      return { isValid: false, message: 'Debe incluir carácter especial' };
    return { isValid: true, message: 'Contraseña válida' };
  };

  const validateConfirmPassword = (confirm) => {
    if (!confirm) return { isValid: false, message: 'Confirma la contraseña' };
    if (confirm !== password)
      return { isValid: false, message: 'Las contraseñas no coinciden' };
    return { isValid: true, message: 'Coinciden' };
  };

  useEffect(() => {
    setFormValidation({
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword),
    });
  }, [fullName, email, password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const validations = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword),
    };

    setFormValidation(validations);

    if (!Object.values(validations).every((v) => v.isValid)) {
      setError('Corrige los errores en el formulario');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError('Ocurrió un error al intentar registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:
            window.location.origin === 'http://localhost:5173'
              ? 'http://localhost:5173/dashboard'
              : 'https://zentrip.vercel.app/dashboard',
        },
      });
      if (error) throw error;
    } catch (error) {
      setError('Error al registrarse con Google: ' + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-form-container">
        <div className="auth-logo-container">
          <img src={Logo} alt="Zentrip Logo" className="auth-logo-image" />
        </div>
        <h2 className="auth-title">Crea tu cuenta gratis</h2>
        <p className="auth-description">
          Transforma tus ideas en aventuras reales
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-inputs-container">
            <div className="label-input-container">
              <TextField
                label="Nombre completo"
                placeholder="Ingresa tu nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                state={
                  formValidation.fullName.isValid
                    ? 'success'
                    : fullName
                      ? 'error'
                      : 'enabled'
                }
                type="text"
                disabled={isLoading}
                autocomplete="name"
                helperText={fullName ? formValidation.fullName.message : ''}
              />
            </div>

            <div className="label-input-container">
              <TextField
                label="Email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                state={
                  formValidation.email.isValid
                    ? 'success'
                    : email
                      ? 'error'
                      : 'enabled'
                }
                type="email"
                disabled={isLoading}
                autocomplete="email"
                helperText={email ? formValidation.email.message : ''}
              />
            </div>

            <div className="label-input-container">
              <TextField
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                state={
                  formValidation.password.isValid
                    ? 'success'
                    : password
                      ? 'error'
                      : 'enabled'
                }
                type={showPassword ? 'text' : 'password'}
                disabled={isLoading}
                helperText={password ? formValidation.password.message : ''}
                icon={
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <img
                      src={showPassword ? EyeOffIcon : EyeIcon}
                      alt="Toggle password"
                    />
                  </button>
                }
                autocomplete="new-password"
              />
            </div>

            <div className="label-input-container">
              <TextField
                label="Confirmar contraseña"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                state={
                  formValidation.confirmPassword.isValid
                    ? 'success'
                    : confirmPassword
                      ? 'error'
                      : 'enabled'
                }
                type={showConfirmPassword ? 'text' : 'password'}
                disabled={isLoading}
                helperText={
                  confirmPassword ? formValidation.confirmPassword.message : ''
                }
                icon={
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    <img
                      src={showConfirmPassword ? EyeOffIcon : EyeIcon}
                      alt="Toggle password"
                    />
                  </button>
                }
                autocomplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span> Registrando...
              </>
            ) : (
              'Regístrate'
            )}
          </button>

          <div className="auth-divider" />

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="auth-google-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> Conectando...
              </>
            ) : (
              <>
                <img src={GoogleIcon} alt="Google" className="google-icon" />
                Registrarse con Google
              </>
            )}
          </button>

          <div className="auth-login-link">
            <span className="auth-text">¿Ya tienes una cuenta?</span>
            <span
              className="auth-link"
              onClick={() => navigate('/login')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && navigate('/login')}
            >
              Inicia sesión
            </span>
          </div>
        </form>

        {error && <p className="auth-error">{error}</p>}
      </div>
    </div>
  );
};

export default RegisterPage;
