const tarefasModel = require("../models/tarefasModel");
const moment = require("moment");
const { body, validationResult } = require("express-validator");

const tarefasController = {
    // Regras de validação
    regrasValidacao: [
        body('titulo')
            .notEmpty().withMessage('O título da tarefa é obrigatório.')
            .isLength({ max: 100 }).withMessage('* O título pode ter no máximo 100 caracteres.'),
        body('descricao')
            .optional()
            .isLength({ max: 500 }).withMessage('* A descrição pode ter no máximo 500 caracteres.'),
        body('data_entrega')
            .optional()
            .isISO8601().withMessage('* A data de entrega deve ser uma data válida!')
            .custom(value => {
                const today = new Date().toISOString().split('T')[0];
                if (value < today) {
                    throw new Error('* A data de entrega não pode ser anterior à data atual.');
                }
                return true;
            }),
        body('prioridade')
            .notEmpty().withMessage('* A prioridade é obrigatória.')
            .isIn(['baixa', 'media', 'alta']).withMessage('* A prioridade deve ser baixa, média ou alta.'),
        body('situacao')
            .notEmpty().withMessage('* O status é obrigatório.')
            .isIn(['pendente', 'iniciada', 'finalizada', 'cancelada', 'excluida']).withMessage('* Status inválido.')
    ],

    // Listar tarefas
    listarTarefas: async (req, res) => {
        res.locals.moment = moment;
        try {
            const tarefas = await tarefasModel.findAll();
            res.render("pages/index", { listaTarefas: tarefas });
        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: "Falha ao acessar dados" });
        }
    },

    // Adicionar ou atualizar tarefa
    adicionarTarefa: async (req, res) => {
        res.locals.moment = moment;
        const erros = validationResult(req);

        if (!erros.isEmpty()) {
            const objTratado = tarefasController.tratarErrosFormulario(req, erros);
            return res.render("pages/editar-novo", {
                formulario: req.body,
                errosTratados: objTratado,
            });
        }

        const dadosForm = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            data_entrega: req.body.data_entrega,
            prioridade: req.body.prioridade,
            situacao: req.body.situacao,
        };

        try {
            const resultado = req.body.id == 0
                ? await tarefasModel.create(dadosForm)
                : await tarefasModel.update(dadosForm, req.body.id);
            res.redirect("/");
        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: "Falha ao acessar dados" });
        }
    },

    // Mostrar tarefa para edição
    mostrarTarefa: async (req, res) => {
        res.locals.moment = moment;
        const id = req.query.id;

        try {
            const [tarefa] = await tarefasModel.findById(id);

            if (!tarefa) {
                return res.status(404).json({ erro: "Tarefa não encontrada" });
            }

            const objTratado = tarefasController.prepararFormulario(tarefa);
            res.render("pages/editar-novo", {
                formulario: {
                    titulo: tarefa.titulo,
                    descricao: tarefa.descricao,
                    data_entrega: moment(tarefa.data_entrega).format('YYYY-MM-DD'),
                    prioridade: tarefa.prioridade,
                    situacao: tarefa.situacao,
                    id,
                },
                errosTratados: objTratado,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: "Falha ao acessar dados" });
        }
    },

    // Mostrar tarefa para exclusão
    confirmaExclusao: async (req, res) => {
        res.locals.moment = moment;
        const id = req.query.id;

        try {
            const [tarefa] = await tarefasModel.findById(id);

            if (!tarefa) {
                return res.status(404).json({ erro: "Tarefa não encontrada" });
            }

            const objTratado = tarefasController.prepararFormulario(tarefa);
            res.render("pages/confirma-exclusao", {
                formulario: {
                    titulo: tarefa.titulo,
                    descricao: tarefa.descricao,
                    data_entrega: moment(tarefa.data_entrega).format('YYYY-MM-DD'),
                    prioridade: tarefa.prioridade,
                    situacao: tarefa.situacao,
                    id:id,
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: "Falha ao acessar dados" });
        }
    },

    // Alterar situação de uma tarefa
    alterarSituacao: async (req, res) => {
        const id = req.query.id;
        const situacaoMap = {
            '/finalizar-tarefa': 'finalizada',
            '/iniciar-tarefa': 'iniciada',
            '/cancelar-tarefa': 'cancelada',
            '/excluir-tarefa': 'excluida',
        };

        const novaSituacao = situacaoMap[req.path];

        if (!novaSituacao) {
            return res.status(400).json({ erro: "Caminho inválido" });
        }

        try {
            const resultado = await tarefasModel.updateSituacao(novaSituacao, id);
            res.redirect('/');
        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: "Falha ao acessar dados" });
        }
    },

    // Funções auxiliares
    tratarErrosFormulario: (req, erros) => {
        const objTratado = {
            tituloForm: req.body.id == 0 ? "Nova Tarefa" : "Alterar Tarefa",
            btnSubmit: req.body.id == 0 ? "Gravar" : "Alterar",
            class_titulo: "",
            msg_titulo: "",
            class_descricao: "",
            msg_descricao: "",
            class_data_entrega: "",
            msg_data_entrega: "",
            prioridade: { op1: "", op2: "", op3: "", op4: "" },
            situacao: { op1: "", op2: "", op3: "", op4: "" },
        };

        // Ajustar seleção/checagem com base nos valores enviados
        tarefasController.preencherOpcoes(objTratado, req.body);

        // Mapear erros para os campos
        erros.errors.forEach((itemErro) => {
            if (itemErro.path === "titulo") {
                objTratado.msg_titulo = itemErro.msg;
                objTratado.class_titulo = "erro-form";
            } else if (itemErro.path === "descricao") {
                objTratado.msg_descricao = itemErro.msg;
                objTratado.class_descricao = "erro-form";
            } else if (itemErro.path === "data_entrega") {
                objTratado.msg_data_entrega = itemErro.msg;
                objTratado.class_data_entrega = "erro-form";
            }
        });

        return objTratado;
    },

    prepararFormulario: (tarefa) => {
        const objTratado = {
            tituloForm: "Alterar Tarefa",
            btnSubmit: "Alterar",
            class_titulo: "",
            msg_titulo: "",
            class_descricao: "",
            msg_descricao: "",
            class_data_entrega: "",
            msg_data_entrega: "",
            prioridade: { op1: "", op2: "", op3: "", op4: "" },
            situacao: { op1: "", op2: "", op3: "", op4: "" },
        };

        tarefasController.preencherOpcoes(objTratado, tarefa);
        return objTratado;
    },

    preencherOpcoes: (objTratado, valores) => {
        switch (valores.prioridade) {
            case "baixa":
                objTratado.prioridade.op2 = "selected";
                break;
            case "media":
                objTratado.prioridade.op3 = "selected";
                break;
            case "alta":
                objTratado.prioridade.op4 = "selected";
                break;
        }

        switch (valores.situacao) {
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
    }
};

module.exports = tarefasController;
