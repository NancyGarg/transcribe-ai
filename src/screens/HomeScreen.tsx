import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types';
const centerImg = require('../../assets/homeScreen/centerImage/centerImg.png');
const micIcon = require('../../assets/icons/microphoneIcon/mic.png');

type RecordingMode = 'VOICE NOTE' | 'INTERVIEW' | 'LECTURE';

const HomeScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [selectedMode, setSelectedMode] = useState<RecordingMode>('INTERVIEW');
  const [isRecording, setIsRecording] = useState(false);

  const styles = createStyles(theme);

  const modes: RecordingMode[] = ['VOICE NOTE', 'INTERVIEW', 'LECTURE'];

  const handleRecord = () => {
    setIsRecording(!isRecording);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={styles.container.backgroundColor}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.iconText}>☰</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.iconText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Privacy Message */}
      <View style={styles.privacyContainer}>
        <Text style={styles.privacyText}>
          Please Be{' '}
          <Text style={styles.privacyHighlight}>Mindful</Text> Of Other's
          Privacy
        </Text>
      </View>

      {/* Glowing Orb */}
      <View style={styles.orbContainer}>
       
          <Image source={centerImg} style={styles.orbImage} />
     
      </View>

      

      {/* Mode Label */}
      <View style={styles.modeLabelContainer}>
        <View style={styles.modeLabel}>
          <Text style={styles.modeLabelText}>
            IDEAL FOR MULTIPLE SPEAKERS
          </Text>
          <View style={styles.modeLabelArrow} />
        </View>
      </View>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode}
            onPress={() => setSelectedMode(mode)}
            style={styles.modeButton}
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

      {/* Recording Button */}
      <View style={styles.recordButtonContainer}>
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          onPress={handleRecord}
          activeOpacity={0.8}
        >
          <Image source={micIcon} style={styles.microphoneIcon} />
        </TouchableOpacity>
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
    iconText: {
      fontSize: 24,
      color: theme.colors.text,
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
      color: theme.colors.success, // Green color from theme
      fontWeight: '600',
    },
    orbContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    orbImage: {
       width: '80%',
     
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
    },
    microphoneIcon: {
      width:40,
      height:40,
      tintColor:'red'
    },
  });

export default HomeScreen;
