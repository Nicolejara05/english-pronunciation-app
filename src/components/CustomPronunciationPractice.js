import React, { useState } from 'react';
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
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';

const CustomPronunciationPractice = () => {
    const [customText, setCustomText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [spokenText, setSpokenText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [savedPractices, setSavedPractices] = useState([]);

    // Cargar prácticas guardadas del localStorage
    React.useEffect(() => {
        const saved = localStorage.getItem('customPractices');
        if (saved) {
            setSavedPractices(JSON.parse(saved));
        }
    }, []);

    const startListening = () => {
        setError(null);
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.lang = 'en-US';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                setIsListening(true);
                setSpokenText('');
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setSpokenText(transcript);
                setIsListening(false);
                checkPronunciation(transcript);
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

    const checkPronunciation = async (spokenText) => {
        setIsProcessing(true);
        setError(null);

        try {
            // Aquí podríamos implementar una lógica más sofisticada de comparación
            // Por ahora, haremos una comparación simple
            const similarity = calculateSimilarity(spokenText.toLowerCase(), customText.toLowerCase());
            const feedback = getFeedback(similarity);

            const practiceItem = {
                original: customText,
                spoken: spokenText,
                feedback,
                timestamp: new Date().toISOString(),
            };

            const newSavedPractices = [practiceItem, ...savedPractices];
            setSavedPractices(newSavedPractices);
            localStorage.setItem('customPractices', JSON.stringify(newSavedPractices));
        } catch (err) {
            console.error('Error:', err);
            setError('Error al procesar la pronunciación. Por favor, intenta de nuevo.');
        } finally {
            setIsProcessing(false);
        }
    };

    const calculateSimilarity = (str1, str2) => {
        // Implementación simple de similitud
        const words1 = str1.split(' ');
        const words2 = str2.split(' ');
        const commonWords = words1.filter(word => words2.includes(word));
        return commonWords.length / Math.max(words1.length, words2.length);
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
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleTextSubmit();
        }
    };

    const deletePractice = (index) => {
        const newSavedPractices = savedPractices.filter((_, i) => i !== index);
        setSavedPractices(newSavedPractices);
        localStorage.setItem('customPractices', JSON.stringify(newSavedPractices));
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
        <Box sx={{ width: '100%', maxWidth: 1600, mx: 'auto', p: 2 }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
                {/* Panel principal de práctica */}
                <Card elevation={3} sx={{ flex: 1 }}>
                    <CardContent>
                        <Typography variant="h4" gutterBottom align="center">
                            Práctica de Pronunciación Personalizada
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    placeholder="Escribe el texto en inglés que quieres practicar..."
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={isListening}
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleTextSubmit}
                                        disabled={!customText.trim() || isListening}
                                        sx={{ minWidth: 'auto', p: 1 }}
                                    >
                                        <SendIcon />
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={startListening}
                                        disabled={isListening || !customText.trim()}
                                        sx={{ minWidth: 'auto', p: 1 }}
                                    >
                                        <MicIcon />
                                    </Button>
                                </Box>
                            </Box>

                            {isListening && (
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <CircularProgress />
                                </Box>
                            )}

                            {error && (
                                <Alert severity="error">
                                    {error}
                                </Alert>
                            )}

                            {spokenText && (
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 2,
                                        bgcolor: 'background.paper',
                                        border: 1,
                                        borderColor: 'divider',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                            transition: 'background-color 0.2s'
                                        }
                                    }}
                                >
                                    <Typography variant="subtitle1" gutterBottom>
                                        Lo que dijiste:
                                    </Typography>
                                    <Typography variant="body1">{spokenText}</Typography>
                                </Paper>
                            )}

                            {isProcessing && (
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <CircularProgress />
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>

                {/* Panel de prácticas guardadas */}
                <Card elevation={3} sx={{ width: 400, display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                Historial de Prácticas
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                            {savedPractices.length === 0 ? (
                                <Box sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No hay prácticas guardadas
                                    </Typography>
                                </Box>
                            ) : (
                                <List>
                                    {savedPractices.map((item, index) => (
                                        <React.Fragment key={index}>
                                            <ListItem
                                                sx={{
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    gap: 1,
                                                    '&:hover': {
                                                        bgcolor: 'action.hover',
                                                        borderRadius: 1
                                                    }
                                                }}
                                            >
                                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body1" color="primary" sx={{ fontWeight: 'medium' }}>
                                                            {item.original}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatDate(item.timestamp)}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => speakText(item.original)}
                                                            sx={{ color: 'primary.main', mr: 1 }}
                                                        >
                                                            <VolumeUpIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => deletePractice(index)}
                                                            sx={{ color: 'error.main' }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                    {item.spoken}
                                                </Typography>
                                                <Typography variant="body2" color={item.feedback.color} sx={{ mt: 0.5 }}>
                                                    {item.feedback.text}
                                                </Typography>
                                            </ListItem>
                                            {index < savedPractices.length - 1 && (
                                                <Divider sx={{ my: 1 }} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default CustomPronunciationPractice; 