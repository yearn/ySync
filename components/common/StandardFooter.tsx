import React, {ReactElement} from 'react';
import meta from 'public/manifest.json';
import Link from 'next/link';

export function	Footer(): ReactElement {
	return (
		<footer className={'mx-auto mt-auto hidden w-full max-w-6xl flex-row items-center py-8 md:flex'}>
			<a href={meta.github} target={'_blank'} className={'pr-6 text-xs text-neutral-500 transition-colors hover:text-accent-500 hover:underline'} rel={'noreferrer'}>
				{'GitHub'}
			</a>
			<a href={'https://thegraph.com/explorer/subgraph?id=5xMSe3wTNLgFQqsAc5SCVVwT4MiRb5AogJCuSN9PjzXF&view=Overview'} target={'_blank'} className={'pr-6 text-xs text-neutral-500 transition-colors hover:text-accent-500 hover:underline'} rel={'noreferrer'}>
				<span className={'sr-only'}>{'Access Yearn\'s subgraph'}</span>
				{'Subgraph'}
			</a>
			<a href={'https://discord.yearn.finance/'} target={'_blank'} className={'pr-6 text-xs text-neutral-500 transition-colors hover:text-accent-500 hover:underline'} rel={'noreferrer'}>
				<span className={'sr-only'}>{'Access Yearn\'s Discord'}</span>
				{'Discord'}
			</a>
			<a href={'https://x.com/yearnfi'} target={'_blank'} className={'pr-6 text-xs text-neutral-500 transition-colors hover:text-accent-500 hover:underline'} rel={'noreferrer'}>
				<span className={'sr-only'}>{'Access Yearn\'s Twitter account'}</span>
				{'Twitter'}
			</a>
			<Link href={'/settings'}>
				<a className={'pr-6 text-xs text-neutral-500 transition-colors hover:text-accent-500 hover:underline'} rel={'noreferrer'}>
					<span className={'sr-only'}>{'Open settings'}</span>
					{'Settings'}
				</a>
			</Link>
		</footer>
	);
}
