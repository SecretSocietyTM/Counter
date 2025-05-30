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

// user table functions
async function addUser(username, password) {
    const db = await connectDB();
    const result = await db.get("INSERT INTO users (username, password) VALUES (?, ?) RETURNING *", [username, password]);
    await db.close();
    return result;
}

async function authUser(username, password) {
    const db = await connectDB();
    const result = await db.get("SELECT * FROM users WHERE username=? AND password=?", [username, password]);
    await db.close();
    return result;
}



module.exports = { 
    connectDB,
    addUser,
    authUser,
};