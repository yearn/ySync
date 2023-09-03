import React, {ReactElement} from 'react';
import {AppProps} from 'next/app';
import {AnimatePresence, motion} from 'framer-motion';
import {KBarProvider} from 'kbar';
import {WithYearn, localhost} from '@yearn-finance/web-lib';
import {YearnContextApp} from 'contexts/useYearn';
import {Footer} from 'components/common/StandardFooter';
import Header from 'components/common/Header';
import {arbitrum, fantom, mainnet, optimism} from '@wagmi/chains';
import HeaderTitle from 'components/common/HeaderTitle';
import KBar from 'components/common/Kbar';
import KBarButton from 'components/common/KBarButton';
import Meta from 'components/common/Meta';

import	'../style.css';

const transition = {duration: 0.3, ease: [0.17, 0.67, 0.83, 0.67]};
const thumbnailVariants = {
	initial: {y: 20, opacity: 0, transition},
	enter: {y: 0, opacity: 1, transition},
	exit: {y: -20, opacity: 0, transition}
};

function	WithLayout(props: AppProps): ReactElement {
	const	{Component, pageProps, router} = props;

	return (
		<div id={'app'} className={'mx-auto mb-0 flex w-full max-w-6xl flex-col'}>
			<Header shouldUseNetworks={true} shouldUseWallets={false}>
				<div className={'mr-4 flex w-full items-center justify-between'}>
					<HeaderTitle />
					<div className={'mx-auto hidden md:block'}>
						<KBarButton />
					</div>
				</div>
			</Header>
			<AnimatePresence mode={'wait'}>
				<motion.div
					key={router.asPath}
					initial={'initial'}
					animate={'enter'}
					exit={'exit'}
					variants={thumbnailVariants}>
					<Component
						key={router.route}
						router={props.router}
						{...pageProps} />
					<Footer />
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

function	AppWrapper(props: AppProps): ReactElement {
	const	{router} = props;
	const	initialActions = [{
		id: 'homeAction',
		name: 'Home',
		shortcut: ['h'],
		keywords: 'home',
		section: 'Navigation',
		perform: async (): Promise<boolean> => router.push('/')
	}];

	return (
		<>
			<Meta />
			<KBarProvider actions={initialActions}>
				<div className={'z-[9999]'}>
					<KBar />
				</div>
				<WithLayout {...props} />
			</KBarProvider>
		</>
	);
}

function	MyApp(props: AppProps): ReactElement {
	const	{Component, pageProps} = props;
	
	return (
		<WithYearn
			supportedChains={[
				mainnet,
				optimism,
				fantom,
				arbitrum,
				localhost
			]}
			options={{
				web3: {
					shouldUseWallets: false,
					defaultChainID: 1
				},
				baseSettings: {
					yDaemonBaseURI: process.env.YDAEMON_BASE_URI as string
				}
			}}>
			<YearnContextApp>
				<AppWrapper
					Component={Component}
					pageProps={pageProps}
					router={props.router} />
			</YearnContextApp>
		</WithYearn>
	);
}

export default MyApp;
