import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Badge,
  Tabs,
  Tab,
  IconButton,
  useMediaQuery,
  Tooltip,
  Button,
  Paper,
} from '@mui/material';
import { blue, purple, grey } from '@mui/material/colors';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import TranslateIcon from '@mui/icons-material/Translate';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BarChartIcon from '@mui/icons-material/BarChart';
import EditIcon from '@mui/icons-material/Edit';
import PronunciationPractice from './components/PronunciationPractice';
import LiveTranslation from './components/LiveTranslation';
import Statistics from './components/Statistics';
import Achievements from './components/Achievements';
import UserProgress from './components/UserProgress';
import PersonalPronunciationPractice from './components/PersonalPronunciationPractice';
import { storageService } from './services/storageService';

function App() {
  const theme = useTheme();
  const [totalScore, setTotalScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(storageService.getThemePreference());
  const [statistics, setStatistics] = useState(storageService.getStatistics());
  const [unlockedAchievements, setUnlockedAchievements] = useState(storageService.getAchievements());
  const [progressDialog, setProgressDialog] = useState({ open: false, type: null });
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    setIsDarkMode(storageService.getThemePreference() || prefersDarkMode);
  }, [prefersDarkMode]);

  const handleScoreUpdate = (points) => {
    setTotalScore(prev => {
      const newScore = prev + points;
      if (Math.floor(newScore / 100) > Math.floor(prev / 100)) {
        setLevel(prevLevel => prevLevel + 1);
      }
      return newScore;
    });
    setStreak(prev => prev + 1);

    // Update statistics
    setStatistics(prev => {
      const newStats = {
        ...prev,
        totalPracticeTime: prev.totalPracticeTime + 5, // Assuming 5 minutes per practice
        wordsPracticed: prev.wordsPracticed + 1,
        correctPronunciations: prev.correctPronunciations + 1,
      };
      storageService.saveStatistics(newStats);
      return newStats;
    });

    // Check for achievements
    checkAchievements();
  };

  const checkAchievements = () => {
    const newAchievements = [...unlockedAchievements];
    const currentStats = statistics;

    // Check each achievement
    if (currentStats.wordsPracticed >= 1 && !newAchievements.includes('first_word')) {
      newAchievements.push('first_word');
    }
    if (currentStats.dailyStreaks >= 7 && !newAchievements.includes('streak_7')) {
      newAchievements.push('streak_7');
    }
    if (currentStats.correctPronunciations >= 10 && !newAchievements.includes('perfect_10')) {
      newAchievements.push('perfect_10');
    }
    if (currentStats.totalPracticeTime >= 60 && !newAchievements.includes('time_master')) {
      newAchievements.push('time_master');
    }
    if (currentStats.wordsPracticed >= 100 && !newAchievements.includes('vocabulary_master')) {
      newAchievements.push('vocabulary_master');
    }

    if (newAchievements.length > unlockedAchievements.length) {
      setUnlockedAchievements(newAchievements);
      storageService.saveAchievements(newAchievements);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    storageService.saveThemePreference(newMode);
  };

  const handleProgressClick = (type) => {
    // Ensure only one modal opens at a time
    setProgressDialog({ open: true, type });
  };

  const handleProgressClose = () => {
    setProgressDialog({ open: false, type: null });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              English Learning App
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                color="inherit"
                onClick={toggleDarkMode}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'scale(1.1)',
                    transition: 'all 0.2s'
                  }
                }}
              >
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>

              <Tooltip title="Ver racha y recompensas">
                <IconButton
                  color="inherit"
                  onClick={() => handleProgressClick('streak')}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'scale(1.1)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  <Badge
                    badgeContent={streak}
                    color="secondary"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#ff4081',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        padding: '0 4px',
                        minWidth: '20px',
                        height: '20px',
                        borderRadius: '10px',
                        border: '2px solid #1976d2'
                      }
                    }}
                  >
                    <StarIcon sx={{ fontSize: 28 }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Ver progreso de nivel">
                <IconButton
                  color="inherit"
                  onClick={() => handleProgressClick('level')}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'scale(1.1)',
                      transition: 'all 0.2s'
                    }
                  }}
                >
                  <Badge
                    badgeContent={level}
                    color="secondary"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#ff4081',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        padding: '0 4px',
                        minWidth: '20px',
                        height: '20px',
                        borderRadius: '10px',
                        border: '2px solid #1976d2'
                      }
                    }}
                  >
                    <EmojiEventsIcon sx={{ fontSize: 28 }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  marginLeft: 2,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    transition: 'all 0.2s'
                  }
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #fff 30%, #e3f2fd 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  Score: {totalScore}
                </Typography>
              </Box>
            </Box>
          </Toolbar>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            centered
            textColor="inherit"
            indicatorColor="secondary"
          >
            <Tab
              icon={<RecordVoiceOverIcon />}
              label="Práctica Básica"
            />
            <Tab
              icon={<EditIcon />}
              label="Práctica Personalizada"
            />
            <Tab
              icon={<TranslateIcon />}
              label="Traducción en Vivo"
            />
            <Tab
              icon={<BarChartIcon />}
              label="Estadísticas"
            />
          </Tabs>
        </AppBar>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
          <Box sx={{
            minHeight: 'calc(100vh - 128px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            py: 4
          }}>
            {currentTab === 0 ? (
              <PronunciationPractice onScoreUpdate={handleScoreUpdate} />
            ) : currentTab === 1 ? (
              <PersonalPronunciationPractice onScoreUpdate={handleScoreUpdate} />
            ) : currentTab === 2 ? (
              <LiveTranslation />
            ) : (
              <>
                <Statistics statistics={statistics} />
                <Achievements
                  statistics={statistics}
                  unlockedAchievements={unlockedAchievements}
                />
              </>
            )}
          </Box>
        </Container>
      </Box>
      <UserProgress
        open={progressDialog.open}
        onClose={handleProgressClose}
        type={progressDialog.type}
        level={level}
        streak={streak}
        totalScore={totalScore}
        onScoreUpdate={handleScoreUpdate}
      />
    </ThemeProvider>
  );
}

export default App;
