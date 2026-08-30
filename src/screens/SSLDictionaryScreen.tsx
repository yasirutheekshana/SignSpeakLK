import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  SIGN_CATEGORIES,
  SIGN_DATABASE,
  SignItem,
  TOP26_LABELS,
} from '../data/signDatabase';

interface SSLDictionaryScreenProps {
  onBack: () => void;
  onSelectSignForRecognition: (signId: string) => void;
}

export const SSLDictionaryScreen: React.FC<SSLDictionaryScreenProps> = ({
  onBack,
  onSelectSignForRecognition,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allSigns = Object.values(SIGN_DATABASE);

  // Filtered list
  const filteredSigns = allSigns.filter(item => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      query === '' ||
      item.english.toLowerCase().includes(query) ||
      item.sinhala.toLowerCase().includes(query) ||
      item.sinhalaPhonetic.toLowerCase().includes(query) ||
      item.tamil.toLowerCase().includes(query) ||
      item.label.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  const renderSignCard = ({ item }: { item: SignItem }) => {
    const isExpanded = expandedId === item.id;
    const isTrainedClass = TOP26_LABELS.includes(item.label);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isExpanded && styles.cardExpanded,
          isTrainedClass && styles.cardTrained,
        ]}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <View style={styles.cardTitles}>
              <View style={styles.titleRowWithBadge}>
                <Text style={styles.cardEnglish}>{item.english}</Text>
                {isTrainedClass && (
                  <View style={styles.trainedBadge}>
                    <Text style={styles.trainedBadgeText}>✨ 100% Acc</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardSinhala}>
                {item.sinhala} • {item.tamil}
              </Text>
            </View>
          </View>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phonetic (Sinhala):</Text>
              <Text style={styles.detailValue}>{item.sinhalaPhonetic}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Model Class ID:</Text>
              <Text style={styles.detailValueCode}>{item.label}</Text>
            </View>

            <View style={styles.gestureGuideBox}>
              <Text style={styles.guideTitle}>🖐️ Gesture Guide:</Text>
              <Text style={styles.guideContent}>{item.gestureGuide}</Text>
            </View>

            <TouchableOpacity
              style={styles.testBtn}
              onPress={() => onSelectSignForRecognition(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.testBtnText}>⚡ Test AI Recognition on this Sign</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>SSL Dictionary</Text>
          <Text style={styles.headerSubtitle}>
            26 Core Classes • ResNet-50 (100% Acc)
          </Text>
        </View>

        <View style={styles.headerCount}>
          <Text style={styles.headerCountText}>{filteredSigns.length}</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Sinhala, Tamil, English, or Sign..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Pills */}
      <View style={styles.filterWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={SIGN_CATEGORIES as unknown as string[]}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  isSelected && styles.filterPillSelected,
                ]}
                onPress={() => setSelectedCategory(item)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected && styles.filterPillTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* List of Signs */}
      <FlatList
        data={filteredSigns}
        keyExtractor={item => item.id}
        renderItem={renderSignCard}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom + 20, 30) },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No matching signs found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching with another keyword or category.
            </Text>
          </View>
        }
      />
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
  headerCount: {
    backgroundColor: 'rgba(0, 201, 167, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerCountText: {
    color: '#00C9A7',
    fontSize: 12,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: '#1C2541',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 12,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  filterWrapper: {
    marginVertical: 12,
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    backgroundColor: '#1C2541',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  filterPillSelected: {
    backgroundColor: '#00C9A7',
    borderColor: '#00C9A7',
  },
  filterPillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextSelected: {
    color: '#0B132B',
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    backgroundColor: '#1C2541',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardExpanded: {
    borderColor: 'rgba(0, 201, 167, 0.4)',
    backgroundColor: '#16223B',
  },
  cardTrained: {
    borderColor: 'rgba(0, 201, 167, 0.25)',
  },
  titleRowWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  trainedBadge: {
    backgroundColor: 'rgba(0, 201, 167, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#00C9A7',
  },
  trainedBadgeText: {
    color: '#00C9A7',
    fontSize: 9,
    fontWeight: '800',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  cardTitles: {
    flex: 1,
  },
  cardEnglish: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cardSinhala: {
    color: '#90E0EF',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: 'rgba(72, 202, 228, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  categoryBadgeText: {
    color: '#48CAE4',
    fontSize: 10,
    fontWeight: '700',
  },
  expandedSection: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  detailValue: {
    color: '#FFB703',
    fontSize: 12,
    fontWeight: '600',
  },
  detailValueCode: {
    color: '#00C9A7',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  gestureGuideBox: {
    backgroundColor: 'rgba(11, 19, 43, 0.7)',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  guideTitle: {
    color: '#00C9A7',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  guideContent: {
    color: '#CAF0F8',
    fontSize: 12,
    lineHeight: 17,
  },
  testBtn: {
    backgroundColor: 'rgba(0, 201, 167, 0.15)',
    borderWidth: 1,
    borderColor: '#00C9A7',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  testBtnText: {
    color: '#00C9A7',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 13,
  },
});

export default SSLDictionaryScreen;
