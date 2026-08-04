import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MonitoringChart from '../../../src/react/charts/MonitoringChart.tsx';
import ProjectActivityChart from '../../../src/react/charts/ProjectActivityChart.tsx';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('charts', () => {
  it('renders monitoring chart controls', () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      timestamp: Date.now(),
      cpu: 41.5,
      memory: 62.5,
      latency: 91,
    })));

    render(<MonitoringChart />);
    expect(screen.getByTestId('monitoring-chart')).toBeInTheDocument();
    expect(screen.getByLabelText('Chart display controls')).toHaveTextContent('Time range');
    expect(fetch).toHaveBeenCalledWith('/api/monitoring/snapshot', expect.objectContaining({
      method: 'POST',
    }));
  });

  it('renders project activity chart', () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      events: [{
        id: 'event-1',
        timestamp: Date.now(),
        type: 'notes',
        action: 'created',
      }],
    })));

    render(<ProjectActivityChart />);
    expect(screen.getByTestId('project-activity-chart')).toBeInTheDocument();
    expect(screen.getByLabelText('Project activity controls')).toHaveTextContent('Bucket');
		expect(fetch).toHaveBeenCalledWith('/api/project-activity/events', expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it('renders persisted creation and update activity without polling', () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const now = Date.now();

    render(<ProjectActivityChart
      initialBucketSizeMs={86_400_000}
      initialDisplayMode="period"
      initialEvents={[
        { id: 'created', timestamp: now - 1_000, type: 'notes', action: 'created' },
        { id: 'updated', timestamp: now, type: 'notes', action: 'updated' },
        { id: 'agent', timestamp: now, type: 'agents', action: 'created' },
      ]}
      pollIntervalMs={null}
      showPollingControl={false}
    />);

    expect(screen.getByText('Historical')).toBeInTheDocument();
    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(screen.queryByText('Poll interval')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Project activity debug output')).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
});
