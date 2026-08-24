import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HomeScreenProps {
  onReplaySplash: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onReplaySplash }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../assets/images/signspeak_logo.png')}
            style={styles.headerLogo}
          />
          <View>
            <View style={styles.brandRow}>
              <Text style={styles.brandTitle}>SignSpeak</Text>
              <View style={styles.brandBadge}>
                <Text style={styles.brandBadgeText}>LK</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>Sri Lankan Sign Language AI</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.replayButton}
          onPress={onReplaySplash}
          activeOpacity={0.7}
        >
          <Text style={styles.replayButtonText}>✨ Splash</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 20, 30) },
        ]}
      >
        {/* Welcome Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>🇱🇰 SSL Model v2.4 Active</Text>
          </View>
          <Text style={styles.heroTitle}>Break the Silence, Connect Sri Lanka</Text>
          <Text style={styles.heroDescription}>
            Real-time two-way translation between Sri Lankan Sign Language (SSL),
            Sinhala.
          </Text>
        </View>

        {/* Feature Grid */}
        <Text style={styles.sectionTitle}>Key Features</Text>

        <View style={styles.featuresGrid}>
          {/* Card 1 */}
          <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
            <View style={[styles.featureIconBox, { backgroundColor: 'rgba(0, 201, 167, 0.15)' }]}>
              <Text style={styles.featureIcon}>📷</Text>
            </View>
            <Text style={styles.featureTitle}>Sign to Speech</Text>
            <Text style={styles.featureDesc}>
              Real-time camera gesture recognition to voice
            </Text>
          </TouchableOpacity>

          {/* Card 2 */}
          <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
            <View style={[styles.featureIconBox, { backgroundColor: 'rgba(72, 202, 228, 0.15)' }]}>
              <Text style={styles.featureIcon}>🎙️</Text>
            </View>
            <Text style={styles.featureTitle}>Speech to Sign</Text>
            <Text style={styles.featureDesc}>
              Voice to 3D avatar Sri Lankan sign playback
            </Text>
          </TouchableOpacity>

          {/* Card 3 */}
          <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
            <View style={[styles.featureIconBox, { backgroundColor: 'rgba(255, 183, 3, 0.15)' }]}>
              <Text style={styles.featureIcon}>📚</Text>
            </View>
            <Text style={styles.featureTitle}>SSL Dictionary</Text>
            <Text style={styles.featureDesc}>
              Over 2,500+ localized Sri Lankan signs
            </Text>
          </TouchableOpacity>

          {/* Card 4 */}
          <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
            <View style={[styles.featureIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
              <Text style={styles.featureIcon}>🎓</Text>
            </View>
            <Text style={styles.featureTitle}>Learn & Practice</Text>
            <Text style={styles.featureDesc}>
              Interactive lessons with AI feedback
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Demo Preview Box */}
        <View style={styles.demoBox}>
          <View style={styles.demoHeader}>
            <Text style={styles.demoTitle}>Quick SSL Gestures</Text>
            <Text style={styles.demoStatus}>● Live</Text>
          </View>
          <View style={styles.gestureRow}>
            <View style={styles.gesturePill}>
              <Text style={styles.gesturePillText}>🙏 ආයුබෝවන් (Hello)</Text>
            </View>
            <View style={styles.gesturePill}>
              <Text style={styles.gesturePillText}>❤️ ස්තූතියි (Thank You)</Text>
            </View>
            <View style={styles.gesturePill}>
              <Text style={styles.gesturePillText}>🤝 සහය (Help)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  brandBadge: {
    backgroundColor: '#FFB703',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  brandBadgeText: {
    color: '#0B132B',
    fontSize: 11,
    fontWeight: '900',
  },
  brandSubtitle: {
    color: '#90E0EF',
    fontSize: 11,
    fontWeight: '500',
  },
  replayButton: {
    backgroundColor: 'rgba(0, 201, 167, 0.15)',
    borderWidth: 1,
    borderColor: '#00C9A7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  replayButtonText: {
    color: '#00C9A7',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
  },
  heroCard: {
    backgroundColor: '#1C2541',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(72, 202, 228, 0.25)',
    marginBottom: 24,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 201, 167, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  heroBadgeText: {
    color: '#00C9A7',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroDescription: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#1C2541',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
  demoBox: {
    backgroundColor: '#16223B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 201, 167, 0.2)',
  },
  demoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  demoTitle: {
    color: '#CAF0F8',
    fontSize: 14,
    fontWeight: '700',
  },
  demoStatus: {
    color: '#00C9A7',
    fontSize: 11,
    fontWeight: '700',
  },
  gestureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gesturePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gesturePillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default HomeScreen;
