export function	getChainExplorer({chainID}: {chainID: number}): string {
	if (chainID === 250) {
		return ('https://ftmscan.com');
	}
	
	if (chainID === 42161) {
		return ('https://arbiscan.io');
	} 
	
	return ('https://etherscan.io');
}
