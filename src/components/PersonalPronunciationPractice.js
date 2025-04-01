import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    IconButton,
    Paper,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip,
    Stack,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HistoryIcon from '@mui/icons-material/History';

const PersonalPronunciationPractice = () => {
    const [customText, setCustomText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [spokenText, setSpokenText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [practiceHistory, setPracticeHistory] = useState([]);
    const [currentPractice, setCurrentPractice] = useState(null);
    const [mispronouncedWords, setMispronouncedWords] = useState([]);
    const [showFeedback, setShowFeedback] = useState(false);

    // Cargar historial de prácticas del localStorage
    useEffect(() => {
        const saved = localStorage.getItem('personalPractices');
        if (saved) {
            setPracticeHistory(JSON.parse(saved));
        }
    }, []);

    const startListening = () => {
        setError(null);
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.lang = 'en-US';
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onstart = () => {
                setIsListening(true);
                setSpokenText('');
                setShowFeedback(false);
            };

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setSpokenText(transcript);
            };

            recognition.onerror = (event) => {
                console.error('Error:', event.error);
                setIsListening(false);
                setError('Error al escuchar. Por favor, intenta de nuevo.');
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        } else {
            setError('Tu navegador no soporta el reconocimiento de voz.');
        }
    };

    const stopListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.stop();
            setIsListening(false);
            analyzePronunciation(spokenText);
        }
    };

    const analyzePronunciation = async (spokenText) => {
        setIsProcessing(true);
        setError(null);

        try {
            // Limpiar el texto de signos de puntuación y símbolos especiales
            const cleanText = (text) => {
                return text.toLowerCase()
                    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿¡!""]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
            };

            const cleanOriginalText = cleanText(customText);
            const cleanSpokenText = cleanText(spokenText);

            const originalWords = cleanOriginalText.split(' ');
            const spokenWords = cleanSpokenText.split(' ');

            // Identificar palabras mal pronunciadas (sin duplicados)
            const mispronounced = [...new Set(originalWords.filter(word => !spokenWords.includes(word)))];
            setMispronouncedWords(mispronounced);

            // Calcular similitud general
            const similarity = calculateSimilarity(cleanSpokenText, cleanOriginalText);
            const feedback = getFeedback(similarity);

            const practiceItem = {
                original: customText,
                spoken: spokenText,
                feedback,
                mispronouncedWords: mispronounced,
                timestamp: new Date().toISOString(),
            };

            setCurrentPractice(practiceItem);
            setShowFeedback(true);

            // Guardar en el historial
            const newHistory = [practiceItem, ...practiceHistory];
            setPracticeHistory(newHistory);
            localStorage.setItem('personalPractices', JSON.stringify(newHistory));
        } catch (err) {
            console.error('Error:', err);
            setError('Error al analizar la pronunciación. Por favor, intenta de nuevo.');
        } finally {
            setIsProcessing(false);
        }
    };

    const calculateSimilarity = (str1, str2) => {
        const words1 = str1.split(' ').filter(word => word.length > 0);
        const words2 = str2.split(' ').filter(word => word.length > 0);
        const commonWords = words1.filter(word => words2.includes(word));
        return words1.length === 0 || words2.length === 0 ? 0 : commonWords.length / Math.max(words1.length, words2.length);
    };

    const getFeedback = (similarity) => {
        if (similarity >= 0.9) return { text: '¡Excelente pronunciación!', color: 'success.main' };
        if (similarity >= 0.7) return { text: 'Buena pronunciación, pero hay espacio para mejorar.', color: 'warning.main' };
        return { text: 'Necesitas practicar más esta frase.', color: 'error.main' };
    };

    const handleTextSubmit = () => {
        if (customText.trim()) {
            setSpokenText('');
            setIsProcessing(false);
            setError(null);
            setShowFeedback(false);
            setMispronouncedWords([]);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleTextSubmit();
        }
    };

    const deletePractice = (index) => {
        const newHistory = practiceHistory.filter((_, i) => i !== index);
        setPracticeHistory(newHistory);
        localStorage.setItem('personalPractices', JSON.stringify(newHistory));
    };

    const speakText = (text) => {
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'en-US';
        window.speechSynthesis.speak(speech);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', gap: 4 }}>
            {/* Panel principal de práctica */}
            <Box sx={{ flex: 1.5 }}>
                <Card elevation={3}>
                    <CardContent>
                        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
                            Práctica Personalizada
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Input de texto */}
                            <Box sx={{ position: 'relative', display: 'flex' }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    variant="outlined"
                                    placeholder="Escribe el texto en inglés que quieres practicar..."
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={isListening}
                                    inputProps={{
                                        style: { paddingRight: '60px' }
                                    }}
                                    sx={{
                                        flex: 1,
                                        '& .MuiInputBase-root': {
                                            '&::-webkit-scrollbar': {
                                                display: 'none'
                                            },
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none',
                                            maxHeight: 'none'
                                        },
                                        '& textarea': {
                                            '&::-webkit-scrollbar': {
                                                display: 'none'
                                            },
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none',
                                        }
                                    }}
                                />
                                <Box sx={{
                                    position: 'absolute',
                                    right: 12,
                                    top: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    backgroundColor: 'transparent',
                                    pointerEvents: 'none',
                                    '& > *': {
                                        pointerEvents: 'auto'
                                    }
                                }}>
                                    <IconButton
                                        color="secondary"
                                        onClick={isListening ? stopListening : startListening}
                                        disabled={!customText.trim()}
                                        size="small"
                                        sx={{
                                            backgroundColor: 'background.paper',
                                            boxShadow: 1,
                                            '&:hover': {
                                                backgroundColor: 'secondary.main',
                                                color: 'secondary.contrastText',
                                            },
                                            transition: 'all 0.2s',
                                            ...(isListening && {
                                                animation: 'pulse 1.5s infinite',
                                                '@keyframes pulse': {
                                                    '0%': {
                                                        transform: 'scale(1)',
                                                        boxShadow: '0 0 0 0 rgba(156, 39, 176, 0.4)',
                                                    },
                                                    '70%': {
                                                        transform: 'scale(1.1)',
                                                        boxShadow: '0 0 0 10px rgba(156, 39, 176, 0)',
                                                    },
                                                    '100%': {
                                                        transform: 'scale(1)',
                                                        boxShadow: '0 0 0 0 rgba(156, 39, 176, 0)',
                                                    },
                                                },
                                            }),
                                        }}
                                    >
                                        <MicIcon />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Resultado y Feedback */}
                            {showFeedback && currentPractice && (
                                <Paper
                                    elevation={2}
                                    sx={{
                                        p: 3,
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        position: 'relative',
                                        minHeight: '100px'
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        Tu pronunciación:
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {spokenText}
                                    </Typography>
                                    <Typography variant="h6" color={currentPractice.feedback.color}>
                                        {currentPractice.feedback.text}
                                    </Typography>
                                    {mispronouncedWords.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Palabras a practicar:
                                            </Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                                {mispronouncedWords.map((word, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={word}
                                                        onClick={() => speakText(word)}
                                                        sx={{
                                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                                            color: 'primary.contrastText',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        display: 'flex',
                                        gap: 1
                                    }}>
                                        <IconButton
                                            onClick={() => speakText(customText)}
                                            sx={{ color: 'primary.contrastText' }}
                                        >
                                            <VolumeUpIcon />
                                        </IconButton>
                                    </Box>
                                </Paper>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Panel de historial de práctica */}
            <Card elevation={3} sx={{ flex: 1, maxHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HistoryIcon color="primary" />
                            Historial de Práctica
                        </Typography>
                    </Box>
                    <Box sx={{
                        flex: 1,
                        overflow: 'auto',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(0,0,0,0.1)',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '4px',
                            '&:hover': {
                                background: 'rgba(0,0,0,0.3)',
                            },
                        },
                    }}>
                        {practiceHistory.length === 0 ? (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body1" color="text.secondary">
                                    No hay prácticas guardadas
                                </Typography>
                            </Box>
                        ) : (
                            <List>
                                {practiceHistory.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem
                                            sx={{
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                py: 2,
                                                px: 3,
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                    borderRadius: 1
                                                }
                                            }}
                                        >
                                            <Box sx={{
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                mb: 1
                                            }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(item.timestamp)}
                                                </Typography>
                                                <Box>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => speakText(item.original)}
                                                        sx={{ mr: 1 }}
                                                        title="Escuchar texto original"
                                                    >
                                                        <VolumeUpIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => deletePractice(index)}
                                                        color="error"
                                                        title="Eliminar práctica"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                            <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
                                                {item.original}
                                            </Typography>
                                            <Typography variant="body2" color={item.feedback.color}>
                                                {item.feedback.text}
                                            </Typography>
                                            {item.mispronouncedWords.length > 0 && (
                                                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                                                    {item.mispronouncedWords.map((word, idx) => (
                                                        <Chip
                                                            key={idx}
                                                            label={word}
                                                            onClick={() => speakText(word)}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Stack>
                                            )}
                                        </ListItem>
                                        {index < practiceHistory.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default PersonalPronunciationPractice;
