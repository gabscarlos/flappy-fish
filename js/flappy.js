function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')

    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura), 
        new ParDeBarreiras(altura, abertura, largura + espaco), 
        new ParDeBarreiras(altura, abertura, largura + espaco * 2), 
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3 // velocidade de deslocamento das barreiras

    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento) // deslocamento das barreiras
            // quando o elemento sair da área do jogo
            if(par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length) // reposiciona a barreira
                par.sortearAbertura() // sorteia uma nova abertura
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio 
                && par.getX() < meio
            if(cruzouOMeio) notificarPonto() // notifica que o pássaro passou pelo meio
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false // pássaro começa sem voar

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/fish.gif'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0]) // pega a posição do pássaro
    this.setY = y => this.elemento.style.bottom = `${y}px` // seta a posição do pássaro

    window.onkeydown = e => voando = true // quando a tecla é pressionada, o pássaro voa
    window.onkeyup = e => voando = false // quando a tecla é solta, o pássaro para de voar    

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8  : -5) // se voando for true, o pássaro sobe, senão, ele desce
        const alturaMaxima = alturaJogo - this.elemento.clientHeight // altura máxima que o pássaro pode subir
        if(novoY <= 0) { // se o pássaro tentar subir além do limite superior
            this.setY(0) // o pássaro fica no limite superior
        } else if(novoY >= alturaMaxima) { // se o pássaro tentar descer além do limite inferior
            this.setY(alturaMaxima) // o pássaro fica no limite inferior
        } else {
            this.setY(novoY) // o pássaro fica na posição que ele tentou ir
        }        
        
    }

    this.setY(alturaJogo / 2) // seta a posição inicial do pássaro
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso') // cria um elemento span com a classe progresso

    this.atualizarPontos = pontos => { // atualiza os pontos
        this.elemento.innerHTML = pontos // insere os pontos no elemento
    }

    this.atualizarPontos(0) // seta os pontos iniciais
}

function estaoSobrepostos(elementoA, elementoB) {
    const a =  elementoA.getBoundingClientRect()
    const b =  elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu) { // se não colidiu
            const superior = parDeBarreiras.superior.elemento // pega o elemento superior
            const inferior = parDeBarreiras.inferior.elemento // pega o elemento inferior
            colidiu = estaoSobrepostos(passaro.elemento, superior) // verifica se o pássaro colidiu com o elemento superior
                || estaoSobrepostos(passaro.elemento, inferior) // verifica se o pássaro colidiu com o elemento inferior
        }
    })
    return colidiu
}

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]') // seleciona a área do jogo
    const altura = areaDoJogo.clientHeight // pega a altura da área do jogo
    const largura = areaDoJogo.clientWidth // pega a largura da área do jogo

    const progresso = new Progresso() // cria um novo progresso
    const barreiras = new Barreiras(altura, largura, 230, 400, // cria as barreiras
        () => progresso.atualizarPontos(++pontos)) // atualiza os pontos
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento) // adiciona o progresso na área do jogo
    areaDoJogo.appendChild(passaro.elemento) // adiciona o pássaro na área do jogo
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento)) // adiciona as barreiras na área do jogo

    this.start = () => { // inicia o jogo
        // loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro, barreiras)) { // se o pássaro colidiu com as barreiras
                clearInterval(temporizador) // para o jogo
            }
        }, 20) // a cada 20 milisegundos, o jogo é atualizado
    }    

}

new FlappyBird().start()