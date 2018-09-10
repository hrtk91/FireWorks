phina.globalize();

var ASSETS = {
  sound: {
    'se1': './se/fireworks1.mp3',
    'se2': './se/fireworks2.mp3',
    'se3': './se/fireworks3.mp3',
    //'bgm': './bgm/bgm.mp3'
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
    if (app.frame % 60 === 0) {
      var fireworks = FireWorks;
      /*
      if (app.frame % 2 === 0)
        fireworks = FireWorks;
      else if (app.frame % 3 === 0)
        fireworks = Cluster;
      */
      var p = fireworks({
        strokeWidth: 0,
        fill: 'hsla({0}, 100%, 60%, 1)'.format(Math.randint(0, 360)),
        radius: 2,
        flowerRadius: Math.random() + 1,
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
    this.v = Vector2(0, 0);
    this.blendMode = 'lighter';
    this.life = this.maxlife = option.life || 50;
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
    this.alpha = (this.life / this.maxlife) * this.v.length();
    
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
    this.flowerRadius = option.flowerRadius || 1.5;
    this.flowerNum = option.flowerNum || 30;
  },
  outer: function (outers) {
    var self = this;
    const baserad = (2 * Math.PI) / outers.length;
    outers.forEach(function (p, i, ary) {
      p.addChildTo(self.parent);
      p.setPosition(self.x, self.y);
      p.v = Vector2(Math.cos(i * baserad), Math.sin(i * baserad));
      p.v.normalize();
      p.v.mul(self.flowerRadius);
      p.fill = self.fill;
    });
  },
  createOuters: function (option) {
    option = option || {};
    const outers = [];
    const flowersNum = option.num;
    for (var i = 0; i < flowersNum; i++) {
      var p = Particle({
        fill: option.fill || 'Silver',
        radius: option.radius || 3,
        strokeWidth: option.strokeWidth || 0,
      });
      outers.push(p);
    }
    return outers;
  },
  inner: function (inners) {
    var self = this;
    const baserad = (2 * Math.PI) / inners.length;
    inners.forEach(function (p, i, ary) {
      p.addChildTo(self.parent);
      p.setPosition(self.x, self.y);
      p.v = Vector2(Math.cos(i * baserad), Math.sin(i * baserad));
      p.v.normalize();
      p.v.mul(Math.random() * self.flowerRadius);
      p.fill = self.fill;
    });
  },
  createInners: function (option) {
    option = option || {};
    const flowerNum = option.num;
    const inners = [];
    for (var i = 0; i < flowerNum; i++) {
      var p = Particle({
        fill: option.fill || 'Gold',
        radius: option.radius || 5,
        strokeWidth: option.strokeWidth || 0,
      });
      inners.push(p);
    }
    return inners;
  },
  explosion: function () {
    const flowerNum = this.flowerNum;
    const outers = this.createOuters({num:flowerNum/2});
    const inners = this.createInners({num:flowerNum});
    this.outer(outers);
    this.inner(inners);
  },
  update: function (app) {
    Particle.prototype.update.call(this, app);
    
    if (this.v.length() < 1) {
      this.explosion();
      SoundManager.play('se' + Math.randint(1, 2).toString());
      this.remove();
    }
  },
});

phina.define('Cluster', {
  superClass: 'FireWorks',
  init: function (option) {
    option = option || {};
    this.superInit(option);
  },
  createInners: function (option) {
    option = option || {};
    const inners = [];
    const flowerNum = 5;
    for (var i = 0; i < flowerNum; i++) {
      var p = FireWorks({
        fill: option.fill,
        radius: option.radius || 5,
        strokeWidth: option.strokeWidth || 0,
        flowerNum: flowerNum,
        flowerRadius: 1,
      });
      inners.push(p);
    }
    return inners;
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
