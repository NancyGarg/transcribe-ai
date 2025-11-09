import React, { useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRecordingContext } from '../contexts/RecordingContext';
import { Theme } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { RecordingEntry } from '../types/recording';

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

type LibraryScreenNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'Library'
>;

interface RecordingSection {
  title: string;
  data: RecordingEntry[];
}

const getSectionTitle = (timestamp: number) => {
  const target = new Date(timestamp);
  const today = new Date();

  const isSameDay =
    target.getDate() === today.getDate() &&
    target.getMonth() === today.getMonth() &&
    target.getFullYear() === today.getFullYear();

  if (isSameDay) {
    return 'TODAY';
  }

  return target.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
  }).toUpperCase();
};

const LibraryScreen: React.FC = () => {
  const { recordings } = useRecordingContext();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<LibraryScreenNavigation>();
  const styles = createStyles(theme);

  const sections = useMemo(() => {
    const groups = recordings.reduce<Record<string, RecordingEntry[]>>(
      (acc, item) => {
        const key = getSectionTitle(item.createdAt);
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {}
    );

    return Object.entries(groups)
      .map<RecordingSection>(([title, data]) => ({
        title,
        data: data.sort((a, b) => b.createdAt - a.createdAt),
      }))
      .sort((a, b) => {
        // order sections by most recent date first
        const firstDate = a.data[0]?.createdAt ?? 0;
        const secondDate = b.data[0]?.createdAt ?? 0;
        return secondDate - firstDate;
      });
  }, [recordings]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={styles.container.backgroundColor}
      />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No recordings yet</Text>
            <Text style={styles.emptySubtitle}>
              Start a new recording from the Home screen and it will appear here.
            </Text>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item, index, section }) => (
          <View>
            <TouchableOpacity
              style={styles.listItem}
              onPress={() =>
                navigation.navigate('RecordingDetails', {
                  recordingId: item.id,
                })
              }
            >
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaGroup}>
                    <MaterialIcons
                      name="event"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.metaText}>
                      {new Date(item.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.metaGroup}>
                    <MaterialIcons
                      name="schedule"
                      size={16}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.metaText}>
                      {formatDuration(item.durationMs)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.itemAction}>
                <MaterialIcons
                  name="chevron-right"
                  size={28}
                  color={theme.colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
            {index < section.data.length - 1 && <View style={styles.itemDivider} />}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      
    },
    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 32,
    },
    emptyState: {
      marginTop: 160,
      alignItems: 'center',
      paddingHorizontal: 48,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    emptySubtitle: {
      fontSize: 14,
      textAlign: 'center',
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    sectionHeader: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      marginTop: 24,
      marginBottom: 12,
      letterSpacing: 1,
    },
  
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
    },
    itemContent: {
      flex: 1,
      gap: 8,
    },
    itemTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    metaGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    itemAction: {
      marginLeft: 12,
    },
    itemDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.divider,
    },
  });

export default LibraryScreen;
