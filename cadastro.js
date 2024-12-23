class Produto {
    constructor(id, nome, vencimento, valorVenda, valorCusto, estoque, posicaoNaLista) {
        this.id = id;
        this.nome = nome;
        this.vencimento = vencimento;
        this.valorVenda = valorVenda;
        this.valorCusto = valorCusto;
        this.estoque = estoque;

        this.posicaoNaLista = posicaoNaLista; //atributo para facilitar a alteração e exclusão 
    }
}