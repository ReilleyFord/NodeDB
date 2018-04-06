const readline = require('readline');
const mysql = require('mysql');
const config = require('./config.js');
const rf = require('./modules/readFile.js');
const fs = require('fs');

//variables needed from config file
const table = config.DB_TABLE;
const delimiter = config.DELIMITER;
const logFile = config.LOG_FILE;

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
 * log function accepts a list of strings and writes each line to a txt file
 **/
log = (logs) => {
  if(!fs.existsSync(logFile))
    fs.mkdirSync(logFile);
  const logger = fs.createWriteStream(logFile);
  logger.on('error', function(e) { console.error(e); });
  logs.forEach(line => {
    logger.write(line + '\n');
  });
  logger.end();
}

/**
 * insertIntoDb function takes a list of insert statements and then opens a mysql
 * connection and then executes each insert. It will also generate a log file of
 * all the performed operations
 **/
insertIntoDb = (queries) => {
  conn.connect((err) => {
    for(let i = 0; i < queries.length; i++) {
      query = queries[i + 1];
      conn.query(query, (err, result) => {
        let executedQuery = 'Query Executed: ' + queries[i + 1];
        if (err) {
          let skip = 'Skipping Query: ' + queries[i + 1];
          let error = 'Error: ' + err;
          logs.push(skip);
          logs.push(error);
          console.log(skip);
          console.log(error);
          i++;
        }
        logs.push(executedQuery);
      });
    }
    log(logs);
    conn.end();
  });
}

/**
 * generateQueries function takes a list of data delimited by new lines
 * from ./modules/readFile.js, it then builds a insert statement based off of
 * the records in each line.
 **/
generateQueries = (data) => {
    if(err) throw err;
    let queries = [];
    let sql = '';
    let logs = [];
    for(let value of data) {
      sql = 'INSERT INTO '+table+ ' VALUES (NULL';
      values = value.split(delimiter);
      for (record of values) {
        if(record.indexOf('"') >= 0)
          sql += ', ' + "'" + record + "'";
        else if(record == 'False')
          sql += ', ' + false;
        else if(record == 'True')
          sql += ', ' + true;
        else if(record === '' || record == ' ')
          sql += ', ' + null;
        else if(record == '\r')
          sql += ');';
        else if(!isNaN(record))
          sql += ', ' + record;
        else if(isNaN(record))
          sql += ', ' + '"' + record + '"';
        else
          sql += ', ' + null;
      }
      queries.push(sql);
    }
    insertIntoDb(queries);
}

/**
 * kicks off the app, grabs the filepath, passes that and insertIntoDB function
 * as a callback to ./modules/readFile.js.
 **/
rl.question('Enter file path: ', (answer) => {
  answer = answer.trim()
  rf.readFile(answer, generateQueries)
  rl.close();
});
