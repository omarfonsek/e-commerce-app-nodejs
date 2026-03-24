const express = require("express");
const router = express.Router();
const products = require("./product.controller");

router.get("/", products.getAllProducts);
router.get("/:id", products.getProductById);
router.post("/", products.createProduct);

module.exports = router;




