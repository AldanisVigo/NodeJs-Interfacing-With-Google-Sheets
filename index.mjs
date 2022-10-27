import express from 'express'
import bodyParser from 'body-parser'
import { router as api } from './sheets_crud.mjs'

const app = express() // Create an express application
app.use(express.static('public'))
app.use( bodyParser.json() )       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({    // to support URL-encoded bodies
  extended: true
}))

app.use('/api',api)

app.listen(5050,()=>{
    console.log("Static assets being served at http://localhost:5050/")
})