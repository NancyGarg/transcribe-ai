import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { TranscriptSegment } from '../types/recording';
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
    return '00:00';
  }
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatDurationForDisplay = (durationMs: number | undefined) => {
  if (!durationMs) {
    return '00:00:00';
  }
  const hours = Math.floor(durationMs / 3600000);
  const minutes = Math.floor((durationMs % 3600000) / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}h ${minutes
      .toString()
      .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  } else if (minutes > 0) {
    return `${minutes.toString().padStart(2, '0')}m ${seconds
      .toString()
      .padStart(2, '0')}s`;
  } else {
    return `${seconds.toString().padStart(2, '0')}s`;
  }
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
    'stopped',
  );
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedTab, setSelectedTab] = useState<TabKey>('Summary');

  useEffect(() => {
    playerService.onProgress = ({ currentPosition, duration }) => {
      setCurrentPosition(currentPosition / 1000);
      setDuration(duration / 1000);
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
    () => recordings.find(rec => rec.id === route.params.recordingId),
    [recordings, route.params.recordingId],
  );

  const totalDurationMs = recording?.durationMs ?? duration * 1000;
  const formattedProgress = formatDuration(currentPosition * 1000);
  const formattedTotal = formatDuration(totalDurationMs);
  const formattedDuration = formatDurationForDisplay(totalDurationMs);
  const transcriptSegments = recording?.transcriptSegments ?? [];
  const renderTranscript = transcriptSegments.length > 0;
  const isInterviewMode = recording?.mode === 'INTERVIEW';

  const speakerLabels = useMemo(() => {
    const map = new Map<string, string>();
    if (!isInterviewMode) {
      return map;
    }

    let counter = 1;
    const fallbackKey = '__fallback__';

    transcriptSegments.forEach(segment => {
      const key = segment.speaker ?? fallbackKey;
      if (!map.has(key)) {
        if (segment.speaker === undefined) {
          map.set(key, 'Speaker');
        } else {
          map.set(key, `Speaker ${counter}`);
          counter += 1;
        }
      }
    });

    return map;
  }, [isInterviewMode, transcriptSegments]);

  const getSpeakerLabel = useCallback(
    (segment: TranscriptSegment) => {
      if (!isInterviewMode) {
        return undefined;
      }

      const fallbackKey = '__fallback__';
      const key = segment.speaker ?? fallbackKey;
      return speakerLabels.get(key) ?? 'Speaker';
    },
    [isInterviewMode, speakerLabels],
  );

  const speakerPalette = useMemo(
    () => [
      theme.colors.speaker1,
      theme.colors.speaker2,
      theme.colors.speaker3,
      theme.colors.speaker4,
    ],
    [theme.colors]
  );

  const groupedConversation = useMemo(() => {
    if (!isInterviewMode || transcriptSegments.length === 0) {
      return [] as Array<{ speakerLabel: string; text: string; color: string }>;
    }

    const groups: Array<{ speakerLabel: string; text: string; color: string }> = [];
    const colorMap = new Map<string, string>();
    let paletteIndex = 0;

    transcriptSegments.forEach(segment => {
      const label = getSpeakerLabel(segment);
      if (!label) {
        return;
      }

      const trimmedText = segment.text.trim();
      if (!trimmedText) {
        return;
      }

      if (!colorMap.has(label)) {
        const assignedColor =
          speakerPalette[paletteIndex % speakerPalette.length] ??
          theme.colors.primary;
        colorMap.set(label, assignedColor);
        paletteIndex += 1;
      }

      const color = colorMap.get(label) ?? theme.colors.primary;

      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.speakerLabel === label) {
        lastGroup.text = `${lastGroup.text} ${trimmedText}`.trim();
      } else {
        groups.push({ speakerLabel: label, text: trimmedText, color });
      }
    });

    return groups;
  }, [
    getSpeakerLabel,
    isInterviewMode,
    speakerPalette,
    theme.colors.primary,
    transcriptSegments,
  ]);

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
                    ((currentPosition || 0) * 100) /
                      ((totalDurationMs || 1) / 1000),
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
            <TouchableOpacity onPress={() => {}} accessibilityLabel="Skip back">
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
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                tab === selectedTab && styles.tabButtonActive,
              ]}
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

      {selectedTab === 'Summary' ?  <View style={styles.summaryCard}>
          <Text style={styles.title}>{recording.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaGroup}>
              <MaterialIcons
                name="calendar-today"
                size={14}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.metaText}>
                {formatFullDate(recording.createdAt)}
              </Text>
            </View>
            <View style={styles.metaGroup}>
              <MaterialIcons
                name="schedule"
                size={14}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.metaText}>{formattedDuration}</Text>
            </View>
          </View>
        </View>:null}

        <View>
          {selectedTab === 'Transcription' ? (
            renderTranscript ? (
              isInterviewMode ? (
                <View style={styles.transcriptList}>
                  {groupedConversation.map((group, index) => (
                    <View key={index} style={styles.timelineRow}>
                      <View style={styles.transcriptTimeBadge}>
                        <MaterialIcons
                          name="circle"
                          size={6}
                          color={theme.colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.conversationSpeaker,
                            {
                              color: group.color,
                            },
                          ]}
                        >
                          {group.speakerLabel}
                        </Text>
                      </View>
                      <Text style={styles.transcriptBody}>{group.text}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.transcriptList}>
                  {transcriptSegments.map(segment => (
                    <View key={segment.id} style={styles.timelineRow}>
                      <View style={styles.transcriptTimeBadge}>
                        <MaterialIcons
                          name="circle"
                          size={6}
                          color={theme.colors.textSecondary}
                        />
                        <Text style={styles.transcriptTimeText}>
                          {formatDuration(segment.startMs)}
                        </Text>
                      </View>
                      <Text style={styles.transcriptBody}>{segment.text}</Text>
                    </View>
                  ))}
                </View>
              )
            ) : recording.transcript ? (
              <Text style={styles.transcriptBody}>{recording.transcript}</Text>
            ) : (
              <Text style={styles.comingSoonText}>
                Transcript will appear here once available.
              </Text>
            )
          ) : (
            <Text style={styles.comingSoonText}>Coming soon</Text>
          )}
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
      gap: 32,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
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
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 24,
      gap: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    scrubberTrack: {
      height: 10,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
    },
    scrubberProgress: {
      height: '100%',
      backgroundColor: theme.colors.text,
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
      gap: 32,
    },

    iconCirclePrimary: {
      backgroundColor: theme.colors.text,
      justifyContent: 'center',
      alignItems: 'center',
      width: 32,
      height: 32,
      borderRadius: 12,
    },

    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      padding: 4,
      alignSelf: 'stretch',
    },
    tabButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabButtonActive: {
      backgroundColor: theme.colors.surface,
    },
    tabLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    tabLabelActive: {
      fontWeight: '700',
      color: theme.colors.primary,
    },
    summaryCard: {
      paddingBottom: 12,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: '500',
      color: theme.colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      gap: 12,
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
    transcriptBody: {
      fontSize: 14,
      lineHeight: 22,
      paddingLeft: 16,
      color: theme.colors.textSecondary,
    },
    transcriptList: {
      gap: 16,
    },
    timelineRow: {
      gap: 8,
    },
    transcriptTimeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 4,
      paddingLeft: 4,
    },
    transcriptTimeText: {
      fontSize: 13,
      color: theme.colors.textTertiary,
    },
    conversationSpeaker: {
      fontSize: 13,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
  });

export default RecordingDetailsScreen;
