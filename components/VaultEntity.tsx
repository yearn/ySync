import React, {ReactElement, ReactNode, useState} from 'react';
import Image from 'next/image';
import {useSettings, useWeb3} from '@yearn-finance/web-lib/contexts';
import {copyToClipboard, toAddress} from '@yearn-finance/web-lib/utils';
import {AddressWithActions, Card} from '@yearn-finance/web-lib/components';
import {useYearn}  from 'contexts/useYearn';
import AnomaliesSection from 'components/VaultEntity.AnomaliesSection';
import StatusLine from 'components/VaultEntity.StatusLine';
import ModalFix from 'components/modals/ModalFix';
import Code from 'components/Code';
import type {TFixModalData, TSettings} from  'types/types';
import {Copy, LinkOut} from '@yearn-finance/web-lib/icons';

const		defaultFixModalData: TFixModalData = {
	isOpen: false,
	fix: {
		category: '',
		address: '0x0000000000000000000000000000000000000000',
		name: '',
		instructions: []
	}
};

function	VaultEntity({
	vault,
	settings: vaultSettings,
	noStrategies
}: {vault: any, settings: TSettings, noStrategies?: boolean}): ReactElement | null {
	const	{aggregatedData} = useYearn();
	const	{chainID} = useWeb3();
	const	{networks} = useSettings();
	const	[fixModalData, set_fixModalData] = useState<TFixModalData>(defaultFixModalData);

	if (!vault) {
		return <React.Fragment />;
	}

	const		hasAnomalies = (
		(vault?.strategies?.length || 0) === 0
		|| !aggregatedData.vaults[toAddress(vault.address)]?.hasValidPrice
		|| !aggregatedData.vaults[toAddress(vault.address)]?.hasValidIcon
		|| !aggregatedData.vaults[toAddress(vault.address)]?.hasValidTokenIcon
		|| !aggregatedData.vaults[toAddress(vault.address)]?.hasLedgerIntegration
		|| !aggregatedData.vaults[toAddress(vault.address)]?.hasValidStrategiesDescriptions
		|| !aggregatedData.vaults[toAddress(vault.address)]?.hasValidStrategiesRisk
		|| !aggregatedData.vaults[toAddress(vault.address)]?.hasYearnMetaFile
	);

	function	onTriggerModalForLedger(): void {
		function	renderSnippetB2C(): string {
			const ledgerSnippetB2C = '{\n\t"address": "0x0000000000000000000000000000000000000000",\n\t"contractName": "some-contract-name",\n\t"selectors": {\n\t\t"0x3ccfd60b": {"erc20OfInterest": [], "method": "withdraw_all", "plugin": "Yearn"},\n\t\t"0x2e1a7d4d": {"erc20OfInterest": [], "method": "withdraw", "plugin": "Yearn"},\n\t\t"0x00f714ce": {"erc20OfInterest": [], "method": "withdraw_to", "plugin": "Yearn"},\n\t\t"0xe63697c8": {"erc20OfInterest": [], "method": "withdraw_to_with_slippage", "plugin": "Yearn"}\n\t}\n}'.trim();
			let	snippet = '';
			snippet = ledgerSnippetB2C.replace('0x0000000000000000000000000000000000000000', vault.address.toLowerCase());
			snippet = snippet.replace('some-contract-name', vault.name);
			return snippet;
		}

		function	renderSnippetMain(): string {
			let addressChunks = vault.address.toLowerCase().replace('0x', '');
			addressChunks = addressChunks.match(/.{1,2}/g);
			addressChunks = addressChunks.map((chunk: string): string => `0x${chunk}`);
			addressChunks = addressChunks.join(', ');
			addressChunks = addressChunks.match(/.{0,59}/g);
			addressChunks = addressChunks.map((chunk: string): string => `${chunk}\n `);
			addressChunks = addressChunks.join('').trim();

			const ledgerSnippetMain = `{{${addressChunks}},\n "${vault.token.symbol}",\n "${vault.symbol}",\n ${vault.decimals}}`;
			let	snippet = '';
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
	function	onTriggerModalForDescription(currentStrategy: {name: string, address: string}): void {
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
	function	onTriggerModalForMetaFileMissing(): void {
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

	if (!hasAnomalies && vaultSettings.shouldShowOnlyAnomalies) {
		return null;
	}

	return (
		<Card variant={'background'}>
			<div className={'flex flex-row space-x-4'}>
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

			<AnomaliesSection
				label={'Yearn Meta File'}
				settings={vaultSettings}
				anomalies={[{
					isValid: aggregatedData.vaults[toAddress(vault.address)]?.hasYearnMetaFile,
					onClick: onTriggerModalForMetaFileMissing,
					prefix: 'Yearn Meta File',
					sufix: 'for vault'
				}]} />

			<AnomaliesSection
				label={'Icon'}
				settings={vaultSettings}
				anomalies={[{
					isValid: aggregatedData.vaults[toAddress(vault.address)]?.hasValidIcon,
					prefix: 'Icon',
					sufix: (
						<span className={'inline'}>
							{'for vault '}
							<a href={`${networks[chainID].explorerBaseURI}/address/${vault.address}`} target={'_blank'} className={`underline ${aggregatedData.vaults[toAddress(vault.address)]?.hasValidIcon ? 'tabular-nums' : 'tabular-nums text-red-900'}`} rel={'noreferrer'}>
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
					isValid: aggregatedData.vaults[toAddress(vault.address)]?.hasValidTokenIcon,
					prefix: 'Icon',
					sufix: (
						<span className={'inline'}>
							{'for underlying token '}
							<a href={`${networks[chainID].explorerBaseURI}/address/${vault.token.address}`} target={'_blank'} className={`underline ${aggregatedData.vaults[toAddress(vault.address)]?.hasValidTokenIcon ? 'tabular-nums' : 'tabular-nums text-red-900'}`} rel={'noreferrer'}>
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
				}]} />

			<AnomaliesSection
				label={'Ledger Live'}
				settings={vaultSettings}
				anomalies={[{
					isValid: aggregatedData.vaults[toAddress(vault.address)]?.hasLedgerIntegration,
					onClick: onTriggerModalForLedger,
					prefix: 'Ledger integration',
					sufix: 'for vault'
				}]} />

			<AnomaliesSection
				label={'Price'}
				settings={vaultSettings}
				anomalies={[{
					isValid: aggregatedData.vaults[toAddress(vault.address)]?.hasValidPrice,
					prefix: 'Price',
					sufix: (
						<span>
							{'for vault '}
							<a href={`${networks[chainID].explorerBaseURI}/address/${aggregatedData.vaults[toAddress(vault.address)].address}`} target={'_blank'} className={`underline ${!aggregatedData.vaults[toAddress(vault.address)].hasValidPrice ? '' : 'text-red-900'}`} rel={'noreferrer'}>
								{aggregatedData.vaults[toAddress(vault.address)].name}
							</a>
						</span>
					)
				}]} />

			<AnomaliesSection
				label={'Strategies'}
				settings={vaultSettings}
				anomalies={[{
					isValid: !noStrategies,
					prefix: 'No strategies for this vault',
					errorMessage: '',
					sufix: ''
				}]} />

			{aggregatedData.vaults[toAddress(vault.address)]?.hasValidStrategiesRisk && vaultSettings.shouldShowOnlyAnomalies ? null : (
				<section aria-label={'strategies check'} className={'mt-4 flex flex-col pl-0 md:pl-14'}>
					<b className={'mb-1 font-mono text-sm text-neutral-500'}>{'Risk Score'}</b>
					{vault.strategies.map((strategy: any): ReactNode => {
						const	hasRiskFramework = ((strategy?.risk?.TVLImpact || 0) + (strategy?.risk?.auditScore || 0) + (strategy?.risk?.codeReviewScore || 0) + (strategy?.risk?.complexityScore || 0) + (strategy?.risk?.longevityImpact || 0) + (strategy?.risk?.protocolSafetyScore || 0) + (strategy?.risk?.teamKnowledgeScore || 0) + (strategy?.risk?.testingScore || 0)) > 0;
						return (
							<StatusLine
								key={`${strategy.address}_risk`}
								settings={vaultSettings}
								isValid={hasRiskFramework}
								prefix={'Risk'}
								sufix={(
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
			)}

			{aggregatedData.vaults[toAddress(vault.address)]?.hasValidStrategiesDescriptions && vaultSettings.shouldShowOnlyAnomalies ? null : (
				<section aria-label={'strategies check'} className={'mt-4 flex flex-col pl-0 md:pl-14'}>
					<b className={'mb-1 font-mono text-sm text-neutral-500'}>{'Descriptions'}</b>
					{vault.strategies.map((strategy: any): ReactNode => {
						const	isMissingDescription = strategy.description === '';

						return (
							<StatusLine
								key={`${strategy.address}_description`}
								onClick={(): void => onTriggerModalForDescription(strategy)}
								settings={vaultSettings}
								isValid={!isMissingDescription}
								prefix={'Description'}
								sufix={(
									<span>
										{'for strategy '}
										<a href={`${networks[chainID].explorerBaseURI}/address/${strategy.address}`} target={'_blank'} className={`underline ${!isMissingDescription ? '' : 'text-red-900'}`} rel={'noreferrer'}>
											{strategy.name}
										</a>
									</span>
								)} />
						);
					})}
				</section>
			)}

			<AnomaliesSection
				label={'APY'}
				settings={vaultSettings}
				anomalies={[{
					isValid: !aggregatedData.vaults[toAddress(vault.address)]?.hasErrorAPY,
					prefix: 'APY is set to ',
					errorMessage: '[ ERROR ]',
					sufix: 'for vault'
				}, {
					isValid: !aggregatedData.vaults[toAddress(vault.address)]?.hasNewAPY,
					isWarning: true,
					prefix: 'APY is set to ',
					errorMessage: '[ NEW ]',
					sufix: 'for vault'
				}]} />


			{Object.keys((aggregatedData?.vaults[toAddress(vault.address)]?.missingTranslations) || []).length !== 0 && vaultSettings.shouldShowMissingTranslations ? (
				<section aria-label={'strategies check'} className={'mt-4 flex flex-col pl-0 md:pl-14'}>
					<b className={'mb-1 font-mono text-sm text-neutral-500'}>{'Missing Translations'}</b>
					{Object.keys(aggregatedData.vaults[toAddress(vault.address)]?.missingTranslations).map((strategyAddress: any): ReactNode => {
						const missingTranslation = aggregatedData.vaults[toAddress(vault.address)]?.missingTranslations;
						const shortAddress = `${strategyAddress.substr(0, 8)}...${strategyAddress.substr(strategyAddress.length-8, strategyAddress.length)}`; 

						return (
							<StatusLine
								key={`${strategyAddress}_translation`}
								settings={vaultSettings}
								isValid={false}
								prefix={missingTranslation[strategyAddress].join(', ')}
								sufix={(
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

			<ModalFix
				fix={fixModalData.fix}
				isOpen={fixModalData.isOpen}
				onClose={(): void => set_fixModalData(defaultFixModalData)} />
		</Card>
	);
}

export default VaultEntity;
