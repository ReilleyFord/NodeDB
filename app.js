const readline = require('readline');
const mysql = require('mysql');
const config = require('./config.js');
const rf = require('./modules/readFile.js');

const table = 'Comics';
const delimiter = '\t';

const conn = mysql.createConnection({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASS,
  socketPath: config.DB_SOCKET,
  database: config.DB_DATABASE,
  charset: config.DB_ENC
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


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
      console.log(query);
      conn.query(query, (err, result) => {
        if (err) {
          console.log('Skipping Query: ' + queries[i]);
          console.log('Error: ', err)
          i++
        }
        console.log('Query Executed: ' + queries[i]);
      });
    }
    conn.end();
  });
}

rl.question('Enter file path: ', (answer) => {
  answer = answer.trim()
  rf.readFile(answer, insertIntoDB)
  rl.close();
});


//
// INSERT INTO Comics VALUES (NULL, 'Comic Title', 'Issue Number', 'Condition', 'Quantity in Stock', 'Cover Date', 'Cover Price', 'Cost', 'Selling Price', 'UPC', 'Notes', 'Grading Notes', 'Appearances', 'Barcode', 'Writer', 'Artist', 'Colorist', 'Cover Artist', 'Cover Inker', 'Editor', 'Inker', 'Letterer', 'Wanted', 'Price Year 1 (2015)', 'Price Year 2 (2016)', 'Price Year 3 (2017)', 'Price Year 4 (2018)', 'Storylines', 'Custom Field 1', 'Custom Field 2', 'Custom Field 3', 'Custom Field 4', 'Custom Check 1', 'Custom Check 2', 'Custom Check 3', 'Custom Date 1', 'Custom Date 2', 'Circulation', 'Top CGC Grade', '# Graded', 'Top Selling Price', 'For Sale', 'M'nimum Quantity', 'Lock Price
//
//
//
//
//
// INSERT INTO Comics VALUES(NULL, 'All-New Guardians of the Galaxy', null, 'NM', null, '2017-07-01', null, null, null, null, null, null, 'Grandmaster, Guardians of the Galaxy, Drax the Destroyer, Gamora, Groot, Rocket Raccoon, Star-Lord', 'AU291%NM', 'Gerry Duggan', 'Aaron Kuder', 'Ive Svorcina', 'Aaron Kuder', 'Aaron Kuder', 'Jordan D. White, Kathleen Wisneski, Darren Shan, Axel Alonso', 'Aaron Kuder', 'Cory Petit', 'False', null, null, null, null, 'Smash & Grab', null, null, null, null, 'False', 'False', 'False', null, null, null, null, null, null, 'False', null, 'False');
