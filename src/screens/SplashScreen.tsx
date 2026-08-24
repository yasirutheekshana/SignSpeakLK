import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 2800,
}) => {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(25)).current;
  const pulseRing1 = useRef(new Animated.Value(0)).current;
  const pulseRing2 = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const screenFadeOut = useRef(new Animated.Value(1)).current;
  const screenScaleOut = useRef(new Animated.Value(1)).current;

  const [statusText, setStatusText] = useState('Initializing Sign AI Engine...');

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 800,
        delay: 350,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlide, {
        toValue: 0,
        duration: 800,
        delay: 350,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    const createPulseAnimation = (animatedVal: Animated.Value, delayMs: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delayMs),
          Animated.parallel([
            Animated.timing(animatedVal, {
              toValue: 1,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(animatedVal, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const pulse1 = createPulseAnimation(pulseRing1, 0);
    const pulse2 = createPulseAnimation(pulseRing2, 1000);
    pulse1.start();
    pulse2.start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration - 600,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();

    const t1 = setTimeout(() => {
      setStatusText('Loading SSL Recognition Models...');
    }, (duration - 600) * 0.38);

    const t2 = setTimeout(() => {
      setStatusText('Ready to Bridge Hands & Voices ✨');
    }, (duration - 600) * 0.78);

    const exitTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(screenFadeOut, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(screenScaleOut, {
          toValue: 1.06,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onFinish) {
          onFinish();
        }
      });
    }, duration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(exitTimer);
      pulse1.stop();
      pulse2.stop();
    };
  }, [
    duration,
    onFinish,
    logoScale,
    logoOpacity,
    contentFade,
    contentSlide,
    pulseRing1,
    pulseRing2,
    progressAnim,
    screenFadeOut,
    screenScaleOut,
  ]);

  const ring1Scale = pulseRing1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.8],
  });
  const ring1Opacity = pulseRing1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.25, 0],
  });

  const ring2Scale = pulseRing2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.8],
  });
  const ring2Opacity = pulseRing2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.25, 0],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenFadeOut,
          transform: [{ scale: screenScaleOut }],
        },
      ]}
    >
      <View style={styles.ambientGlowTop} />
      <View style={styles.ambientGlowBottom} />

      <View style={styles.centerSection}>
        <Animated.View
          style={[
            styles.pulseRing,
            {
              opacity: ring1Opacity,
              transform: [{ scale: ring1Scale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.pulseRing,
            styles.pulseRingSecondary,
            {
              opacity: ring2Opacity,
              transform: [{ scale: ring2Scale }],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../assets/images/signspeak_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.brandingContainer,
            {
              opacity: contentFade,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>SignSpeak</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>LK</Text>
            </View>
          </View>

          <Text style={styles.taglineText}>
            Bridging Hands & Voices Across Sri Lanka
          </Text>

          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>🖐️ Sign</Text>
            </View>
            <View style={styles.chipDivider} />
            <View style={styles.chip}>
              <Text style={styles.chipText}>🗣️ Voice</Text>
            </View>
            <View style={styles.chipDivider} />
            <View style={styles.chip}>
              <Text style={styles.chipText}>🇱🇰 SSL</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.bottomSection,
          {
            opacity: contentFade,
          },
        ]}
      >
        <Text style={styles.statusText}>{statusText}</Text>
        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>

        <Text style={styles.versionText}>
          Sri Lankan Sign Language Initiative • v1.0.0
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: height * 0.08,
    paddingHorizontal: 24,
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0, 201, 167, 0.15)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(72, 202, 228, 0.12)',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pulseRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: '#00C9A7',
  },
  pulseRingSecondary: {
    borderColor: '#48CAE4',
    borderWidth: 1.5,
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00C9A7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 15,
  },
  logoImage: {
    width: 145,
    height: 145,
    borderRadius: 34,
  },
  brandingContainer: {
    alignItems: 'center',
    marginTop: 28,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  badgeContainer: {
    backgroundColor: '#FFB703',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
    shadowColor: '#FFB703',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeText: {
    color: '#0B132B',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  taglineText: {
    fontSize: 14,
    color: '#90E0EF',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    backgroundColor: 'rgba(28, 37, 65, 0.75)',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(72, 202, 228, 0.25)',
  },
  chip: {
    paddingHorizontal: 4,
  },
  chipText: {
    color: '#CAF0F8',
    fontSize: 12,
    fontWeight: '600',
  },
  chipDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(72, 202, 228, 0.5)',
    marginHorizontal: 8,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  statusText: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  progressBarTrack: {
    width: width * 0.65,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00C9A7',
    borderRadius: 2,
  },
  versionText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '400',
  },
});

export default SplashScreen;
