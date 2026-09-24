import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme';

export interface ScreenContainerProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  bottomBar?: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  backgroundColor?: string;
  scrollable?: boolean;
  withTopInset?: boolean;
  withBottomInset?: boolean;
  keyboardAvoiding?: boolean;
  showsVerticalScrollIndicator?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  header,
  bottomBar,
  style,
  contentContainerStyle,
  backgroundColor = COLORS.background,
  scrollable = false,
  withTopInset,
  withBottomInset = false,
  keyboardAvoiding = Platform.OS === 'ios',
  showsVerticalScrollIndicator = false,
}) => {
  const insets = useSafeAreaInsets();

  // If a custom header is passed, the header itself applies top insets.
  // If no header is present, default withTopInset to true to protect Dynamic Island / status bar.
  const shouldApplyTopInset = withTopInset !== undefined ? withTopInset : !header;

  const rootStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
    paddingTop: shouldApplyTopInset ? insets.top : 0,
    paddingBottom: withBottomInset ? insets.bottom : 0,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  const content = scrollable ? (
    <ScrollView
      style={[styles.scroll, style]}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, style]}>{children}</View>
  );

  const innerLayout = (
    <View style={styles.container}>
      {header}
      <View style={styles.container}>
        {content}
      </View>
      {bottomBar}
    </View>
  );

  if (keyboardAvoiding && Platform.OS === 'ios') {
    return (
      <View style={rootStyle}>
        <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.container}
          keyboardVerticalOffset={0}
        >
          {innerLayout}
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={rootStyle}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      {innerLayout}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
