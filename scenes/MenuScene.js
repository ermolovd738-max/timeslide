export default class MenuScene extends Phaser.Scene {
    constructor(){ super("Menu"); }
  
    create(){
      console.log("▶ MenuScene запустилась");
  
      const W = this.scale.width, H = this.scale.height;
      this.cameras.main.setBackgroundColor("#4246c8");
  
      // Заголовок
      this.add.rectangle(W/2, 120, 360, 80, 0xff3b30).setStrokeStyle(6, 0x1b1b1b);
      this.add.text(W/2, 120, "TimeSlide", {
        fontFamily:"Arial Black", fontSize:48, color:"#e9f2ff"
      }).setOrigin(0.5);
  
      // Кнопки сеток
      const grids = [3,4,5,6,7,8,9];
      const startY = 240, gap = 120, btnW = 220, btnH = 62;
  
      grids.forEach((g, idx)=>{
        const y = startY + idx*gap;
        const btn = this.add.rectangle(W/2, y, btnW, btnH, 0xb57ad3)
          .setStrokeStyle(8, 0x111111)
          .setInteractive({useHandCursor:true});
        this.add.text(W/2, y, `${g}x${g}`, {
          fontFamily:"Arial Black", fontSize:36, color:"#ffe04e"
        }).setOrigin(0.5);
  
        btn.on("pointerover", ()=>btn.setFillStyle(0xc78be6));
        btn.on("pointerout",  ()=>btn.setFillStyle(0xb57ad3));
        btn.on("pointerup",   ()=>{
          // Всегда начинаем с первой картинки набора
          this.scene.start("Puzzle", { grid:g, index:0 });
        });
      });
    }
  }
  