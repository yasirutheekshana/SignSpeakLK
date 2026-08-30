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
  onOpenRecognition: (sampleId?: string) => void;
  onOpenDictionary: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onReplaySplash,
  onOpenRecognition,
  onOpenDictionary,
}) => {
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
        {/* Welcome / Active Model Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadgeRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>⚡ ResNet-50 INT8</Text>
            </View>
            <View style={styles.heroBadgeSecondary}>
              <Text style={styles.heroBadgeSecondaryText}>🎯 100.00% Acc</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Break the Silence, Connect Sri Lanka</Text>
          <Text style={styles.heroDescription}>
            Real-time on-device gesture recognition powered by optimized ResNet-50
            across 26 high-precision Sri Lankan Sign Language classes.
          </Text>

          <TouchableOpacity
            style={styles.heroCta}
            onPress={() => onOpenRecognition()}
            activeOpacity={0.8}
          >
            <Text style={styles.heroCtaText}>📸 Start Live AI Recognition</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Grid */}
        <Text style={styles.sectionTitle}>Features & Modules</Text>

        <View style={styles.featuresGrid}>
          {/* Card 1: Sign to Speech (Recognition) */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => onOpenRecognition()}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.featureIconBox,
                { backgroundColor: 'rgba(0, 201, 167, 0.15)' },
              ]}
            >
              <Text style={styles.featureIcon}>📷</Text>
            </View>
            <Text style={styles.featureTitle}>Sign to Speech</Text>
            <Text style={styles.featureDesc}>
              Real-time camera & gesture recognition with TFLite ResNet-50
            </Text>
            <View style={styles.cardActionTag}>
              <Text style={styles.cardActionTagText}>Try Model →</Text>
            </View>
          </TouchableOpacity>

          {/* Card 2: SSL Dictionary */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={onOpenDictionary}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.featureIconBox,
                { backgroundColor: 'rgba(72, 202, 228, 0.15)' },
              ]}
            >
              <Text style={styles.featureIcon}>📚</Text>
            </View>
            <Text style={styles.featureTitle}>SSL Dictionary</Text>
            <Text style={styles.featureDesc}>
              26 high-accuracy gestures with Sinhala & Tamil guides
            </Text>
            <View style={styles.cardActionTag}>
              <Text style={styles.cardActionTagText}>Explore →</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Demo Preview Box */}
        <View style={styles.demoBox}>
          <View style={styles.demoHeader}>
            <Text style={styles.demoTitle}>Quick Model Recognition Tests</Text>
            <Text style={styles.demoStatus}>● 26 Top Classes</Text>
          </View>
          <View style={styles.gestureRow}>
            <TouchableOpacity
              style={styles.gesturePill}
              onPress={() => onOpenRecognition('ssl_mata_asaniipai')}
              activeOpacity={0.7}
            >
              <Text style={styles.gesturePillText}>🤒 මට අසනීපයි (Sick)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gesturePill}
              onPress={() => onOpenRecognition('ssl_doctor_koheda_inne')}
              activeOpacity={0.7}
            >
              <Text style={styles.gesturePillText}>👨‍⚕️ දොස්තර කොහෙද?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gesturePill}
              onPress={() => onOpenRecognition('verbs_adum_sodanawa')}
              activeOpacity={0.7}
            >
              <Text style={styles.gesturePillText}>👕 ඇඳුම් සෝදනවා</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gesturePill}
              onPress={() => onOpenRecognition('additional_wama')}
              activeOpacity={0.7}
            >
              <Text style={styles.gesturePillText}>👈 වමට (Left)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gesturePill}
              onPress={() => onOpenRecognition('additional_bag_eka')}
              activeOpacity={0.7}
            >
              <Text style={styles.gesturePillText}>👜 බෑග් එක (Bag)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gesturePill}
              onPress={() => onOpenRecognition('months_february')}
              activeOpacity={0.7}
            >
              <Text style={styles.gesturePillText}>📅 පෙබරවාරි (Feb)</Text>
            </TouchableOpacity>
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
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  heroBadge: {
    backgroundColor: 'rgba(0, 201, 167, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBadgeText: {
    color: '#00C9A7',
    fontSize: 12,
    fontWeight: '700',
  },
  heroBadgeSecondary: {
    backgroundColor: 'rgba(255, 183, 3, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBadgeSecondaryText: {
    color: '#FFB703',
    fontSize: 11,
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
    marginBottom: 16,
  },
  heroCta: {
    backgroundColor: '#00C9A7',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  heroCtaText: {
    color: '#0B132B',
    fontSize: 14,
    fontWeight: '800',
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
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  featureIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  cardActionTag: {
    alignSelf: 'flex-start',
  },
  cardActionTagText: {
    color: '#00C9A7',
    fontSize: 11,
    fontWeight: '700',
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
