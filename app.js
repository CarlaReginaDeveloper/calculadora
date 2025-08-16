"use strict";


const display = document.getElementById("resultado");
const numeros = document.querySelectorAll("[id*=tecla]"); //O sinal *= faz com que ache todos atributos de id ou parte da sua identificação, neste caso, com o nome tecla.
const operadores = document.querySelectorAll("[id*=operador]");
const equacaoDisplay = document.getElementById("equacao");

let novoNumero = true;
let operador;
let numeroAnterior;
let numeroAnteriorStr;

const maxDigitosInseridos = 12;
const maxDigitosNoDisplay = 17;

//ajusta o tamanho da fonte de acordo com a configuração feita nos @media do CSS
const ajustarFonteSizeManual = () => {
  const len = display.textContent.length;

  const styles = window.getComputedStyle(document.documentElement);

  const fontSizePrimario = styles
    .getPropertyValue("--font-size-primaria")
    .trim();
  const fontSizeSecundario = styles
    .getPropertyValue("--font-size-secundaria")
    .trim();

  if (len <= 14) {
    display.style.fontSize = fontSizePrimario;
  } else {
    display.style.fontSize = fontSizeSecundario;
  }
};

//garantir que, assim que a página terminar de carregar, o display da calculadora já comece com a fonte ajustada corretamente
document.addEventListener("DOMContentLoaded", () => {
  ajustarFonteSizeManual();
});

window.addEventListener("resize", ajustarFonteSizeManual); //ajusta a fonte conforme o usuário redimensionar a janela

//mostra acima no display um histórico de qual conta o usuario está fazendo
const atualizarEquacao = () => {
  let textoEquacao = "";

  if (numeroAnteriorStr !== undefined && operador !== undefined) {
    textoEquacao = `${numeroAnteriorStr} ${operador}`;
  } else {
    textoEquacao = display.textContent;
  }
  equacaoDisplay.textContent = textoEquacao;
};

//verifica se tem alguma operação digitada anteriormente que ainda não foi feita, ou seja, se está vazio
const operacaoPendente = () => operador !== undefined;

//verifica e conta quantas casas decimais tem para, considerando o numero digitado e o formato brasileiro de numeros float, usando a virgula como separador decimal
const contarCasasDecimais = (numeroStr) => {
  const partes = numeroStr.split(","); //separa em duas partes em um array condiderando a virgula
  if (partes.length === 2) {
    //se tem 2 partes, quantas casas tem na segunda parte, ou seja, após a virgula
    return partes[1].length;
  }
  return 0; //se não tiver casas decimais, retorna 0
};

const calcular = () => {
  if (operacaoPendente()) {
    let numeroAtualStr = display.textContent;
    //se tem operaçao pendente vai fazer todas as contas pertinentes
    let numeroAtual = parseFloat(
      numeroAtualStr.replace(/\./g, "").replace(",", ".")
    ); //transforma em número, coloca os pontos de milhar e troca a virgula por ponto para não dar erro no resultado

    novoNumero = true;

    const casasNumeroAnterior = contarCasasDecimais(numeroAnteriorStr);
    const casasNumeroAtual = contarCasasDecimais(numeroAtualStr);
    const casasDecimais = Math.max(10,casasNumeroAnterior, casasNumeroAtual); //vai receber e ajustar para o maior número de casas decimais entre os dois números.

    let resultado;
    

    if (operador === "+") {
      resultado = numeroAnterior + numeroAtual;
    } else if (operador === "-") {
      resultado = numeroAnterior - numeroAtual;
    } else if (operador === "/") {
      resultado = numeroAnterior / numeroAtual;      
    } else if (operador === "*") {
      resultado = numeroAnterior * numeroAtual;
    }    

    const fator = Math.pow(10, casasDecimais); //Controlar o arredondamento do resultado com base nas casas decimais dos números digitados;
    resultado = Math.round(resultado * fator) / fator; //arredonda o número resultado com a quantidade de casas decimais especificada.

    atualizarDisplay(resultado);

    equacaoDisplay.textContent = `${numeroAnteriorStr} ${operador} ${numeroAtualStr} =`;
  }
};

//atualiza o que está sendo mostrado no display
const atualizarDisplay = (texto) => {
  if (typeof texto === "number") {
    // Troca ponto por vírgula sempre
    texto = texto.toLocaleString("pt-BR");
  } else if (typeof texto === "string") {
    // Formata apenas números completos
    texto = texto.replaceAll(".", ",");
  }

  //caso o valor do resultado passe da quantidade pré determinada, é acrescentado um "+" para entender que existem mais números no calculo, só não serão mostrados
  if (texto.length > maxDigitosNoDisplay) {
    texto = texto.slice(0, maxDigitosNoDisplay - 1) + "+";
  }

  if (novoNumero) {
    //se for um novo número não concatena, limpa a tela e vai para a memoria
    display.textContent = texto;
    novoNumero = false;
  } else {//se não for número novo, concatena até a quantidade máxima de caracteres já determinada 
    display.textContent += texto;
    if (display.textContent.length > maxDigitosInseridos) {
      display.textContent = display.textContent.slice(0, maxDigitosInseridos);
    }
  }
  ajustarFonteSizeManual();
};

const inserirNumero = (evento) => {
  atualizarDisplay(evento.target.textContent);
}; //mandando para o atualizarDisplay o texto que está dentro de cada um dos botões que foram clicados

//Capturar todos os cliques de cada um dos botões numéricos e vai para a função inserirNumero
//forEach() - varre todos os elementos do array, neste caso, do numeros e faz com que assim que clicar vai para inserirNumero
numeros.forEach((numero) => numero.addEventListener("click", inserirNumero));

const selecionarOperador = (evento) => {
  if (!novoNumero) {
    //se não for numero novo, faz o que está a seguir...
    calcular(); //vai para a função calcular

    //assim que clicar no operador, vai para as condições dentro da function atualizarDisplay
    novoNumero = true;
    //quando o evento de clique do operador acontece, salva o operador na variavel
    operador = evento.target.textContent;

    numeroAnteriorStr = display.textContent; //salva o numero já digitado na memoria

    //salva o numero antes de clicar no operador que está no display na memoria e troca a virgula por ponto
    numeroAnterior = parseFloat(
      numeroAnteriorStr.replace(/\./g, "").replace(",", ".")
    );
    atualizarEquacao();
  }
};

//Capturar todos os cliques de cada um dos operadores e vai para a função selecionarOperador
operadores.forEach((operador) =>
  operador.addEventListener("click", selecionarOperador)
);

//aqui vamos calcular e vamos zerar o operador para que, assim que clicar em outro operador, não faça a mesma função do botão igual
const ativarIgual = () => {
  calcular();
  operador = undefined;
};

//assim que apertar o botão de igual, vamos precisar ajustar seu resultado
document.getElementById("igual").addEventListener("click", ativarIgual);

//limpa o valor que estiver apenas na tela
const limparDisplay = () => {
  display.textContent = "";
};

//assim que clicar no botão CE, vai para a função limparDisplay
document
  .getElementById("limparDisplay")
  .addEventListener("click", limparDisplay);

//apaga todos as informações (os valores que estão salvos e o operador que estiver salvo também)
const limparCalculo = () => {
  limparDisplay();
  operador = undefined;
  novoNumero = true;
  numeroAnterior = undefined;
  equacaoDisplay.textContent = "";
};

//assim que clicar no botão C, vai para a função limparCalculo
document
  .getElementById("limparCalculo")
  .addEventListener("click", limparCalculo);

//apaga apenas o último digito que está no display a cada vez que o botão for clicado
//metodo slice faz com que o texto seja fatiado e assim possa ser apagado (inicia em 0 vai até o último valor do nosso texto e queremos que ele tire 1, por isso o -1)
const removerUltimoDigito = () =>
  (display.textContent = display.textContent.slice(0, -1));

//assim que clicar no botão <<, vai para a função removerUltimoDigito
document
  .getElementById("backspace")
  .addEventListener("click", removerUltimoDigito);

//inverte o sinal do nosso número (positivo se torna negativo e vice versa)
const inverterSinal = () => {
  let valorAtual = parseFloat(
    display.textContent.replace(/\./g, "").replace(",", ".")
  );
  if (!isNaN(valorAtual)) {
    valorAtual *= -1;

    novoNumero = true;
    atualizarDisplay(valorAtual);
  }
};

//assim que clicar no botão +/-, vai para a função inverterSinal
document.getElementById("inverter").addEventListener("click", inverterSinal);

//verifica se já existe dentro do valor na tela a virgula para que não apareça mais de uma vez
const existeDecimal = () => display.textContent.includes(","); 

//verifica se ao clicar direto no ponto antes de qualquer número, inicie-se com '0,', caso não, acrescenta a virgula
const inserirDecimal = () => {
  //nesse primeiro if verifica-se se é um novo numero inclui '0,' diretamente
  if (novoNumero) {
    atualizarDisplay("0,");
    return;
  }

  //se não for novo número, insere a virgula caso não houver ou acrescenta o '0,'
  if (!existeDecimal()) {
    if (display.textContent.length > 0) {
      atualizarDisplay(",");
    } else {
      atualizarDisplay("0,");
    }
  }
};

//assim que clicar no botão '.', vai para a função inserirDecimal
document.getElementById("decimal").addEventListener("click", inserirDecimal);

//FAZER COM QUE SEJA FUNCIONAL A DIGITAÇÃO DIRETO PELO TECLADO, IGNORANDO TECLAS DE LETRAS E OUTRAS AÇÕES FORA DA NOSSA CALCULADORA
const mapaTeclado = {
  //definimos nossos valores baseado nos botões que queremos para apresentar suas chaves
  0: "tecla0",
  1: "tecla1",
  2: "tecla2",
  3: "tecla3",
  4: "tecla4",
  5: "tecla5",
  6: "tecla6",
  7: "tecla7",
  8: "tecla8",
  9: "tecla9",
  "/": "operadorDivisao",
  "*": "operadorMultiplicacao",
  "+": "operadorAdicao",
  "-": "operadorSubtracao",
  "=": "igual",
  Enter: "igual",
  Backspace: "backspace",
  C: "limparCalculo",
  Escape: "limparDisplay",
  ",": "decimal",
  ".": "decimal",
};

const mapearTeclado = (evento) => {
  const tecla = evento.key; //pega a tecla que foi pressionada pelo usuário (exemplo: '1', '+', '-', 'Enter', etc.) e armazena na variável tecla.

  if (tecla === "-") {
    //Verifica se a tecla pressionada foi o sinal de menos -.
    if (
      novoNumero &&
      (display.textContent === "" || display.textContent === "0")
    ) {
      // verifica se está digitando um novo número (novoNumero é true) e se o display está vazio ou com zero — isso serve para permitir inserir o sinal de menos como início de um número negativo.
      display.textContent = "-"; //se as condições forem atendidas, mostra o sinal de '-' antes
      novoNumero = false; //mostra que não é um novo numero pois já digitou o sinal '-'
      evento.preventDefault(); //Impede que o comportamento padrão do navegador para essa tecla (se houver) aconteça — para evitar que o evento interfira no funcionamento da calculadora.
      return;
    }
  }

  if (tecla in mapaTeclado) {
    //verifica se a tecla pressionada está definida em mapaTeclado
    const botao = document.getElementById(mapaTeclado[tecla]); //salva o elemento obtido pelo mapaTeclado

    botao.click(); //simula o click no botão da calculadora

    //adicionando o mesmo efeito de hover para quando o usuario clicar pelo teclado
    botao.classList.add("hover-effect");
    //remove o efeito hover assim que o tempo definido passar
    setTimeout(() => {
      botao.classList.remove("hover-effect");
    }, 200); //200 -> tempo do efeito em milissegundos

    evento.preventDefault();
  }
};

//assim que o usuario clicar no teclado vai para a função mapearTeclado
document.addEventListener("keydown", mapearTeclado);
