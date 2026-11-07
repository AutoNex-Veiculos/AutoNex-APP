import { Children, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  children: ReactNode;
  minItemWidth?: number;
  maxColumns?: number;
  gap?: number;
}

// Grade fluida: calcula quantas colunas cabem e divide a largura por igual.
export function ResponsiveGrid({ children, minItemWidth = 280, maxColumns = 4, gap = 16 }: Props) {
  const [width, setWidth] = useState(0);
  const columns = Math.max(1, Math.min(maxColumns, Math.floor((width + gap) / (minItemWidth + gap))));
  const itemWidth = width > 0 ? Math.floor((width - gap * (columns - 1)) / columns) : 0;

  return (
    <View style={[styles.grid, { gap }]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0
        ? Children.toArray(children).map((child, index) => (
            <View key={index} style={{ width: itemWidth }}>
              {child}
            </View>
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
});
