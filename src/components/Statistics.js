import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s',
    '&:hover': {
        transform: 'translateY(-4px)',
    },
}));

const StatItem = ({ title, value, unit, progress }) => (
    <StyledCard>
        <CardContent>
            <Typography variant="h6" gutterBottom>
                {title}
            </Typography>
            <Typography variant="h4" color="primary">
                {value}
                {unit && <Typography component="span" variant="body2"> {unit}</Typography>}
            </Typography>
            {progress !== undefined && (
                <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={progress} />
                </Box>
            )}
        </CardContent>
    </StyledCard>
);

const Statistics = ({ statistics }) => {
    const {
        totalPracticeTime,
        wordsPracticed,
        correctPronunciations,
        incorrectPronunciations,
        dailyStreaks,
    } = statistics;

    const accuracy = wordsPracticed > 0
        ? Math.round((correctPronunciations / wordsPracticed) * 100)
        : 0;

    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Estadísticas de Aprendizaje
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatItem
                        title="Tiempo Total de Práctica"
                        value={Math.round(totalPracticeTime / 60)}
                        unit="minutos"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatItem
                        title="Palabras Practicadas"
                        value={wordsPracticed}
                        progress={Math.min((wordsPracticed / 1000) * 100, 100)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatItem
                        title="Racha Diaria"
                        value={dailyStreaks}
                        unit="días"
                        progress={Math.min((dailyStreaks / 30) * 100, 100)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatItem
                        title="Precisión"
                        value={accuracy}
                        unit="%"
                        progress={accuracy}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatItem
                        title="Pronunciaciones Correctas"
                        value={correctPronunciations}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatItem
                        title="Pronunciaciones Incorrectas"
                        value={incorrectPronunciations}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Statistics; 