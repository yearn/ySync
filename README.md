# Yearn Sync
![](./public/og.jpeg)

Yearn Sync is a small internal dashboard used to detect anomalies across our data sources.  
An anomaly is a problem with a vault that is not properly a bug, but instead either missing information or a de-synchronization issue between the main data source for Yearn.  
Having an anomaly means that we are missing important information or data for the vaults which can lead to poor user experience, front-end bugs, or even incompatibility with external partners.  

The main data source is the [yDaemon](https://github.com/yearn/ydaemon), accessible via this [URI](https://ydaemon.yearn.finance) and with documentation [here](https://ydaemon.ycorpo.com/).

## How to run the project
1. Clone the repository
2. Create your own `.env` with your `WALLETCONNECT_PROJECT_ID`
3. Run `yarn`  
4. Run `yarn run dev`  
5. Access `http://localhost:3000`  

## How to run via docker
1. Run `make deploy`