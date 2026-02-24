const express = require("express");
const router = express.Router();
const products = require("./product.controller");

router.get("/", products.getAllProducts);

module.exports = router;