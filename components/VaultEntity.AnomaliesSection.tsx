import React, {ReactElement, ReactNode, useEffect, useState} from 'react';
import {performBatchedUpdates} from '@yearn-finance/web-lib';
import StatusLine from 'components/StatusLine';
import type {TAnomalies, TAnomaliesSection} from 'types/types';

function	AnomaliesSection({
	label,
	anomalies,
	errorMessage,
	settings: anomaliesSettings
}: TAnomaliesSection): ReactElement {
	const	[hasAnomalies, set_hasAnomalies] = useState<boolean>(false);
	const	[localAnomalies, set_localAnomalies] = useState<TAnomalies[]>(anomalies);

	useEffect((): void => {
		performBatchedUpdates((): void => {
			set_hasAnomalies(anomalies.some((anomaly): boolean => !anomaly.isValid));
			set_localAnomalies(anomalies);
		});
	}, [anomalies]);

	if (!hasAnomalies && anomaliesSettings.shouldShowOnlyAnomalies) {
		return <div />;
	}
	return (
		<section aria-label={'data source check'} className={'mt-4 flex flex-col pl-0 md:pl-0'}>
			<b className={'mb-1 font-mono text-sm text-neutral-500'}>{label}</b>
			{localAnomalies.map((e: TAnomalies, i: number): ReactNode => (
				<StatusLine
					key={`${e.prefix}-${i}`}
					errorMessage={errorMessage}
					settings={anomaliesSettings}
					{...e} />
			))}
		</section>
	);
}

export default AnomaliesSection;