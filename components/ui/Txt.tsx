import { Text, type TextProps } from 'react-native';
import { text } from '@/constants/theme';

interface Props extends TextProps {
  variant?: keyof typeof text;
  color?: string;
}

export function Txt({ variant = 'body', color, style, ...rest }: Props) {
  return <Text style={[text[variant], color ? { color } : null, style]} {...rest} />;
}
