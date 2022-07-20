# Yearn Sync
![](./public/og.jpeg)

Yearn Sync is a small internal dashboard used to detectanomalies accross our data sources.  
An anomaly is a problem with a vault that is not a properly a bug, but a missing information or a desynchronization issue between the main data source for Yearn.  
Having an anomaly means that we are missing important information or data for the vaults, that can lead to poor user experience, front-end bug or even incompatibility with some external partner.  

The main data source is the [yDaemon](https://github.com/Majorfi/ydaemon), accessible via this [URI](https://api.ycorpo.com) and with a documentation [here](https://ydaemon.ycorpo.com/).

## How to run the project  
1. Clone the repository  
2. Run `yarn`  
3. Run `yarn run dev`  
4. Access `http://localhost:3000`  
