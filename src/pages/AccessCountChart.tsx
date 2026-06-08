import { DomainAreaChart } from '@/components/DomainAreaChart';
import { CHART_COLORS } from '@/utils/chart';
import dayjs from 'dayjs';

const FAKE_DOMAINS = ['example.com', 'foo.io', 'bar.dev', 'baz.app', 'qux.net'];

function generateFakeData() {
  const days = 30;
  const today = dayjs();
  return Array.from({ length: days }, (_, i) => {
    const day = today.subtract(days - 1 - i, 'day').format('YYYY-MM-DD');
    const row: Record<string, string | number> = { day };
    for (const d of FAKE_DOMAINS) {
      row[d] = Math.floor(Math.random() * 100) + 10;
    }
    return row;
  });
}

export function AccessCountChart() {
  const chartData = generateFakeData();
  const colorMap = Object.fromEntries(FAKE_DOMAINS.map((d, i) => [d, CHART_COLORS[i % CHART_COLORS.length]]));
  const dataMax = chartData.flatMap((row) => FAKE_DOMAINS.map((d) => row[d] as number)).reduce((max, n) => Math.max(max, n), 0);

  return (
    <div className='tw:flex tw:w-full tw:h-full tw:flex-1 tw:min-h-0 tw:gap-4 tw:flex-row'>
      <div className='tw:min-w-0 tw:overflow-hidden tw:flex tw:flex-1 tw:min-h-0'>
        <DomainAreaChart
          domains={FAKE_DOMAINS}
          colorMap={colorMap}
          chartData={chartData}
          dataMax={dataMax}
          className='tw:h-full tw:aspect-auto tw:p-4 tw:border tw:border-border tw:rounded'
        />
      </div>
    </div>
  );
}
