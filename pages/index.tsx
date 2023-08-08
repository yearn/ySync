import React, {ReactElement, ReactNode, useEffect, useMemo, useState} from 'react';
import {useWeb3} from '@yearn-finance/web-lib/contexts';
import {toAddress} from '@yearn-finance/web-lib/utils';
import {Card, Dropdown, StatisticCard} from '@yearn-finance/web-lib/components';
import {useYearn} from 'contexts/useYearn';
import VaultEntity from 'components/VaultEntity';
import TokenEntity from 'components/TokenEntity';
import {TokensImageTester, VaultImageTester} from 'components/ImageTester';
import type {TEntity, TPartner, TSettings, TVersions} from 'types/types';
import TranslationStatusLine from 'components/TranslationStatusLine';
import {TStrategiesData, TTokensData} from 'types/entities';
import StrategyEntity from 'components/StrategyEntity';
import PartnerEntity from 'components/PartnerEntity';

const defaultSettings: TSettings = {
	shouldShowAllFilters: true,
	shouldShowOnlyAnomalies: true,
	shouldShowOnlyEndorsed: true,
	shouldShowVersion: 'v4',
	shouldShowMissingTranslations: false,
	shouldShowIcons: true,
	shouldShowPrice: true,
	shouldShowRetirement: true,
	shouldShowYearnMetaFile: true,
	shouldShowLedgerLive: true,
	shouldShowStrategies: true,
	shouldShowRisk: true,
	shouldShowRiskScore: true,
	shouldShowDescriptions: true,
	shouldShowAPY: true,
	shouldShowWantTokenDescription: true,
	shouldShowEntity: 'vaults'
};

type TOption = { label: string; value: TEntity };

const OPTIONS: TOption[] = [
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
	return <label
		htmlFor={'checkbox-anomalies'}
		className={'flex w-fit cursor-pointer flex-row items-center rounded-lg bg-neutral-200/60 p-2 font-mono text-sm text-neutral-500 transition-colors hover:bg-neutral-200'}>
		<p className={'pr-4'}>{'Anomalies only'}</p>
		<input
			type={'checkbox'}
			id={'checkbox-anomalies'}
			className={'ml-2 rounded-lg'}
			checked={appSettings.shouldShowOnlyAnomalies}
			onChange={(): void => {
				set_appSettings({
					...appSettings,
					shouldShowOnlyAnomalies: !appSettings.shouldShowOnlyAnomalies
				});
			}} />
	</label>;
};

const SelectAllCheckbox = ({appSettings, set_appSettings}: {
	appSettings: TSettings,
	set_appSettings: React.Dispatch<React.SetStateAction<TSettings>>
}): ReactElement | null => {
	useEffect((): void => {
		set_appSettings((prev): TSettings => {
			const isAllSelected = [
				prev.shouldShowMissingTranslations,
				prev.shouldShowIcons,
				prev.shouldShowPrice,
				prev.shouldShowRetirement,
				prev.shouldShowYearnMetaFile,
				prev.shouldShowLedgerLive,
				prev.shouldShowStrategies,
				prev.shouldShowRisk,
				prev.shouldShowRiskScore,
				prev.shouldShowDescriptions,
				prev.shouldShowAPY,
				prev.shouldShowWantTokenDescription
			].every(Boolean);
			
			return ({...prev, shouldShowAllFilters: isAllSelected});
		});
	}, [set_appSettings]);

	return <label
		htmlFor={'checkbox-anomalies'}
		className={'flex w-fit cursor-pointer flex-row items-center rounded-lg bg-neutral-200/60 p-2 font-mono text-sm text-neutral-500 transition-colors hover:bg-neutral-200'}>
		<p className={'pr-4'}>{'Select All Filters'}</p>
		<input
			type={'checkbox'}
			id={'checkbox-select-all'}
			className={'ml-2 rounded-lg'}
			checked={appSettings.shouldShowAllFilters}
			onChange={(): void => {
				const isSelectAllChecked = !appSettings.shouldShowAllFilters;
				set_appSettings({
					...appSettings,
					shouldShowAllFilters: isSelectAllChecked,
					shouldShowMissingTranslations: isSelectAllChecked,
					shouldShowIcons: isSelectAllChecked,
					shouldShowPrice: isSelectAllChecked,
					shouldShowRetirement: isSelectAllChecked,
					shouldShowYearnMetaFile: isSelectAllChecked,
					shouldShowLedgerLive: isSelectAllChecked,
					shouldShowStrategies: isSelectAllChecked,
					shouldShowRisk: isSelectAllChecked,
					shouldShowRiskScore: isSelectAllChecked,
					shouldShowDescriptions: isSelectAllChecked,
					shouldShowAPY: isSelectAllChecked,
					shouldShowWantTokenDescription: isSelectAllChecked
				});
			}} />
	</label>;
};

function convertToKebabCase(str: string): string {
	return str
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-');
}

type TBooleanKeys<T> = {
	[K in keyof T]: T[K] extends boolean ? K : never;
}[keyof T];

const FilterCheckbox = ({label, appSettings, appSettingsKey, set_appSettings}: {
	label: string; appSettings: TSettings; appSettingsKey: TBooleanKeys<TSettings>;
	set_appSettings: (s: TSettings) => void
}): ReactElement | null => {
	const kebabCaseLabel = convertToKebabCase(label);

	return <label
		htmlFor={`checkbox-${kebabCaseLabel}`}
		className={'flex w-fit cursor-pointer flex-row items-center rounded-lg bg-neutral-200/60 p-2 font-mono text-sm text-neutral-500 transition-colors hover:bg-neutral-200'}>
		<p className={'pr-4'}>{label}</p>
		<input
			type={'checkbox'}
			id={`checkbox-${kebabCaseLabel}`}
			className={'ml-2 rounded-lg'}
			checked={appSettings[appSettingsKey]}
			onChange={(): void => {
				set_appSettings({
					...appSettings,
					[appSettingsKey]: !appSettings[appSettingsKey]
				});
			}} />
	</label>;
};

function Filters({appSettings, set_appSettings}: {
	appSettings: TSettings,
	set_appSettings: (s: TSettings) => void
}): ReactElement | null {
	if (appSettings.shouldShowEntity === 'vaults') {
		const filters: { label: string; appSettingsKey: TBooleanKeys<TSettings> }[] = [
			{label: 'Missing Translations', appSettingsKey: 'shouldShowMissingTranslations'},
			{label: 'Icons', appSettingsKey: 'shouldShowIcons'},
			{label: 'Price', appSettingsKey: 'shouldShowPrice'},
			{label: 'Retirement', appSettingsKey: 'shouldShowRetirement'},
			{label: 'Yearn Meta File', appSettingsKey: 'shouldShowYearnMetaFile'},
			{label: 'Ledger Live', appSettingsKey: 'shouldShowLedgerLive'},
			{label: 'Strategies', appSettingsKey: 'shouldShowStrategies'},
			{label: 'Risk', appSettingsKey: 'shouldShowRisk'},
			{label: 'Risk Score', appSettingsKey: 'shouldShowRiskScore'},
			{label: 'Descriptions', appSettingsKey: 'shouldShowDescriptions'},
			{label: 'APY', appSettingsKey: 'shouldShowAPY'},
			{label: 'Want Token Description', appSettingsKey: 'shouldShowWantTokenDescription'}
		];

		return (
			<div className={'flex flex-row flex-wrap gap-2'}>
				{filters.map(({label, appSettingsKey}): ReactElement => (
					<FilterCheckbox key={label} label={label} appSettings={appSettings} set_appSettings={set_appSettings} appSettingsKey={appSettingsKey} />
				))}
			</div>
		);
	}

	if (appSettings.shouldShowEntity === 'tokens') {
		const filters: { label: string; appSettingsKey: TBooleanKeys<TSettings> }[] = [
			{label: 'Missing Translations', appSettingsKey: 'shouldShowMissingTranslations'},
			{label: 'Icons', appSettingsKey: 'shouldShowIcons'},
			{label: 'Price', appSettingsKey: 'shouldShowPrice'}
		];

		return (
			<div className={'flex flex-row flex-wrap gap-2'}>
				{filters.map(({label, appSettingsKey}): ReactElement => (
					<FilterCheckbox key={label} label={label} appSettings={appSettings} set_appSettings={set_appSettings} appSettingsKey={appSettingsKey} />
				))}
			</div>
		);
	}

	return null;
}

function Index(): ReactNode {
	const {chainID} = useWeb3();
	const {dataFromAPI, aggregatedData} = useYearn();
	const [vaults, set_vaults] = useState<any[]>([]);
	const [tokens, set_tokens] = useState<TTokensData>({});
	const [protocols, set_protocols] = useState<any>();
	const [partners, set_partners] = useState<Map<string, TPartner[]>>();
	const [protocolNames, set_protocolNames] = useState<string[]>([]);
	const [strategies, set_strategies] = useState<TStrategiesData>();
	const [appSettings, set_appSettings] = useState<TSettings>(defaultSettings);
	const [selectedOption, set_selectedOption] = useState(OPTIONS[0]);

	useEffect((): void => {
		if (appSettings.shouldShowEntity === 'vaults') {
			let _vaults = [...dataFromAPI] || [];
			if (appSettings.shouldShowOnlyEndorsed) {
				_vaults = _vaults.filter((vault: { endorsed: boolean }): boolean => vault.endorsed);
			}
			if (appSettings.shouldShowVersion === 'v2') {
				_vaults = _vaults.filter((vault: { version: string }): boolean => Number(vault.version.replace('.', '')) >= 2);
			} else if (appSettings.shouldShowVersion === 'v3') {
				_vaults = _vaults.filter((vault: { version: string }): boolean => Number(vault.version.replace('.', '')) >= 3);
			} else if (appSettings.shouldShowVersion === 'v4') {
				_vaults = _vaults.filter((vault: { version: string }): boolean => Number(vault.version.replace('.', '')) >= 4);
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

	const errorCount = useMemo((): number => {
		if (appSettings.shouldShowEntity === 'tokens') {
			const _errorCount = (
				Object.keys(tokens)
					.filter((tokenAddress: string): boolean => {
						const hasAnomalies = (
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
		const _errorCount = (
			vaults
				.filter((vault): boolean => {
					const vaultData = aggregatedData.vaults[toAddress(vault.address)];
					if (!vaultData) {
						return false;
					}

					const riskScores = (vaultData.strategies ?? []).map((strategy): { strategy: { address: string; name: string; }; sum: number; isValid: boolean } => {
						const {riskDetails} = strategy?.risk || {};
						if (!riskDetails) {
							return {strategy: {address: strategy.address, name: strategy.name}, sum: 0, isValid: false};
						}
						const sum = (
							(riskDetails.TVLImpact || 0)
							+ (riskDetails.auditScore || 0)
							+ (riskDetails.codeReviewScore || 0)
							+ (riskDetails.complexityScore || 0)
							+ (riskDetails.longevityImpact || 0)
							+ (riskDetails.protocolSafetyScore || 0)
							+ (riskDetails.teamKnowledgeScore || 0)
							+ (riskDetails.testingScore || 0)
						);

						return {
							strategy: {
								address: strategy.address,
								name: strategy.name
							},
							sum,
							isValid: sum > 0 && sum < 40
						};
					});

					const descriptions = (vaultData.strategies ?? []).map((strategy): { strategy: any; isValid: boolean } => ({
						strategy,
						isValid: strategy.description !== ''
					}));

					const hasAnomalies = (
						(appSettings.shouldShowStrategies && vault.strategies.length === 0)
						|| (appSettings.shouldShowIcons && !vaultData.hasValidIcon)
						|| (appSettings.shouldShowIcons && !vaultData.hasValidTokenIcon)
						|| (appSettings.shouldShowPrice && !vaultData.hasValidPrice)
						|| (appSettings.shouldShowRetirement && !vaultData.hasValidRetirement)
						|| (appSettings.shouldShowYearnMetaFile && !vaultData.hasYearnMetaFile)
						|| (appSettings.shouldShowLedgerLive && !vaultData.hasLedgerIntegration.deployed)
						|| (appSettings.shouldShowStrategies && !vaultData.hasValidStrategiesDescriptions) // TODO: check if this is correct
						|| (appSettings.shouldShowStrategies && !vaultData.hasValidStrategiesRisk) // TODO: check if this is correct
						|| (appSettings.shouldShowRisk && vaultData.strategies.some((strategy): boolean => (strategy?.risk?.riskGroup || 'Others') === 'Others'))
						|| (appSettings.shouldShowAPY && vaultData.hasErrorAPY)
						|| (appSettings.shouldShowAPY && vaultData.hasNewAPY)
						|| (appSettings.shouldShowWantTokenDescription && !vaultData.token?.description)
						|| (appSettings.shouldShowRiskScore && riskScores?.some((isValid): boolean => !isValid))
						|| (appSettings.shouldShowDescriptions && descriptions?.some(({isValid}): boolean => !isValid))
					);
					return (hasAnomalies);
				})
				.length
		);
		return _errorCount / (vaults.length || 1) * 100;

	}, [appSettings.shouldShowEntity, appSettings.shouldShowStrategies, appSettings.shouldShowIcons, appSettings.shouldShowPrice, appSettings.shouldShowRetirement, appSettings.shouldShowYearnMetaFile, appSettings.shouldShowLedgerLive, appSettings.shouldShowRisk, appSettings.shouldShowAPY, appSettings.shouldShowWantTokenDescription, appSettings.shouldShowRiskScore, appSettings.shouldShowDescriptions, vaults, tokens, aggregatedData.tokens, aggregatedData.vaults, partners]);

	const versions: { [K in TVersions]: { label: string; value: string } } = {
		all: {label: 'All', value: 'all'},
		v2: {label: '>= v0.2.0', value: 'v2'},
		v3: {label: '>= v0.3.0', value: 'v3'},
		v4: {label: '>= v0.4.0', value: 'v4'}
	};

	const versionsOptions = Object.keys(versions).map((key): { label: string; value: string } => (versions[key as TVersions]));

	const shouldShowAnomaliesCheckbox = ['vaults', 'tokens', 'strategies', 'partners'].includes(appSettings.shouldShowEntity);

	return (
		<div>
			{appSettings.shouldShowEntity === 'vaults' ? <VaultImageTester vaults={vaults} /> : null}
			{appSettings.shouldShowEntity === 'tokens' ? <TokensImageTester tokens={aggregatedData.tokens} /> : null}

			<div className={'mb-4'}>
				<StatisticCard.Wrapper>
					<StatisticCard className={'col-span-6 md:col-span-3'} label={'Vaults count'} value={vaults.length} />
					<StatisticCard className={'col-span-6 md:col-span-3'} label={'Tokens count'} value={Object.values(tokens || {}).length} />
					<StatisticCard className={'col-span-6 md:col-span-3'} label={'Error ratio'} value={`${errorCount.toFixed(2)} %`} />
				</StatisticCard.Wrapper>
			</div>

			<Card>
				<div className={'flex flex-col space-y-2 pb-6'}>
					<b className={'text-lg'}>{'Filters'}</b>
					<div className={'grid grid-cols-2 flex-row gap-4 space-x-0 md:flex md:gap-0 md:space-x-4'}>
						<div className={'relative z-10'}>
							<Dropdown
								defaultOption={OPTIONS[0]}
								options={OPTIONS}
								selected={selectedOption}
								onSelect={(option: TOption): void => {
									set_selectedOption(option);
									set_appSettings({...appSettings, shouldShowEntity: option.value});
								}} />
						</div>				<span className={'grid-cols-2'}>
							<Dropdown
								defaultOption={versions.v4}
								options={versionsOptions}
								selected={versions[appSettings.shouldShowVersion]}
								onSelect={(option: { label: string; value: TVersions; }): void => {
									set_appSettings({...appSettings, shouldShowVersion: option.value});
								}}
							/>
						</span>
						{shouldShowAnomaliesCheckbox ? <AnomaliesCheckbox appSettings={appSettings} set_appSettings={set_appSettings} /> : null}
						<SelectAllCheckbox appSettings={appSettings} set_appSettings={set_appSettings} />
					</div>
				</div>
				<div className={'flex flex-wrap pb-6'}>
					<Filters appSettings={appSettings} set_appSettings={set_appSettings} />
				</div>
				{appSettings.shouldShowEntity === 'strategies' &&
					<div className={'flex flex-col space-y-2 pb-6'}>
						<b className={'text-lg'}>{'Valid Protocol Names'}</b>
						<small>{protocolNames.join(', ')}</small>
					</div>
				}
				<div className={'flex flex-col space-y-2 pb-6'}>
					<b className={'text-lg'}>{'Results'}</b>
					<div className={'mt-4 grid w-full grid-cols-1 gap-4 lg:grid-cols-2'}>
						{appSettings.shouldShowEntity === 'vaults' && vaults.map((vault: any, index: number): ReactNode => {
							return (
								<VaultEntity
									key={`${vault.address}_${index}`}
									vault={vault}
									settings={appSettings}
									noStrategies={vault.strategies.length === 0} />
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
								<Card variant={'background'} key={protocol}>
									<div className={'flex flex-row space-x-4'}>
										<div className={'-mt-1 flex flex-col'}>
											<div className={'flex flex-row items-center space-x-2'}>
												<h4 className={'text-lg font-bold text-neutral-700'}>{protocol}</h4>
											</div>
										</div>
									</div>
									<section aria-label={'strategies check'} className={'mt-3 flex flex-col pl-0'}>
										<b className={'mb-1 font-mono text-sm text-neutral-500'}>{`(${missingTranslations.length}) Missing Translations`}</b>
										<TranslationStatusLine
											key={`${protocol}_translation`}
											isValid={false}
											content={missingTranslations.join(', ')} />
									</section>
								</Card>
							);
						})}

						{appSettings.shouldShowEntity === 'partners' && partners && [...partners].map(([partner, status]): ReactElement => {
							return <PartnerEntity key={partner} partner={partner} status={status} settings={appSettings} />;
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
			</Card>
		</div>
	);
}

export default Index;
