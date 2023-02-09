import React from 'react';
import Link from 'next/link';
import LogoYearn from 'components/icons/LogoYearn';

import type {ReactElement} from 'react';

function	HeaderTitle(): ReactElement {
	return (
		<Link href={'/'} >
			<div className={'flex-row-center space-x-4'}>
				<LogoYearn className={'h-10 w-10'} />
				<h1 className={'mr-2 font-bold text-neutral-900 md:mr-4'}>
					{'Yearn Finance'}
				</h1>
			</div>
		</Link>
	);
}

export default HeaderTitle;
