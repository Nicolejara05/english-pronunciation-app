import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    LinearProgress,
    Select,
    MenuItem,
    IconButton,
    Tooltip,
    ToggleButton,
    ToggleButtonGroup,
    Paper,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import InfoIcon from '@mui/icons-material/Info';
import { content } from '../data/words';

const PronunciationPractice = ({ onScoreUpdate }) => {
    const [isListening, setIsListening] = useState(false);
    const [currentWord, setCurrentWord] = useState(null);
    const [userSpeech, setUserSpeech] = useState('');
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState('beginner');
    const [feedback, setFeedback] = useState(null);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [contentType, setContentType] = useState('vocabulary');

    const updateCurrentWord = useCallback((index) => {
        const words = content[contentType][level];
        if (words && words[index]) {
            setCurrentWord(words[index]);
        }
    }, [contentType, level]);

    useEffect(() => {
        // Reiniciar el índice cuando cambie el tipo de contenido o nivel
        setCurrentWordIndex(0);
        updateCurrentWord(0);
    }, [level, contentType, updateCurrentWord]);

    const handleLevelChange = (event) => {
        setLevel(event.target.value);
        setCurrentWordIndex(0);
        setScore(0);
    };

    const handleContentTypeChange = (event, newType) => {
        if (newType !== null) {
            setContentType(newType);
            setCurrentWordIndex(0);
            setScore(0);
        }
    };

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.lang = 'en-US';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                setIsListening(true);
                setFeedback(null);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                setUserSpeech(transcript);
                checkPronunciation(transcript);
            };

            recognition.onerror = (event) => {
                console.error('Error:', event.error);
                setIsListening(false);
                setFeedback({
                    type: 'error',
                    message: 'Hubo un error al escuchar. Por favor, intenta de nuevo.'
                });
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        } else {
            alert('Speech recognition is not supported in this browser.');
        }
    };

    const checkPronunciation = (transcript) => {
        if (transcript.includes(currentWord.word.toLowerCase())) {
            // Pronunciación correcta
            setScore(prevScore => prevScore + currentWord.points);
            onScoreUpdate(currentWord.points);
            setFeedback({
                type: 'success',
                message: '¡Excelente pronunciación!'
            });

            // Pasar a la siguiente palabra
            const nextIndex = currentWordIndex + 1;
            const words = content[contentType][level];
            if (nextIndex >= words.length) {
                setFeedback({
                    type: 'success',
                    message: '¡Felicitaciones! Has completado todas las palabras de este nivel.'
                });
                setCurrentWordIndex(0);
                updateCurrentWord(0);
            } else {
                setCurrentWordIndex(nextIndex);
                updateCurrentWord(nextIndex);
            }
        } else {
            setFeedback({
                type: 'error',
                message: 'Intenta de nuevo. Concéntrate en la pronunciación.'
            });
        }
    };

    const playAudio = () => {
        if (currentWord.audioUrl) {
            const audio = new Audio(currentWord.audioUrl);
            audio.play();
        } else {
            const speech = new SpeechSynthesisUtterance(currentWord.word);
            speech.lang = 'en-US';
            window.speechSynthesis.speak(speech);
        }
    };

    if (!currentWord) return null;

    return (
        <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
            <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <CardContent sx={{ p: 0 }}>
                    {/* Header with controls */}
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            p: 2, 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper'
                        }}
                    >
                        <ToggleButtonGroup
                            value={contentType}
                            exclusive
                            onChange={handleContentTypeChange}
                            aria-label="tipo de contenido"
                            size="small"
                        >
                            <ToggleButton value="vocabulary" aria-label="vocabulario">
                                Vocabulario
                            </ToggleButton>
                            <ToggleButton value="phrases" aria-label="frases">
                                Frases
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                Nivel:
                            </Typography>
                            <Select
                                value={level}
                                onChange={handleLevelChange}
                                size="small"
                                variant="outlined"
                            >
                                <MenuItem value="beginner">Principiante</MenuItem>
                                <MenuItem value="intermediate">Intermedio</MenuItem>
                                <MenuItem value="advanced">Avanzado</MenuItem>
                            </Select>
                        </Box>
                    </Paper>

                    {/* Main content */}
                    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h2" align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
                            {currentWord.word}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <IconButton onClick={playAudio} color="primary" size="large" sx={{ mr: 1 }}>
                                <VolumeUpIcon />
                            </IconButton>
                            <Typography variant="body1" color="text.secondary">
                                [{currentWord.phonetic}]
                            </Typography>
                        </Box>

                        <Typography variant="body1" align="center" sx={{ mb: 3, color: 'text.secondary', fontStyle: 'italic' }}>
                            {currentWord.example}
                        </Typography>

                        <Typography variant="body1" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
                            {currentWord.translation}
                        </Typography>

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<MicIcon />}
                            onClick={startListening}
                            disabled={isListening}
                            size="large"
                            sx={{ 
                                borderRadius: 28,
                                px: 4,
                                py: 1,
                                boxShadow: 3,
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.05)'
                                }
                            }}
                        >
                            {isListening ? 'Escuchando...' : 'Hablar'}
                        </Button>

                        {isListening && (
                            <CircularProgress sx={{ mt: 2 }} />
                        )}

                        {feedback && (
                            <Alert
                                severity={feedback.type}
                                sx={{ mt: 3, width: '100%' }}
                                variant="filled"
                            >
                                {feedback.message}
                            </Alert>
                        )}

                        {userSpeech && (
                            <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                                Te escuché decir: "{userSpeech}"
                            </Typography>
                        )}
                    </Box>

                    {/* Progress bar */}
                    <Box sx={{ px: 4, pb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                Palabra {currentWordIndex + 1} de {content[contentType][level].length}
                            </Typography>
                            <Typography variant="caption" color="primary">
                                {Math.round((currentWordIndex / content[contentType][level].length) * 100)}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={(currentWordIndex / content[contentType][level].length) * 100}
                            sx={{ height: 6, borderRadius: 3 }}
                        />
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default PronunciationPractice;
