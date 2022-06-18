const path = require('path');
if (!global.hasOwnProperty("models")) {
    var Sequelize = require("sequelize"),
        sequelize = null;
    // 
    const dburl = process.env.DATABASE_URL || 'psql url'

    sequelize = new Sequelize(dburl, {
        ssl: true,
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
    });

    global.models = {
        Sequelize: Sequelize,
        sequelize: sequelize,
            // [modalName]: require(path.join(__dirname, '[modalName]'))(sequelize, Sequelize.DataTypes),
    };
}
module.exports = global.models;
