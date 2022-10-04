import React, {ReactElement} from 'react';
import {AddressWithActions} from '@yearn-finance/web-lib/components';
import type {TFile, TSettings} from 'types/types';
import {TStrategy} from 'types/entities';
import StatusLine from './VaultEntity.StatusLine';

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
					{protocolsStatus.map(({name, isValid, file}: TProtocolStatus): ReactElement => {
						return (
							<>
								<StatusLine
									key={`${name}_protocol_file`}
									settings={statusSettings}
									isValid={!!file}
									prefix={(<span>
										{'File '}
										<a href={file?.originalName ? file?.url : '#'} target={file?.originalName ? '_blank' : ''} className={`tabular-nums text-red-900 ${file?.originalName ? 'underline' : ''}`} rel={'noreferrer'}>
											{file?.originalName ?? `${name.replace(/[^a-zA-Z0-9]/g, '')}.json`}
										</a>
									</span>)}
									suffix={'for strategy\'s protocol'} />
								{!!file && <StatusLine
									key={`${name}_protocol`}
									settings={statusSettings}
									isValid={isValid}
									prefix={(<span>
										{'Name '}
										{'"'}<span className={`underline ${isValid ? '' : 'text-red-900'}`}>
											{name}
										</span>{'"'}
									</span>)}
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
