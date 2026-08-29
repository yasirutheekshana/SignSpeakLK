import React from 'react';
import {
  NativeSyntheticEvent,
  Platform,
  requireNativeComponent,
  StyleProp,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

export interface SignDetectionNativeEvent {
  predictions: Array<{
    label: string;
    confidence: number;
    classIndex: number;
  }>;
  latencyMs: number;
  timestamp: number;
}

export interface SignCameraViewProps extends ViewProps {
  lensFacing?: 'front' | 'back';
  isPaused?: boolean;
  onSignDetected?: (event: NativeSyntheticEvent<SignDetectionNativeEvent>) => void;
  style?: StyleProp<ViewStyle>;
}

const NativeSignCameraView =
  Platform.OS === 'android'
    ? requireNativeComponent<SignCameraViewProps>('SignCameraView')
    : null;

export const SignCameraView: React.FC<SignCameraViewProps> = ({
  lensFacing = 'front',
  isPaused = false,
  onSignDetected,
  style,
  children,
  ...rest
}) => {
  if (Platform.OS === 'android' && NativeSignCameraView) {
    return (
      <NativeSignCameraView
        style={style}
        lensFacing={lensFacing}
        isPaused={isPaused}
        onSignDetected={onSignDetected}
        {...rest}
      >
        {children}
      </NativeSignCameraView>
    );
  }

  // Fallback container for non-Android / simulator
  return <View style={style}>{children}</View>;
};

export default SignCameraView;
