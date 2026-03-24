const express = require("express");
const router = express.Router();
const products = require("./product.controller");

router.put("/:id", products.updateProduct);

module.exports = router;