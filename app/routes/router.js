const express = require("express");
const router = express.Router();

const tarefasController = require("../controllers/tarefasController");

router.get("/", function (req, res) {
  tarefasController.listarTarefas(req, res);
});


router.get("/novo", function (req, res) {
    let objTratado = {
        tituloForm : "Nova Tarefa",
        btnSubmit: "Gravar",
        class_titulo: "",
        msg_titulo:"",
        class_descricao: "",
        msg_descricao:"",
        class_data_entrega:"",
        msg_data_entrega:"",
        prioridade: {op1:"", op2:"",op3:"",op4:""},
        situacao: {op1:"", op2:"",op3:"",op4:""}
      }
    res.render("pages/editar-novo", {
        formulario: {titulo:"", descricao:"", data_entrega:"",prioridade:"",situacao:"",id:0},
        errosTratados: objTratado,
      });
});

router.get("/editar-tarefa", function (req, res) {
    tarefasController.mostrarTarefa(req, res);
});




router.post("/add-edt-tarefa", tarefasController.regrasValidacao, function (req, res) {
    tarefasController.adicionarTarefa(req, res);
});

router.get("/detalhes", function (req, res) {
    res.render("pages/detalhes");
});

module.exports = router;