import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {ModalMobileMenu} from '@yearn-finance/web-lib/components/ModalMobileMenu';


export type TCurrentMenu = {
	isOpen: boolean,
}
export type TMenu = {
	menu: TCurrentMenu,
	onOpenMenu: VoidFunction,
}
const	defaultProps: TMenu = {
	menu: {
		isOpen: false
	},
	onOpenMenu: (): void => undefined
};

const	MenuContext = createContext<TMenu>(defaultProps);
export const MenuContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const	[menu, set_menu] = useState<TCurrentMenu>(defaultProps.menu);

	const onOpenMenu = useCallback((): void => {
		set_menu({isOpen: true});
	}, []);

	/* 🔵 - Yearn Finance ******************************************************
	**	Setup and render the Context provider to use in the app.
	***************************************************************************/
	const	contextValue = useMemo((): TMenu => ({
		menu,
		onOpenMenu
	}), [menu, onOpenMenu]);

	return (
		<MenuContext.Provider value={contextValue}>
			{children}
			<ModalMobileMenu
				shouldUseWallets={true}
				shouldUseNetworks={true}
				isOpen={menu.isOpen}
				onClose={(): void => set_menu(defaultProps.menu)}>
			</ModalMobileMenu>
		</MenuContext.Provider>
	);
};


export const useMenu = (): TMenu => useContext(MenuContext);
export default useMenu;
