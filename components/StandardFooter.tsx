import	React, {ReactElement}		from	'react';
import	{SwitchTheme}				from	'@yearn-finance/web-lib/components';
import	{useUI}						from	'@yearn-finance/web-lib/contexts';

function	Footer(): ReactElement {
	const	{theme, switchTheme} = useUI();

	return (
		<footer className={'hidden flex-row items-center py-8 mx-auto mt-auto w-full max-w-6xl md:flex'}>
			<a href={process.env.PROJECT_GITHUB_URL} target={'_blank'} className={'pr-6 text-xs hover:underline transition-colors text-typo-secondary hover:text-primary'} rel={'noreferrer'}>
				{'GitHub'}
			</a>
			<a href={'https://thegraph.com/explorer/subgraph?id=5xMSe3wTNLgFQqsAc5SCVVwT4MiRb5AogJCuSN9PjzXF&view=Overview'} target={'_blank'} className={'pr-6 text-xs hover:underline transition-colors text-typo-secondary hover:text-primary'} rel={'noreferrer'}>
				<span className={'sr-only'}>{'Access Yearn\'s subgraph'}</span>
				{'Subgraph'}
			</a>
			<a href={'https://discord.yearn.finance/'} target={'_blank'} className={'pr-6 text-xs hover:underline transition-colors text-typo-secondary hover:text-primary'} rel={'noreferrer'}>
				<span className={'sr-only'}>{'Access Yearn\'s Discord'}</span>
				{'Discord'}
			</a>
			<a href={'https://twitter.com/iearnfinance'} target={'_blank'} className={'pr-6 text-xs hover:underline transition-colors text-typo-secondary hover:text-primary'} rel={'noreferrer'}>
				<span className={'sr-only'}>{'Access Yearn\'s Twitter account'}</span>
				{'Twitter'}
			</a>

			<div className={'px-3 ml-auto'}>
				<SwitchTheme theme={theme} switchTheme={switchTheme} />
			</div>

		</footer>
	);
}

export default Footer;
