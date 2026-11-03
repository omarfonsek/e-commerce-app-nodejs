const models = require("./models");
const express = require("express");
const router = express.Router();

router.post("/sync", async function (req, res, next) {
    try {
        await models.sequelize.sync({ alter: true });
        res.json({ synced: true, at: new Date().toISOString() });
    } catch (err) {
        next(err);
    }
});

module.exports = router;