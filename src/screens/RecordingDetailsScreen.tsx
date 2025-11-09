import React, { useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRecordingContext } from '../contexts/RecordingContext';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types';
import { RootStackParamList } from '../navigation/types';

const formatFullDate = (timestamp: number) =>
  new Date(timestamp).toLocaleString();

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

type RecordingDetailsRoute = RouteProp<RootStackParamList, 'RecordingDetails'>;
type RecordingDetailsNav = NativeStackNavigationProp<
  RootStackParamList,
  'RecordingDetails'
>;

const RecordingDetailsScreen: React.FC = () => {
  const route = useRoute<RecordingDetailsRoute>();
  const navigation = useNavigation<RecordingDetailsNav>();
  const { theme, isDark } = useTheme();
  const { recordings } = useRecordingContext();
  const styles = createStyles(theme);

  const recording = useMemo(
    () => recordings.find((rec) => rec.id === route.params.recordingId),
    [recordings, route.params.recordingId]
  );

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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{recording.title}</Text>
        <View style={styles.iconPlaceholder} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.value}>{formatDuration(recording.durationMs)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Created</Text>
          <Text style={styles.value}>{formatFullDate(recording.createdAt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{recording.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Playback</Text>
        <View style={styles.playerPlaceholder}>
          <MaterialIcons
            name="play-circle"
            size={48}
            color={theme.colors.primary}
          />
          <Text style={styles.playerText}>
            Playback controls coming soon
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transcript</Text>
        {recording.transcript ? (
          <Text style={styles.transcriptText}>{recording.transcript}</Text>
        ) : (
          <Text style={styles.transcriptPending}>Transcript pending…</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingTop: 16,
      gap: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 8,
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
    },
    section: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 16,
      gap: 12,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    label: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    value: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    playerPlaceholder: {
      alignItems: 'center',
      gap: 8,
      paddingVertical: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    playerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    transcriptText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.text,
    },
    transcriptPending: {
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
