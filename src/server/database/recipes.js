const { connectDB } = require("./connect.js");

async function getCategories(uid) {
    let db = await connectDB();;
    let result = await db.all(`
        SELECT category_id, name, blurb, color, emoji
        FROM categories
        WHERE user_id=?`,
        [uid]
    );
    await db.close();
    return result;
}

module.exports = {
    getCategories
}