import { useEffect, useMemo, useRef } from 'react'
import {
  AreaSeries,
  ColorType,
  createChart,
  LineSeries,
} from 'lightweight-charts'
import type {
  AreaData,
  AreaSeriesOptions,
  ChartOptions,
  DeepPartial,
  IChartApi,
  LineData,
  LineSeriesOptions,
  Time,
} from 'lightweight-charts'

type ChartSeries =
  | {
      readonly type: 'line'
      readonly title: string
      readonly color: string
      readonly data: ReadonlyArray<LineData<Time>>
      readonly lineWidth?: 1 | 2 | 3 | 4
    }
  | {
      readonly type: 'area'
      readonly title: string
      readonly color: string
      readonly fill: string
      readonly data: ReadonlyArray<AreaData<Time>>
      readonly lineWidth?: 1 | 2 | 3 | 4
    }

type LessonChartProps = {
  readonly series: ReadonlyArray<ChartSeries>
  readonly height?: number
  readonly yVisible?: boolean
  readonly xVisible?: boolean
  readonly timeFormatter?: (time: Time) => string
  readonly ariaLabel: string
}

type ChartSeriesConfig =
  | {
      readonly type: 'line'
      readonly title: string
      readonly color: string
      readonly lineWidth: 1 | 2 | 3 | 4
    }
  | {
      readonly type: 'area'
      readonly title: string
      readonly color: string
      readonly fill: string
      readonly lineWidth: 1 | 2 | 3 | 4
    }

type SeriesUpdater = (series: ChartSeries) => void
const CONFIG_ITEM_SEPARATOR = '\u001e'
const CONFIG_FIELD_SEPARATOR = '\u001f'
const BUSINESS_DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

const formatTick = (value: Time): string => {
  const numeric =
    typeof value === 'number' ? value : Number.parseFloat(String(value))
  if (!Number.isFinite(numeric)) return String(value)
  return numeric.toFixed(1)
}

function readChartPalette() {
  if (typeof window === 'undefined') {
    return {
      background: '#fffdf8',
      text: '#6b6257',
      grid: 'rgba(216, 205, 187, 0.7)',
    }
  }

  const styles = window.getComputedStyle(document.documentElement)
  return {
    background: styles.getPropertyValue('--card').trim() || '#fffdf8',
    text: styles.getPropertyValue('--muted-foreground').trim() || '#6b6257',
    grid: 'rgba(216, 205, 187, 0.7)',
  }
}

const parseLineWidth = (value: string): 1 | 2 | 3 | 4 => {
  const parsed = Number(value)
  if (parsed === 1 || parsed === 2 || parsed === 3 || parsed === 4) {
    return parsed
  }
  return 2
}

const timeOrderKey = (time: Time): number => {
  if (typeof time === 'number') return time

  if (typeof time === 'string') {
    const match = BUSINESS_DAY_PATTERN.exec(time)
    if (match !== null) {
      return Number(match[1]) * 372 + Number(match[2]) * 31 + Number(match[3])
    }

    const numeric = Number.parseFloat(time)
    return Number.isFinite(numeric) ? numeric : 0
  }

  return time.year * 372 + time.month * 31 + time.day
}

const orderedUniqueData = <T extends { readonly time: Time }>(
  data: ReadonlyArray<T>,
): Array<T> => {
  const sorted = [...data].sort(
    (left, right) => timeOrderKey(left.time) - timeOrderKey(right.time),
  )
  const output: Array<T> = []
  let previousKey: number | undefined

  for (const item of sorted) {
    const key = timeOrderKey(item.time)
    if (previousKey !== undefined && key === previousKey) {
      output[output.length - 1] = item
      continue
    }

    output.push(item)
    previousKey = key
  }

  return output
}

const seriesConfigKeyFromSeries = (
  series: ReadonlyArray<ChartSeries>,
): string =>
  series
    .map((item) =>
      [
        item.type,
        item.title,
        item.color,
        item.lineWidth ?? 2,
        item.type === 'area' ? item.fill : '',
      ].join(CONFIG_FIELD_SEPARATOR),
    )
    .join(CONFIG_ITEM_SEPARATOR)

const seriesConfigsFromKey = (
  configKey: string,
): ReadonlyArray<ChartSeriesConfig> => {
  if (configKey.length === 0) return []

  return configKey.split(CONFIG_ITEM_SEPARATOR).map((entry) => {
    const [type = 'line', title = '', color = '', lineWidth = '2', fill = ''] =
      entry.split(CONFIG_FIELD_SEPARATOR)

    if (type === 'area') {
      return {
        type: 'area',
        title,
        color,
        fill,
        lineWidth: parseLineWidth(lineWidth),
      }
    }

    return {
      type: 'line',
      title,
      color,
      lineWidth: parseLineWidth(lineWidth),
    }
  })
}

function LessonChart({
  series,
  height = 290,
  yVisible = true,
  xVisible = true,
  timeFormatter,
  ariaLabel,
}: LessonChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesUpdatersRef = useRef<ReadonlyArray<SeriesUpdater>>([])
  const palette = useMemo(() => readChartPalette(), [])
  const formatTime = timeFormatter ?? formatTick

  const seriesConfigKey = useMemo(
    () => seriesConfigKeyFromSeries(series),
    [series],
  )

  const chartOptions = useMemo<DeepPartial<ChartOptions>>(
    () => ({
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: palette.background },
        textColor: palette.text,
        attributionLogo: false,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
      localization: {
        timeFormatter: formatTime,
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: palette.text,
          labelVisible: false,
          style: 3,
          width: 1,
        },
        horzLine: {
          visible: false,
          labelVisible: false,
        },
      },
      grid: {
        vertLines: { color: palette.grid, visible: true },
        horzLines: { color: palette.grid, visible: true },
      },
      timeScale: {
        visible: xVisible,
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        timeVisible: true,
        tickMarkFormatter: formatTime,
      },
      rightPriceScale: {
        visible: yVisible,
        borderVisible: false,
        scaleMargins: { top: 0.12, bottom: 0.16 },
      },
      handleScroll: false,
      handleScale: false,
    }),
    [formatTime, palette, xVisible, yVisible],
  )

  useEffect(() => {
    const container = containerRef.current
    if (container === null) return

    const chart = createChart(container, chartOptions)
    const nextUpdaters = seriesConfigsFromKey(seriesConfigKey).map((config) => {
      if (config.type === 'area') {
        const options: DeepPartial<AreaSeriesOptions> = {
          title: config.title,
          topColor: config.fill,
          bottomColor: 'rgba(255, 253, 248, 0)',
          lineColor: config.color,
          lineWidth: config.lineWidth,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: true,
          priceFormat: { type: 'price', precision: 4, minMove: 0.0001 },
        }
        const area = chart.addSeries(AreaSeries, options)
        return (next: ChartSeries) => {
          if (next.type === 'area') {
            area.setData(orderedUniqueData(next.data))
          }
        }
      }

      const options: DeepPartial<LineSeriesOptions> = {
        title: config.title,
        color: config.color,
        lineWidth: config.lineWidth,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: true,
        priceFormat: { type: 'price', precision: 4, minMove: 0.0001 },
      }
      const line = chart.addSeries(LineSeries, options)
      return (next: ChartSeries) => {
        if (next.type === 'line') {
          line.setData(orderedUniqueData(next.data))
        }
      }
    })

    chart.timeScale().fitContent()
    chartRef.current = chart
    seriesUpdatersRef.current = nextUpdaters

    return () => {
      chart.remove()
      chartRef.current = null
      seriesUpdatersRef.current = []
    }
  }, [chartOptions, seriesConfigKey])

  useEffect(() => {
    series.forEach((item, index) => {
      seriesUpdatersRef.current[index]?.(item)
    })
    chartRef.current?.timeScale().fitContent()
  }, [series])

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      className="w-full overflow-hidden rounded-md border border-border bg-card"
      style={{ height }}
    />
  )
}

export { LessonChart }
export type { ChartSeries }
