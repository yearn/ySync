import React from 'react';
import {AddressWithActions} from '@yearn-finance/web-lib/components/AddressWithActions';
import {useSettings} from '@yearn-finance/web-lib/contexts/useSettings';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import StatusLine from './StatusLine';

import type {ReactElement} from 'react';
import type {TStrategy} from 'types/entities';
import type {TFile, TSettings} from 'types/types';

type TProtocolStatus = {
	name: string;
	isValid: boolean;
	file?: TFile;
}

type TStrategyEntity = {
	strategyData: TStrategy;
	protocolNames: string[];
	protocolFiles: TFile[];
	statusSettings: TSettings;
}

function findFile(filename: string, files: TFile[]): TFile | undefined {
	return files.find(({name}): boolean => name === filename.replace(/[^a-zA-Z0-9]/g, '').toUpperCase());
}

function StrategyEntity({strategyData, protocolNames, protocolFiles, statusSettings}: TStrategyEntity): ReactElement | null {
	const	{chainID} = useWeb3();
	const	{networks} = useSettings();

	if (!strategyData) {
		return null;
	}

	const {address, name, protocols} = strategyData;

	if (!protocols?.length) {
		return null;
	}

	const protocolsStatus = protocols.map((protocol): TProtocolStatus => ({
		name: protocol,
		isValid: protocolNames.includes(protocol),
		file: findFile(protocol, protocolFiles)
	}));

	const hasAnomalies = protocolsStatus.some(({isValid}): boolean => !isValid);

	if (!hasAnomalies && statusSettings.shouldShowOnlyAnomalies) {
		return null;
	}

	return (
		<div className={'rounded-default bg-neutral-100'} key={name}>
			<div className={'rounded-t-default flex flex-row space-x-4 border-b border-neutral-300 p-4'}>
				<div className={'-mt-1 flex flex-col'}>
					<div className={'flex flex-row items-baseline space-x-2'}>
						<h4 className={'text-lg font-bold text-neutral-900'}>
							{name}
						</h4>
					</div>
					<div className={'hidden md:flex'}>
						<AddressWithActions
							className={'text-sm font-normal'}
							truncate={0}
							address={toAddress(address)}
							explorer={networks[chainID].explorerBaseURI || ''}
						/>
					</div>
					<div className={'flex md:hidden'}>
						<AddressWithActions
							className={'text-sm font-normal'}
							truncate={8}
							address={toAddress(address)}
							explorer={networks[chainID].explorerBaseURI || ''}
						/>
					</div>
				</div>
			</div>
			<div className={'flex flex-col p-4 pt-0'}>
				<section aria-label={'strategies check'} className={'mt-4 flex flex-col pl-0 md:pl-0'}>
					<b className={'mb-1 font-mono text-sm text-neutral-900'}>{'Protocol Validity'}</b>
					{protocolsStatus.map(({name, isValid, file}: TProtocolStatus): ReactElement => {
						return (
							<>
								<StatusLine
									key={`${name}_protocol_file`}
									settings={statusSettings}
									isValid={!!file}
									prefix={(
										<span>
											{'File '}
											<a
												href={file?.originalName ? file?.url : '#'}
												target={file?.originalName ? '_blank' : ''}
												className={`tabular-nums text-red-900 ${file?.originalName ? 'underline' : ''}`}
												rel={'noreferrer'}>
												{file?.originalName ?? `${name.replace(/[^a-zA-Z0-9]/g, '')}.json`}
											</a>
										</span>
									)}
									suffix={'for strategy\'s protocol'} />
								{!!file && <StatusLine
									key={`${name}_protocol`}
									settings={statusSettings}
									isValid={isValid}
									prefix={(
										<span>
											{'Name '}
											{'"'}<span className={`underline ${isValid ? '' : 'text-red-900'}`}>{name}</span>{'"'}
										</span>)
									}
									suffix={'for strategy\'s protocol'} />}
							</>
						);
					})}
				</section>
			</div>
		</div>
	);
}

export default StrategyEntity;
