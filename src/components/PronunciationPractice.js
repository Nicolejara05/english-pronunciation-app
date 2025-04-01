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
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 2 }}>
            <Card elevation={3}>
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 3 }}>
                        <ToggleButtonGroup
                            value={contentType}
                            exclusive
                            onChange={handleContentTypeChange}
                            aria-label="tipo de contenido"
                        >
                            <ToggleButton value="vocabulary" aria-label="vocabulario">
                                Vocabulario
                            </ToggleButton>
                            <ToggleButton value="phrases" aria-label="frases">
                                Frases
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" color="primary">
                                Nivel:
                            </Typography>
                            <Select
                                value={level}
                                onChange={handleLevelChange}
                                size="small"
                            >
                                <MenuItem value="beginner">Principiante</MenuItem>
                                <MenuItem value="intermediate">Intermedio</MenuItem>
                                <MenuItem value="advanced">Avanzado</MenuItem>
                            </Select>
                        </Box>
                    </Box>

                    <Typography variant="h4" gutterBottom align="center">
                        {contentType === 'vocabulary' ? 'Pronuncia esta palabra' : 'Pronuncia esta frase'}
                    </Typography>

                    <Typography variant="h2" align="center" sx={{ my: 4 }}>
                        {currentWord.word}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Tooltip title="Escuchar pronunciación">
                            <IconButton onClick={playAudio} color="primary" size="large">
                                <VolumeUpIcon />
                            </IconButton>
                        </Tooltip>
                        <Typography variant="h6" color="text.secondary">
                            [{currentWord.phonetic}]
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                        <Typography variant="body1" align="center" color="text.secondary">
                            <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Ejemplo: {currentWord.example}
                        </Typography>
                    </Box>

                    <Typography variant="h5" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
                        Traducción: {currentWord.translation}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<MicIcon />}
                            onClick={startListening}
                            disabled={isListening}
                            size="large"
                        >
                            {isListening ? 'Escuchando...' : 'Empezar a hablar'}
                        </Button>
                    </Box>

                    {isListening && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {feedback && (
                        <Alert
                            severity={feedback.type}
                            sx={{ mt: 2 }}
                            variant="filled"
                        >
                            {feedback.message}
                        </Alert>
                    )}

                    {userSpeech && (
                        <Typography variant="body1" align="center" sx={{ mt: 2 }}>
                            Te escuché decir: {userSpeech}
                        </Typography>
                    )}

                    <Box sx={{ mt: 4 }}>
                        <Typography variant="body2" align="center" gutterBottom>
                            Progreso del nivel ({currentWordIndex + 1}/{content[contentType][level].length})
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={(currentWordIndex / content[contentType][level].length) * 100}
                            sx={{ height: 10, borderRadius: 5, margin: 3 }}
                        />
                    </Box>


                </CardContent>
            </Card>
        </Box>
    );
};

export default PronunciationPractice; 