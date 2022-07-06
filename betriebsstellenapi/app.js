const express = require('express')
const app = express()
const port = 8000
const fs = require('fs')

const csv_folder = 'files'
const csv_file = 'DBNetz-Betriebsstellenverzeichnis-Stand2021-10.csv'

var path = csv_folder + '/' + csv_file

var data


// loads a csv file at start of program
read_csv(path)


// reads a csv file and splits content into array.
// TODO: proper file validation/error handling
function read_csv(path) {

  data = fs.readFileSync(path, 'utf-8')

  data = data.split("\r\n")

  for(let i = 0; i < data.length; i++) {

    data[i] = data[i].split(',');

    }
}

// searches for a given Betriebsstellen-Code in loaded CSV-File and returns a JSON-Object.
function find_betriebsstelle(request){

  for(let i = 0; i < data.length; i++) {

    var x = data[i][0].split(';')

    if(x[1] == request.toUpperCase()){

      return response_string = `{"PLC":"${x[0]}","RL100-Code":"${x[1]}","RL100-Langname":"${x[2]}",
                      "RL100-Kurzname":"${x[3]}","Typ Kurz":"${x[4]}","Typ Lang":"${x[5]}",
                      "Betriebszustand":"${x[6]}","Datum ab":"${x[7]}","Datum bis":"${x[8]}",
                      "Niederlassung":"${x[9]}","Regionalbereich":"${x[10]}","Letzte Änderung":"${x[11]}"}`      

    }  
  }

  return response_string = `{"body":"Betriebstelle ${request} not found"}`
}


app.get('/', (req, res) => {
  res.send('Search the Betriebsstellenverzeichnis using Betriebstellen-Codes such as "/aamp".')
})


/**
 * (Re-)loads a csv file. 
 * 
 * A new file path can be specified using the query parameter "path".
 * If no path parameter is given, use existing path.
 * 
 * TODO: proper error handling
 */
app.get('/loaddata', (req, res) => {

  if(req.query.path != undefined){
  
    read_csv(req.query.path)  
  } else {
    read_csv(path)
  }

  res.send('CSV file data has been (re-)loaded.')
})


/**
 *  Wildcard GET for handling Betriebstellen-Codes
 * 
 * TODO: Reject obviously invalid codes right away (containing digits, special characters, etc.)
 *       [a-zA-Z]+ doesn't seem to be working?
 */
app.get(/^(.+)$/, (req, res) => {

  var response_string = find_betriebsstelle(req.path.substring(1))
  var response_json = JSON.parse(response_string)

  // send status code according to response value (code found/not found)
  if(response_string.includes('not found')){
    res.status(404).json(response_json)
  } else {
    res.status(200).json(response_json)
  }

})


app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
