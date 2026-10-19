import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Container, Card, CardContent, TextField, Button,
  Typography, InputAdornment, IconButton, Alert, Divider, Stack
} from "@mui/material";
import {
  Email, Lock, Visibility, VisibilityOff, AutoAwesome, Login as LoginIcon
} from "@mui/icons-material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        setError("Invalid email or password. Please try again.");
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
          {/* Top gradient bar */}
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

            <Typography variant="h4" fontWeight={700} textAlign="center" mb={0.5}>Welcome Back</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>
              Sign in to continue your beauty journey
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleLogin}>
              <TextField fullWidth label="Email Address" type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Email color="primary" /></InputAdornment> }}
                sx={{ mb: 2.5 }} />

              <TextField fullWidth label="Password" type={showPass ? 'text' : 'password'} required
                value={password} onChange={e => setPassword(e.target.value)}
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
                sx={{ mb: 3 }} />

              <Button fullWidth type="submit" variant="contained" size="large"
                disabled={loading} startIcon={<LoginIcon />}
                sx={{ py: 1.5, fontSize: '1rem', mb: 2 }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }}><Typography variant="caption" color="text.secondary">New here?</Typography></Divider>

            <Button fullWidth variant="outlined" color="primary" component={Link} to="/register" size="large">
              Create an Account
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}