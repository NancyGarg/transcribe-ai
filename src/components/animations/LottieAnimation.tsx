import React, { useEffect, useRef } from 'react';
import LottieView, { AnimationObject } from 'lottie-react-native';
import { StyleProp, ViewStyle } from 'react-native';

export interface LottieAnimationProps {
  source: AnimationObject | string;
  autoPlay?: boolean;
  loop?: boolean;
  style?: StyleProp<ViewStyle>;
  playAnimation?: boolean;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  source,
  autoPlay = true,
  loop = true,
  style,
  playAnimation = false,
}) => {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (!playAnimation) {
      lottieRef.current?.pause();
    }

    if (autoPlay || playAnimation) {
      lottieRef.current?.play();
    }
  }, [autoPlay, playAnimation]);

  return (
    <LottieView
      ref={lottieRef}
      source={source}
      autoPlay={autoPlay}
      loop={loop}
      style={style}
    />
  );
};

export default LottieAnimation;
