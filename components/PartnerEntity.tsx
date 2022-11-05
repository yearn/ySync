import React, {ReactElement} from 'react';
import {Card} from '@yearn-finance/web-lib/components';
import type {TPartner, TSettings} from 'types/types';
import StatusLine from './StatusLine';
import {useWeb3} from '@yearn-finance/web-lib';
import {partnerSupportedNetworksMap} from 'contexts/useYearn';

type TPartnerEntityProps = {partner: string; status: TPartner[] ;settings: TSettings};

const getSuffix = (src: string, chainID: string, hasAnomalies: boolean, partner: string): ReactElement | string => {
	if (hasAnomalies && src === 'yDaemon') {
		return (<span>
			{'yDaemon (file '}
			<a
				href={`https://github.com/yearn/ydaemon/tree/main/data/partners/networks/${chainID}`}
				target={'_blank'}
				className={'tabular-nums text-red-900 underline'}
				rel={'noreferrer'}
			>
				{`${partner.toLowerCase()}.json`}
			</a>
			{' is missing)'}
		</span>);
	}

	return `in ${src}`;
};

function PartnerEntity({partner, status, settings: statusSettings}: TPartnerEntityProps): ReactElement | null {
	const	{chainID} = useWeb3();

	if (![...partnerSupportedNetworksMap.values()].includes(chainID)) {
		return null;
	}
	
	const hasAnomalies = (status.length < 2);

	if (!hasAnomalies && statusSettings.shouldShowOnlyAnomalies) {
		return null;
	}

	return (
		<Card variant={'background'} key={partner}>
			<div className={'flex flex-row space-x-4'}>
				<div className={'-mt-1 flex flex-col'}>
					<div className={'flex flex-row items-center space-x-2'}>
						<h4 className={'text-lg font-bold text-neutral-700'}>{partner.charAt(0) + partner.slice(1).toLocaleLowerCase()}</h4>
					</div>
				</div>
			</div>
			<section aria-label={'partners check'} className={'mt-3 flex flex-col pl-0'}>
				{['exporter', 'yDaemon'].map((src): ReactElement => {
					const {source} = status.find(({source}: TPartner): boolean => src === source) || {};
					return <StatusLine
						key={`${src}_${partner}_state`}
						settings={statusSettings}
						isValid={src === source}
						suffix={getSuffix(src, chainID, hasAnomalies, partner)}
					/>;
				})}
			</section>
		</Card>
	);
}

export default PartnerEntity;
