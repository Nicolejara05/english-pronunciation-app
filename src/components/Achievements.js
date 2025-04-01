import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';

const StyledCard = styled(Card)(({ theme, unlocked }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s',
    opacity: unlocked ? 1 : 0.7,
    '&:hover': {
        transform: 'translateY(-4px)',
    },
}));

const AchievementIcon = styled(Box)(({ theme, unlocked }) => ({
    width: 60,
    height: 60,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
    backgroundColor: unlocked ? theme.palette.primary.main : theme.palette.grey[400],
    color: unlocked ? theme.palette.primary.contrastText : theme.palette.grey[600],
}));

const achievements = [
    {
        id: 'first_word',
        title: 'Primera Palabra',
        description: 'Completa tu primera palabra correctamente',
        icon: '🎯',
        requirement: 1,
    },
    {
        id: 'streak_7',
        title: 'Racha de 7 Días',
        description: 'Practica durante 7 días seguidos',
        icon: '🔥',
        requirement: 7,
    },
    {
        id: 'perfect_10',
        title: 'Perfecto 10',
        description: 'Obtén 10 pronunciaciones correctas seguidas',
        icon: '⭐',
        requirement: 10,
    },
    {
        id: 'time_master',
        title: 'Maestro del Tiempo',
        description: 'Practica durante 60 minutos en total',
        icon: '⏰',
        requirement: 60,
    },
    {
        id: 'vocabulary_master',
        title: 'Maestro del Vocabulario',
        description: 'Practica 100 palabras diferentes',
        icon: '📚',
        requirement: 100,
    },
];

const AchievementCard = ({ achievement, unlocked, progress }) => (
    <StyledCard unlocked={unlocked}>
        <CardContent sx={{ textAlign: 'center' }}>
            <AchievementIcon unlocked={unlocked}>
                {unlocked ? (
                    <Typography variant="h4">{achievement.icon}</Typography>
                ) : (
                    <LockIcon fontSize="large" />
                )}
            </AchievementIcon>
            <Typography variant="h6" gutterBottom>
                {achievement.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {achievement.description}
            </Typography>
            {!unlocked && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Progreso: {progress}/{achievement.requirement}
                </Typography>
            )}
        </CardContent>
    </StyledCard>
);

const Achievements = ({ statistics, unlockedAchievements }) => {
    const getProgress = (achievement) => {
        switch (achievement.id) {
            case 'first_word':
                return statistics.wordsPracticed;
            case 'streak_7':
                return statistics.dailyStreaks;
            case 'perfect_10':
                return statistics.correctPronunciations;
            case 'time_master':
                return Math.round(statistics.totalPracticeTime / 60);
            case 'vocabulary_master':
                return statistics.wordsPracticed;
            default:
                return 0;
        }
    };

    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Logros
            </Typography>
            <Grid container spacing={3}>
                {achievements.map((achievement) => (
                    <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                        <AchievementCard
                            achievement={achievement}
                            unlocked={unlockedAchievements.includes(achievement.id)}
                            progress={getProgress(achievement)}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Achievements; 