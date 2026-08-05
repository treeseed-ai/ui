export type LiveConnectionState = 'live' | 'idle' | 'degraded' | 'offline' | 'snapshot';

export interface OperationsIdentityItem { label: string; value: string; }
export interface VitalMetricItem {
	key: string; label: string; value: number; secondary?: string | null; href: string; tone?: 'default' | 'positive' | 'warning' | 'danger'; semantic?: MetricSemantic; observedAt?: string;
}
export interface ActivityIntervalItem {
	id: string; stateVersion: number; projectId: string; projectName: string; agentId: string; agentName: string;
	agentClassId: string; activityProfile: string; assignmentId: string; executionId: string; status: string;
	startedAt: string; finishedAt: string | null;
}
export type MetricSemantic = 'configured' | 'cumulative' | 'instantaneous' | 'exact-total';
export interface MetricStatistic { semantic: MetricSemantic; exactTotal: number; mean: number; standardDeviation: number | null; low: number; high: number; sampleSize: number; observedAt: string; }
export interface MetricSeriesPoint { id: string; stateVersion: number; timestamp: string; values: Record<string, number>; statistics: Record<string, MetricStatistic | undefined>; }
export interface WorkdaySummary { id: string; title: string; status: string; startedAt: string | null; finishedAt: string | null; }
export interface MonitorOverview {
	revision: string; generatedAt: string; timeZone: string; connectivity: LiveConnectionState;
	operatingDay: { start: string; end: string };
	activeWorkdays: number; activeProviders: number; executionProviders: string[];
	team: { id: string; name: string }; metrics: Array<{ key: string; value: number; secondary?: string | null; semantic: MetricSemantic; observedAt: string }>;
	workdayContext: { selectedDate: string; selectedWorkdayId: string | null; latestWorkdayId: string | null; workdays: WorkdaySummary[] };
	metricTargets: Record<string, number>; targetRevision: string | null;
}
export interface DeltaPayload<T> { revision: string; generatedAt: string; cursor: string | null; upserts: T[]; removedIds: string[]; }
export interface RealtimePreference { enabled: boolean; intervalSeconds: 2 | 5 | 15 | 30; }
export interface AllocationSliceItem { id: string; name: string; percentage: number; projectId?: string; }
export interface AllocationSnapshot {
	revision: string; generatedAt: string; canManage: boolean; activeAllocationSetId: string | null;
	time: { availableSeconds: number | null; requestedSeconds: number; reservedSeconds: number; activeSeconds: number; elapsedSeconds: number; releasedSeconds: number; remainingSeconds: number | null; overrunSeconds: number };
	projects: AllocationSliceItem[]; agentClasses: AllocationSliceItem[]; workdayTime: AllocationSliceItem[];
}
