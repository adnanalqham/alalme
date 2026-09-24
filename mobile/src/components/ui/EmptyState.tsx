import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { Button } from './Button';

interface EmptyStateProps {
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
  description?: string;
  actionTitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  iconName = 'car-wrench',
  title,
  subtitle,
  description,
  actionTitle,
  actionLabel,
  onAction,
}) => {
  const displaySubtitle = subtitle || description;
  const displayAction = actionTitle || actionLabel;
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={iconName} size={36} color={COLORS.navy} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {displaySubtitle && <Text style={styles.subtitle}>{displaySubtitle}</Text>}
      {displayAction && onAction && (
        <Button
          title={displayAction}
          onPress={onAction}
          variant="primary"
          size="sm"
          style={{ marginTop: SPACING.md }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    maxWidth: 260,
  },
});
