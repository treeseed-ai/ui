import type { ReactNode } from 'react';

export interface LinkedDiagnosticColumn<Row> {
	id: string;
	label: string;
	value(row: Row): ReactNode;
}

export function LinkedDiagnosticTable<Row extends { id: string }>({ label, rows, columns, onInspect, empty = 'No diagnostic records are available.' }: {
	label: string;
	rows: Row[];
	columns: LinkedDiagnosticColumn<Row>[];
	onInspect?(row: Row): void;
	empty?: string;
}) {
	if (!rows.length) return <p className="ts-linked-diagnostic-table__empty">{empty}</p>;
	return <div className="ts-linked-diagnostic-table" role="region" aria-label={label} tabIndex={0}>
		<table>
			<thead><tr>{columns.map((column) => <th key={column.id} scope="col">{column.label}</th>)}{onInspect ? <th scope="col"><span className="ts-visually-hidden">Actions</span></th> : null}</tr></thead>
			<tbody>{rows.map((row) => <tr key={row.id}>{columns.map((column) => <td key={column.id}>{column.value(row)}</td>)}{onInspect ? <td><button type="button" onClick={() => onInspect(row)}>Inspect</button></td> : null}</tr>)}</tbody>
		</table>
	</div>;
}
