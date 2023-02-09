import React from 'react';
import AppWrapper from 'components/common/AppWrapper';
import KBar from 'components/common/Kbar';
import {MenuContextApp} from 'contexts/useMenu';
import {YearnContextApp} from 'contexts/useYearn';
import {KBarProvider} from 'kbar';
import localFont from '@next/font/local';
import {WithYearn} from '@yearn-finance/web-lib/contexts/WithYearn';

import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

import	'../style.css';

const aeonik = localFont({
	variable: '--font-aeonik',
	display: 'swap',
	src: [
		{
			path: '../public/fonts/Aeonik-Regular.woff2',
			weight: '400',
			style: 'normal'
		}, {
			path: '../public/fonts/Aeonik-Bold.woff2',
			weight: '700',
			style: 'normal'
		}
	]
});

function	MyApp(props: AppProps): ReactElement {
	const	{Component, pageProps, router} = props;
	const	initialActions = [
		{
			id: 'homeAction',
			name: 'Home',
			shortcut: ['h'],
			keywords: 'home',
			section: 'Navigation',
			perform: async (): Promise<boolean> => router.push('/')
		}
	];

	return (
		<>
			<style jsx global>{`html {font-family: ${aeonik.style.fontFamily};}`}</style>
			<WithYearn
				options={{
					web3: {
						shouldUseWallets: false,
						defaultChainID: 1,
						supportedChainID: [1, 10, 250, 42161, 1337, 31337]
					},
					baseSettings: {
						yDaemonBaseURI: process.env.YDAEMON_BASE_URI as string
					}
				}}>

				<MenuContextApp>
					<YearnContextApp>
						<KBarProvider actions={initialActions}>
							<div className={'z-[9999]'}>
								<KBar />
							</div>
							<AppWrapper
								Component={Component}
								pageProps={pageProps}
								router={props.router} />
						</KBarProvider>
					</YearnContextApp>
				</MenuContextApp>
			</WithYearn>
		</>
	);
}

export default MyApp;
