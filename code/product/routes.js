const express = require("express");
const router = express.Router();
const products = require("./product.controller");

router.delete("/:id", products.deleteProduct);

module.exports = router;