const tarefasModel = require("../models/tarefasModel");
const moment = require("moment");
const { body, validationResult } = require("express-validator");

const tarefasController = {
    regrasValidacao: [
        // Validação do título
        body('titulo')
            .notEmpty().withMessage('O título da tarefa é obrigatório.')
            .isLength({ max: 100 }).withMessage('O título pode ter no máximo 100 caracteres.'),
        // Validação da descrição
        body('descricao')
            .optional() // Permite que o campo seja vazio
            .isLength({ max: 500 }).withMessage('A descrição pode ter no máximo 500 caracteres.'),
        // Validação da data de entrega
        body('data_entrega')
            .optional()
            .isISO8601().withMessage('A data de entrega deve ser uma data válida!')
            .custom((value) => {
                const today = new Date().toISOString().split('T')[0];
                if (value < today) {
                    throw new Error('A data de entrega não pode ser anterior à data atual.');
                }
                return true;
            }),
        // Validação da prioridade
        body('prioridade')
            .notEmpty().withMessage('A prioridade é obrigatória.')
            .isIn(['baixa', 'media', 'alta']).withMessage('A prioridade deve ser uma das opções: baixa, média ou alta.'),
        // Validação do status
        body('situacao')
            .notEmpty().withMessage('O status é obrigatório.')
            .isIn(['pendente', 'iniciada', 'finalizada', 'cancelada', 'excluida'])
            .withMessage('O status deve ser uma das opções: pendente, iniciada, finalizada ou cancelada.'),
    ],


    listarTarefas: async (req, res) => {
        res.locals.moment = moment;
        try {
            var tarefas = await tarefasModel.findAll();
            console.table(tarefas);
            res.render("pages/index", { listaTarefas: tarefas });
        } catch (e) {
            console.log(e); // exibir os erros no console do vs code
            res.json({ erro: "Falha ao acessar dados" });
        }
    },


    adicionarTarefa: async (req, res) => {
        res.locals.moment = moment;
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            console.log(erros);
            let objTratado = {
                tituloForm: "Nova Tarefa",
                btnSubmit: "Gravar",
                class_titulo: "",
                msg_titulo: "",
                class_descricao: "",
                msg_descricao: "",
                class_data_entrega: "",
                msg_data_entrega: "",
                prioridade: { op1: "", op2: "", op3: "", op4: "" },
                situacao: { op1: "", op2: "", op3: "", op4: "" }
            }
            switch (req.body.prioridade) {
                case "baixa":
                    objTratado.prioridade.op2 = "selected";
                    break;
                case "media":
                    objTratado.prioridade.op3 = "selected";
                    break;
                case "alta":
                    objTratado.prioridade.op4 = "selected";
                    break;
                default:
                    objTratado.prioridade.op0 = "selected";
            }

            switch (req.body.situacao) {
                case "pendente":
                    objTratado.situacao.op1 = "checked";
                    break;
                case "iniciada":
                    objTratado.situacao.op2 = "checked";
                    break;
                case "finalizada":
                    objTratado.situacao.op3 = "checked";
                    break;
                case "cancelada":
                    objTratado.situacao.op4 = "checked";
                    break;
            }
            if (req.body.id != 0) {
                objTratado.tituloForm = "Alterar Tarefa";
                objTratado.btnSubmit = "Alterar";
            }
            erros.errors.forEach((itemErro) => {
                if (itemErro.path == "titulo") {
                    objTratado.msg_titulo = itemErro.msg
                    objTratado.class_titulo = "erro-form"
                }
                if (itemErro.path == "descricao") {
                    objTratado.msg_descricao = itemErro.msg
                    objTratado.class_descricao = "erro-form"
                }
                if (itemErro.path == "data_entrega") {
                    objTratado.msg_data_entrega = itemErro.msg
                    objTratado.class_data_entrega = "erro-form"
                }
            });
            return res.render("pages/editar-novo", {
                formulario: req.body,
                errosTratados: objTratado,
            });
        }
        var dadosForm = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            data_entrega: req.body.data_entrega,
            prioridade: req.body.prioridade,
            situacao: req.body.situacao,
        };
        let id = req.body.id;
        try {
            if (id == 0) {
                var results = await tarefasModel.create(dadosForm);
            } else {
                var results = await tarefasModel.update(dadosForm, id);
            }
            console.table(results)
            res.redirect("/");
        } catch (e) {
            console.log(e);
            res.json({ erro: "Falha ao acessar dados" });
        }
    },

    mostrarTarefa: async (req, res) => {
        res.locals.moment = moment;
        //pegando o id da tarefa
        let id = req.query.id;
        try {
            var results = await tarefasModel.findById(id);
            console.table(results);
            let objTratado = {
                tituloForm: "Alterar Tarefa",
                btnSubmit: "Alterar",
                class_titulo: "",
                msg_titulo: "",
                class_descricao: "",
                msg_descricao: "",
                class_data_entrega: "",
                msg_data_entrega: "",
                prioridade: { op1: "", op2: "", op3: "", op4: "" },
                situacao: { op1: "", op2: "", op3: "", op4: "" }
            }

            switch (results[0].prioridade) {
                case "baixa":
                    objTratado.prioridade.op2 = "selected";
                    break;
                case "media":
                    objTratado.prioridade.op3 = "selected";
                    break;
                case "alta":
                    objTratado.prioridade.op4 = "selected";
                    break;
                default:
                    objTratado.prioridade.op0 = "selected";
            }
            switch (results[0].situacao) {
                case "pendente":
                    objTratado.situacao.op1 = "checked";
                    break;
                case "iniciada":
                    objTratado.situacao.op2 = "checked";
                    break;
                case "finalizada":
                    objTratado.situacao.op3 = "checked";
                    break;
                case "cancelada":
                    objTratado.situacao.op4 = "checked";
                    break;
            }
            res.render("pages/editar-novo", {
                formulario: { titulo: results[0].titulo, descricao: results[0].descricao, data_entrega: moment(results[0].data_entrega).format('YYYY-MM-DD'), prioridade: "", situacao: "", id: id },
                errosTratados: objTratado,
            });
        } catch (e) {
            console.log(e);
            res.json({ erro: "Falha ao acessar dados" });
        }
    },

    alterarSituacao: async (req, res) => {
        let id = req.query.id;
        switch(req.path){
            case '/finalizar-tarefa':
                var results = await tarefasModel.updateSituacao('finalizada', id);
                break;
            case '/iniciar-tarefa':
                var results = await tarefasModel.updateSituacao('iniciada', id);
                break;
            case '/deletar-tarefa':
                var results = await tarefasModel.updateSituacao('cancelada', id);
                break;
        }
        console.table(results);
        res.redirect('/');
    }


};

module.exports = tarefasController;
