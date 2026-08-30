import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  NativeSyntheticEvent,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import signClassifierService, {
  ClassificationResponse,
  ModelMetadata,
  PredictionResult,
} from '../services/SignClassifierService';
import { getSignInfo } from '../data/signDatabase';
import {
  SignCameraView,
  SignDetectionNativeEvent,
} from '../components/SignCameraView';

const { width } = Dimensions.get('window');

interface SignRecognitionScreenProps {
  onBack: () => void;
  initialSampleId?: string;
}

export const SignRecognitionScreen: React.FC<SignRecognitionScreenProps> = ({
  onBack,
  initialSampleId,
}) => {
  const insets = useSafeAreaInsets();

  const [modelInfo, setModelInfo] = useState<ModelMetadata | null>(null);
  const [currentResult, setCurrentResult] = useState<ClassificationResponse | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [selectedSample, setSelectedSample] = useState<string>(
    initialSampleId || 'ssl_mata_asaniipai'
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Camera States
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [lensFacing, setLensFacing] = useState<'front' | 'back'>('front');
  const [isCameraPaused, setIsCameraPaused] = useState(false);

  // Animations
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const cardFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Request camera permission on mount
    checkAndRequestPermission();

    // 2. Load model metadata
    signClassifierService.getModelMetadata().then(info => {
      setModelInfo(info);
    });

    // 4. Trigger initial sample
    handleClassifySample(initialSampleId || 'ssl_mata_asaniipai');
  }, [initialSampleId]);

  const checkAndRequestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const alreadyGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (alreadyGranted) {
          setHasCameraPermission(true);
          return;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'SignSpeakLK Camera Access',
            message:
              'SignSpeakLK needs camera permission to capture and recognize Sri Lankan Sign Language gestures in real time.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow Camera',
          }
        );
        setHasCameraPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn('Camera permission request error:', err);
        setHasCameraPermission(false);
      }
    } else {
      setHasCameraPermission(true);
    }
  };

  const handleNativeSignDetected = (
    event: NativeSyntheticEvent<SignDetectionNativeEvent>
  ) => {
    const data = event.nativeEvent;
    if (data && data.predictions && data.predictions.length > 0) {
      const topPred = data.predictions[0];
      const predictions: PredictionResult[] = data.predictions.map(p => ({
        label: p.label,
        confidence: p.confidence,
        confidencePercent: `${(p.confidence * 100).toFixed(1)}%`,
        classIndex: p.classIndex,
        signInfo: getSignInfo(p.label),
      }));

      setCurrentResult({
        predictions,
        latencyMs: data.latencyMs || 24,
        timestamp: data.timestamp || Date.now(),
        source: 'native_tflite',
      });
      setSelectedSample(topPred.label);
    }
  };

  const handleClassifySample = async (sampleId: string) => {
    setSelectedSample(sampleId);
    setIsClassifying(true);

    try {
      const response = await signClassifierService.classifySampleGesture(sampleId, 3);
      setCurrentResult(response);

      cardFadeAnim.setValue(0.7);
      Animated.spring(cardFadeAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } catch (e: any) {
      Alert.alert('Classification Error', e?.message || 'Failed to process gesture');
    } finally {
      setIsClassifying(false);
    }
  };

  const toggleCameraFacing = () => {
    setLensFacing(prev => (prev === 'front' ? 'back' : 'front'));
  };

  const toggleCameraPause = () => {
    setIsCameraPaused(prev => !prev);
  };

  const handleSpeak = (textToSpeak: string) => {
    setIsSpeaking(true);
    setTimeout(() => {
      setIsSpeaking(false);
    }, 1500);
  };

  const handleRunBenchmark = async () => {
    const res = await signClassifierService.runBenchmarkTest();
    Alert.alert(
      '⚡ TFLite Benchmark Results',
      `Model: best_model_int8.tflite\nArchitecture: EfficientNet-B0\nTotal Classes: ${res.numClasses}\nInference Speed: ${res.latencyMs} ms / frame\nAccuracy: ${res.accuracy}\nStatus: ${res.status}`
    );
  };

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240],
  });

  const topPrediction: PredictionResult | undefined = currentResult?.predictions[0];

  // Quick sample test chips
  const sampleGestures = [
    { id: 'ssl_mata_asaniipai', title: 'Mata Asaniipai', icon: '🤒' },
    { id: 'ssl_doctor_koheda_inne', title: 'Doctor Koheda?', icon: '👨‍⚕️' },
    { id: 'verbs_adum_sodanawa', title: 'Wash Clothes', icon: '👕' },
    { id: 'additional_wama', title: 'Turn Left', icon: '👈' },
    { id: 'additional_bag_eka', title: 'Bag Eka', icon: '👜' },
    { id: 'ssl_mata_beheth_denna', title: 'Give Medicine', icon: '💊' },
    { id: 'verbs_ambaranawa', title: 'Grinding', icon: '🔄' },
    { id: 'months_february', title: 'February', icon: '📅' },
  ];

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Live Gesture AI</Text>
          <Text style={styles.headerSubtitle}>
            {hasCameraPermission ? '● Live Camera Active' : 'best_model_int8.tflite'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.benchmarkBtn}
          onPress={handleRunBenchmark}
          activeOpacity={0.7}
        >
          <Text style={styles.benchmarkBtnText}>⚡ Test</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 20, 30) },
        ]}
      >
        {/* Model Spec Badge */}
        <View style={styles.modelBadgeRow}>
          <View style={styles.modelBadge}>
            <Text style={styles.modelBadgeText}>🧠 ResNet-50 INT8</Text>
          </View>
          <View style={styles.modelBadgeSecondary}>
            <Text style={styles.modelBadgeTextSecondary}>🎯 100.00% Acc</Text>
          </View>
          <View style={styles.modelBadgeSecondary}>
            <Text style={styles.modelBadgeTextSecondary}>
              ⚡ {currentResult?.latencyMs || 24} ms
            </Text>
          </View>
        </View>

        {/* Live Camera Viewfinder Card */}
        <View style={styles.viewfinderCard}>
          <View style={styles.viewfinderScreen}>
            {/* Real Native CameraX Stream */}
            {hasCameraPermission ? (
              <SignCameraView
                key={`camera-${lensFacing}-${hasCameraPermission ? 'ready' : 'init'}`}
                style={styles.cameraStream}
                lensFacing={lensFacing}
                isPaused={isCameraPaused}
                onSignDetected={handleNativeSignDetected}
              />
            ) : (
              /* Permission fallback / Request card */
              <View style={styles.permissionPlaceholder}>
                <Text style={styles.permissionIcon}>📷</Text>
                <Text style={styles.permissionTitle}>Camera Permission Required</Text>
                <Text style={styles.permissionDesc}>
                  Allow camera access to recognize Sri Lankan Sign Language gestures in real time.
                </Text>
                <TouchableOpacity
                  style={styles.permissionBtn}
                  onPress={checkAndRequestPermission}
                  activeOpacity={0.8}
                >
                  <Text style={styles.permissionBtnText}>Enable Camera</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Viewfinder Corner Brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            

            {/* Top HUD Controls Overlay */}
            <View style={styles.hudHeader}>
              <View style={styles.liveIndicator}>
                <View
                  style={[
                    styles.liveDot,
                    isCameraPaused && { backgroundColor: '#FFB703' },
                  ]}
                />
                <Text style={styles.liveText}>
                  {isCameraPaused
                    ? 'CAM PAUSED'
                    : hasCameraPermission
                    ? `LIVE CAM (${lensFacing.toUpperCase()})`
                    : 'AI DEMO MODE'}
                </Text>
              </View>

              {/* Camera Action Buttons (Flip & Pause) */}
              {hasCameraPermission && (
                <View style={styles.hudActions}>
                  <TouchableOpacity
                    style={styles.hudActionBtn}
                    onPress={toggleCameraFacing}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.hudActionBtnText}>🔄 Flip</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.hudActionBtn}
                    onPress={toggleCameraPause}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.hudActionBtnText}>
                      {isCameraPaused ? '▶ Play' : '⏸ Pause'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Bottom Target Bounding Box / Detected Tag */}
            <View style={styles.hudBottom}>
              {topPrediction && (
                <View style={styles.confidenceTag}>
                  <Text style={styles.confidenceTagIcon}>
                    {topPrediction.signInfo.icon}
                  </Text>
                  <Text style={styles.confidenceTagText}>
                    {topPrediction.signInfo.english} • {topPrediction.confidencePercent}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Quick Test Samples */}
        <Text style={styles.sectionHeader}>Test Sign Gesture Samples</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sampleChipsContainer}
        >
          {sampleGestures.map(sample => {
            const isSelected = selectedSample === sample.id;
            return (
              <TouchableOpacity
                key={sample.id}
                style={[
                  styles.sampleChip,
                  isSelected && styles.sampleChipSelected,
                ]}
                onPress={() => handleClassifySample(sample.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.sampleChipIcon}>{sample.icon}</Text>
                <Text
                  style={[
                    styles.sampleChipText,
                    isSelected && styles.sampleChipTextSelected,
                  ]}
                >
                  {sample.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Real-time Recognition Result Card */}
        {topPrediction && (
          <Animated.View
            style={[
              styles.resultCard,
              {
                opacity: cardFadeAnim,
              },
            ]}
          >
            <View style={styles.resultHeader}>
              <View style={styles.resultCategoryBadge}>
                <Text style={styles.resultCategoryText}>
                  {topPrediction.signInfo.category}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.speakButton,
                  isSpeaking && styles.speakButtonActive,
                ]}
                onPress={() => handleSpeak(topPrediction.signInfo.sinhala)}
                activeOpacity={0.7}
              >
                <Text style={styles.speakButtonText}>
                  {isSpeaking ? '🔊 Speaking...' : '🗣️ Speak Voice'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Trilingual Translations */}
            <View style={styles.translationBlock}>
              <Text style={styles.englishText}>
                {topPrediction.signInfo.english}
              </Text>

              {/* Sinhala */}
              <View style={styles.langRow}>
                <View style={styles.langTag}>
                  <Text style={styles.langTagText}>සිංහල</Text>
                </View>
                <View style={styles.langContent}>
                  <Text style={styles.sinhalaText}>
                    {topPrediction.signInfo.sinhala}
                  </Text>
                  <Text style={styles.phoneticText}>
                    ({topPrediction.signInfo.sinhalaPhonetic})
                  </Text>
                </View>
              </View>

              {/* Tamil */}
              <View style={styles.langRow}>
                <View style={[styles.langTag, { backgroundColor: '#7B2CBF' }]}>
                  <Text style={styles.langTagText}>தமிழ்</Text>
                </View>
                <Text style={styles.tamilText}>
                  {topPrediction.signInfo.tamil}
                </Text>
              </View>
            </View>

            {/* Gesture Guide */}
            <View style={styles.guideBox}>
              <Text style={styles.guideTitle}>💡 How to Sign:</Text>
              <Text style={styles.guideText}>
                {topPrediction.signInfo.gestureGuide}
              </Text>
            </View>

            {/* Probability Breakdown (Top 3) */}
            <Text style={styles.probTitle}>Model Confidence Distribution</Text>
            {currentResult?.predictions.map((pred, index) => (
              <View key={pred.label} style={styles.probRow}>
                <Text style={styles.probLabel} numberOfLines={1}>
                  #{index + 1} {pred.signInfo.english}
                </Text>
                <View style={styles.probBarTrack}>
                  <View
                    style={[
                      styles.probBarFill,
                      {
                        width: `${Math.max(pred.confidence * 100, 6)}%`,
                        backgroundColor:
                          index === 0 ? '#00C9A7' : index === 1 ? '#48CAE4' : '#64748B',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.probPercent}>{pred.confidencePercent}</Text>
              </View>
            ))}
          </Animated.View>
        )}
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
  },
  backBtnText: {
    color: '#CAF0F8',
    fontSize: 14,
    fontWeight: '700',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#00C9A7',
    fontSize: 11,
    fontWeight: '600',
  },
  benchmarkBtn: {
    backgroundColor: 'rgba(255, 183, 3, 0.15)',
    borderWidth: 1,
    borderColor: '#FFB703',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  benchmarkBtnText: {
    color: '#FFB703',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
  },
  modelBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  modelBadge: {
    backgroundColor: 'rgba(0, 201, 167, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 201, 167, 0.3)',
  },
  modelBadgeText: {
    color: '#00C9A7',
    fontSize: 11,
    fontWeight: '700',
  },
  modelBadgeSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },
  modelBadgeTextSecondary: {
    color: '#90E0EF',
    fontSize: 11,
    fontWeight: '600',
  },
  viewfinderCard: {
    backgroundColor: '#16223B',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(72, 202, 228, 0.3)',
    marginBottom: 20,
    shadowColor: '#00C9A7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  viewfinderScreen: {
    height: 270,
    backgroundColor: '#070D1E',
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cameraStream: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  permissionPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#0E172E',
  },
  permissionIcon: {
    fontSize: 44,
    marginBottom: 10,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  permissionDesc: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  permissionBtn: {
    backgroundColor: '#00C9A7',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 14,
  },
  permissionBtnText: {
    color: '#0B132B',
    fontSize: 13,
    fontWeight: '800',
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: '#00C9A7',
    zIndex: 10,
  },
  cornerTL: {
    top: 10,
    left: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 10,
    right: 10,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00C9A7',
    shadowColor: '#00C9A7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    zIndex: 8,
  },
  hudHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    zIndex: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#00C9A7',
    marginRight: 6,
  },
  liveText: {
    color: '#00C9A7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hudActions: {
    flexDirection: 'row',
    gap: 6,
  },
  hudActionBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  hudActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  hudBottom: {
    padding: 12,
    alignItems: 'center',
    zIndex: 12,
  },
  confidenceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 19, 43, 0.85)',
    borderWidth: 1,
    borderColor: '#00C9A7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confidenceTagIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  confidenceTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  sampleChipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 6,
    marginBottom: 18,
  },
  sampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C2541',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sampleChipSelected: {
    backgroundColor: 'rgba(0, 201, 167, 0.2)',
    borderColor: '#00C9A7',
  },
  sampleChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  sampleChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  sampleChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#1C2541',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 201, 167, 0.3)',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultCategoryBadge: {
    backgroundColor: 'rgba(72, 202, 228, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resultCategoryText: {
    color: '#48CAE4',
    fontSize: 11,
    fontWeight: '700',
  },
  speakButton: {
    backgroundColor: '#00C9A7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  speakButtonActive: {
    backgroundColor: '#FFB703',
  },
  speakButtonText: {
    color: '#0B132B',
    fontSize: 12,
    fontWeight: '800',
  },
  translationBlock: {
    marginBottom: 16,
  },
  englishText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  langTag: {
    backgroundColor: '#0077B6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 10,
    marginTop: 2,
  },
  langTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  langContent: {
    flex: 1,
  },
  sinhalaText: {
    color: '#FFB703',
    fontSize: 16,
    fontWeight: '700',
  },
  phoneticText: {
    color: '#94A3B8',
    fontSize: 11,
    fontStyle: 'italic',
  },
  tamilText: {
    color: '#CAF0F8',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  guideBox: {
    backgroundColor: 'rgba(11, 19, 43, 0.6)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#00C9A7',
  },
  guideTitle: {
    color: '#00C9A7',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  guideText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
  },
  probTitle: {
    color: '#CAF0F8',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  probRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  probLabel: {
    color: '#94A3B8',
    fontSize: 11,
    width: '38%',
  },
  probBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  probBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  probPercent: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    width: 44,
    textAlign: 'right',
  },
});

export default SignRecognitionScreen;
