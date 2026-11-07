import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type BadgeTone = 'neutral' | 'accent' | 'glass' | 'warning' | 'dark';
