import	React, {ReactElement, ReactNode} from 'react';
import	{Card} from './Card';

export type TStatisticCard = {
	label: string;
	value: ReactNode;
	variant?: 'surface' | 'background';
} & React.ComponentPropsWithoutRef<'div'>;

export function StatisticCard({label, value, ...props}: TStatisticCard): ReactElement {
	const	className = props.className || 'col-span-12 md:col-span-4';
	return (
		<Card
			className={`flex flex-col ${className}`}
			padding={'narrow'}
			{...props}>
			<div className={'mb-2 text-sm text-neutral-500'}>
				{label}
			</div>
			<div className={'text-xl font-bold tabular-nums text-neutral-700'}>
				{value}
			</div>
		</Card>
	);
}

// eslint-disable-next-line react/display-name
StatisticCard.Wrapper = ({children}: {children: ReactElement[]}): ReactElement => {
	return (
		<div className={'grid grid-cols-12 gap-4'}>
			{children}
		</div>
	);
};
