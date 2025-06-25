const { connectDB } = require("./connect.js");

async function rename() {
    const db = await connectDB();

    await db.run(`
        ALTER TABLE diary
        RENAME COLUMN date_eaten
        TO date
    `)

    await db.close();
}

rename();