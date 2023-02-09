import React, {useEffect, useMemo, useState} from 'react';
import Header from 'components/common/Header';
import HeaderTitle from 'components/common/HeaderTitle';
import KBarButton from 'components/common/KBarButton';
import {TokensImageTester, VaultImageTester} from 'components/ImageTester';
import PartnerEntity from 'components/PartnerEntity';
import StrategyEntity from 'components/StrategyEntity';
import TokenEntity from 'components/TokenEntity';
import TranslationStatusLine from 'components/TranslationStatusLine';
import VaultEntity from 'components/VaultEntity';
import {useYearn} from 'contexts/useYearn';
import {Dropdown} from '@yearn-finance/web-lib/components/Dropdown';
import {StatisticCard} from '@yearn-finance/web-lib/components/StatisticCard';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {ReactElement, ReactNode} from 'react';
import type {TStrategiesData, TTokensData} from 'types/entities';
import type {TEntity, TPartner, TSettings} from 'types/types';

const	defaultSettings: TSettings = {
	shouldShowOnlyAnomalies: true,
	shouldShowOnlyEndorsed: true,
	shouldShowVersion: 'v4',
	shouldShowMissingTranslations: false,
	shouldShowEntity: 'vaults'
};

type 	TOption = {label: string; value: TEntity};

const	OPTIONS: TOption[] = [
	{label: 'Vaults', value: 'vaults'},
	{label: 'Tokens', value: 'tokens'},
	{label: 'Protocols', value: 'protocols'},
	{label: 'Strategies', value: 'strategies'},
	{label: 'Partners', value: 'partners'}
];

const AnomaliesCheckbox = ({appSettings, set_appSettings}: {
	appSettings: TSettings,
	set_appSettings: (s: TSettings) => void
}): ReactElement | null => {
	return (
		<label
			htmlFor={'checkbox-anomalies'}
			className={'rounded-default flex w-fit cursor-pointer flex-row items-center bg-neutral-200/60 p-2 font-mono text-sm text-neutral-500 transition-colors hover:bg-neutral-200'}>
			<p className={'pr-4'}>{'Anomalies only'}</p>
			<input
				type={'checkbox'}
				id={'checkbox-anomalies'}
				className={'rounded-default ml-2'}
				checked={appSettings.shouldShowOnlyAnomalies}
				onChange={(): void => {
					set_appSettings({
						...appSettings,
						shouldShowOnlyAnomalies: !appSettings.shouldShowOnlyAnomalies
					});
				}} />
		</label>
	);
};

const TranslationsCheckbox = ({appSettings, set_appSettings}: {
	appSettings: TSettings,
	set_appSettings: (s: TSettings) => void
}): ReactElement | null => {
	return (
		<label
			htmlFor={'checkbox-translations'}
			className={'rounded-default flex w-fit cursor-pointer flex-row items-center bg-neutral-200/60 p-2 font-mono text-sm text-neutral-500 transition-colors hover:bg-neutral-200'}>
			<p className={'pr-4'}>{'Missing translations'}</p>
			<input
				type={'checkbox'}
				id={'checkbox-translations'}
				className={'rounded-default ml-2'}
				checked={appSettings.shouldShowMissingTranslations}
				onChange={(): void => {
					set_appSettings({
						...appSettings,
						shouldShowMissingTranslations: !appSettings.shouldShowMissingTranslations
					});
				}} />
		</label>
	);
};

function	Filters({appSettings, set_appSettings}: {
	appSettings: TSettings,
	set_appSettings: (s: TSettings) => void
}): ReactElement | null {
	if (appSettings.shouldShowEntity === 'vaults') {
		return (
			<>
				<AnomaliesCheckbox appSettings={appSettings} set_appSettings={set_appSettings} />
				<TranslationsCheckbox appSettings={appSettings} set_appSettings={set_appSettings} />
				<span
					className={'rounded-default col-span-2 flex w-full flex-row items-center overflow-hidden bg-neutral-200/60 font-mono text-sm text-neutral-500 transition-colors md:w-fit'}>
					<p className={'pr-4 pl-2'}>{'Version'}</p>

					<div className={'flex flex-row divide-primary'}>
						<label className={'cursor-pointer p-2 transition-colors hover:bg-neutral-200'} htmlFor={'checkbox-vaults-all'}>
							{'All'}
							<input
								type={'checkbox'}
								id={'checkbox-vaults-all'}
								className={'rounded-default ml-2'}
								checked={appSettings.shouldShowVersion === 'all'}
								onChange={(): void => {
									set_appSettings({
										...appSettings,
										shouldShowVersion: 'all'
									});
								}} />
						</label>

						<label className={'cursor-pointer p-2 transition-colors hover:bg-neutral-200'} htmlFor={'checkbox-vaults-v2'}>
							{'>= v0.2.0'}
							<input
								type={'checkbox'}
								id={'checkbox-vaults-v2'}
								className={'rounded-default ml-2'}
								checked={appSettings.shouldShowVersion === 'v2'}
								onChange={(): void => {
									set_appSettings({
										...appSettings,
										shouldShowVersion: 'v2'
									});
								}} />
						</label>

						<label className={'cursor-pointer p-2 transition-colors hover:bg-neutral-200'} htmlFor={'checkbox-vaults-v3'}>
							{'>= v0.3.0'}
							<input
								type={'checkbox'}
								id={'checkbox-vaults-v3'}
								className={'rounded-default ml-2'}
								checked={appSettings.shouldShowVersion === 'v3'}
								onChange={(): void => {
									set_appSettings({
										...appSettings,
										shouldShowVersion: 'v3'
									});
								}} />
						</label>

						<label className={'cursor-pointer p-2 transition-colors hover:bg-neutral-200'} htmlFor={'checkbox-vaults-v4'}>
							{'>= v0.4.0'}
							<input
								type={'checkbox'}
								id={'checkbox-vaults-v4'}
								className={'rounded-default ml-2'}
								checked={appSettings.shouldShowVersion === 'v4'}
								onChange={(): void => {
									set_appSettings({
										...appSettings,
										shouldShowVersion: 'v4'
									});
								}} />
						</label>
					</div>
				</span>
			</>
		);
	}

	if (appSettings.shouldShowEntity === 'tokens') {
		return (
			<>
				<AnomaliesCheckbox appSettings={appSettings} set_appSettings={set_appSettings} />
				<TranslationsCheckbox appSettings={appSettings} set_appSettings={set_appSettings} />
			</>
		);
	}

	if (['strategies', 'partners'].includes(appSettings.shouldShowEntity)) {
		return <AnomaliesCheckbox appSettings={appSettings} set_appSettings={set_appSettings} />;
	}

	return null;
}

function	Index(): ReactNode {
	const	{chainID} = useWeb3();
	const	{dataFromAPI, aggregatedData} = useYearn();
	const	[vaults, set_vaults] = useState<any[]>([]);
	const	[tokens, set_tokens] = useState<TTokensData>({});
	const	[protocols, set_protocols] = useState<any>();
	const	[partners, set_partners] = useState<Map<string, TPartner[]>>();
	const	[protocolNames, set_protocolNames] = useState<string[]>([]);
	const	[strategies, set_strategies] = useState<TStrategiesData>();
	const	[appSettings, set_appSettings] = useState<TSettings>(defaultSettings);
	const	[selectedOption, set_selectedOption] = useState(OPTIONS[0]);

	useEffect((): void => {
		if (appSettings.shouldShowEntity === 'vaults') {
			let	_vaults = [...dataFromAPI] || [];
			if (appSettings.shouldShowOnlyEndorsed) {
				_vaults = _vaults.filter((vault: {endorsed: boolean}): boolean => vault.endorsed);
			}
			if (appSettings.shouldShowVersion === 'v2') {
				_vaults = _vaults.filter((vault: {version: string}): boolean => Number(vault.version.replace('.', '')) >= 2);
			} else if (appSettings.shouldShowVersion === 'v3') {
				_vaults = _vaults.filter((vault: {version: string}): boolean => Number(vault.version.replace('.', '')) >= 3);
			} else if (appSettings.shouldShowVersion === 'v4') {
				_vaults = _vaults.filter((vault: {version: string}): boolean => Number(vault.version.replace('.', '')) >= 4);
			}
			set_vaults(_vaults);
		}
		set_tokens(aggregatedData.tokens);
		set_protocols(aggregatedData.protocols);
		set_strategies(aggregatedData.strategies);
		set_partners(aggregatedData.partners);
	}, [dataFromAPI, appSettings, chainID, aggregatedData.tokens, aggregatedData.protocols, aggregatedData.strategies, aggregatedData.partners]);

	useMemo((): void => {
		if (protocols?.protocol) {
			set_protocolNames(Object.keys(protocols.protocol).map((key: string): string => protocols.protocol[key].name));
		}
	}, [protocols?.protocol]);

	const	errorCount = useMemo((): number => {
		if (appSettings.shouldShowEntity === 'tokens') {
			const _errorCount = (
				Object.keys(tokens)
					.filter((tokenAddress: string): boolean => {
						const	hasAnomalies = (
							!aggregatedData.tokens[toAddress(tokenAddress)]?.hasValidPrice
						);

						return hasAnomalies;
					}).length
			);
			return _errorCount / (Object.keys(tokens).length || 1) * 100;

		}
		if (appSettings.shouldShowEntity === 'partners') {
			const values = Array.from(partners?.values() || []);
			const _errorCount = values.filter((partner: TPartner[]): boolean => {
				return partner.length < 2;
			}).length;
			return _errorCount / (values.length || 1) * 100;

		}
		const	_errorCount = (
			vaults
				.filter((vault): boolean => {
					const	hasAnomalies = (
						vault.strategies.length === 0
					|| !aggregatedData.vaults[toAddress(vault.address)]?.hasValidPrice
					|| !aggregatedData.vaults[toAddress(vault.address)]?.hasValidIcon
					|| !aggregatedData.vaults[toAddress(vault.address)]?.hasValidTokenIcon
					|| !aggregatedData.vaults[toAddress(vault.address)]?.hasLedgerIntegration
					|| !aggregatedData.vaults[toAddress(vault.address)]?.hasValidStrategiesDescriptions
					|| !aggregatedData.vaults[toAddress(vault.address)]?.hasValidStrategiesRisk
					|| !aggregatedData.vaults[toAddress(vault.address)]?.hasYearnMetaFile
					|| aggregatedData.vaults[toAddress(vault.address)]?.hasErrorAPY);
					return (hasAnomalies);
				})
				.length
		);
		return _errorCount / (vaults.length || 1) * 100;

	}, [appSettings.shouldShowEntity, vaults, tokens, aggregatedData.tokens, aggregatedData.vaults, partners]);

	return (
		<div>
			{appSettings.shouldShowEntity === 'vaults' ? <VaultImageTester vaults={vaults} /> : null}
			{appSettings.shouldShowEntity === 'tokens' ? <TokensImageTester tokens={aggregatedData.tokens} /> : null}

			<Header shouldUseNetworks={true} shouldUseWallets={false}>
				<div className={'flex w-full flex-col'}>
					<div className={'mr-4 flex w-full items-center justify-between'}>
						<HeaderTitle />
						<div className={'mx-auto hidden md:block'}>
							<KBarButton />
						</div>
					</div>
					<div className={'mt-16'}>
						<StatisticCard.Wrapper>
							<StatisticCard
								className={'col-span-6 !bg-neutral-0 md:col-span-3'}
								label={'Vaults count'}
								value={vaults.length} />
							<StatisticCard
								className={'col-span-6 !bg-neutral-0 md:col-span-3'}
								label={'Tokens count'}
								value={Object.values(tokens || {}).length} />
							<StatisticCard
								className={'col-span-6 !bg-neutral-0 md:col-span-3'}
								label={'Error ratio'}
								value={`${errorCount.toFixed(2)} %`} />
						</StatisticCard.Wrapper>
					</div>
				</div>
			</Header>


			<div className={'bg-neutral-0 p-0'}>
				<div className={'flex flex-col space-y-2 pb-6'}>
					<div className={'grid grid-cols-2 flex-row gap-4 space-x-0 md:flex md:gap-0 md:space-x-4'}>
						<div className={'relative z-10'}>
							<Dropdown
								defaultOption={OPTIONS[0]}
								options={OPTIONS}
								selected={selectedOption}
								onSelect={(option: any): void => {
									set_selectedOption(option);
									set_appSettings({...appSettings, shouldShowEntity: option.value});
								}} />
						</div>
						<Filters appSettings={appSettings} set_appSettings={set_appSettings} />
					</div>
				</div>
				{appSettings.shouldShowEntity === 'strategies' &&
					<div className={'flex flex-col space-y-2 pb-6'}>
						<b className={'text-lg'}>{'Valid Protocol Names'}</b>
						<small>{protocolNames.join(', ')}</small>
					</div>
				}
				<div className={'flex flex-col space-y-2 pb-6'}>
					<b className={'text-lg'}>{'Results'}</b>
					<div className={'mt-4 grid w-full grid-cols-1 gap-6 pb-20 lg:grid-cols-2'}>
						{appSettings.shouldShowEntity === 'vaults' && vaults.map((vault: any, index: number): ReactNode => {
							return (
								<VaultEntity
									key={`${vault.address}_${index}`}
									vault={vault}
									settings={appSettings}
									noStrategies={vault.strategies.length === 0}/>
							);
						})}

						{appSettings.shouldShowEntity === 'tokens' && tokens && Object.keys(tokens).map((tokenAddress: string): ReactNode => {
							return (
								<TokenEntity
									key={tokenAddress}
									settings={appSettings}
									tokenData={aggregatedData.tokens[toAddress(tokenAddress)]} />
							);
						})}

						{appSettings.shouldShowEntity === 'protocols' && protocols.protocol && Object.keys(protocols.protocol).map((protocol: string): ReactNode => {
							if (!protocols.protocol[protocol]) {
								return null;
							}

							const {missingTranslations} = protocols.protocol[protocol];

							if (!missingTranslations) {
								return null;
							}

							return (
								<div className={'bg-neutral-100 p-4'} key={protocol}>
									<div className={'flex flex-row space-x-4'}>
										<div className={'-mt-1 flex flex-col'}>
											<div className={'flex flex-row items-center space-x-2'}>
												<h4 className={'text-lg font-bold text-neutral-900'}>{protocol}</h4>
											</div>
										</div>
									</div>
									<section aria-label={'strategies check'} className={'mt-3 flex flex-col pl-0'}>
										<b className={'mb-1 font-mono text-sm text-neutral-900'}>{`(${missingTranslations.length}) Missing Translations`}</b>
										<TranslationStatusLine
											key={`${protocol}_translation`}
											isValid={false}
											content={missingTranslations.join(', ')} />
									</section>
								</div>
							);
						})}

						{appSettings.shouldShowEntity === 'partners' && partners && [...partners].map(([partner, status]): ReactElement => {
							return <PartnerEntity
								key={partner}
								partner={partner}
								status={status}
								settings={appSettings} />;
						})}

						{appSettings.shouldShowEntity === 'strategies' && strategies && Object.keys(strategies).map((strategyAddress: string): ReactNode => {
							return (
								<StrategyEntity
									key={strategyAddress}
									statusSettings={appSettings}
									protocolFiles={protocols.files}
									protocolNames={protocolNames}
									strategyData={aggregatedData.strategies[strategyAddress]} />
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Index;
