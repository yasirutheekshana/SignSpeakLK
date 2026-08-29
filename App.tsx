import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from './src/screens/SplashScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SignRecognitionScreen } from './src/screens/SignRecognitionScreen';
import { SSLDictionaryScreen } from './src/screens/SSLDictionaryScreen';

type ScreenType = 'home' | 'recognition' | 'dictionary';

function App(): React.JSX.Element {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [initialSampleId, setInitialSampleId] = useState<string | undefined>(undefined);

  const handleOpenRecognition = (sampleId?: string) => {
    setInitialSampleId(sampleId);
    setCurrentScreen('recognition');
  };

  const handleOpenDictionary = () => {
    setCurrentScreen('dictionary');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {showSplash ? (
          <SplashScreen
            duration={2800}
            onFinish={() => setShowSplash(false)}
          />
        ) : currentScreen === 'recognition' ? (
          <SignRecognitionScreen
            onBack={handleBackToHome}
            initialSampleId={initialSampleId}
          />
        ) : currentScreen === 'dictionary' ? (
          <SSLDictionaryScreen
            onBack={handleBackToHome}
            onSelectSignForRecognition={signId => handleOpenRecognition(signId)}
          />
        ) : (
          <HomeScreen
            onReplaySplash={() => setShowSplash(true)}
            onOpenRecognition={handleOpenRecognition}
            onOpenDictionary={handleOpenDictionary}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
});

export default App;


