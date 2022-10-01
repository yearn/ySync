import React, {ReactElement} from 'react';
import {AddressWithActions} from '@yearn-finance/web-lib/components';
import type {TSettings} from 'types/types';
import {TStrategy} from 'types/entities';
import StatusLine from './VaultEntity.StatusLine';

type TProtocolStatus = {
	isValid: boolean;
	name: string;
}

type TStrategyEntity = {
	strategyData: TStrategy;
	protocolNames: string[];
	statusSettings: TSettings;
}

function StrategyEntity({strategyData, protocolNames, statusSettings}: TStrategyEntity): ReactElement | null {
	if (!strategyData) {
		return null;
	}

	const {address, name, protocols} = strategyData;

	if (!protocols?.length) {
		return null;
	}

	const protocolsStatus = protocols.map((protocol): TProtocolStatus => ({
		isValid: protocolNames.includes(protocol),
		name: protocol
	}));

	const hasAnomalies = protocolsStatus.some(({isValid}): boolean => !isValid);

	if (!hasAnomalies && statusSettings.shouldShowOnlyAnomalies) {
		return null;
	}

	return (
		<div className={'rounded-lg bg-neutral-200'} key={name}>
			<div className={'flex flex-row space-x-4 rounded-t-lg bg-neutral-300/40 p-4'}>
				<div className={'-mt-1 flex flex-col'}>
					<div className={'flex flex-row items-baseline space-x-2'}>
						<h4 className={'text-lg font-bold text-neutral-700'}>
							{name}
						</h4>
					</div>
					<div className={'hidden md:flex'}>
						<AddressWithActions
							className={'text-sm font-normal'}
							truncate={0}
							address={address}
						/>
					</div>
					<div className={'flex md:hidden'}>
						<AddressWithActions
							className={'text-sm font-normal'}
							truncate={8}
							address={address}
						/>
					</div>
				</div>
			</div>
			<div className={'flex flex-col p-4 pt-0'}>
				<section aria-label={'strategies check'} className={'mt-4 flex flex-col pl-0 md:pl-0'}>
					<b className={'mb-1 font-mono text-sm text-neutral-500'}>{'Protocol Validity'}</b>
					{protocolsStatus.map(({isValid, name}: TProtocolStatus): ReactElement => {
						return (
							<StatusLine
								key={`${name}_protocol`}
								settings={statusSettings}
								isValid={isValid}
								prefix={(<span>
									{'Name '}
									{'"'}<span className={`underline ${isValid ? '' : 'text-red-900'}`}>
										{name}
									</span>{'"'}
								</span>)}
								suffix={'for protocol'} />
								
						);
					})}
				</section>
			</div>
		</div>
	);
}

export default StrategyEntity;
