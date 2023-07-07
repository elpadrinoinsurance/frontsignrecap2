import { Box, Button, Container, Grid, Typography } from "@mui/material"
import { useHistory } from 'react-router-dom'
import { routes } from "../../helper"

export const PageNotFoundAdmin = () => {
    const history = useHistory()

    const onReturn = () => {
        history.push(routes.dashboard)
    }
    return (
        <Box
            sx={{
                m: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}
            >
            <Container maxWidth="md">
                <Grid container spacing={2}>
                <Grid xs={6}>
                    <Typography variant="h1">
                    404
                    </Typography>
                    <Typography variant="h6">
                    The page you’re looking for doesn’t exist.
                    </Typography>
                    <Button onClick={onReturn} sx={{mt:5, p:1}} variant="outlined" color="success">
                        Regresar
                    </Button>
                </Grid>
                <Grid xs={6}>
                    <img
                    src="https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569__340.jpg"
                    alt=""
                    width={500} height={250}
                    />
                </Grid>
                </Grid>
            </Container>
        </Box>
    )
}