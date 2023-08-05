import React, {ReactElement, ReactNode, useState} from 'react';
import Image from 'next/image';
import {useSettings, useWeb3} from '@yearn-finance/web-lib/contexts';
import {copyToClipboard, format, toAddress} from '@yearn-finance/web-lib/utils';
import {AddressWithActions} from '@yearn-finance/web-lib/components';
import {useYearn} from 'contexts/useYearn';
import AnomaliesSection from 'components/VaultEntity.AnomaliesSection';
import StatusLine from 'components/StatusLine';
import ModalFix from 'components/modals/ModalFix';
import Code from 'components/Code';
import type {TFixModalData, TSettings} from 'types/types';
import {Copy, LinkOut} from '@yearn-finance/web-lib/icons';

const defaultFixModalData: TFixModalData = {
	isOpen: false,
	fix: {
		category: '',
		address: '0x0000000000000000000000000000000000000000',
		name: '',
		instructions: []
	}
};

function VaultEntity({
	vault,
	settings: vaultSettings,
	noStrategies
}: { vault: any, settings: TSettings, noStrategies?: boolean }): ReactElement | null {
	const {aggregatedData} = useYearn();
	const {chainID} = useWeb3();
	const {networks} = useSettings();
	const [fixModalData, set_fixModalData] = useState<TFixModalData>(defaultFixModalData);

	if (!vault) {
		return null;
	}

	const vaultData = aggregatedData.vaults?.[toAddress(vault.address)];

	function onTriggerModalForLedger(): void {
		function renderSnippetB2C(): string {
			const ledgerSnippetB2C = '{\n\t"address": "0x0000000000000000000000000000000000000000",\n\t"contractName": "some-contract-name",\n\t"selectors": {\n\t\t"0x3ccfd60b": {"erc20OfInterest": [], "method": "withdraw_all", "plugin": "Yearn"},\n\t\t"0x2e1a7d4d": {"erc20OfInterest": [], "method": "withdraw", "plugin": "Yearn"},\n\t\t"0x00f714ce": {"erc20OfInterest": [], "method": "withdraw_to", "plugin": "Yearn"},\n\t\t"0xe63697c8": {"erc20OfInterest": [], "method": "withdraw_to_with_slippage", "plugin": "Yearn"}\n\t}\n}'.trim();
			let snippet = '';
			snippet = ledgerSnippetB2C.replace('0x0000000000000000000000000000000000000000', vault.address.toLowerCase());
			snippet = snippet.replace('some-contract-name', vault.name);
			return snippet;
		}

		function renderSnippetMain(): string {
			let addressChunks = vault.address.toLowerCase().replace('0x', '');
			addressChunks = addressChunks.match(/.{1,2}/g);
			addressChunks = addressChunks.map((chunk: string): string => `0x${chunk}`);
			addressChunks = addressChunks.join(', ');
			addressChunks = addressChunks.match(/.{0,59}/g);
			addressChunks = addressChunks.map((chunk: string): string => `${chunk}\n `);
			addressChunks = addressChunks.join('').trim();

			const ledgerSnippetMain = `{{${addressChunks}},\n "${vault.token.symbol}",\n "${vault.symbol}",\n ${vault.decimals}}`;
			let snippet = '';
			snippet = ledgerSnippetMain.replace('0x0000000000000000000000000000000000000000', vault.address.toLowerCase());
			snippet = snippet.replace('some-contract-name', vault.name);
			return snippet;
		}

		set_fixModalData({
			isOpen: true,
			fix: {
				category: 'ledger',
				address: vault.address,
				name: vault.name,
				instructions: [
					<span key={'step-1'}>
						{'1. Access the Ledger\'s B2C file for Yearn on GitHub: '}
						<a href={'https://github.com/LedgerHQ/app-plugin-yearn/blob/develop/tests/yearn/b2c.json'} target={'_blank'} className={'underline'} rel={'noreferrer'}>
							{'https://github.com/LedgerHQ/app-plugin-yearn/blob/develop/tests/yearn/b2c.json'}
						</a>
					</span>,
					<span key={'step-2'}>
						{'2. Append the following snippet at the end of the '}
						<code
							onClick={(): void => copyToClipboard('contracts')}
							className={'cursor-copy rounded-md bg-neutral-200 py-1 px-2 text-sm'}>
							{'contracts'}
						</code>
						{' object in the '}
						<code
							onClick={(): void => copyToClipboard('b2c.json')}
							className={'cursor-copy rounded-md bg-neutral-200 py-1 px-2 text-sm'}>
							{'b2c.json'}
						</code>
						{'file.'}
					</span>,
					<section key={'step-2-2'} aria-label={'code-part'} className={'relative'}>
						<div className={'absolute top-4 right-4'}>
							<Copy
								onClick={(): void => copyToClipboard(renderSnippetB2C())}
								className={'h-4 w-4 cursor-copy opacity-60 transition-colors hover:opacity-100'} />
						</div>
						<Code code={renderSnippetB2C()} language={'json'} />
					</section>,
					<span key={'step-3'}>
						{'3. Access the Ledger\'s ABIs folder for Yearn on GitHub: '}
						<a href={'https://github.com/LedgerHQ/app-plugin-yearn/tree/develop/tests/yearn/abis'} target={'_blank'} className={'underline'} rel={'noreferrer'}>
							{'https://github.com/LedgerHQ/app-plugin-yearn/tree/develop/tests/yearn/abis'}
						</a>
					</span>,
					<span key={'step-4'}>
						{'4. Clone and rename '}
						<code
							onClick={(): void => copyToClipboard('_vault_v0.4.3.json')}
							className={'cursor-copy rounded-md bg-neutral-200 py-1 px-2 text-sm'}>
							{'_vault_v0.4.3.json'}
						</code>
						{' to '}
						<code
							onClick={(): void => copyToClipboard(`${vault.address}.json`)}
							className={'cursor-copy rounded-md bg-neutral-200 py-1 px-2 text-sm'}>
							{`${vault.address}.json`}
						</code>
					</span>,

					<span key={'step-5'}>
						{'5. Access the Ledger\'s main.c file for Yearn on GitHub, and append the following snippet at the end of the array '}
						<a href={'https://github.com/LedgerHQ/app-plugin-yearn/blob/develop/src/main.c#L51'} target={'_blank'} className={'underline'} rel={'noreferrer'}>
							{'https://github.com/LedgerHQ/app-plugin-yearn/blob/develop/src/main.c#L51'}
						</a>
					</span>,
					<section key={'step-5-2'} aria-label={'code-part'} className={'relative'}>
						<div className={'absolute top-4 right-4'}>
							<Copy
								onClick={(): void => copyToClipboard(renderSnippetMain())}
								className={'h-4 w-4 cursor-copy opacity-60 transition-colors hover:opacity-100'} />
						</div>
						<Code code={renderSnippetMain()} language={'json'} />
					</section>
				]
			}
		});
	}

	function onTriggerModalForDescription(currentStrategy: { name: string, address: string }): void {
		set_fixModalData({
			isOpen: true,
			fix: {
				category: 'description',
				address: vault.address,
				name: vault.name,
				instructions: [
					<span key={'step-1'}>
						{'1. Access the Strategies folder in the yDaemon meta directory: '}
						<a href={`https://github.com/yearn/ydaemon/tree/main/data/meta/strategies/${chainID}`} target={'_blank'} className={'underline'} rel={'noreferrer'}>
							{`https://github.com/yearn/ydaemon/tree/main/data/meta/strategies/${chainID}`}
						</a>
					</span>,
					<span key={'step-2'}>
						{'2. Select the file in which the strategy '}
						<code
							onClick={(): void => copyToClipboard(currentStrategy.name)}
							className={'cursor-copy rounded-md bg-neutral-200 py-1 px-2 text-sm'}>
							{currentStrategy.name}
						</code>
						{' should belong to.'}
					</span>,
					<span key={'step-3'}>
						{'3a. If the file exists, append the address of the strategy to the file, under "addresses": '}
						<code
							onClick={(): void => copyToClipboard(currentStrategy.address)}
							className={'cursor-copy rounded-md bg-neutral-200 py-1 px-2 text-sm'}>
							{currentStrategy.address}
						</code>
					</span>,
					<span key={'step-4'}>
						{'3b. If the file does not exists, create a new one and append the address of the strategy to the file, under "addresses": '}
						<code
							onClick={(): void => copyToClipboard(currentStrategy.address)}
							className={'cursor-copy rounded-md bg-neutral-200 py-1 px-2 text-sm'}>
							{currentStrategy.address}
						</code>
					</span>
				]
			}
		});
	}

	function onTriggerModalForMetaFileMissing(): void {
		set_fixModalData({
			isOpen: true,
			fix: {
				category: 'file',
				address: vault.address,
				name: vault.name,
				instructions: [
					<span key={'step-1'}>
						{'1. Access the vaults\' folder in the yDaemon meta directory: '}
						<a href={`https://github.com/yearn/ydaemon/tree/main/data/meta/vaults/${chainID}`} target={'_blank'} className={'underline'} rel={'noreferrer'}>
							{`https://github.com/yearn/ydaemon/tree/main/data/meta/vaults/${chainID}`}
						</a>
					</span>,
					<span key={'step-2'}>
						{'2. Add missing vault file with the filename '}
						<code
							onClick={(): void => copyToClipboard(`${vault.address}.json`)}
							className={'cursor-copy rounded-md bg-neutral-200 py-1 px-2 text-sm'}>
							{`${vault.address}.json`}
						</code>
					</span>
				]
			}
		});
	}

	const hasIconAnomaly = !vaultData?.hasValidTokenIcon || !vaultData?.hasValidIcon;
	const hasPriceAnomaly = !vaultData?.hasValidPrice;
	const hasRetirementAnomaly = !vaultData?.hasValidRetirement;
	const hasYearnMetaFileAnomaly = !vaultData?.hasYearnMetaFile;
	const hasLedgerLiveAnomaly = !vaultData?.hasLedgerIntegration.deployed;
	const hasStrategiesAnomaly = noStrategies;
	const hasRiskAnomaly = vaultData?.strategies.some((strategy): boolean => (strategy?.risk?.riskGroup || 'Others') === 'Others');

	const riskScores = (vaultData?.strategies ?? []).map((strategy): { strategy: { address: string; name: string; }; sum: number; isValid: boolean } => {
		const sum = (
			(strategy?.risk?.riskDetails?.TVLImpact || 0)
			+ (strategy?.risk?.riskDetails?.auditScore || 0)
			+ (strategy?.risk?.riskDetails?.codeReviewScore || 0)
			+ (strategy?.risk?.riskDetails?.complexityScore || 0)
			+ (strategy?.risk?.riskDetails?.longevityImpact || 0)
			+ (strategy?.risk?.riskDetails?.protocolSafetyScore || 0)
			+ (strategy?.risk?.riskDetails?.teamKnowledgeScore || 0)
			+ (strategy?.risk?.riskDetails?.testingScore || 0)
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
	const hasRiskScoreAnomaly = riskScores?.some((isValid): boolean => !isValid);

	const descriptions = (vaultData?.strategies ?? []).map((strategy): { strategy: any; isValid: boolean } => ({
		strategy,
		isValid: strategy.description !== ''
	}));
	const hasDescriptionsAnomaly = descriptions?.some(({isValid}): boolean => !isValid);

	const hasAPYAnomaly = vaultData?.hasErrorAPY || vaultData?.hasNewAPY;
	const hasWantTokenDescriptionAnomaly = !vaultData?.token?.description;

	const shouldRenderDueToMissingIcon = hasIconAnomaly && vaultSettings.shouldShowIcons;
	const shouldRenderDueToMissingPrice = hasPriceAnomaly && vaultSettings.shouldShowPrice;
	const shouldRenderDueToMissingTranslations = Object.keys((vaultData?.missingTranslations) || []).length !== 0 && vaultSettings.shouldShowMissingTranslations;
	const shouldRenderDueToRetirementAnomaly = hasRetirementAnomaly && vaultSettings.shouldShowRetirement;
	const shouldRenderDueToYearnMetaFileAnomaly = hasYearnMetaFileAnomaly && vaultSettings.shouldShowYearnMetaFile;
	const shouldRenderDueToLedgerLiveAnomaly = hasLedgerLiveAnomaly && vaultSettings.shouldShowLedgerLive;
	const shouldRenderDueToStrategiesAnomaly = hasStrategiesAnomaly && vaultSettings.shouldShowStrategies;
	const shouldRenderDueToRiskAnomaly = hasRiskAnomaly && vaultSettings.shouldShowRisk;

	const shouldRenderDueToRiskScoreAnomaly = hasRiskScoreAnomaly && vaultSettings.shouldShowRiskScore;
	const shouldRenderDueToDescriptionsAnomaly = hasDescriptionsAnomaly && vaultSettings.shouldShowDescriptions;
	const shouldRenderDueToAPYAnomaly = hasAPYAnomaly && vaultSettings.shouldShowAPY;
	const shouldRenderDueToWantTokenDescriptionAnomaly = hasWantTokenDescriptionAnomaly && vaultSettings.shouldShowWantTokenDescription;

	if (
		!vaultSettings.shouldShowIcons &&
		!vaultSettings.shouldShowPrice &&
		!vaultSettings.shouldShowMissingTranslations &&
		!vaultSettings.shouldShowRetirement &&
		!vaultSettings.shouldShowYearnMetaFile &&
		!vaultSettings.shouldShowLedgerLive &&
		!vaultSettings.shouldShowStrategies &&
		!vaultSettings.shouldShowRisk &&
		!vaultSettings.shouldShowRiskScore &&
		!vaultSettings.shouldShowDescriptions &&
		!vaultSettings.shouldShowAPY &&
		!vaultSettings.shouldShowWantTokenDescription
	) {
		return null;
	}

	if (
		vaultSettings.shouldShowOnlyAnomalies &&
		!shouldRenderDueToMissingIcon &&
		!shouldRenderDueToMissingPrice &&
		!shouldRenderDueToMissingTranslations &&
		!shouldRenderDueToRetirementAnomaly &&
		!shouldRenderDueToYearnMetaFileAnomaly &&
		!shouldRenderDueToLedgerLiveAnomaly &&
		!shouldRenderDueToStrategiesAnomaly &&
		!shouldRenderDueToRiskAnomaly &&
		!shouldRenderDueToRiskScoreAnomaly &&
		!shouldRenderDueToDescriptionsAnomaly &&
		!shouldRenderDueToAPYAnomaly &&
		!shouldRenderDueToWantTokenDescriptionAnomaly
	) {
		return null;
	}

	return (
		<div className={'rounded-lg bg-neutral-200'}>
			<div className={'flex flex-row space-x-4 rounded-t-lg bg-neutral-300/40 p-4'}>
				<div className={'h-10 min-h-[40px] w-10 min-w-[40px] rounded-full bg-neutral-200'}>
					{vault.icon ?
						<Image
							alt={''}
							src={vault.icon}
							width={40}
							height={40} /> :
						<Image
							alt={''}
							src={`https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/${chainID}/${vault.address}/logo-128.png`}
							width={40}
							height={40} />}
				</div>
				<div className={'-mt-1 flex flex-col'}>
					<div className={'flex flex-row items-center space-x-2'}>
						<h4 className={'text-lg font-bold text-neutral-700'}>{vault.name}</h4>
						<p className={'text-sm opacity-60'}>{`(v${vault.version})`}</p>
					</div>
					<div className={'hidden md:flex'}>
						<AddressWithActions
							className={'text-sm font-normal'}
							truncate={0}
							address={vault.address} />
					</div>
					<div className={'flex md:hidden'}>
						<AddressWithActions
							className={'text-sm font-normal'}
							truncate={8}
							address={vault.address} />
					</div>
				</div>
			</div>
			<div className={'flex flex-col p-4 pt-0'}>
				{(vaultSettings.shouldShowRetirement && !vaultSettings.shouldShowOnlyAnomalies) || (vaultSettings.shouldShowOnlyAnomalies && shouldRenderDueToRetirementAnomaly) ? <AnomaliesSection
					label={'Retirement'}
					settings={vaultSettings}
					anomalies={[{
						isValid: !hasRetirementAnomaly,
						prefix: 'Retirement',
						suffix: (
							<span>
								{vaultData?.hasValidRetirement ? 'for vault' : 'for vault, it should be retired=true'}
							</span>
						)
					}]} /> : null}

				{((vaultSettings.shouldShowYearnMetaFile && !vaultSettings.shouldShowOnlyAnomalies) || (vaultSettings.shouldShowOnlyAnomalies && shouldRenderDueToYearnMetaFileAnomaly)) ? <AnomaliesSection
					label={'Yearn Meta File'}
					settings={vaultSettings}
					anomalies={[{
						isValid: !hasYearnMetaFileAnomaly,
						onClick: onTriggerModalForMetaFileMissing,
						prefix: 'Yearn Meta File',
						suffix: 'for vault'
					}]} /> : null}

				{((vaultSettings.shouldShowIcons && !vaultSettings.shouldShowOnlyAnomalies) || (vaultSettings.shouldShowOnlyAnomalies && shouldRenderDueToMissingIcon)) && (
					<AnomaliesSection
						label={'Icon'}
						settings={vaultSettings}
						anomalies={[{
							isValid: !!vaultData?.hasValidIcon,
							prefix: 'Icon',
							suffix: (
								<span className={'inline'}>
									{'for vault '}
									<a href={`${networks[chainID].explorerBaseURI}/address/${vault.address}`} target={'_blank'} className={`underline ${vaultData?.hasValidIcon ? 'tabular-nums' : 'tabular-nums text-red-900'}`} rel={'noreferrer'}>
										{vault.symbol || 'not_set'}
									</a>
									<button onClick={(): void => copyToClipboard(`${networks[chainID].explorerBaseURI}/address/${vault.address}`)}>
										<Copy className={'ml-2 inline h-4 w-4 text-neutral-500/40 transition-colors hover:text-neutral-500'} />
									</button>
									<a href={`${networks[chainID].explorerBaseURI}/address/${vault.address}`} target={'_blank'} rel={'noreferrer'}>
										<LinkOut className={'ml-2 inline h-4 w-4 text-neutral-500/40 transition-colors hover:text-neutral-500'} />
									</a>
								</span>
							)
						}, {
							isValid: !!vaultData?.hasValidTokenIcon,
							prefix: 'Icon',
							suffix: (
								<span className={'inline'}>
									{'for underlying token '}
									<a href={`${networks[chainID].explorerBaseURI}/address/${vault.token.address}`} target={'_blank'} className={`underline ${vaultData?.hasValidTokenIcon ? 'tabular-nums' : 'tabular-nums text-red-900'}`} rel={'noreferrer'}>
										{vault.token.symbol || 'not_set'}
									</a>
									<button onClick={(): void => copyToClipboard(`${networks[chainID].explorerBaseURI}/address/${vault.token.address}`)}>
										<Copy className={'ml-2 inline h-4 w-4 text-neutral-500/40 transition-colors hover:text-neutral-500'} />
									</button>
									<a href={`${networks[chainID].explorerBaseURI}/address/${vault.token.address}`} target={'_blank'} rel={'noreferrer'}>
										<LinkOut className={'ml-2 inline h-4 w-4 text-neutral-500/40 transition-colors hover:text-neutral-500'} />
									</a>
								</span>
							)
						}]}
					/>
				)}

				{(vaultSettings.shouldShowLedgerLive && !vaultSettings.shouldShowOnlyAnomalies) || (vaultSettings.shouldShowOnlyAnomalies && shouldRenderDueToLedgerLiveAnomaly) ? <AnomaliesSection
					label={'Ledger Live'}
					settings={vaultSettings}
					errorMessage={vaultData?.hasLedgerIntegration.incoming ? 'PENDING' : undefined}
					anomalies={[{
						isValid: vaultData?.hasLedgerIntegration.deployed ?? false,
						isWarning: !vaultData?.hasLedgerIntegration.deployed && vaultData?.hasLedgerIntegration.incoming,
						onClick: onTriggerModalForLedger,
						prefix: 'Ledger integration',
						suffix: 'for vault'
					}]} /> : null}

				{((vaultSettings.shouldShowPrice && !vaultSettings.shouldShowOnlyAnomalies) || (vaultSettings.shouldShowOnlyAnomalies && shouldRenderDueToMissingPrice)) && (
					<AnomaliesSection
						label={'Price'}
						settings={vaultSettings}
						anomalies={[{
							isValid: !hasPriceAnomaly,
							prefix: 'Price',
							suffix: (
								<span>
									{'for vault '}
									<a href={`${networks[chainID].explorerBaseURI}/address/${vault.address}`} target={'_blank'} className={`underline ${vaultData?.hasValidPrice ? '' : 'text-red-900'}`} rel={'noreferrer'}>
										{vaultData?.name}
									</a>
								</span>
							)
						}]}
					/>
				)}

				{((vaultSettings.shouldShowStrategies && !vaultSettings.shouldShowOnlyAnomalies) || (vaultSettings.shouldShowOnlyAnomalies && shouldRenderDueToStrategiesAnomaly)) ? <AnomaliesSection
					label={'Strategies'}
					settings={vaultSettings}
					anomalies={[{
						isValid: !hasStrategiesAnomaly,
						prefix: 'No strategies for this vault',
						errorMessage: '',
						suffix: ''
					}]} /> : null}

				{((vaultSettings.shouldShowRisk && !vaultSettings.shouldShowOnlyAnomalies) || (vaultSettings.shouldShowOnlyAnomalies && shouldRenderDueToRiskAnomaly)) ? (
					<section aria-label={'strategies check'} className={'mt-4 flex flex-col pl-0 md:pl-0'}>
						<b className={'mb-1 font-mono text-sm text-neutral-500'}>{'Risk'}</b>
						{vault.strategies.map((strategy: any): ReactNode => {
							const hasRiskFramework = (strategy?.risk?.riskGroup || 'Others') !== 'Others';
							return (
								<StatusLine
									key={`${strategy.address}_risk`}
									settings={vaultSettings}
									isValid={hasRiskFramework}
									prefix={'Risk'}
									suffix={(
										<span>
											{'for strategy '}
											<a href={`${networks[chainID].explorerBaseURI}/address/${strategy.address}`} target={'_blank'} className={`underline ${hasRiskFramework ? '' : 'text-red-900'}`} rel={'noreferrer'}>
												{strategy.name}
											</a>
										</span>
									)} />

							);
						})}
					</section>
				) : null}

				{((vaultSettings.shouldShowRiskScore && !vaultSettings.shouldShowOnlyAnomalies) || (vaultSettings.shouldShowOnlyAnomalies && shouldRenderDueToRiskScoreAnomaly)) ? (
					<section aria-label={'strategies check'} className={'mt-4 flex flex-col pl-0 md:pl-0'}>
						<b className={'mb-1 font-mono text-sm text-neutral-500'}>{'Risk Score'}</b>
						{riskScores?.map((riskScore): ReactNode => {
							return (
								<StatusLine
									key={`${riskScore.strategy.address}_risk`}
									settings={vaultSettings}
									isValid={riskScore.isValid}
									prefix={'Risk Score '}
									suffix={(
										<span>
											{'for strategy '}
											<a href={`${networks[chainID].explorerBaseURI}/address/${riskScore.strategy.address}`} target={'_blank'} className={`underline ${hasRiskScoreAnomaly ? '' : 'text-red-900'}`} rel={'noreferrer'}>
												{riskScore.strategy.name}
											</a>
											{` (${riskScore.sum})`}
										</span>
									)} />

							);
						})}
					</section>
				) : null}

				{((vaultSettings.shouldShowDescriptions && !vaultSettings.shouldShowOnlyAnomalies) || (vaultSettings.shouldShowOnlyAnomalies && shouldRenderDueToDescriptionsAnomaly)) ? (
					<section aria-label={'strategies check'} className={'mt-4 flex flex-col pl-0 md:pl-0'}>
						<b className={'mb-1 font-mono text-sm text-neutral-500'}>{'Descriptions'}</b>
						{descriptions?.map((description): ReactNode => {
							return (
								<StatusLine
									key={`${description.strategy.address}_description`}
									onClick={(): void => onTriggerModalForDescription(description.strategy)}
									settings={vaultSettings}
									isValid={!hasDescriptionsAnomaly}
									prefix={'Description'}
									suffix={(
										<span>
											{'for strategy '}
											<a href={`${networks[chainID].explorerBaseURI}/address/${description.strategy.address}`} target={'_blank'} className={`underline ${!hasDescriptionsAnomaly ? '' : 'text-red-900'}`} rel={'noreferrer'}>
												{description.strategy.name}
											</a>
										</span>
									)} />
							);
						})}
					</section>
				) : null}

				{((vaultSettings.shouldShowAPY && !vaultSettings.shouldShowOnlyAnomalies) || (vaultSettings.shouldShowOnlyAnomalies && shouldRenderDueToAPYAnomaly)) ? <AnomaliesSection
					label={'APY'}
					settings={vaultSettings}
					anomalies={[{
						isValid: !vaultData?.hasErrorAPY,
						prefix: 'APY is set to ',
						errorMessage: `[ ERROR: ${vault?.apy?.error || 'unknown'} ]`,
						suffix: `for vault - (Net APY: ${format.amount((vault?.apy?.net_apy || 0) * 100, 2, 4)}% | Gross APR: ${format.amount((vault?.apy?.gross_apr || 0) * 100, 2, 4)}%)`
					}, {
						isValid: !vaultData?.hasNewAPY,
						isWarning: true,
						prefix: 'APY is set to ',
						errorMessage: '[ NEW ]',
						suffix: `for vault - (Net APY: ${format.amount((vault?.apy?.net_apy || 0) * 100, 2, 4)}% | Gross APR: ${format.amount((vault?.apy?.gross_apr || 0) * 100, 2, 4)}%)`
					}]} /> : null}

				{((vaultSettings.shouldShowMissingTranslations && !vaultSettings.shouldShowOnlyAnomalies) || (vaultSettings.shouldShowOnlyAnomalies && shouldRenderDueToMissingTranslations)) ? (
					<section aria-label={'strategies check'} className={'mt-4 flex flex-col pl-0 md:pl-0'}>
						<b className={'mb-1 font-mono text-sm text-neutral-500'}>{'Missing Translations'}</b>
						{Object.keys(vaultData?.missingTranslations ?? []).map((strategyAddress: any): ReactNode => {
							const missingTranslation = vaultData?.missingTranslations;
							const shortAddress = `${strategyAddress.substr(0, 8)}...${strategyAddress.substr(strategyAddress.length - 8, strategyAddress.length)}`;

							return (
								<StatusLine
									key={`${strategyAddress}_translation`}
									settings={vaultSettings}
									isValid={false}
									prefix={missingTranslation?.[strategyAddress].join(', ')}
									suffix={(
										<span>
											{'for '}
											<a href={`${networks[chainID].explorerBaseURI}/address/${strategyAddress}`} className={'text-red-900 underline'} rel={'noreferrer'}>
												{shortAddress}
											</a>
										</span>
									)} />
							);
						})}
					</section>
				) : null}

				{((vaultSettings.shouldShowWantTokenDescription && !vaultSettings.shouldShowOnlyAnomalies) || (vaultSettings.shouldShowOnlyAnomalies && shouldRenderDueToWantTokenDescriptionAnomaly)) ? <AnomaliesSection
					label={'Want Token Description'}
					settings={vaultSettings}
					anomalies={[{
						isValid: !hasWantTokenDescriptionAnomaly,
						prefix: 'Description',
						suffix: (
							<span className={'inline'}>
								{'for want token '}
								<a href={`${networks[chainID].explorerBaseURI}/address/${vaultData?.token?.address}`} target={'_blank'} className={'tabular-nums text-red-900 underline'} rel={'noreferrer'}>
									{vaultData?.token?.symbol || 'not_set'}
								</a>
								<button onClick={(): void => copyToClipboard(`${networks[chainID].explorerBaseURI}/address/${vaultData?.token?.address}`)}>
									<Copy className={'ml-2 inline h-4 w-4 text-neutral-500/40 transition-colors hover:text-neutral-500'} />
								</button>
								<a href={`${networks[chainID].explorerBaseURI}/address/${vaultData?.token?.address}`} target={'_blank'} rel={'noreferrer'}>
									<LinkOut className={'ml-2 inline h-4 w-4 text-neutral-500/40 transition-colors hover:text-neutral-500'} />
								</a>
							</span>
						)
					}]} /> : null}
			</div>
			<ModalFix
				fix={fixModalData.fix}
				isOpen={fixModalData.isOpen}
				onClose={(): void => set_fixModalData(defaultFixModalData)} />
		</div>
	);
}



export default VaultEntity;
