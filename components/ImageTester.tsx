/* eslint-disable @next/next/no-img-element */
import React from 'react';
import {useYearn} from 'contexts/useYearn';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {ReactElement} from 'react';
import type {TTokenData, TTokensData} from 'types/entities';

function	VaultImageTester({vaults}: {vaults: any[]}): ReactElement {
	const	{onUpdateIconStatus, onUpdateTokenIconStatus} = useYearn();

	return (
		<div className={'invisible h-0 w-0 overflow-hidden'}>
			{(vaults || []).map((vault: any): ReactElement => {
				return (
					<div key={`image_tester-${vault.icon}_${vault.address}`}>
						<img
							alt={''}
							onError={(): void => {
								onUpdateIconStatus(vault.address, false);
							}}
							src={vault.icon}
							width={40}
							height={40} />
						<img
							alt={''}
							onError={(): void => {
								onUpdateTokenIconStatus(vault.address, false, false);
							}}
							src={vault.token.icon}
							width={40}
							height={40} />
					</div>
				);
			})}
		</div>
	);
}

function	TokensImageTester({tokens}: {tokens: TTokensData}): ReactElement {
	const	{chainID} = useWeb3();
	const	{onUpdateTokenIconStatus} = useYearn();

	return (
		<div className={'invisible h-0 w-0 overflow-hidden'}>
			{(Object.values(tokens) || []).map((token: TTokenData): ReactElement => {
				const	icon = `https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/${chainID}/${toAddress(token.address)}/logo-128.png`;
				return (
					<div key={`image_tester-${icon}_${token.address}`}>
						<img
							alt={''}
							onError={(): void => {
								onUpdateTokenIconStatus(token.address, false, true);
							}}
							src={icon}
							width={40}
							height={40} />
					</div>
				);
			})}
		</div>
	);
}

export {TokensImageTester, VaultImageTester};
