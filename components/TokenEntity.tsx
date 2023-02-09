import React from 'react';
import Image from 'next/image';
import TranslationStatusLine from 'components/TranslationStatusLine';
import AnomaliesSection from 'components/VaultEntity.AnomaliesSection';
import {AddressWithActions} from '@yearn-finance/web-lib/components/AddressWithActions';
import {useSettings} from '@yearn-finance/web-lib/contexts/useSettings';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import Copy from '@yearn-finance/web-lib/icons/IconCopy';
import LinkOut from '@yearn-finance/web-lib/icons/IconLinkOut';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {copyToClipboard} from '@yearn-finance/web-lib/utils/helpers';

import type {ReactElement} from 'react';
import type {TTokenData} from 'types/entities';
import type {TSettings} from 'types/types';

function	TokenEntity({
	tokenData,
	settings: statusSettings
}: {tokenData: TTokenData, settings: TSettings}): ReactElement {
	const	{chainID} = useWeb3();
	const	{networks} = useSettings();

	if (!tokenData) {
		return <React.Fragment />;
	}
	const {name, symbol, missingTranslations} = tokenData;

	if (!missingTranslations) {
		return <React.Fragment />;
	}

	const		hasAnomalies = (
		((missingTranslations[tokenData.address].length || 0) > 0 && statusSettings.shouldShowMissingTranslations)
		|| !tokenData?.hasValidPrice
	);

	if (!hasAnomalies && statusSettings.shouldShowOnlyAnomalies) {
		return <React.Fragment />;
	}

	return (
		<div className={'rounded-default bg-neutral-100'} key={tokenData.address}>
			<div className={'rounded-t-default flex flex-row space-x-4 border-b border-neutral-300 p-4'}>
				<div className={'h-10 min-h-[40px] w-10 min-w-[40px] rounded-full bg-neutral-200'}>
					<Image
						alt={''}
						src={`https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/${chainID}/${tokenData.address}/logo-128.png`}
						width={40}
						height={40} />
				</div>
				<div className={'-mt-1 flex flex-col'}>
					<div className={'flex flex-row items-baseline space-x-2'}>
						<h4 className={'text-lg font-bold text-neutral-900'}>{name}</h4>
						<p className={'whitespace-nowrap text-sm opacity-60'}>{`(${symbol})`}</p>
					</div>
					<div className={'hidden md:flex'}>
						<AddressWithActions
							className={'text-sm font-normal'}
							truncate={0}
							address={toAddress(tokenData.address)}
							explorer={networks[chainID].explorerBaseURI || ''} />
					</div>
					<div className={'flex md:hidden'}>
						<AddressWithActions
							className={'text-sm font-normal'}
							truncate={8}
							address={toAddress(tokenData.address)}
							explorer={networks[chainID].explorerBaseURI || ''} />
					</div>
				</div>
			</div>

			<div className={'flex flex-col p-4 pt-0'}>
				<AnomaliesSection
					label={'Icon'}
					settings={statusSettings}
					anomalies={[
						{
							isValid: tokenData?.hasValidTokenIcon,
							prefix: 'Icon',
							suffix: (
								<span className={'inline'}>
									{'for underlying token '}
									<a
										href={`${networks[chainID].explorerBaseURI}/address/${tokenData.address}`}
										target={'_blank'}
										className={`underline ${tokenData?.hasValidTokenIcon ? 'tabular-nums' : 'tabular-nums text-red-900'}`}
										rel={'noreferrer'}>
										{tokenData.symbol || 'not_set'}
									</a>
									<button onClick={(): void => copyToClipboard(`${networks[chainID].explorerBaseURI}/address/${tokenData.address}`)}>
										<Copy className={'ml-2 inline h-4 w-4 text-neutral-500/40 transition-colors hover:text-neutral-500'} />
									</button>
									<a
										href={`${networks[chainID].explorerBaseURI}/address/${tokenData.address}`}
										target={'_blank'}
										rel={'noreferrer'}>
										<LinkOut className={'ml-2 inline h-4 w-4 text-neutral-500/40 transition-colors hover:text-neutral-500'} />
									</a>
								</span>
							)
						}
					]} />

				<AnomaliesSection
					label={'Price'}
					settings={statusSettings}
					anomalies={[
						{
							isValid: tokenData?.hasValidPrice,
							prefix: 'Price',
							suffix: (
								<span>
									{'for token '}
									<a
										href={`${networks[chainID].explorerBaseURI}/address/${tokenData.address}`}
										target={'_blank'}
										className={`underline ${tokenData.hasValidPrice ? '' : 'text-red-900'}`}
										rel={'noreferrer'}>
										{tokenData.name}
									</a>
									{tokenData?.hasValidPrice ? ` (${tokenData.price}$)` : ''}
								</span>
							)
						}
					]} />

				{statusSettings.shouldShowMissingTranslations ? (
					<section aria-label={'localization check'} className={'mt-4 flex flex-col pl-0 md:pl-0'}>
						<b className={'mb-1 font-mono text-sm text-neutral-900'}>{`(${missingTranslations[tokenData.address].length || 0}) Missing Translations`}</b>
						<TranslationStatusLine
							key={`${tokenData.address}_translation`}
							isValid={false}
							content={missingTranslations[tokenData.address].join(', ')} />
					</section>
				) : null}
			</div>
		</div>
	);
}

export default TokenEntity;
