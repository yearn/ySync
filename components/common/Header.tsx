import {ModalMobileMenu} from '@yearn-finance/web-lib/components/ModalMobileMenu';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {IconHamburger} from '@yearn-finance/web-lib/icons/IconHamburger';
import {IconNetworkArbitrum} from '@yearn-finance/web-lib/icons/IconNetworkArbitrum';
import {IconNetworkEthereum} from '@yearn-finance/web-lib/icons/IconNetworkEthereum';
import {IconNetworkFantom} from '@yearn-finance/web-lib/icons/IconNetworkFantom';
import {IconNetworkOptimism} from '@yearn-finance/web-lib/icons/IconNetworkOptimism';
import {IconNetworkBase} from '@yearn-finance/web-lib/icons/IconNetworkBase';
import {Card} from 'components/common/Card';
import {Dropdown} from 'components/common/Dropdown';
import	React, {ReactElement, useEffect, useState}				from	'react';

const	options: any[] = [
	{icon: <IconNetworkEthereum />, label: 'Ethereum', value: 1},
	{icon: <IconNetworkOptimism />, label: 'Optimism', value: 10},
	{icon: <IconNetworkFantom />, label: 'Fantom', value: 250},
	{icon: <IconNetworkBase />, label: 'Base', value: 8453},
	{icon: <IconNetworkArbitrum />, label: 'Arbitrum', value: 42161}
];

type		THeader = {
	shouldUseWallets?: boolean,
	shouldUseNetworks?: boolean,
	children: ReactElement
}
function	Header({
	shouldUseNetworks = true,
	children
}: THeader): ReactElement {
	const	{chainID, onSwitchChain, isActive} = useWeb3();
	const	[selectedOption, set_selectedOption] = useState(options[0]);
	const	[hasMobileMenu, set_hasMobileMenu] = useState(false);

	useEffect((): void => {
		const	_selectedOption = options.find((e): boolean => e.value === Number(chainID)) || options[0];
		set_selectedOption(_selectedOption);
	}, [chainID, isActive]);

	return (
		<header className={'z-30 mx-auto w-full py-4'}>
			<Card className={'flex h-auto items-center justify-between md:h-20'}>
				<div className={'flex w-full flex-row items-center'}>
					{children}
				</div>
				<div className={'flex flex-row items-center space-x-4 md:hidden'}>
					<button onClick={(): void => set_hasMobileMenu(true)}>
						<IconHamburger />
					</button>
				</div>
				<div className={'flex flex-row items-center space-x-4'}>
					{shouldUseNetworks ? (
						<div className={'hidden flex-row items-center space-x-4 md:flex'}>
							<Dropdown
								defaultOption={options[0]}
								options={options}
								selected={selectedOption}
								onSelect={(option: any): void => onSwitchChain(option.value as number)} />
						</div>
					) : null}

				</div>
			</Card>
			<ModalMobileMenu
				shouldUseWallets
				isOpen={hasMobileMenu}
				shouldUseNetworks={true} // TODO
				onClose={(): void => set_hasMobileMenu(false)}>

			</ModalMobileMenu>
		</header>
	);
}

export default Header;
