import { Visibility, VisibilityOff } from "@mui/icons-material"
import { Box, Button, Container, CssBaseline, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { routes, sendRequest, setRol, setSessionId, setUserId, verifySession } from "../../helper"
import './style.scss'

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const history = useHistory()

  useEffect(() => {
    verifySession(true, history, routes.dashboard)
      .catch(err => console.log(err))
  }, [])

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault()

    const link = `${process.env.REACT_APP_BACK_URL}/session`
    const data = await sendRequest.Post(link, { username, password })
    if(!data) return
    setRol(data.rol)
    const { session, user } = data.session
    setSessionId(session)
    setUserId(user)
    history.push(routes.dashboard)
  }

  return (
    <Container
      component="main"
      maxWidth="xs"
      className="login-main"
      sx={{
        display: 'flex',
      }}>
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'white',
          p: 3,
          borderRadius: 2,
          boxShadow: '1px 2px 10px rgba(0,0,0,0.2);'
        }}
      >
        <Typography component="h1" variant="h5">
          Ingrese la clave
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <FormControl sx={{ m: '10px 0 1px 0', width: 1 }} variant="outlined">
            <InputLabel htmlFor="outlined-username">Usuario</InputLabel>
            <OutlinedInput
              id="outlined-username"
              type={'text'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
              autoFocus
              label="username"
            />
          </FormControl>
          <FormControl sx={{ m: '10px 0 1px 0', width: 1 }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Clave</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type={showPassword ? 'text' : 'password'}
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Entrar
          </Button>
        </Box>
      </Box>
    </Container>
  )
}