let listaProduto = []; //conjunto de dados
let oQueEstaFazendo = ''; //variável global de controle
let produto = null; //variavel global 
bloquearAtributos(true);
configurarInputsNumericos();

//backend (não interage com o html)
function procurePorChavePrimaria(chave) {
    for (let i = 0; i < listaProduto.length; i++) {
        const produto = listaProduto[i];
        if (produto.id == chave) {
            produto.posicaoNaLista = i;
            return listaProduto[i];
        }
    }
    return null;//não achou
}

// Função para procurar um elemento pela chave primária   -------------------------------------------------------------
function procure() {
    const id = document.getElementById("inputId").value;
    if (id) { // se digitou um id
        produto = procurePorChavePrimaria(id);
        if (produto) { //achou na lista
            mostrarDadosEstoque(produto);
            visibilidadeDosBotoes('none', 'none', 'inline', 'inline', 'none', 'inline', 'inline'); // Habilita botões de alterar e excluir
            mostrarAviso("Achou na lista, pode alterar ou excluir");
            document.getElementById("inputId").readOnly = true;
        } else { //não achou na lista
            limparAtributos();
            visibilidadeDosBotoes('none', 'inline', 'none', 'none', 'none', 'inline', 'inline');
            mostrarAviso("Não achou na lista, pode inserir");
            document.getElementById("inputId").readOnly = true;
        }
    } else {
        document.getElementById("inputId").focus();
        return;
    }
}

//backend->frontend

function fazerDownload() {
    let nomeParaSalvar = "Estoque.csv";
    let textoCSV = "";
    for (let i = 0; i < listaProduto.length; i++) {
        const produto = listaProduto[i];
        textoCSV += 
            produto.id + ";" +
            produto.nome + ";" +
            produto.vencimento + ";" +
            produto.valorVenda + ";" +
            produto.valorCusto + ";" +
            produto.estoque + "\n";
    }
    salvarEmArquivo(nomeParaSalvar, textoCSV);
}

function salvarEmArquivo(nomeDoArquivo, texto) {
    const blob = new Blob([texto], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nomeDoArquivo;
    link.click();
    URL.revokeObjectURL(link.href);
}

function fazerUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = function(event) {
        const arquivo = event.target.files[0];
        console.log(arquivo.name);
        if (arquivo) {
            processarArquivo(arquivo);
        }
    }
    input.click();
}

function processarArquivo(arquivo) {
    const leitor = new FileReader();
    leitor.onload = function(event) {
        const conteudo = event.target.result;
        const linhas = conteudo.split("\n");
        listaProduto = [];
        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i].trim();
            if (linha) {
                const dados = linha.split(";");
                if (dados.length == 6) {
                    listaProduto.push(new Produto(dados[0], dados[1], dados[2], parseFloat(dados[3]), parseFloat(dados[4]), dados[5]));
                }
            }
        }
        listar();
    }
    leitor.readAsText(arquivo);
}

function inserir() {
    const id = parseInt(document.getElementById("inputId").value);
    if (procurePorChavePrimaria(id) != null) {
        mostrarAviso("Já existe um produto com esse ID, digite outro ID");
    } else {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline', 'inline'); //visibilidadeDosBotoes(procure,inserir,alterar,excluir,salvar)
    oQueEstaFazendo = 'inserindo';
    mostrarAviso("INSERINDO - Digite os atributos e clic o botão salvar");
    document.getElementById("inputId").focus();
    }
}

// Função para alterar um elemento da lista
function alterar() {

    // Remove o readonly dos campos
    bloquearAtributos(false);

    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline', 'inline');

    oQueEstaFazendo = 'alterando';
    mostrarAviso("ALTERANDO - Digite os atributos e clic o botão salvar");
}

// Função para excluir um elemento da lista
function excluir() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline', 'inline'); //visibilidadeDosBotoes(procure,inserir,alterar,excluir,salvar)

    oQueEstaFazendo = 'excluindo';
    mostrarAviso("EXCLUINDO - clic o botão salvar para confirmar a exclusão");
    bloquearAtributos(true);
}

//gerencia operações inserir, alterar e excluir na lista

function salvar() {


    // obter os dados a partir do html

    let id;
    if (produto == null) {
        id = document.getElementById("inputId").value;
    } else {
        id = produto.id;
    }

    const nome = document.getElementById("inputNome").value;
    const vencimento = document.getElementById("inputVencimento").value;
    const valorVenda = document.getElementById("inputVlVenda").value;
    const valorCusto = parseFloat(document.getElementById("inputVlCusto").value);
    const estoque = parseFloat(document.getElementById("inputEstoque").value);
    //verificar se o que foi digitado pelo USUÁRIO está correto
    if (id > 0 && nome && vencimento && valorVenda > 0 && valorCusto > 0 && estoque > 0) {// se tudo certo 
        switch (oQueEstaFazendo) {
            case 'inserindo':
                produto = new Produto(id, nome, vencimento, valorVenda, valorCusto, estoque);
                listaProduto.push(produto);
                mostrarAviso("Inserido na lista", 5000);
                break;
            case 'alterando':
                atletaAlterado = new Produto(id, nome, vencimento, valorVenda, valorCusto, estoque);
                listaProduto[produto.posicaoNaLista] = atletaAlterado;
                mostrarAviso("Alterado", 5000);
                break;
            case 'excluindo':
                let novaLista = [];
                for (let i = 0; i < listaProduto.length; i++) {
                    if (produto.posicaoNaLista != i) {
                        novaLista.push(listaProduto[i]);
                    }
                }
                listaProduto = novaLista;
                mostrarAviso("EXCLUIDO", 5000);
                break;
            default:
                // console.error('Ação não reconhecida: ' + oQueEstaFazendo);
                mostrarAviso("Erro aleatório");
        }
        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none', 'none', 'inline');
        limparAtributos();
        listar();
        document.getElementById("inputId").focus();
    } else {
        alert("Erro nos dados digitados");
        return;
    }
}

//backend

function listar() {
    // Seleciona o tbody da tabela onde os dados serão inseridos
    const tbody = document.getElementById("outputSaida").getElementsByTagName("tbody")[0];
    let html = ""; // Variável para construir o HTML das linhas

    // Itera sobre cada produto na lista
    for (let i = 0; i < listaProduto.length; i++) {
        const produto = listaProduto[i];

        // Constrói a linha HTML com os dados do produto
        html += `
            <tr>
                <td>${produto.id}</td>
                <td>${produto.nome}</td>
                <td>${produto.vencimento}</td>
                <td>${parseFloat(produto.valorVenda).toFixed(2)}</td>
                <td>${parseFloat(produto.valorCusto).toFixed(2)}</td>
                <td>${produto.estoque}</td>
            </tr>
        `;
    }

    // Define o HTML construído diretamente no tbody
    tbody.innerHTML = html;
}



//backend->frontend (interage com html)

function cancelarOperacao() {
    limparAtributos();
    bloquearAtributos(true);
    visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none', 'none', 'inline');
    mostrarAviso("Cancelou a operação de edição" , 5000);
}

function mostrarAviso(mensagem, tempo) {
    //printa a mensagem na divAviso
        const divAviso = document.getElementById("divAviso");
        divAviso.innerHTML = mensagem;
        divAviso.style.display = 'block'; // Torna a div visível

        if (tempo) {
            setTimeout(function() { 
                divAviso.style.display = 'none'; // Torna a div invisível
            }, tempo); 
    }

}

// Função para mostrar os dados do produto nos campos
function mostrarDadosEstoque(produto) {
    document.getElementById("inputId").value = produto.id;
    document.getElementById("inputNome").value = produto.nome;
    document.getElementById("inputVencimento").value = produto.vencimento;
    document.getElementById("inputVlVenda").value = produto.valorVenda
    document.getElementById("inputVlCusto").value = produto.valorCusto;
    document.getElementById("inputEstoque").value = produto.estoque;
    // Define os campos como readonly
    bloquearAtributos(true);
}

// Função para limpar os dados dos campos
function limparAtributos() {
    document.getElementById("inputId").readOnly = false;
    document.getElementById("inputNome").value = "";
    document.getElementById("inputVencimento").value = "";
    document.getElementById("inputVlVenda").value = "";
    document.getElementById("inputVlCusto").value = "";
    document.getElementById("inputEstoque").value = "";
    bloquearAtributos(true);
}

function bloquearAtributos(soLeitura) {
    //quando a chave primaria possibilita edicao, tranca (readonly) os outros e vice-versa
    document.getElementById("inputId").disabled = !soLeitura;
    document.getElementById("inputNome").disabled = soLeitura;
    document.getElementById("inputVencimento").disabled = soLeitura;
    document.getElementById("inputVlVenda").disabled = soLeitura;
    document.getElementById("inputVlCusto").disabled = soLeitura;
    document.getElementById("inputEstoque").disabled = soLeitura;
}

// Função para deixar visível ou invisível os botões
function visibilidadeDosBotoes(btProcure, btInserir, btAlterar, btExcluir, btSalvar,btCancelar,  aviso) {
    //  visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline'); 
    //none significa que o botão ficará invisível (visibilidade == none)
    //inline significa que o botão ficará visível 

    document.getElementById("btProcure").style.display = btProcure;
    document.getElementById("btInserir").style.display = btInserir;
    document.getElementById("btAlterar").style.display = btAlterar;
    document.getElementById("btExcluir").style.display = btExcluir;
    document.getElementById("btSalvar").style.display = btSalvar;
    document.getElementById("btCancelar").style.display = btCancelar; // o cancelar sempre aparece junto com o salvar
    document.getElementById("divAviso").style.display = aviso;
    document.getElementById("inputId").focus();
}

//Função para validar a entrada numerica
function validarEntradaNumerica(event) {
    const tecla = event.key;
    const input = event.target;

    // Permite Backspace, Delete, Tab, Esc, Enter, e setas
    if (
        tecla === 'Backspace' || tecla === 'Delete' || 
        tecla === 'Tab' || tecla === 'Escape' || tecla === 'Enter' || 
        tecla === 'ArrowLeft' || tecla === 'ArrowRight'
    ) {
        return; // Permite essas teclas
    }

    // Verifica se o input é de valorCusto ou estoque
    if (input.id === 'inputVlVenda' || input.id === 'inputVlCusto') {
        // Permite as teclas de ponto e vírgula
        if (tecla === '.' || tecla === ',') {
            return;
        }
    }

    // Bloqueia qualquer tecla que não seja de 0 a 9, ou as específicas 'e', 'E', '+', '-'
    if ((tecla < '0' || tecla > '9') || tecla === 'e' || tecla === 'E' || tecla === '+' || tecla === '-') {
        event.preventDefault(); // Impede a entrada
    }
}

// Função para configurar os inputs do tipo 'number'
function configurarInputsNumericos() {
    // Seleciona todos os inputs do tipo 'number'
    const inputsNumericos = document.querySelectorAll('input[type="number"]');

    // Adiciona o evento 'keydown' para cada input
    for (let i = 0; i < inputsNumericos.length; i++) {
        inputsNumericos[i].addEventListener('keydown', validarEntradaNumerica);
    }
}