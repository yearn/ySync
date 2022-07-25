import	React, {ReactElement}	from	'react';
import	{Card, Modal}			from	'@yearn-finance/web-lib/components';
import	{Copy}					from	'@yearn-finance/web-lib/icons';
import 	{copyToClipboard}		from	'@yearn-finance/web-lib/utils';
import	Code					from	'components/Code';
import	type {TFixModalData}	from	'types/types';

type		TModalFix = {
	fix: TFixModalData['fix'],
	isOpen: boolean,
	onClose: () => void,
}

const ledgerSnippet = `{
	"address": "0x0000000000000000000000000000000000000000",
	"contractName": "some-contract-name",
	"selectors": {
		"0x3ccfd60b": {"erc20OfInterest": [], "method": "withdraw_all", "plugin": "Yearn"},
		"0x2e1a7d4d": {"erc20OfInterest": [], "method": "withdraw", "plugin": "Yearn"},
		"0x00f714ce": {"erc20OfInterest": [], "method": "withdraw_to", "plugin": "Yearn"},
		"0xe63697c8": {"erc20OfInterest": [], "method": "withdraw_to_with_slippage", "plugin": "Yearn"}
}`.trim();

function	ModalFix({fix, isOpen, onClose}: TModalFix): ReactElement {
	function	renderSnippet(): string {
		let	snippet = '';
		if (fix.category === 'ledger') {
			snippet = ledgerSnippet.replace('0x0000000000000000000000000000000000000000', fix.address.toLowerCase());
			snippet = snippet.replace('some-contract-name', fix.name);
		}
		return snippet;
	}

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
				{fix.category === 'ledger' ? <section aria-label={'code-part'} className={'relative'}>
					<div className={'absolute top-4 right-4'}>
						<Copy
							onClick={(): void => copyToClipboard(renderSnippet())}
							className={'h-4 w-4 cursor-copy opacity-60 transition-colors hover:opacity-100'} />
					</div>
					<Code code={renderSnippet()} language={'json'} />
				</section> : null}
			</Card>
		</Modal>
	);
}

export default ModalFix;