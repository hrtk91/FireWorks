phina.globalize();

var ASSETS = {
  sound: {
    'se1': './se/fireworks1.mp3',
    'se2': './se/fireworks2.mp3',
    'se3': './se/fireworks3.mp3',
    'bgm': './bgm/bgm.mp3'
  }
};

phina.define('MainScene', {
  superClass: 'DisplayScene',
  
  init: function() {
    this.superInit();
    var grad = Canvas.createLinearGradient(0, 0, 0,960);
    grad.addColorStop(0, '#001');
    grad.addColorStop(0.7, '#113');
    grad.addColorStop(1, '#116');
    this.backgroundColor = grad;
    //SoundManager.playMusic('bgm');
  },
  update: function (app) {
    if (app.frame % 30 === 0) {
      var p = FireWorks({
        strokeWidth: 0,
        fill: 'hsla({0}, 100%, 60%, 1)'.format(Math.randint(0, 360)),
        radius: 2,
        flowerRange: Math.random() + 1,
      }).addChildTo(this);
      p.blendMode = 'lighter';
      p.setPosition(Math.randint(0, 600), 960);
      p.v = Vector2(0, -Math.randint(7, 12));
      p.off('tod', p.remove);
    }
    
    if (app.keyboard.getKey('escape')) {
      app.pushScene(PauseScene());
    }
  }
});

phina.define('Particle', {
  superClass: 'CircleShape',
  
  init: function (option) {
    option = option || {};
    this.superInit(option);
    this.blendMode = 'lighter';
    this.life = this.maxlife = option.life || Math.randint(60, 100);
    this.friction = option.friction || 0.987;
    this.on('tod', this.remove);
  },
  setLife: function (life) {
    this.life = this.maxlife = life;
    return this;
  },
  update: function (app) {
    this.position.add(this.v);
    this.v.mul(this.friction);
    //this.v.y += 0.01;
    this.alpha = (this.life) / this.maxlife;
    
    if (app.frame % 5 === 0)
      this.life--;
    
    if (this.life <= 0)
      this.flare('tod');
  },
});

phina.define('FireWorks', {
  superClass: 'Particle',
  init: function (option) {
    option = option || {};
    this.superInit(option);
    this.superUpdate = Particle().update;
    this.flowerRange = option.flowerRange || 1.5;
    this.threshold = option.threshold || -1;
    this.flowerNum = option.flowerNum || 30;
  },
  exterior: function (num) {
    var self = this;
    const flowersNum = num;
    const baserad = (2 * Math.PI) / flowersNum;
    (flowersNum).times(function (i) {
      var p = Particle({
        fill: self.fill,
        radius: 3,
        strokeWidth: self.strokeWidth,
      }).addChildTo(self.parent);
      p.setPosition(self.x, self.y);
      p.v = Vector2(Math.cos(i * baserad), Math.sin(i * baserad));
      p.v.mul(self.flowerRange);
      p.life = 50;
    });
  },
  interior: function (num) {
    var self = this;
    const flowersNum = num;
    const baserad = (2 * Math.PI) / flowersNum;
    (flowersNum).times(function (i) {
      var p = Particle({
        fill: self.fill,
        radius: 5,
        strokeWidth: self.strokeWidth,
      }).addChildTo(self.parent);
      p.setPosition(self.x, self.y);
      p.v = Vector2(Math.cos(i * baserad), Math.sin(i * baserad));
      p.v.mul(Math.random()*self.flowerRange);
      p.life = 50;
    });
  },
  explosion: function (app) {
    const flowersNum = this.flowerNum;
    this.exterior(flowersNum / 4);
    this.interior(flowersNum);
    this.remove();
  },
  update: function (app) {
    this.superUpdate(app);
    
    if (this.life <= 0 || this.v.y >= this.threshold) {
      this.explosion(app);
      SoundManager.play('se' + Math.randint(1, 2).toString());
    }
  },
});

phina.main(function() {
  var app = GameApp({
    startLabel: 'main',
    assets: ASSETS,
  });
  app.fps = 60;
  
  app.run();
});
