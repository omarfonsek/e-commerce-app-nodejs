const models = require("./models");
const express = require("express");
const router = express.Router();

async function initialize() {
    try {
        await models.sequelize.sync({alter: true});
    } catch (err) {
        console.log(err);
    }
}

router.head("/sync", async function (req, res) {
    await initialize();
    res.json();
});

module.exports = router;