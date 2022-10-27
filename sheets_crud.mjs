import fs from 'fs'
import express from 'express'
const router = express.Router()
import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'] //Authentication scopes

let token = null //Placeholder for the token

const sid = '1TIi7tJXloRUeb2WSRNvA8VJqE3V4_pTO-fOr1QgF1IY' //Sheet ID

let oauthclient = null //OAuth Client

const requestToken = router.get('/requestToken',(req,res)=>{
    try{ //Begin token request
        //Read the oauth credentials json file
        fs.readFile('credentials_oauth.json', (err, content) => { 
            //If there's an error return it
            if (err){
                console.log('Error credentials_oauth.json:', err)
                res.json({error : err})
            }
            
            //Parse the credentials into JSON object
            let credentials = JSON.parse(content)

            //Pull the client_secret, client_id and redirect_uris
            const { client_secret, client_id, redirect_uris } = credentials.x8b

            //Generate a new OAuth2 client using the creds
            oauthclient = new google.auth.OAuth2(
                client_id,
                client_secret,
                redirect_uris[0],
            )
        
            //If there's no token saved
            if (token === null){ //Generate a new token
                //Get the auth url
                const authUrl = oauthclient.generateAuthUrl({
                    access_type: 'offline',
                    scope: SCOPES,
                    redirect_uri: 'http://localhost:5050/index.html'
                })
                
                //Send it back to the client
                res.json({
                    authenticated : false,
                    authUrl : authUrl
                })
                
            }else{
                //Pass the token to the oAuth2Client
                oauthclient.setCredentials(token)

                //Send the token back to the client
                res.json({
                    authenticated : true,
                    token : token
                })
                
                //clear the token
                // token = null
            }
        })    
    }catch(err){
        console.log(err)
        res.json({
            error : err
        })
    }
})

const getSheetData = router.post('/getSheetData',(req,res)=>{
    //Get the OAuth2 authentication code
    let code = req.body.code

    //Get the query the user wants to perform
    let sheetQuery = req.body.sheetQuery

    //If we have both the oauth code and the query
    if(code && sheetQuery){
        if(token === null){ //If the token is not set
            //Get a new oAuth2 token with the authentication code
            oauthclient.getToken(code, (err, tok) => {

                if (err){ //If there's any errors
                    res.send({error : err}) //Send the error back to the client

                    //Log the error on the terminal
                    console.error(
                        'Error while trying to retrieve access token in getSheetData',
                        err
                    )
                }
                
                //save the token for next time
                token = tok

                //Set the oAuth2 client credentials with the new token
                oauthclient.setCredentials(tok)

                //Perform the sheet query
                performSheetQuery(oauthclient,sheetQuery,res)
                
            })
        }else{
            console.log("OAuth Client Exists Here's the Current Token: ")
            console.log(token)
            oauthclient.setCredentials(token)
            performSheetQuery(oauthclient,sheetQuery,res)
        }
    } else { //Otherwise
        res.json({ //Send an error to the client
            error : "Please send the OAuth2 authentication code and a sheet query with your request."
        })
    }
})

const insertDataRow = router.post('/insertDataRow',(req,res)=>{
    console.log("Inserting data row")
    //Get the auth code
    let code = req.body.code

    //Get the row of data to append
    let row = req.body.row
    console.log("Code: " + code)
    console.log("Row: " + row)

    if(code && row){ //If we have both the auth code and the row available
        if(token === null){ //If the token is null
            //Get a new oAuth2 token with the authentication code
            oauthclient.getToken(code, (err, tok) => {

                if (err){ //If there's any errors
                    //res.send({error : err}) //Send the error back to the client

                    //Log the error on the terminal
                    console.error(
                        'Error while trying to retrieve access token in insertDataRow',
                        err
                    )

                    //Try to see if existing oauthclient works
                    insertRow(row,oauthclient,res)

                }else{
                    //Set the oAuth2 client credentials with the new token
                    oauthclient.setCredentials(tok)
                    
                    //Save the token
                    // token = JSON.stringify(tok)
                    console.log('Token stored')

                    //Perform the sheet append
                    insertRow(row,oauthclient,res)
                }  
            })
        }else{
            console.log("OAuth Client Exists Here's the Current Token: ")
            console.log(token)
            oauthclient.setCredentials(token)
            insertRow(row,oauthclient,res)
        }
    }
})


/*
    Perform the passed in query, will respond using passed in response
*/
const performSheetQuery = (auth,query,res) => {
    //Get an instance of google sheets v4
    const sheets = google.sheets({ 
        version: 'v4',
        auth: oauthclient != null ? oauthclient : auth
    })

    //Get the values from the google sheet based on the query
    sheets.spreadsheets.values.get({
        spreadsheetId: sid, //Set the spreadsheet id
        range: query, //Pass in the query
    },
    (err, queryResponse) => { //If there's any errors
        if (err) {
            return console.log('The Sheets API returned an error: ' + err) //If there's an error show it in the terminal
        }else{
            const rows = queryResponse.data.values //Otherwise, pull the rows from the sheet
            if (rows) {//If there are any rows                
                //Send them back to the client
                res.json({  
                    data : rows
                })
            } else { //Otherwise
                res.json({ //send back an empty array
                    data : []
                })
            }
        }
    })
}

//Insert a row
const insertRow = async (row,auth,res) => {
    console.log("Inserting data row")
    //Create a request to update the sheet
    const request = {
        spreadsheetId: sid, 
        range: 'A1:E100',  
        // valueRenderOption : "FORMATTED_VALUE", //Already default
        insertDataOption: "INSERT_ROWS",
        valueInputOption : "RAW",
        auth: auth,
        resource : {
            values : [row]
        }
    }
    
    try { //Try to get a response
        //Get sheets
        const sheets = google.sheets({
            version : 'v4', 
            auth
        })

        //Get the response from the append request
        const response = (await sheets.spreadsheets.values.append(request)).data

        //Log the response to the terminal
        console.log(JSON.stringify(response, null, 2))

        //Respond to the client request
        res.json({
            response : JSON.stringify(response, null, 2)
        })
    } catch (err) {
        console.error(err)
        //Send the error code to the client
        res.json({
            error : err
        })
    }
}


export {
    router
}