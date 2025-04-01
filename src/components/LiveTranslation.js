import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    IconButton,
    Paper,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Divider,
    Button,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteIcon from '@mui/icons-material/Delete';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';

const LiveTranslation = () => {
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [translatedText, setTranslatedText] = useState('');
    const [savedTranslations, setSavedTranslations] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentSpeakingId, setCurrentSpeakingId] = useState(null);
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        // Cargar traducciones guardadas del localStorage
        const saved = localStorage.getItem('savedTranslations');
        if (saved) {
            setSavedTranslations(JSON.parse(saved));
        }
    }, []);

    // Nuevo efecto para manejar la traducción automática
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (inputText.trim()) {
                handleTranslation(inputText);
            } else {
                setTranslatedText('');
            }
        }, 500); // Esperar 500ms después de que el usuario deje de escribir

        return () => clearTimeout(delayDebounce);
    }, [inputText]);

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.lang = 'es-ES';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
            };

            recognition.onerror = (event) => {
                console.error('Error:', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        }
    };

    const handleTranslation = async (text) => {
        if (!text.trim() || isTranslating) return;

        setIsTranslating(true);
        try {
            const encodedText = encodeURIComponent(text);
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=es|en`
            );

            if (!response.ok) {
                throw new Error('Error de conexión con el servicio de traducción');
            }

            const data = await response.json();

            if (data.responseStatus === 200) {
                setTranslatedText(data.responseData.translatedText);
            } else {
                throw new Error(data.responseDetails || 'Error en la traducción');
            }
        } catch (err) {
            console.error('Error:', err);
            setTranslatedText('Error al traducir. Por favor, intenta de nuevo.');
        } finally {
            setIsTranslating(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
        }
    };

    const saveTranslation = () => {
        if (inputText && translatedText) {
            const newTranslation = {
                original: inputText,
                translated: translatedText,
                timestamp: new Date().toISOString(),
            };
            const updatedTranslations = [newTranslation, ...savedTranslations];
            setSavedTranslations(updatedTranslations);
            localStorage.setItem('savedTranslations', JSON.stringify(updatedTranslations));
        }
    };

    const deleteTranslation = (index) => {
        const updatedTranslations = savedTranslations.filter((_, i) => i !== index);
        setSavedTranslations(updatedTranslations);
        localStorage.setItem('savedTranslations', JSON.stringify(updatedTranslations));
    };

    const speakText = (text, isEnglish = false, id = null) => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setCurrentSpeakingId(null);
            return;
        }

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = isEnglish ? 'en-US' : 'es-ES';

        speech.onend = () => {
            setIsSpeaking(false);
            setCurrentSpeakingId(null);
        };

        speech.onerror = () => {
            setIsSpeaking(false);
            setCurrentSpeakingId(null);
        };

        setIsSpeaking(true);
        setCurrentSpeakingId(id);
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
            {/* Panel principal de traducción */}
            <Box sx={{ flex: 1.5 }}>
                <Card elevation={3}>
                    <CardContent>
                        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
                            Traducción en Vivo
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Input de texto */}
                            <Box sx={{ position: 'relative', display: 'flex' }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    maxRows={8}
                                    variant="outlined"
                                    placeholder="Escribe el texto en español o usa el micrófono..."
                                    label={inputText ? `Texto en español (${inputText.length}/500)` : ''}
                                    value={inputText}
                                    onChange={(e) => {
                                        const newText = e.target.value;
                                        if (newText.length <= 500) {
                                            setInputText(newText);
                                        }
                                    }}
                                    onKeyPress={handleKeyPress}
                                    inputProps={{
                                        maxLength: 500,
                                        style: { paddingRight: '120px' }
                                    }}
                                    sx={{
                                        flex: 1,
                                        '& .MuiInputBase-root': {
                                            '&::-webkit-scrollbar': {
                                                display: 'none'
                                            },
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none',
                                            maxHeight: '100%'
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
                                        onClick={startListening}
                                        disabled={isListening}
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

                            {/* Resultado de la traducción */}
                            {translatedText && (
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
                                        Traducción:
                                    </Typography>
                                    <Typography variant="body1">
                                        {translatedText}
                                    </Typography>
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        display: 'flex',
                                        gap: 1
                                    }}>
                                        <IconButton
                                            onClick={() => speakText(translatedText, true, 'current')}
                                            sx={{
                                                color: 'primary.contrastText',
                                                ...(isSpeaking && currentSpeakingId === 'current' && {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                })
                                            }}
                                        >
                                            {isSpeaking && currentSpeakingId === 'current' ? <StopIcon /> : <VolumeUpIcon />}
                                        </IconButton>
                                        <IconButton
                                            onClick={saveTranslation}
                                            sx={{ color: 'primary.contrastText' }}
                                        >
                                            <BookmarkIcon />
                                        </IconButton>
                                    </Box>
                                </Paper>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Panel de traducciones guardadas */}
            <Card elevation={3} sx={{ flex: 1, maxHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BookmarkIcon color="primary" />
                            Traducciones Guardadas
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
                        {savedTranslations.length === 0 ? (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body1" color="text.secondary">
                                    No hay traducciones guardadas
                                </Typography>
                            </Box>
                        ) : (
                            <List>
                                {savedTranslations.map((item, index) => (
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
                                                        onClick={() => speakText(item.translated, true, index)}
                                                        sx={{
                                                            mr: 1,
                                                            ...(isSpeaking && currentSpeakingId === index && {
                                                                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                                            })
                                                        }}
                                                        title={isSpeaking && currentSpeakingId === index ? "Detener" : "Escuchar en inglés"}
                                                    >
                                                        {isSpeaking && currentSpeakingId === index ? <StopIcon /> : <VolumeUpIcon />}
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => deleteTranslation(index)}
                                                        color="error"
                                                        title="Eliminar traducción"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                            <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
                                                {item.original}
                                            </Typography>
                                            <Typography variant="body2" color="primary" sx={{ fontStyle: 'italic' }}>
                                                {item.translated}
                                            </Typography>
                                        </ListItem>
                                        {index < savedTranslations.length - 1 && <Divider />}
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

export default LiveTranslation; 