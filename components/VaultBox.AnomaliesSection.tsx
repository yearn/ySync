import	React, {ReactElement, ReactNode}		from	'react';
import	{performBatchedUpdates}					from	'@yearn-finance/web-lib/utils';
import	StatusLine								from	'components/VaultBox.StatusLine';
import	type {TAnomalies, TAnomaliesSection}	from 'types/types';

function	AnomaliesSection({
	label,
	anomalies,
	settings
}: TAnomaliesSection): ReactElement {
	const	[hasAnomalies, set_hasAnomalies] = React.useState<boolean>(false);
	const	[localAnomalies, set_localAnomalies] = React.useState<TAnomalies[]>(anomalies);

	React.useEffect((): void => {
		performBatchedUpdates((): void => {
			set_hasAnomalies(anomalies.some((anomaly): boolean => !anomaly.isValid));
			set_localAnomalies(anomalies);
		});
	}, [anomalies]);

	if (!hasAnomalies && settings.shouldShowOnlyAnomalies) {
		return <div />;
	}
	return (
		<section aria-label={'data source check'} className={'mt-3 flex flex-col pl-0 md:pl-14'}>
			<b className={'mb-1 font-mono text-sm text-neutral-500'}>{label}</b>
			{localAnomalies.map((e: TAnomalies, i: number): ReactNode => <StatusLine key={`${e.prefix}-${i}`} settings={settings} {...e} />)}
		</section>
	);
}

export default AnomaliesSection;