import React from 'react';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';

import StatusLine from './StatusLine';

import type {ReactElement} from 'react';
import type {TPartner, TSettings} from 'types/types';

type TPartnerEntityProps = {partner: string; status: TPartner[] ;settings: TSettings};

const getSuffix = (src: string, chainID: string, hasAnomalies: boolean, partner: string): ReactElement | string => {
	if (hasAnomalies && src === 'yDaemon') {
		return (
			<span>
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
			</span>
		);
	}

	return `in ${src}`;
};

function PartnerEntity({partner, status, settings: statusSettings}: TPartnerEntityProps): ReactElement | null {
	const	{chainID} = useWeb3();

	const hasAnomalies = (status.length < 2);

	if (!hasAnomalies && statusSettings.shouldShowOnlyAnomalies) {
		return null;
	}

	return (
		<div className={'bg-neutral-100 p-4'} key={partner}>
			<div className={'flex flex-row space-x-4'}>
				<div className={'-mt-1 flex flex-col'}>
					<div className={'flex flex-row items-center space-x-2'}>
						<h4 className={'text-lg font-bold text-neutral-900'}>{partner.charAt(0) + partner.slice(1).toLocaleLowerCase()}</h4>
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
						suffix={getSuffix(src, String(chainID), hasAnomalies, partner)}
					/>;
				})}
			</section>
		</div>
	);
}

export default PartnerEntity;
