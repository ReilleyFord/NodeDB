const readline = require('readline');
const mysql = require('mysql');
const config = require('./config.js');
const rf = require('./modules/readFile.js');
const fs = require('fs');

//database variables that can be changed to make it dynamic
const table = 'Comics';
const delimiter = '\t';
const logFile = 'Executed_Queries_Log.txt';

//opening a connection to a MySQL db using node-mysql
const conn = mysql.createConnection({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASS,
  socketPath: config.DB_SOCKET,
  database: config.DB_DATABASE,
  charset: config.DB_ENC
});

//readline interface for grabbing user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


/**
 * insertIntoDB function takes an object of records parsed from ./modules/readFile
 * it will format and build the sql queries and then execute all of them.
 * minor error handling will log each query executed and which ones it skips/errors out
 * also logs all queries and errors to log file.
 **/
insertIntoDB = (rows) => {
  conn.connect((err) => {
    if(err) throw err;
    let queries = [];
    let sql = '';
    for(let value of rows) {
      sql = 'INSERT INTO '+table+ ' VALUES (NULL';
      values = value.split(delimiter);
      for (record of values) {
        if(record == 'False')
          sql += ', ' + false
        else if(record == 'True')
          sql += ', ' + true
        else if(isNaN(record))
          sql += ', ' + '"' + record + '"';
        else if(record === '' || record == ' ')
          sql += ', ' + null;
        else if(record == '\r')
          sql += ');'
        else
          sql += ', ' + null;
      }
      queries.push(sql);
    }
    for(let i = 0; i < queries.length; i++){
      query = queries[i + 1];
      conn.query(query, (err, result) => {
        let executedQuery = 'Query Executed: ' + queries[i];
        let logs = [];
        if (err) {
          let skip = 'Skipping Query: ' + queries[i];
          let error = 'Error: ' + err;
          logs.push(skip);
          logs.push(error);
          console.log(skip);
          console.log(error);
          i++;
        }
        logs.push(executedQuery);
        const logger = fs.createWriteStream(logFile);
        logger.on('error', function(e) { console.error(e); });
        logs.forEach(line => {
          logger.write(line + '\n');
        });
        logger.end();
      });
    }
    conn.end();
  });
}

/**
 * kicks off the app, grabs the filepath, passes that and insertIntoDB function
 * as a callback to ./modules/readFile.js.
 **/
rl.question('Enter file path: ', (answer) => {
  answer = answer.trim()
  rf.readFile(answer, insertIntoDB)
  rl.close();
});
