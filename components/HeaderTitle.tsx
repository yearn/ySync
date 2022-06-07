import	React, {ReactElement}	from	'react';
import	{useRouter}				from	'next/router';
import	LogoYearn				from	'components/icons/LogoYearn';

function	HeaderTitle(): ReactElement {
	const	router = useRouter();

	if (router.pathname === '/faq') {
		return (
			<div className={'flex-row-center'}>
				<h1 className={'mr-2 md:mr-4 text-typo-primary'}>
					{'FAQ'}
				</h1>
			</div>
		);
	}
	return (
		<div className={'space-x-4 flex-row-center'}>
			<LogoYearn className={'w-10 h-10'} />
			<h1 className={'mr-2 md:mr-4 text-typo-primary'}>
				{'Yearn Finance'}
			</h1>
		</div>
	);
}

export default HeaderTitle;
