NodeDB
============
This is a `node` script that runs from the command line. Run `node` `app.js` and then enter
a path to a file eg: `DB_output.csv` and then it should insert everything into a MySQL database.

either add a `config.js` file with connection strings or just add them to `app.js`

As of right now it grabs the delimiter from a variable, will try and add as a cmd line argument later. Delimter is set to `\t` for tabs.
