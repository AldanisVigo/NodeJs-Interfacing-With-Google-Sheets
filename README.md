### NodeJS Integrating With Google Sheets

For this project I wanted to create a front end page that used Google Sheets as a sort of data storage. To achieve this, I created a Node.js client that interfaces the front end with google sheets through the google api. So far I have achieved reading the data, and appending a new row to the end of the sheet. Next is updaing rows, and deleting rows, then we'll have a full CRUD.

##### Preview
![Assets Preview](/assets/preview.gif)


## Installation

1. Clone the repo: `git clone git@github.com:AldanisVigo/NodeJs-Interfacing-With-Google-Sheets.git`
2. Navigate into the project folder: `cd NodeJs-Interfacing-With-Google-Sheets`
3. Install all dependencies : `npm i`  
4. [Create a new project on GCP](https://console.cloud.google.com/projectcreate)
5. [Enable the Google Sheets API for this project](https://console.cloud.google.com/apis/library/sheets.googleapis.com)
6. [Generate the OAuth 2.0 Client IDs for this project](https://console.cloud.google.com/apis/credentials)
7. Download the json file and rename it to credentials.json. Place this file in the root folder of the project. Our code will be expecting it and needs it to authenticate with the google APIs and talk to Google Sheets.
![Download Credentials JSON File](/assets/download_creds.png)
8. Now we're ready to rock and roll : `npm run start`


#### Questions or Concerns
Please feel free to email me @ aldanisvigo@gmail.com
