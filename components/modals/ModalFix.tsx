import {Modal} from '@yearn-finance/web-lib/components/Modal';
import {Card} from 'components/common/Card';
import	React, {ReactElement}	from	'react';
import	type {TFixModalData}	from	'types/types';

type		TModalFix = {
	fix: TFixModalData['fix'],
	isOpen: boolean,
	onClose: () => void,
}

function	ModalFix({fix, isOpen, onClose}: TModalFix): ReactElement {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}>
			<Card>
				<h1 className={'mb-4 text-3xl text-neutral-700'}>{'Fix this issue'}</h1>
				<div className={'mb-4 space-y-2'}>
					<p>{'In order to fix this issue, please, follow the instructions:'}</p>
					<ul className={'space-y-2'}>
						{fix.instructions.map((instruction: string | ReactElement, index: number): ReactElement => (
							<li className={'pl-4'} key={index}>{instruction}</li>
						))}
					</ul>
				</div>
			</Card>
		</Modal>
	);
}

export default ModalFix;
