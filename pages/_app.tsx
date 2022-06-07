import	React, {ReactElement}			from	'react';
import	Head							from	'next/head';
import	{AppProps}						from	'next/app';
import	{DefaultSeo}					from	'next-seo';
import	{AnimatePresence, motion}		from	'framer-motion';
import	{KBarProvider}					from	'kbar';
import	{WithYearn}						from	'@yearn-finance/web-lib/contexts';
import	{Header}						from	'@yearn-finance/web-lib/layouts';
import	{YearnContextApp}				from	'contexts/useYearn';
import	Footer							from	'components/StandardFooter';
import	HeaderTitle						from	'components/HeaderTitle';
import	KBar							from	'components/Kbar';
import	KBarButton						from	'components/KBarButton';

import	'../style.css';

const transition = {duration: 0.3, ease: [0.17, 0.67, 0.83, 0.67]};
const thumbnailVariants = {
	initial: {y: 20, opacity: 0, transition},
	enter: {y: 0, opacity: 1, transition},
	exit: {y: -20, opacity: 0, transition}
};

function	WithLayout(props: AppProps): ReactElement {
	const	{Component, pageProps, router} = props;

	function handleExitComplete(): void {
		if (typeof window !== 'undefined') {
			window.scrollTo({top: 0});
		}
	}

	return (
		<div id={'app'} className={'flex flex-col mx-auto mb-0 w-full max-w-6xl'}>
			<Header shouldUseNetworks={true} shouldUseWallets={false}>
				<div className={'flex justify-between items-center mr-4 w-full'}>
					<HeaderTitle />
					<div className={'hidden mx-auto md:block'}>
						<KBarButton />
					</div>
				</div>
			</Header>
			<AnimatePresence exitBeforeEnter onExitComplete={handleExitComplete}>
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

function	AppHead(): ReactElement {
	return (
		<>
			<Head>
				<title>{process.env.WEBSITE_NAME}</title>
				<meta httpEquiv={'X-UA-Compatible'} content={'IE=edge'} />
				<meta name={'viewport'} content={'width=device-width, initial-scale=1'} />
				<meta name={'description'} content={process.env.WEBSITE_NAME} />

				<link rel={'shortcut icon'} type={'image/x-icon'} href={'/favicons/favicon.ico'} />
				<link rel={'apple-touch-icon'} sizes={'57x57'} href={'/apple-icon-57x57.png'} />
				<link rel={'apple-touch-icon'} sizes={'60x60'} href={'/apple-icon-60x60.png'} />
				<link rel={'apple-touch-icon'} sizes={'72x72'} href={'/apple-icon-72x72.png'} />
				<link rel={'apple-touch-icon'} sizes={'76x76'} href={'/apple-icon-76x76.png'} />
				<link rel={'apple-touch-icon'} sizes={'114x114'} href={'/apple-icon-114x114.png'} />
				<link rel={'apple-touch-icon'} sizes={'120x120'} href={'/apple-icon-120x120.png'} />
				<link rel={'apple-touch-icon'} sizes={'144x144'} href={'/apple-icon-144x144.png'} />
				<link rel={'apple-touch-icon'} sizes={'152x152'} href={'/apple-icon-152x152.png'} />
				<link rel={'apple-touch-icon'} sizes={'180x180'} href={'/apple-icon-180x180.png'} />
				<link rel={'icon'} type={'image/png'} sizes={'192x192'}  href={'/android-icon-192x192.png'} />
				<link rel={'icon'} type={'image/png'} sizes={'32x32'} href={'/favicon-32x32.png'} />
				<link rel={'icon'} type={'image/png'} sizes={'96x96'} href={'/favicon-96x96.png'} />
				<link rel={'icon'} type={'image/png'} sizes={'16x16'} href={'/favicon-16x16.png'} />
				<link rel={'manifest'} href={'/manifest.json'} />
				<meta name={'msapplication-TileColor'} content={'#D02A20'} />
				<meta name={'msapplication-TileImage'} content={'/ms-icon-144x144.png'} />
				<meta name={'theme-color'} content={'#D02A20'} />

				<meta name={'robots'} content={'index,nofollow'} />
				<meta name={'googlebot'} content={'index,nofollow'} />
				<meta charSet={'utf-8'} />
			</Head>
			<DefaultSeo
				title={process.env.WEBSITE_NAME}
				defaultTitle={process.env.WEBSITE_NAME}
				description={process.env.WEBSITE_DESCRIPTION}
				openGraph={{
					type: 'website',
					locale: 'en_US',
					url: process.env.WEBSITE_URI,
					site_name: process.env.WEBSITE_NAME,
					title: process.env.WEBSITE_NAME,
					description: process.env.WEBSITE_DESCRIPTION,
					images: [
						{
							url: `${process.env.WEBSITE_URI}og.jpeg`,
							width: 1200,
							height: 675,
							alt: 'Yearn'
						}
					]
				}}
				twitter={{
					handle: '@iearnfinance',
					site: '@iearnfinance',
					cardType: 'summary_large_image'
				}} />
		</>
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
			<AppHead />
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
		<WithYearn options={{
			web3: {
				defaultChainID: 1,
				supportedChainID: [1, 250, 42161]
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
