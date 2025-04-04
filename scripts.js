let tarefas = [];
let tarefaEditar = null;

const form = document.getElementById('form-tarefa');
const listaTarefa = document.getElementById('lista-tarefas');
const mensagem = document.getElementById('mensagem');
const modal = document.getElementById('modal-edicao');
const buscaInput = document.getElementById('buscar-tarefa');
const filtroCategoria = document.getElementById('filtro-categoria');
const filtroPrioridade = document.getElementById('filtro-prioridade');

document.addEventListener("DOMContentLoaded", function () {
    modal.style.display = "none";
});

form.addEventListener("submit", function (event) {
    event.preventDefault();

    let nome = document.getElementById('nome-tarefa').value.trim();
    const categoria = document.getElementById('categoria').value;
    const prioridade = document.getElementById('prioridade').value;
    const dataConclusao = document.getElementById('data-conclusao').value;
    const criadaEm = new Date().toLocaleString();

    nome = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();

    if (tarefaEditar !== null) {
        tarefaEditar.nome = nome;
        tarefaEditar.categoria = categoria;
        tarefaEditar.prioridade = prioridade;
        tarefaEditar.dataConclusao = dataConclusao;
        tarefaEditar = null;
        form.reset();
        mensagem.innerHTML = "";
        renderizarTarefas();
        return;
    }

    const tarefaExiste = tarefas.some((tarefa) => tarefa.nome === nome);
    if (tarefaExiste) {
        mensagem.innerHTML = '<p>Esta tarefa já existe!</p>';
        return;
    }

    const novaTarefa = {
        id: Date.now(),
        nome,
        categoria,
        prioridade,
        criadaEm,
        dataConclusao,
        concluida: false
    };

    tarefas.push(novaTarefa);
    form.reset();
    mensagem.innerHTML = "";
    renderizarTarefas();
});

buscaInput.addEventListener("input", filtrarTarefas);
filtroCategoria.addEventListener("change", filtrarTarefas);
filtroPrioridade.addEventListener("change", filtrarTarefas);

function filtrarTarefas() {
    const busca = buscaInput.value.toLowerCase();
    const categoriaSelecionada = filtroCategoria.value;
    const prioridadeSelecionada = filtroPrioridade.value;

    const tarefasFiltradas = tarefas.filter(tarefa => {
        const nomeMatch = tarefa.nome.toLowerCase().includes(busca);
        const categoriaMatch = categoriaSelecionada === "" || tarefa.categoria === categoriaSelecionada;
        const prioridadeMatch = prioridadeSelecionada === "" || tarefa.prioridade === prioridadeSelecionada;
        return nomeMatch && categoriaMatch && prioridadeMatch;
    });

    renderizarTarefas(tarefasFiltradas);
}

function abrirModal(id) {
    const tarefa = tarefas.find((t) => t.id === id);
    if (tarefa) {
        document.getElementById('modal-nome').value = tarefa.nome;
        document.getElementById('modal-categoria').value = tarefa.categoria;
        document.getElementById('modal-prioridade').value = tarefa.prioridade;
        document.getElementById('modal-data-conclusao').value = tarefa.dataConclusao || "";
        tarefaEditar = tarefa;
        modal.style.display = "flex";
    }
}

function salvarEdicao() {
    if (tarefaEditar) {
        let novoNome = document.getElementById('modal-nome').value.trim();
        novoNome = novoNome.charAt(0).toUpperCase() + novoNome.slice(1).toLowerCase();
        const nomeExistente = tarefas.some(t => t.nome === novoNome && t.id !== tarefaEditar.id);
        if (nomeExistente) {
            document.getElementById('modal-mensagem').innerText = 'Este nome para a tarefa já existe!';
            return;
        }
        tarefaEditar.nome = novoNome;
        tarefaEditar.categoria = document.getElementById('modal-categoria').value;
        tarefaEditar.prioridade = document.getElementById('modal-prioridade').value;
        tarefaEditar.dataConclusao = document.getElementById('modal-data-conclusao').value;
        tarefaEditar = null;
        document.getElementById('modal-mensagem').innerText = "";
        fecharModal();
        renderizarTarefas();
    }
}


function fecharModal() {
    modal.style.display = "none";
}

function excluirTarefa(id) {
    tarefas = tarefas.filter((tarefa) => tarefa.id !== id);
    renderizarTarefas();
}

function toggleConclusao(id) {
    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa) {
        tarefa.concluida = !tarefa.concluida;
        renderizarTarefas();
    }
}

function renderizarTarefas(lista = tarefas) {
    listaTarefa.innerHTML = "";
    const hoje = new Date(); 

    lista.forEach((tarefa) => {
        const li = document.createElement("li");

        let diasRestantes = null;
        if (tarefa.dataConclusao) {
            const dataConclusao = new Date(tarefa.dataConclusao);
            const diff = dataConclusao - hoje;
            diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24)); 
        }

        let corFundo = "";
        if (diasRestantes !== null) {
            if (diasRestantes < 0) {
                corFundo = "vermelho"; 
            } else if (diasRestantes === 0) {
                corFundo = "laranja";
            } else if (diasRestantes <= 3) {
                corFundo = "amarelo";
            } else {
                corFundo = "verde"; 
            }
        }

        li.className = `${tarefa.concluida ? "concluida" : ""} ${corFundo}`;
        li.innerHTML = `
            <input type="checkbox" onclick="toggleConclusao(${tarefa.id})" ${tarefa.concluida ? "checked" : ""}>
            <div class="container-tarefa">
                <div class="tarefas">
                    <strong><i>${tarefa.nome}</i></strong>
                    <div class="classificacao">
                        <div><strong>Prioridade: </strong> ${tarefa.prioridade} </div>
                        <div><strong>Categoria: </strong> ${tarefa.categoria} </div>
                    </div>
                    <div><strong>Dias restantes:</strong> ${diasRestantes !== null ? diasRestantes : "N/A"}</div>
                </div>
                <div class="botoes">
                    <div><strong>Criada em:</strong> ${tarefa.criadaEm}</div>
                    <div><strong>Data de conclusão:</strong> ${tarefa.dataConclusao || "Não definida"}</div>
                    <div>
                        <button onclick="abrirModal(${tarefa.id})">Editar</button>
                        <button onclick="excluirTarefa(${tarefa.id})">Excluir</button>
                    </div>
                </div>
            </div>`;
        listaTarefa.appendChild(li);
    });
}
