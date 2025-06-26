const sqlite  = require("sqlite");
const sqlite3 = require("sqlite3");
const path    = require("path");


// open the database (creates a file if it doesn't exist)
async function connectDB() {
    return await sqlite.open({
        filename: path.join(__dirname, "database.db"),  
        driver: sqlite3.Database,   
    });
}

module.exports = { connectDB };