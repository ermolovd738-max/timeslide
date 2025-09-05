const UI = {
    titleStyle: { fontFamily:"Arial Black", fontSize:28, color:"#d5ddff" },
    btnStyle:   { fontFamily:"Arial Black", fontSize:28, color:"#d5ddff" }
  };
  
  export default class PuzzleScene extends Phaser.Scene {
    constructor(){ super("Puzzle"); }
  
    init(data){
      this.grid = data.grid;                      // 3..9
      this.idx  = data.index ?? 0;                // индекс картинки в наборе
      this.keysByGrid = this.registry.get("IMAGE_KEYS");
      this.keyList = this.keysByGrid[this.grid] || [];
      this.imageKey = this.keyList[
        (this.idx % this.keyList.length + this.keyList.length) % this.keyList.length
      ];
  
      this.boardPadding = 32;
      this.tileGap = 2;
      this.moves = 0;
    }
  
    create(){
      console.log("▶ PuzzleScene запустилась", this.grid, this.idx, this.imageKey);
      const W = this.scale.width, H = this.scale.height;
      this.cameras.main.setBackgroundColor(0x3942c0);
  
      // Верхняя строка
      this.movesText = this.add.text(W/2, 30, "Количество шагов: 0 шагов", UI.titleStyle)
        .setOrigin(0.5,0);
  
      // Кнопки
      this.backBtn    = this.makeButton(130, H-60, "Назад",       ()=>this.scene.start("Menu"));
      this.shuffleBtn = this.makeButton(W-140, H-60, "Перемешать",()=>this.shuffle(true));
  
      // Размер доски (адаптивный)
      const boardMaxW = Math.min(W - 2*this.boardPadding, 0.94*W);
      const boardMaxH = Math.min(H - 220, 0.62*H);
      this.boardSize  = Math.floor(Math.min(boardMaxW, boardMaxH));
  
      // Превью-миниатюра эталонной картинки (под счётчиком шагов, по центру)
      this.preview = this.add.image(W/2, 200, this.imageKey)
        .setDisplaySize(this.boardSize*0.35, this.boardSize*0.35)
        .setOrigin(0.5);

  
      // Подготовка текстур тайлов через Canvas (чёткие фрагменты)
      this.tileTextures = this.buildTileTextures(this.imageKey, this.grid);
  
      // Доска
      this.makeBoard();
  
      // Стартовое перемешивание
      this.shuffle(false);
    }
  
    makeButton(x,y,label,cb){
      const r = this.add.rectangle(x,y,200,56,0x7aa7ff)
        .setStrokeStyle(6,0xb8c8ff)
        .setInteractive({useHandCursor:true});
      const t = this.add.text(x,y,label,UI.btnStyle).setOrigin(0.5);
      r.on("pointerover", ()=>r.setFillStyle(0x8bb6ff));
      r.on("pointerout",  ()=>r.setFillStyle(0x7aa7ff));
      r.on("pointerup", cb);
      return r;
    }
  
    // Режем исходную картинку на N×N тайлов (без setCrop)
    buildTileTextures(imgKey, N){
      const src = this.textures.get(imgKey).getSourceImage();
      const srcW = src.width, srcH = src.height;
      const tileSrcW = Math.floor(srcW / N);
      const tileSrcH = Math.floor(srcH / N);
  
      const tileTexKeys = [];
      for(let r=0; r<N; r++){
        for(let c=0; c<N; c++){
          const key = `${imgKey}_tile_${N}_${r}_${c}`;
          if(!this.textures.exists(key)){
            const canv = document.createElement("canvas");
            canv.width = tileSrcW; canv.height = tileSrcH;
            const ctx = canv.getContext("2d");
            ctx.imageSmoothingEnabled = false; // резкость
            ctx.drawImage(src, c*tileSrcW, r*tileSrcH, tileSrcW, tileSrcH, 0, 0, tileSrcW, tileSrcH);
            this.textures.addCanvas(key, canv);
          }
          tileTexKeys.push(key);
        }
      }
      return { keys: tileTexKeys, tileSrcW, tileSrcH };
    }
  
    makeBoard(){
      const N = this.grid, size = this.boardSize, gap = this.tileGap;
  
      this.boardX = Math.floor((this.scale.width - size)/2);
      this.boardY = Math.floor((this.scale.height - size)/2 + 40);
      const tileW = Math.floor((size - (N-1)*gap)/N);
      const tileH = tileW;
  
      this.tiles = []; this.state = []; this.goal = [];
  
      const idxToXY = (i)=> {
        const r = Math.floor(i/N), c = i%N;
        const x = this.boardX + c*(tileW+gap) + tileW/2;
        const y = this.boardY + r*(tileH+gap) + tileH/2;
        return {x,y};
      };
  
      const keys = this.tileTextures.keys;
      for(let r=0; r<N; r++){
        for(let c=0; c<N; c++){
          const i = r*N + c;
          const goalId = i;
          this.goal.push(goalId);
  
          if(i === N*N-1){ // пустая
            this.state.push(-1);
            this.emptyIndex = i;
            continue;
          }
  
          const spr = this.add.image(0,0, keys[i]).setDisplaySize(tileW, tileH).setOrigin(0.5);
          const {x,y} = idxToXY(i);
          spr.setPosition(x,y).setInteractive({useHandCursor:true});
          const tile = {spr, id:goalId, i};
          spr.on("pointerup", ()=>this.tryMove(tile));
          this.tiles.push(tile);
          this.state.push(goalId);
        }
      }
  
      this.idxToXY = idxToXY;
      this.tileW = tileW; this.tileH = tileH;
    }
  
    tryMove(tile){
      const N = this.grid, i = tile.i, e = this.emptyIndex;
      const sameRow = (a,b)=> Math.floor(a/N)===Math.floor(b/N);
      const can =
        (i===e-1 && sameRow(i,e)) ||
        (i===e+1 && sameRow(i,e)) ||
        i===e-N || i===e+N;
  
      if(!can) return;
  
      const {x,y} = this.idxToXY(e);
      this.tweens.add({
        targets: tile.spr, x, y, duration: 90, onComplete: ()=>{
          this.state[e] = tile.id;
          this.state[i] = -1;
          tile.i = e;
          this.emptyIndex = i;
          this.moves++;
          this.movesText.setText(`Количество шагов: ${this.moves} шагов`);
          if(this.isSolved()) this.onWin();
        }
      });
    }
  
    isSolved(){
      for(let i=0;i<this.state.length-1;i++){
        if(this.state[i]!==i) return false;
      }
      return this.state[this.state.length-1]===-1;
    }
  
    shuffle(animated){
      const N = this.grid;
      const arr = [];
      for(let i=0;i<N*N-1;i++) arr.push(i);
  
      // Фишер-Йетс
      for(let i=arr.length-1;i>0;i--){
        const j = (Math.random()*(i+1))|0;
        [arr[i],arr[j]]=[arr[j],arr[i]];
      }
  
      // Исправляем чётность (чтобы раскладка была решаемой)
      const inv = (a)=>{ let s=0; for(let i=0;i<a.length;i++) for(let j=i+1;j<a.length;j++) if(a[i]>a[j]) s++; return s; };
      const inversions = inv(arr);
      const widthEven = (N%2===0);
      const emptyRowFromBottom = 1; // пустая в последней строке
      const solvable = !widthEven ? inversions%2===0
        : ((emptyRowFromBottom%2===0 && inversions%2===1) || (emptyRowFromBottom%2===1 && inversions%2===0));
      if(!solvable) [arr[0],arr[1]]=[arr[1],arr[0]];
  
      // Раскладываем
      const place = (tile,i)=>{ const {x,y}=this.idxToXY(i); tile.spr.setPosition(x,y); tile.i=i; };
      let k=0;
      for(let i=0;i<N*N;i++){
        if(i===N*N-1){ this.state[i] = -1; this.emptyIndex = i; continue; }
        const id = arr[k++]; this.state[i]=id;
        const tile = this.tiles.find(t=>t.id===id);
        if(animated){
          const {x,y} = this.idxToXY(i);
          this.tweens.add({targets: tile.spr, x,y, duration:150});
          tile.i=i;
        }else{
          place(tile,i);
        }
      }
  
      this.moves = 0;
      this.movesText.setText(`Количество шагов: ${this.moves} шагов`);
    }
  
    onWin(){
      const W=this.scale.width, H=this.scale.height;
  
      const overlay = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.35).setDepth(5);
      const full = this.add.image(W/2, H/2, this.imageKey)
        .setDepth(6)
        .setDisplaySize(this.boardSize, this.boardSize);
  
      const msg = this.add.text(W/2, H/2, `Победа!!!\nПазл собран за ${this.moves} шагов`, {
        fontFamily:"Arial Black", fontSize:36, color:"#ffffff", align:"center", stroke:"#000", strokeThickness:6
      }).setOrigin(0.5).setDepth(7);
  
      const nextBtn = this.add.rectangle(W/2, H-110, 260, 64, 0x8cb2ff)
        .setStrokeStyle(6,0xcfe0ff)
        .setInteractive({useHandCursor:true})
        .setDepth(7);
      const t = this.add.text(W/2, H-110, "Далее", UI.btnStyle).setOrigin(0.5).setDepth(7);
      nextBtn.on("pointerup", ()=>{
        overlay.destroy(); full.destroy(); msg.destroy(); nextBtn.destroy(); t.destroy();
        const nextIndex = (this.idx + 1) % this.keyList.length;
        this.scene.start("Puzzle", { grid:this.grid, index: nextIndex });
      });
    }
  }
  