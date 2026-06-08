import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/ui/chart';
import { CHART_COLORS, formatXAxisDate, xAxisInterval, yAxisMax } from '@/utils/chart';
import { cn } from '@/utils/cn';
import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface DomainAreaChartProps {
  domains: string[];
  chartData: Array<Record<string, string | number | undefined>>;
  dataMax: number;
  colorMap?: Record<string, string>;
  className?: string;
}

export function DomainAreaChart({ domains, colorMap: colorMapProp, chartData, dataMax, className }: DomainAreaChartProps) {
  const isMobile = false;
  const gradientIdPrefix = useId();
  const gradientId = (domain: string) => `${gradientIdPrefix}-${domain}`;
  const colorMap = Object.fromEntries(domains.map((d, i) => [d, colorMapProp?.[d] ?? CHART_COLORS[i % CHART_COLORS.length]]));
  const chartConfig: ChartConfig = Object.fromEntries(domains.map((d) => [d, { label: d, color: colorMap[d] }]));

  return (
    <ChartContainer config={chartConfig} className={cn('tw:w-full', className)}>
      <AreaChart data={chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
        <defs>
          {domains.map((d) => (
            <linearGradient key={d} id={gradientId(d)} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor={colorMap[d]} stopOpacity={0.3} />
              <stop offset='95%' stopColor={colorMap[d]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray='3 3' vertical={false} />
        <XAxis dataKey='day' interval={xAxisInterval(chartData.length, isMobile)} tickFormatter={formatXAxisDate} />
        <YAxis width={30} domain={[0, yAxisMax(dataMax)]} />
        <ChartTooltip
          content={({ content: _content, ...props }) => <ChartTooltipContent {...props} payload={[...(props.payload ?? [])].sort((a, b) => ((b.value ?? 0) as number) - ((a.value ?? 0) as number))} />}
        />
        {domains.map((d) => (
          <Area key={d} type='monotone' dataKey={d} stroke={colorMap[d]} strokeWidth={2} fill={`url(#${gradientId(d)})`} isAnimationActive={false} dot={{ r: 2 }} />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}
