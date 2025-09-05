export default class BootScene extends Phaser.Scene {
    constructor(){ super("Boot"); }
  
    preload(){
      // Экран «Загрузка ....»
      this.cameras.main.setBackgroundColor("#000");
      this.add.text(this.scale.width/2, this.scale.height/2, "Загрузка ....", {
        fontFamily: "Arial", fontSize: 56, color: "#ffffff"
      }).setOrigin(0.5);
  
      // === Наборы картинок по сеткам ===
      // Можно добавлять любые пути; главное — отзеркалить здесь.
      this.registry.set("IMAGE_SETS", {
        3: ["assets/images/3x/img3_1.jpg","assets/images/3x/img3_2.jpg"],
        4: ["assets/images/4x/img4_1.jpg","assets/images/4x/img4_2.jpg"],
        5: ["assets/images/5x/img5_1.jpg","assets/images/5x/img5_2.jpg"],
        6: ["assets/images/6x/img6_1.jpg","assets/images/6x/img6_2.jpg"],
        7: ["assets/images/7x/img7_1.jpg","assets/images/7x/img7_2.jpg"],
        8: ["assets/images/8x/img8_1.jpg","assets/images/8x/img8_2.jpg"],
        9: ["assets/images/9x/img9_1.jpg","assets/images/9x/img9_2.jpg"]
      });
  
      // Предзагрузка всех изображений + карта ключей по сетке
      const sets = this.registry.get("IMAGE_SETS");
      let i = 0;
      Object.entries(sets).forEach(([n, arr])=>{
        arr.forEach(src=>{
          const key = `img_${n}x_${i++}`;
          this.load.image(key, src);
          const map = this.registry.get("IMAGE_KEYS") || {};
          const list = map[n] || [];
          list.push(key);
          map[n] = list;
          this.registry.set("IMAGE_KEYS", map);
        });
      });
  
      this.load.on("complete", ()=>{
        console.log("✅ Все картинки загружены");
        this.scene.start("Menu");
      });
    }
  }
  