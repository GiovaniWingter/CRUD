var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
    res.render("pages/index");
});

router.get("/novo", function (req, res) {
    res.render("pages/editar-novo");
});

router.get("/detalhes", function (req, res) {
    res.render("pages/detalhes");
});

module.exports = router;