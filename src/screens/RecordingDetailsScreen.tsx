import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRecordingContext } from '../contexts/RecordingContext';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types';
import { RootStackParamList } from '../navigation/types';
import { playerService } from '../services/player';

const formatFullDate = (timestamp: number) =>
  new Date(timestamp).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatDuration = (durationMs: number | undefined) => {
  if (!durationMs) {
    return '0m 0s';
  }
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
};

type RecordingDetailsRoute = RouteProp<RootStackParamList, 'RecordingDetails'>;
type RecordingDetailsNav = NativeStackNavigationProp<
  RootStackParamList,
  'RecordingDetails'
>;

const TABS = ['Summary', 'Transcription', 'Chat'] as const;
type TabKey = (typeof TABS)[number];

const RecordingDetailsScreen: React.FC = () => {
  const route = useRoute<RecordingDetailsRoute>();
  const navigation = useNavigation<RecordingDetailsNav>();
  const { theme, isDark } = useTheme();
  const { recordings } = useRecordingContext();
  const styles = createStyles(theme);
  const [playState, setPlayState] = useState<'stopped' | 'playing' | 'paused'>(
    'stopped'
  );
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedTab, setSelectedTab] = useState<TabKey>('Summary');

  useEffect(() => {
    playerService.onProgress = ({ currentPosition, duration }) => {
      setCurrentPosition(currentPosition/1000);
      setDuration(duration);
    };
    playerService.onEnd = () => {
      setPlayState('stopped');
      setCurrentPosition(0);
    };

    return () => {
      playerService.cleanup();
    };
  }, []);

  const recording = useMemo(
    () => recordings.find((rec) => rec.id === route.params.recordingId),
    [recordings, route.params.recordingId]
  );

  const totalDurationMs = recording?.durationMs ?? duration * 1000;
  const formattedProgress = formatDuration(currentPosition * 1000);
  const formattedTotal = formatDuration(totalDurationMs);

  const togglePlayback = async () => {
    if (!recording) {
      return;
    }

    try {
      if (playState === 'stopped') {
        await playerService.start(recording.filePath);
        setPlayState('playing');
      } else if (playState === 'playing') {
        await playerService.pause();
        setPlayState('paused');
      } else if (playState === 'paused') {
        await playerService.resume();
        setPlayState('playing');
      }
    } catch (error) {
      console.error('Playback error', error);
    }
  };

  const stopPlayback = async () => {
    await playerService.stop();
    setPlayState('stopped');
    setCurrentPosition(0);
  };

  if (!recording) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={styles.container.backgroundColor}
        />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Recording not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={styles.container.backgroundColor}
      />
     
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.playerCard}>
          <View style={styles.scrubberTrack}>
            <View
              style={[
                styles.scrubberProgress,
                {
                  width: `${Math.min(
                    100,
                    (currentPosition * 1000 * 100) / (totalDurationMs || 1)
                  )}%`,
                },
              ]}
            />
          </View>
          <View style={styles.playerTimes}>
            <Text style={styles.timeText}>{formattedProgress}</Text>
            <Text style={styles.timeText}>{formattedTotal}</Text>
          </View>
          <View style={styles.playerButtonsRow}>
            <TouchableOpacity
          
              onPress={() => {}}
              accessibilityLabel="Skip back"
            >
              <MaterialIcons
                name="replay-10"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconCirclePrimary}
              onPress={togglePlayback}
              accessibilityLabel={
                playState === 'playing' ? 'Pause playback' : 'Play recording'
              }
            >
              <MaterialIcons
                name={playState === 'playing' ? 'pause' : 'play-arrow'}
                size={18}
                color={theme.colors.onPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
    
              onPress={() => {}}
              accessibilityLabel="Skip forward"
            >
              <MaterialIcons
                name="forward-10"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, tab === selectedTab && styles.tabButtonActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  tab === selectedTab && styles.tabLabelActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.title}>{recording.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaGroup}>
              <MaterialIcons
                name="event"
                size={18}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.metaText}>{formatFullDate(recording.createdAt)}</Text>
            </View>
            <View style={styles.metaGroup}>
              <MaterialIcons
                name="schedule"
                size={18}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.metaText}>{formattedTotal}</Text>
            </View>
          </View>
        </View>

      
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{selectedTab}</Text>
          <Text style={styles.comingSoonText}>Coming soon</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingVertical: 32,
      gap: 24,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
      gap: 16,
    },
    iconButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconPlaceholder: {
      width: 40,
      height: 40,
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
    },
    playerCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      paddingVertical: 24,
      paddingHorizontal: 20,
      gap: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 3,
    },
    scrubberTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.surfaceVariant,
      overflow: 'hidden',
    },
    scrubberProgress: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 3,
    },
    playerTimes: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    timeText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    playerButtonsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap:32
    },

    iconCirclePrimary: {
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      width: 32,
      height: 32,
      borderRadius: 12,
    },
 
    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      padding: 4,
      alignSelf: 'stretch',
    },
    tabButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabButtonActive: {
      backgroundColor: `${theme.colors.primary}25`,
    },
    tabLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    tabLabelActive: {
      color: theme.colors.primary,
    },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      gap: 12,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      gap: 16,
    },
    metaGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    metaText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      gap: 12,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionAccent: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.success,
      textTransform: 'uppercase',
    },
    sectionActions: {
      flexDirection: 'row',
      gap: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },
    comingSoonText: {
      fontSize: 14,
      fontStyle: 'italic',
      color: theme.colors.textSecondary,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    link: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });

export default RecordingDetailsScreen;
