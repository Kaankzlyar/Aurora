// components/ui/chart.tsx - React Native version
import React from 'react';
import { View, Text, StyleSheet, ViewProps, TextProps } from 'react-native';

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

interface ChartContainerProps extends ViewProps {
  config: ChartConfig;
  children: React.ReactNode;
}

function ChartContainer({
  children,
  config,
  style,
  ...props
}: ChartContainerProps) {
  return (
    <ChartContext.Provider value={{ config }}>
      <View style={[styles.chartContainer, style]} {...props}>
        {children}
      </View>
    </ChartContext.Provider>
  );
}

// Placeholder components for compatibility
function ChartTooltip({ children }: { children?: React.ReactNode }) {
  return <View>{children}</View>;
}

function ChartTooltipContent({ children }: { children?: React.ReactNode }) {
  return (
    <View style={styles.tooltip}>
      <Text style={styles.tooltipText}>Chart Tooltip</Text>
      {children}
    </View>
  );
}

function ChartLegend({ children }: { children?: React.ReactNode }) {
  return <View>{children}</View>;
}

function ChartLegendContent({ children }: { children?: React.ReactNode }) {
  return (
    <View style={styles.legend}>
      <Text style={styles.legendText}>Chart Legend</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 4,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
};
