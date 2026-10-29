const express = require("express");
const router = express.Router();
const products = require("./product.controller");

router.get("/", products.getAllProducts);
router.get("/:id", products.getProductById);
router.post("/", products.createProduct);
router.put("/:id", products.updateProduct);
router.delete("/:id", products.deleteProduct);

module.exports = router;
