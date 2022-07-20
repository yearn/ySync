# Yearn Sync
![](./public/og.jpeg)

Yearn Sync is a small internal dashboard used to detectanomalies accross our data sources.  
An anomaly is a problem with a vault that is not a properly a bug, but a missing information or a desynchronization issue between the main data source for Yearn.  
Having an anomaly means that we are missing important information or data for the vaults, that can lead to poor user experience, front-end bug or even incompatibility with some external partner.  

The available data sources are:  
- The data from the Yearn API: https://api.yearn.finance/v1/chains/1/vaults/all
- The data from the Yearn Meta: https://meta.yearn.finance/api/1/vaults/all
- The data from the Yearn Graph: https://api.thegraph.com/subgraphs/name/0xkofee/yearn-vaults-v2
- The data from the Ledger Live Plugin: https://raw.githubusercontent.com/LedgerHQ/app-plugin-yearn/develop/tests/yearn/b2c.json
- The data from the Risk Framework: https://raw.githubusercontent.com/yearn/yearn-data-analytics/master/src/risk_framework/risks.json

## How to run the project  
1. Clone the repository  
2. Run `yarn`  
3. Run `yarn run dev`  
4. Access `http://localhost:3000`  
