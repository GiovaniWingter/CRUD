var pool = require("../../config/pool_conexoes");

const tarefasModel = {
    // Buscar todas as tarefas ativas
    findAll: async () => {
        try {
            const [linhas] = await pool.query('SELECT * FROM tarefas WHERE situacao != "excluida"');
            return linhas;
        } catch (error) {
            console.error('Erro ao buscar tarefas:', error);
            return error;
        }
    },

    // Buscar uma tarefa específica por ID
    findById: async (id) => {
        try {
            const [linhas] = await pool.query('SELECT * FROM tarefas WHERE id = ? AND situacao != "excluida"', [id]);
            return linhas;
        } catch (error) {
            console.error('Erro ao buscar tarefa por ID:', error);
            return error;
        }
    },

    // Criar uma nova tarefa
    create: async (dadosForm) => {
        try {
            const [linhas] = await pool.query('INSERT INTO tarefas SET ?', 
                [dadosForm]);
            return linhas;
        } catch (error) {
            console.error('Erro ao criar tarefa:', error);
            return null;
        }
    },

    // Atualizar dados de uma tarefa existente
    update: async (dadosForm, id) => {
        try {
            const [linhas] = await pool.query('UPDATE tarefas SET titulo = ?, descricao = ?, data_entrega = ?, prioridade = ?, situacao = ?, atualizada_em = NOW() WHERE id = ?', 
                [dadosForm.titulo, dadosForm.descricao, dadosForm.data_entrega, dadosForm.prioridade, dadosForm.situacao, id]);
            return linhas;
        } catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
            return error;
        }
    },

    // Excluir uma tarefa (marcar como excluída)
    delete: async (id) => {
        try {
            const [linhas] = await pool.query('UPDATE tarefas SET situacao = "excluida" WHERE id = ?', [id]);
            return linhas;
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error);
            return error;
        }
    },
    // Excluir uma tarefa (marcar como excluída)
    deleteFisico: async (id) => {
        try {
            const [linhas] = await pool.query('DELETE FROM tarefas WHERE id = ?', [id]);
            return linhas;
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error);
            return error;
        }
    },

    // Alterar a situação de uma tarefa (pendente, iniciada, finalizada, cancelada)
    updateSituacao: async (situacao, id) => {
        try {
            const [linhas] = await pool.query('UPDATE tarefas SET situacao = ?, atualizada_em = NOW() WHERE id = ?', [situacao, id]);
            return linhas;
        } catch (error) {
            console.error('Erro ao alterar situação da tarefa:', error);
            return error;
        }
    }
};

module.exports = tarefasModel;
