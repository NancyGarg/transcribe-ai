import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types';
import { RootStackParamList } from '../navigation/types';
import { useRecordingContext } from '../contexts/RecordingContext';
import { RecordingState } from '../types/recording';
import LoadingOverlay from '../components/modals/LoadingOverlay';

const centerImg = require('../../assets/homeScreen/centerImage/centerImg.png');

type RecordingMode = 'VOICE NOTE' | 'INTERVIEW' | 'LECTURE';
type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

const HomeScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const {
    activeRecording,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    isSavingRecording,
  } = useRecordingContext();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [selectedMode, setSelectedMode] = React.useState<RecordingMode>('INTERVIEW');

  const styles = createStyles(theme);

  const modes: RecordingMode[] = ['VOICE NOTE', 'INTERVIEW', 'LECTURE'];

  const recordingState: RecordingState = activeRecording?.state ?? 'idle';

  const handleRecord = async () => {
    switch (recordingState) {
      case 'idle':
        await startRecording();
        break;
      case 'recording':
        await pauseRecording();
        break;
      case 'paused':
        await resumeRecording();
        break;
      default:
        break;
    }
  };

  const recordingConfig = useMemo(() => {
    switch (recordingState) {
      case 'recording':
        return {
          icon: 'pause',
          label: 'Pause',
          accessibility: 'Pause recording',
        };
      case 'paused':
        return {
          icon: 'play-arrow',
          label: 'Resume',
          accessibility: 'Resume recording',
        };
      case 'idle':
      default:
        return {
          icon: 'mic',
          label: 'Start',
          accessibility: 'Start recording',
        };
    }
  }, [recordingState]);

  const iconColor =
    recordingState === 'idle'
      ? theme.colors.background
      : theme.colors.onPrimary;

  const statusColor =
    recordingState === 'recording'
      ? theme.colors.error
      : theme.colors.textSecondary;

  const handleCancelRecording = async () => {
    await cancelRecording();
  };

  const handleSaveRecording = async () => {
    await stopRecording();
  };

  const showActions = recordingState !== 'idle';
  const formattedDuration = useMemo(() => {
    if (!activeRecording) {
      return '00:00:00';
    }
    const totalSeconds = Math.floor(activeRecording.durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }, [activeRecording]);

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay
        visible={isSavingRecording}
        message="Saving recording…"
      />
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={styles.container.backgroundColor}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Library')}
          accessibilityLabel="Open library"
        >
          <MaterialIcons name="menu" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Settings')}
          accessibilityLabel="Open settings"
        >
          <MaterialIcons name="settings" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Privacy Message */}
      <View style={styles.privacyContainer}>
        <Text style={styles.privacyText}>
          Please Be <Text style={styles.privacyHighlight}>Mindful</Text> Of
          Other's Privacy
        </Text>
      </View>

      {/* Glowing Orb */}
      <View style={styles.orbContainer}>
        <Image
          source={centerImg}
          style={styles.orbImage}
          resizeMode="contain"
        />
        {recordingState !== 'idle' && (
          <View style={styles.liveContainer}>
        
      
              <Text style={styles.liveText}>{formattedDuration}</Text>
  
          </View>
        )}
        
      </View>

      {/* Mode Label */}
      {/* <View style={styles.modeLabelContainer}>
        <View style={styles.modeLabel}>
          <Text style={styles.modeLabelText}>IDEAL FOR MULTIPLE SPEAKERS</Text>
          <View style={styles.modeLabelArrow} />
        </View>
      </View> */}

      {/* Mode Selector */}
      {recordingState === 'idle' && (
        <View style={styles.modeSelector}>
          {modes.map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => setSelectedMode(mode)}
              style={styles.modeButton}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedMode === mode }}
            >
              <Text
                style={[
                  styles.modeText,
                  selectedMode === mode && styles.modeTextSelected,
                ]}
              >
                {mode}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {/* Recording Button */}

      <View style={styles.buttonRow}>
       {showActions && <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={handleCancelRecording}
            accessibilityLabel="Cancel recording"
            disabled={!showActions}
            style={!showActions ? styles.disabledAction : undefined}
          >
            <Text
              style={[
                styles.tertiaryButtonText,
                !showActions && styles.tertiaryButtonTextDisabled,
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>}
        <View style={styles.recordButtonWrapper}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              recordingState !== 'idle' && styles.recordButtonActive,
              recordingState === 'paused' && styles.recordButtonPaused,
            ]}
            onPress={handleRecord}
            activeOpacity={0.8}
            accessibilityLabel={recordingConfig.accessibility}
          >
            <MaterialIcons
              name={recordingConfig.icon as never}
              size={32}
              color={iconColor}
            />
          </TouchableOpacity>
        </View>
      {showActions && <View style={styles.actionContainer}>
            <TouchableOpacity
              onPress={handleSaveRecording}
              accessibilityLabel="Save recording"
              disabled={!showActions}
              style={!showActions ? styles.disabledAction : undefined}
            >
              <Text
                style={[
                  styles.tertiaryButtonText,
                  !showActions && styles.tertiaryButtonTextDisabled,
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 32,
    },
    iconButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    privacyContainer: {
      paddingHorizontal: 96,
      alignItems: 'center',
    },
    privacyText: {
      fontSize: 16,
      fontStyle: 'italic',
      color: theme.colors.text,
      textAlign: 'center',
      lineHeight: 24,
    },
    privacyHighlight: {
      color: theme.colors.success,
      fontWeight: '600',
    },
    orbContainer: {
      flex: 1,
      paddingTop: 100,
      alignItems: 'center',
    },
    orbImage: {
      width: '80%',
      maxWidth: 320,
      aspectRatio: 1,
    },
    liveContainer: {
      position: 'absolute',
      bottom: 44,
    },
  
  
    liveText: {
      color: theme.colors.text,
      fontWeight: '700',
      letterSpacing: 0.5,
      fontSize: 32,
    },
    modeLabelContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    modeLabel: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      position: 'relative',
    },
    modeLabelText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    modeLabelArrow: {
      position: 'absolute',
      bottom: -6,
      left: '50%',
      marginLeft: -6,
      width: 0,
      height: 0,
      borderLeftWidth: 6,
      borderRightWidth: 6,
      borderTopWidth: 6,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: theme.colors.surface,
    },
    modeSelector: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 40,
      marginBottom: 40,
    },
    modeButton: {
      flex: 1,
      paddingHorizontal: 8,
    },
    modeText: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      fontWeight: '400',
    },
    modeTextSelected: {
      color: theme.colors.text,
      fontWeight: '700',
    },
    recordButtonContainer: {
      alignItems: 'center',
      marginBottom: 32,
      gap: 10,
    },
    buttonRow: {
      flexDirection: 'row',
    justifyContent: 'center',
      alignItems: 'center',
      gap: 32,
      paddingHorizontal: 32,

    },
    actionContainer: {
      width: 78,
      alignItems: 'center',
    },
    disabledAction: {
      opacity: 0.3,
    },
    recordButtonWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    recordButton: {
      width: 72,
      height: 72,
      borderRadius: 40,
      backgroundColor: theme.colors.text,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    recordButtonActive: {
      backgroundColor: theme.colors.error,
      borderRadius: 27,
    },
    recordButtonPaused: {
      backgroundColor: theme.colors.text,
    },
    recordButtonLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    recordingStatus: {
      fontSize: 12,
    },
    tertiaryButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text,
      textTransform: 'uppercase',
    },
    tertiaryButtonTextOnPrimary: {
      color: theme.colors.onPrimary,
    },
    tertiaryButtonTextDisabled: {
      color: theme.colors.textTertiary,
    },
  });

export default HomeScreen;
