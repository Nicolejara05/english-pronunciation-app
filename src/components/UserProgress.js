import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        minWidth: 400,
        maxWidth: 600,
    },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.palette.grey[200],
    '& .MuiLinearProgress-bar': {
        borderRadius: 5,
    },
}));

const levelFeatures = {
    1: ['Acceso a palabras básicas', 'Sistema de puntuación básico'],
    2: ['Acceso a frases comunes', 'Estadísticas detalladas'],
    3: ['Acceso a conversaciones', 'Modo de práctica avanzado'],
    4: ['Acceso a todos los niveles', 'Modo de desafío diario'],
    5: ['Contenido premium', 'Modo sin anuncios'],
};

const streakRewards = {
    3: 'Desbloquea modo de práctica rápida',
    7: 'Desbloquea modo de desafío diario',
    14: 'Desbloquea estadísticas avanzadas',
    30: 'Desbloquea contenido premium',
};

const UserProgress = ({ open, onClose, type, level, streak, totalScore, onScoreUpdate }) => {
    const nextLevel = level + 1;
    const pointsToNextLevel = (nextLevel * 100) - totalScore;
    const progressToNextLevel = (totalScore % 100) / 100 * 100;

    const renderLevelContent = () => (
        <>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Nivel {level}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                        Progreso al siguiente nivel:
                    </Typography>
                    <Typography variant="body2" color="primary">
                        {Math.round(progressToNextLevel)}%
                    </Typography>
                </Box>
                <ProgressBar
                    variant="determinate"
                    value={progressToNextLevel}
                    sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                    {pointsToNextLevel} puntos para el siguiente nivel
                </Typography>
            </Box>

            <Typography variant="h6" gutterBottom>
                Características desbloqueadas:
            </Typography>
            <List>
                {levelFeatures[level]?.map((feature, index) => (
                    <ListItem key={index}>
                        <ListItemIcon>
                            <EmojiEventsIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                    </ListItem>
                ))}
            </List>

            {levelFeatures[nextLevel] && (
                <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Próximas características:
                    </Typography>
                    <List>
                        {levelFeatures[nextLevel].map((feature, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>
                                    <EmojiEventsIcon color="disabled" />
                                </ListItemIcon>
                                <ListItemText primary={feature} />
                            </ListItem>
                        ))}
                    </List>
                </>
            )}
        </>
    );

    const renderStreakContent = () => (
        <>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Racha actual: {streak} días
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                        Progreso de la racha:
                    </Typography>
                    <Typography variant="body2" color="primary">
                        {Math.round((streak / 30) * 100)}%
                    </Typography>
                </Box>
                <ProgressBar
                    variant="determinate"
                    value={(streak / 30) * 100}
                    sx={{ mb: 2 }}
                />
            </Box>

            <Typography variant="h6" gutterBottom>
                Recompensas por racha:
            </Typography>
            <List>
                {Object.entries(streakRewards).map(([days, reward]) => (
                    <ListItem key={days}>
                        <ListItemIcon>
                            <StarIcon color={streak >= parseInt(days) ? "primary" : "disabled"} />
                        </ListItemIcon>
                        <ListItemText
                            primary={`${days} días: ${reward}`}
                            secondary={streak >= parseInt(days) ? "¡Desbloqueado!" : `${parseInt(days) - streak} días restantes`}
                        />
                    </ListItem>
                ))}
            </List>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                    Consejo: Mantén tu racha practicando al menos una palabra cada día para desbloquear recompensas especiales.
                </Typography>
            </Box>
        </>
    );

    return (
        <StyledDialog open={open} onClose={onClose}>
            <DialogTitle>
                {type === 'level' ? 'Progreso de Nivel' : 'Racha y Recompensas'}
            </DialogTitle>
            <DialogContent>
                {type === 'level' ? renderLevelContent() : renderStreakContent()}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cerrar</Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default UserProgress; 