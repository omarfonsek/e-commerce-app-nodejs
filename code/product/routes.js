const express = require("express");
const router = express.Router();
const products = require("./product.controller");
const { createProductSchema, updateProductSchema, productIdParams } = require("./../middlewares/validators/product.validator")
const validate = require("./../middlewares/validate")

router.get("/", products.getAllProducts);
router.get("/:id", validate({params: productIdParams}), products.getProductById);
router.post("/", validate({body: createProductSchema}), products.createProduct);
router.put("/:id", validate({params: productIdParams, body: updateProductSchema}), products.updateProduct);
router.delete("/:id", validate({params: productIdParams}), products.deleteProduct);

module.exports = router;
