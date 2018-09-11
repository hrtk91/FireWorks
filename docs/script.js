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
    var firespan = this.firespan = 60;
    this.label = Label({
      text: 'FireSpan:' + ('000' + this.firespan.toString()).slice(-3),
      fontSize: 20,
      fill: 'rgba(255, 255, 255, 1)',
      x: this.gridX.span(2),
      y: this.gridY.span(0) + 20,
    }).addChildTo(this);
    var upButton = Button({
      text: 'up', fontSize: 20,
      width: 65, height: 50,
      fill: 'hsla(240, 75%, 50%, 0.2)',
      x: this.gridX.span(1),
      y: this.gridY.span(1),
    }).addChildTo(this);
    var downButton = Button({
      text: 'down', fontSize: 20,
      width: 65, height: 50,
      fill: 'hsla(240, 75%, 50%, 0.2)',
      x: this.gridX.span(3),
      y: this.gridY.span(1),
    }).addChildTo(this);

    upButton.on('pointend', function (app) {
      if (this.firespan > 255) return;
      this.firespan++;
      const numstr = ('000' + this.firespan.toString()).slice(-3);
      this.label.text = 'FireSpan:' + numstr;
    }.bind(this));
    downButton.on('pointend', function (app) {
      if (this.firespan <= 1) return;
      this.firespan--;
      const numstr = ('000' + this.firespan.toString()).slice(-3);
      this.label.text = 'FireSpan:' + numstr;
    }.bind(this));
    upButton.on('pointover', function (app) {
      var prev = this.fill;
      this.fill = 'hsla(240, 75%, 50%, 0.7';
      this.one('pointout', function (app) {
        this.fill = prev;
      });
    });
    downButton.on('pointover', function (app) {
      var prev = this.fill;
      this.fill = 'hsla(240, 75%, 50%, 0.7';
      this.one('pointout', function (app) {
        this.fill = prev;
      });
    });
    //SoundManager.playMusic('bgm');
  },
  update: function (app) {
    if (app.frame % this.firespan === 0) {
      const works = [FireWorks, Cluster];
      const subs = Math.randint(0, 1);
      var p = works[subs]({
        strokeWidth: 0,
        fill: 'hsla({0}, 100%, 60%, 1)'.format(Math.randint(0, 360)),
        radius: 2,
        flowerRadius: Math.random() + 1,
        life: Math.randint(60, 200)
      }).addChildTo(this);
      p.blendMode = 'lighter';
      p.setPosition(Math.randint(0, 600), 960);
      p.v = Vector2(0, -Math.randint(7, 12));
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
    this.life = this.maxlife = option.life || 60;
    this.friction = option.friction || 0.987;
    this.scaled = 0.99;
    this.on('death', this.remove);
  },
  setLife: function (life) {
    this.life = this.maxlife = life;
    return this;
  },
  update: function (app) {
    this.position.add(this.v);
    this.v.mul(this.friction);
    this.scale.mul(this.scaled);
    this.alpha = (this.life / this.maxlife);
    
    //if (app.frame % 10 === 0)
      this.life--;
    
    if (this.life <= 0) {
      this.flare('beforeDeath');
      this.flare('death');
    }
  },
});

phina.define('FireWorks', {
  superClass: 'Particle',
  init: function (option) {
    option = option || {};
    this.superInit(option);
    this.flowerRadius = option.flowerRadius || 1.5;
    this.flowerNum = option.flowerNum || 30;
    this.on('beforeDeath', this.explosion);
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
    SoundManager.play('se' + Math.randint(1, 2).toString());
  },
  update: function (app) {
    Particle.prototype.update.call(this, app);
    /*
    if (this.alpha < 0.1) {
      this.flare('beforeDeath');
    }
    */
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
    const flowerNum = 15;
    for (var i = 0; i < flowerNum; i++) {
      var p = FireWorks({
        fill: option.fill,
        radius: option.radius || 5,
        strokeWidth: option.strokeWidth || 0,
        flowerNum: flowerNum,
        flowerRadius: 1,
        life: Math.randint(80, 120)
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
