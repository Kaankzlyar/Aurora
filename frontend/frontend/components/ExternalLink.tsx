import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform, Linking, Text, TouchableOpacity } from 'react-native';

export type Props = {
  href: string;
  children: React.ReactNode;
  style?: any;
};

export function ExternalLink({ href, children, style, ...rest }: Props) {
  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      await openBrowserAsync(href);
    } else {
      Linking.openURL(href);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={style} {...rest}>
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </TouchableOpacity>
  );
}
