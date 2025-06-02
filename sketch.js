let solX, solY;
let solDir = 1;
let nuvens = [];
let arvores = [];

function setup() {
  createCanvas(800, 400);
  rectMode(CENTER);
  angleMode(DEGREES);
  solX = width * 0.1;
  solY = height * 0.3;
  
  for (let i = 0; i < 6; i++) {
    nuvens.push(new Nuvem(random(width), random(height * 0.1, height * 0.3), random(60, 100)));
  }
  
  for (let x = 100; x < width; x += 160) {
    arvores.push(new Arvore(x, height * 0.9));
  }
}

function draw() {
  desenharCeu();
  moverSol();
  desenharSol();
  moverNuvens();
  desenharNuvens();
  desenharChao();
  
  // Progressão do dia de 0 a 1
  let diaProgresso = map(solX, width * 0.1, width * 0.9, 0, 1);
  diaProgresso = constrain(diaProgresso, 0, 1);
  
  animarArvores(diaProgresso);
  animarGrama();
}

function desenharCeu() {
  for(let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(135, 206, 235), color(255, 255, 255), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function moverSol() {
  solX += solDir * 0.4;
  if (solX > width * 0.9 || solX < width * 0.1) solDir *= -1;
  solY = height * 0.3 + sin(map(solX, width*0.1, width*0.9, 0, 180)) * 50;
}

function desenharSol() {
  noStroke();
  fill(255, 204, 0);
  ellipse(solX, solY, 80, 80);
  fill(255, 255, 150, 80);
  ellipse(solX, solY, 120, 120);
}

function moverNuvens() {
  for (let n of nuvens) {
    n.x += 0.3;
    if (n.x > width + 50) n.x = -50;
  }
}

function desenharNuvens() {
  for (let n of nuvens) {
    n.mostrar();
  }
}

function desenharChao() {
  noStroke();
  fill(34, 139, 34);
  rect(width/2, height * 0.95, width, height * 0.1);
}

function animarArvores(progresso) {
  for (let a of arvores) {
    a.atualizar(progresso);
    a.balançar();
    a.mostrar();
  }
}

function animarGrama() {
  push();
  stroke(0, 100, 0);
  strokeWeight(2);
  for(let x = 0; x < width; x += 15) {
    let yBase = height * 0.95;
    let offset = sin(frameCount * 0.1 + x * 0.5) * 10;
    line(x, yBase, x + offset * 0.3, yBase - 20 - offset);
  }
  pop();
}

// Classes

class Nuvem {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
  }
  mostrar() {
    noStroke();
    fill(255, 240);
    ellipse(this.x, this.y, this.size * 0.6, this.size * 0.6);
    ellipse(this.x + this.size * 0.3, this.y + 10, this.size * 0.7, this.size * 0.7);
    ellipse(this.x - this.size * 0.3, this.y + 10, this.size * 0.7, this.size * 0.7);
  }
}

class Arvore {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.balanço = 0;
    this.dir = random() < 0.5 ? 1 : -1;
    
    this.alturaMin = 20;
    this.alturaMax = 200;
    this.alturaAtual = this.alturaMin;
    
    this.folhas = [];
    this.frutas = [];
    this.folhasCount = 60;
    
    // Criar folhas distribuídas em círculo completo
    for (let i = 0; i < this.folhasCount; i++) {
      let angle = map(i, 0, this.folhasCount - 1, -180, 180);
      let radius = random(20, 50);
      let fx = cos(angle) * radius;
      let fy = sin(angle) * radius - this.alturaMax;
      let rotation = random(-40, 40);
      this.folhas.push({x: fx, y: fy, rotation: rotation});
    }
  }
  
  atualizar(progresso) {
    // Crescimento só para cima, nunca diminui
    let novaAltura = lerp(this.alturaMin, this.alturaMax, progresso);
    if (novaAltura > this.alturaAtual) {
      this.alturaAtual = novaAltura;
    }
    
    // Atualizar frutas conforme crescimento
    let frutaProgresso = map(this.alturaAtual, this.alturaMin + (this.alturaMax - this.alturaMin) * 0.4, this.alturaMax, 0, 1);
    frutaProgresso = constrain(frutaProgresso, 0, 1);
    
    // Quantidade de frutas proporcional ao progresso após 40% do crescimento
    let frutaCount = floor(this.folhasCount * frutaProgresso);
    
    // Criar frutas nas posições das folhas selecionadas
    this.frutas = [];
    for (let i = 0; i < frutaCount; i++) {
      let f = this.folhas[i];
      // Frutas ficam perto da folha, um pouco deslocadas
      let offsetX = random(-5, 5);
      let offsetY = random(-5, 5);
      // Tamanho das frutas proporcional ao progresso
      let size = map(frutaProgresso, 0, 1, 4, 12);
      this.frutas.push({x: f.x + offsetX, y: f.y + offsetY + (this.alturaMax - this.alturaAtual), size: size});
    }
  }
  
  balançar() {
    this.balanço += 0.02 * this.dir;
    if (this.balanço > 0.15 || this.balanço < -0.15) this.dir *= -1;
  }
  
  mostrar() {
    push();
    translate(this.x, this.y);
    rotate(this.balanço);
    
    // Tronco
    fill(101, 67, 33);
    rect(0, -this.alturaAtual / 2, 20, this.alturaAtual, 10);
    
    // Copa base (transparente)
    noStroke();
    fill(34, 139, 34, 120);
    let copaSize = map(this.alturaAtual, this.alturaMin, this.alturaMax, 50, 100);
    ellipse(0, -this.alturaAtual, copaSize, copaSize);
    
    // Folhas elípticas inclinadas
    fill(34, 139, 34, 230);
    noStroke();
    let folhaWidth = map(this.alturaAtual, this.alturaMin, this.alturaMax, 15, 40);
    let folhaHeight = folhaWidth * 0.6;
    
    let folhasVisiveis = floor(map(this.alturaAtual, this.alturaMin, this.alturaMax, 0, this.folhas.length));
    folhasVisiveis = constrain(folhasVisiveis, 0, this.folhas.length);
    
    for (let i = 0; i < folhasVisiveis; i++) {
      let f = this.folhas[i];
      push();
      translate(f.x, f.y + (this.alturaMax - this.alturaAtual));
      rotate(f.rotation);
      ellipse(0, 0, folhaWidth, folhaHeight);
      pop();
    }
    
    // Mostrar frutas
    fill(200, 0, 30);
    noStroke();
    for (let fruta of this.frutas) {
      ellipse(fruta.x, fruta.y, fruta.size);
    }
    
    pop();
  }
}