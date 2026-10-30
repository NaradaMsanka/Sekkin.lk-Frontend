import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Container, Card, CardContent, TextField, Button,
  Typography, InputAdornment, IconButton, Alert, Divider, Stack
} from "@mui/material";
import { Email, Lock, Person, Visibility, VisibilityOff, AutoAwesome, PersonAdd } from "@mui/icons-material";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sekkin-lk-backend.onrender.com';

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPass) { setError("Passwords do not match!"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const text = await res.text();
      if (res.ok) {
        setSuccess("Account created successfully! Logging you in...");
        try {
          const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (loginRes.ok) {
            const loginData = await loginRes.json();
            localStorage.setItem("token", loginData.token);
            setTimeout(() => navigate("/"), 1200);
            return;
          }
        } catch (loginErr) {
          console.warn("Auto-login error:", loginErr);
        }
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(text || "Registration failed. Email may already be in use.");
      }
    } catch {
      setError("Connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '90vh', display: 'flex', alignItems: 'center',
      background: 'linear-gradient(135deg, #FDF0F4 0%, #F5E6EA 100%)'
    }}>
      <Container maxWidth="sm">
        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ height: 6, background: 'linear-gradient(90deg, #B5385C, #C9956A)' }} />
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Box
                component="img"
                src="/logo.png"
                alt="Sekkin.lk"
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  border: '2px solid #C9956A',
                  p: 0.3,
                  bgcolor: '#000000',
                  boxShadow: '0 4px 14px rgba(201,149,106,0.25)',
                  mb: 1.5,
                }}
              />
              <Typography variant="h5" fontWeight={800} color="primary.main">
                Sekkin<span style={{ color: '#C9956A' }}>.lk</span>
              </Typography>
              <Typography variant="caption" sx={{ color: '#8c7568', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
                Beauty • Elegance • Confidence
              </Typography>
            </Box>

            <Typography variant="h4" fontWeight={700} align="center" mb={0.5}>Create Account</Typography>
            <Typography variant="body2" color="text.secondary" align="center" mb={4}>
              Join our beauty community today
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

            <Box component="form" onSubmit={handleRegister}>
              <TextField fullWidth label="Full Name" required
                value={name} onChange={e => setName(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Person color="primary" /></InputAdornment> }}
                sx={{ mb: 2.5 }} />

              <TextField fullWidth label="Email Address" type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email color="primary" /></InputAdornment> }}
                sx={{ mb: 2.5 }} />

              <TextField fullWidth label="Password" type={showPass ? 'text' : 'password'} required
                value={password} onChange={e => setPassword(e.target.value)}
                helperText="Minimum 6 characters"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock color="primary" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(v => !v)} edge="end">
                        {showPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2.5 }} />

              <TextField fullWidth label="Confirm Password" type={showPass ? 'text' : 'password'} required
                value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                error={confirmPass.length > 0 && password !== confirmPass}
                helperText={confirmPass.length > 0 && password !== confirmPass ? "Passwords don't match" : ""}
                InputProps={{ startAdornment: <InputAdornment position="start"><Lock color="primary" /></InputAdornment> }}
                sx={{ mb: 3 }} />

              <Button fullWidth type="submit" variant="contained" size="large"
                disabled={loading} startIcon={<PersonAdd />}
                sx={{ py: 1.5, fontSize: '1rem', mb: 2 }}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }}><Typography variant="caption" color="text.secondary">Already have an account?</Typography></Divider>
            <Button fullWidth variant="outlined" color="primary" component={Link} to="/login" size="large">Sign In</Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}