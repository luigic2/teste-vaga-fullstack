const csv = require('csv-parser');
const fs = require('fs');
const armazenagemDeDados = fs.createWriteStream('teste-vaga-fullstack/Dados-tratados.json');

let results = [];
let resultsTemporary ;
function tratamentoCPF(CPFHolder){
    
    let cpf = CPFHolder.replace(/[^\d]+/g, '')
    if (!!cpf.match(/(\d)\1{10}/)) return false
    cpf = cpf.split('')
    const validator = cpf
        .filter((digit, index, array) => index >= array.length - 2 && digit)
        .map( el => +el )
    const toValidate = pop => cpf
        .filter((digit, index, array) => index < array.length - pop && digit)
        .map(el => +el)
    const rest = (count, pop) => (toValidate(pop)
        .reduce((soma, el, i) => soma + el * (count - i), 0) * 10) % 11 % 10
    return !(rest(10,2) !== validator[0] || rest(11,1) !== validator[1])
}
function tratamentoCNPJ(CNPJHolder){
    var b = [ 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 ]
    var c = String(CNPJHolder).replace(/\D/g, '')
    
    if(c.length !== 14)
        return false

    if(/0{14}/.test(c))
        return false

    for (var i = 0, n = 0; i < 12; n += c[i] * b[++i]);
    if(c[12] != (((n %= 11) < 2) ? 0 : 11 - n))
        return false

    for (var i = 0, n = 0; i <= 12; n += c[i] * b[i++]);
    if(c[13] != (((n %= 11) < 2) ? 0 : 11 - n))
        return false

    return true

}

function tratamentoDosDados(data){

    divisãoValorTotal = data.vlTotal / data.qtPrestacoes;
    validadeDoDocumento = "Invalido"; 
    if(divisãoValorTotal != data.vlPresta){
        data.vlPresta = divisãoValorTotal;
    }
    if(data.nrCpfCnpj.toString().length == 11){
        if(tratamentoCPF(data.nrCpfCnpj)){
            validadeDoDocumento = "Valido";
        }
    }else if(data.nrCpfCnpj.toString().length == 14){
         if(tratamentoCNPJ(data.nrCpfCnpj)){
            validadeDoDocumento = "Valido";
         }
    }
   
    resultsTemporary = {
        nrInst: data.nrInst,
        nrAgencia: data.nrAgencia,
        cdClient: data.cdClient,
        nmClient: data.nmClient,
        nrCpfCnpj: data.nrCpfCnpj,
        validadeDoDocumento: validadeDoDocumento, 
        nrContrato: data.nrContrato, 
        dtContrato: data.dtContrato, 
        qtPrestacoes: data.qtPrestacoes, 
        vlTotal: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.vlTotal,),
        cdProduto: data.cdProduto,
        dsProduto: data.dsProduto, 
        cdCarteira: data.cdCarteira, 
        dsCarteira: data.dsCarteira, 
        nrProposta: data.nrProposta, 
        nrPresta: data.nrPresta, 
        tpPresta: data.tpPresta, 
        nrSeqPre: data.nrSeqPre, 
        dtVctPre: data.dtVctPre, 
        vlPresta: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.vlPresta,), 
        vlMora: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.vlMora,), 
        vlMulta: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.vlMulta,), 
        vlOutAcr: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.vlOutAcr,), 
        vlIof: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.vlIof,), 
        vlDescon: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.vlDescon,), 
        vlAtual: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.vlAtual,),
        idSituac: data.idSituac,
        idSitVen: data.idSitVen
    };

    results.push(resultsTemporary);

    armazenagemDeDados.write(JSON.stringify(resultsTemporary) + '\n');

}

fs.createReadStream('teste-vaga-fullstack/data.csv')
    .pipe(csv({}))
    .on('data', async (data)=> {
       await tratamentoDosDados(data)
        
    })
    .on('end', () => {
        console.log("Processamento dos dados terminado!");
        armazenagemDeDados.end();
    });