var tempframe = 0;
var numsprite = 0;

var rocket = {
    object: new element('image', 'img/guide/rocket_1.png', 0, 347, 93, 37),
    controls: function () {
        if (GameArea.keys && GameArea.keys[37]) {rocket['object'].speedX = -2; }
        if (GameArea.keys && GameArea.keys[39]) {rocket['object'].speedX = 2; }
        if (GameArea.keys && GameArea.keys[38]) {rocket['object'].speedY = -2; }
        if (GameArea.keys && GameArea.keys[40]) {rocket['object'].speedY = 2; }
    },
    update: function () {
        if(numsprite == 0){
            rocket['object'].image.src = 'img/guide/rocket_1.png';
        }

        if(numsprite == 5){
            rocket['object'].image.src = 'img/guide/rocket_2.png';
        }

        if(numsprite == 10){
            rocket['object'].image.src = 'img/guide/rocket_3.png';
        }

        numsprite++;

        if(numsprite > 10){
            numsprite = 0;
        }

        rocket['object'].newPos();
        rocket['object'].update();
    }
};

var background = new element('image', 'img/bg-2.jpg', 0, 0, 1024, 768);

var meteors = {
    objects: [],
    hit: function () {
        for (var i = 0; i < meteors['objects'].length; i++) {
            if (rocket['object'].hitWith(meteors['objects'][i])) {
                sounds['background'].stop();
                sounds['hit'].play();
                GameArea.stop();

                // TO-DO: переход на страницу рекордов
                return;
            }
        }
    },
    update: function () {
        for (var i = 0; i < meteors['objects'].length; i++) {
            meteors['objects'][i].angle += Math.PI / 180;
            if (i % 2 == 0){
                meteors['objects'][i].x -= 4;
            }
            else {
                meteors['objects'][i].x -= 3;
            }
            meteors['objects'][i].update();
        }
    }
};

var stars = {
    ind: new text("30px", "Verdana", "white", 190, 700),
    interface: new element('image', 'img/interface/starsind.png', 30, 630, 269, 114),
    count: 0,
    objects: [],
    hit: function () {
        for (var i = 0; i < stars['objects'].length; i++) {
            if (rocket['object'].hitWith(stars['objects'][i])) {
                sounds['star'].play();
                stars['count'] += 1;
                stars['objects'].splice(i,1);
                return;
            }
        }
    },
    update: function () {
        stars['ind'].text = stars['count'];
        for (var i = 0; i < stars['objects'].length; i++){
            stars['objects'][i].x -= 4.5;
            stars['objects'][i].update();
        }
        stars['interface'].update();
        stars['ind'].update();
    }
};

var fuel = {
    ind: new text("30px", "Verdana", "white", 800, 700),
    interface: new element('image', 'img/interface/fuelind.png', 730, 630, 269, 114),
    count: 10,
    objects: [],
    action: function () {
        if ((GameArea.frameNo % 60) == 0){
            fuel['count'] -= 1;
            if(fuel['count'] == 0){
                sounds['background'].stop();
                sounds['finish'].play();
                GameArea.stop();
            }
        }
    },
    hit: function () {
        for (var i = 0; i < fuel['objects'].length; i++) {
            if (rocket['object'].hitWith(fuel['objects'][i])) {
                sounds['star'].play();
                fuel['count'] += 10;
                fuel['objects'].splice(i, 1);
                return;
            }
        }
    },
    update: function () {
        for (var i = 0; i < fuel['objects'].length; i++){
            fuel['objects'][i].x -= 4.5;
            fuel['objects'][i].update();
        }
        fuel['ind'].text = fuel['count'];
        fuel['interface'].update();
        fuel['ind'].update();
    }
};

var sounds = {
    hit: new sound("sound/hit.mp3"),
    star: new sound('sound/star.mp3'),
    background: new sound('sound/background.mp3'),
    finish: new sound('sound/finish.mp3')
};

var timer = {
    ind: new text("72px", "Verdana", "white", 410, 690),
    interface: new element('image', 'img/interface/timer.png', 350, 580, 323, 179),
    min: 0,
    mintext: '',
    sec: 0,
    action: function () {
        timer['sec'] = (GameArea.frameNo/60).toFixed();
        if(timer['sec'] == 60) {
            GameArea.frameNo = 0;
            timer['sec'] = 0;
            timer['min'] += 1;
        }
        if ((timer['min'] >= 0) && (timer['min'] < 10)){
            timer['mintext'] = '0' + timer['min'];
        }
        else {
            timer['mintext'] = timer['min'];
        }
        if (timer['sec'] < 10){
            timer['ind'].text = timer['mintext'] + ":" + '0' + timer['sec'];
        }
        else {
            timer['ind'].text = timer['mintext'] + ":" + timer['sec'];
        }
    },
    update: function () {
        timer['interface'].update();
        timer['ind'].update();
    }
};

var GameArea = {
    canvas : document.getElementById('canvas'),
    start : function() {
        sounds['background'].play();
        $('#game').removeClass('hidden');
        this.canvas.width = 1024;
        this.canvas.height = 768;
        this.context = this.canvas.getContext("2d");
        if (tempframe){
            this.frameNo = tempframe;
        }
        else {
            this.frameNo = 0;
        }
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            GameArea.keys = (GameArea.keys || []);
            GameArea.keys[e.keyCode] = true;
        });
        window.addEventListener('keyup', function (e) {
            GameArea.keys[e.keyCode] = false;
        });
    },
    stop : function() {
        GameArea.hidescreens();
        GameArea.hidescreen('#canvas');
        GameArea.showscreen('#top');
        $('.result').removeClass('hidden');
        $('.result').append('<p>Ваш результат - ' + stars["count"] +' <img src="img/star.png" alt="Альтернативный заголовок"></p>');
        clearInterval(this.interval);
    },
    pause : function() {
        GameArea.hidescreens();
        GameArea.hidescreen('#canvas');
        GameArea.showscreen('#pause');
        tempframe = GameArea.frameNo;
        clearInterval(this.interval);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    everyinterval: function (n) {
        if ((GameArea.frameNo / n) % 1 == 0) {return true;}
        return false;
    },
    addObjects: function () {
        var x, y, minY, maxY;
        GameArea.frameNo += 1;

        if (GameArea.frameNo == 1 || GameArea.everyinterval(100)) {
            x = GameArea.canvas.width;
            minY = 50;
            maxY = 500;
            y = Math.floor(Math.random()*(maxY - minY + 1) + minY);
            meteors['objects'].push(new obstacle('img/guide/meteor.png', x, Math.random() * (maxY - minY) + minY, 70, 58));
            meteors['objects'].push(new obstacle('img/guide/meteor.png', x, Math.random() * (maxY - minY) + minY, 70, 58));
            fuel['objects'].push(new element('image', 'img/guide/gallon.png', x, Math.random() * (maxY - minY) + minY, 61, 77));
            stars['objects'].push(new element('image', 'img/guide/star.png', x, Math.random() * (maxY - minY) + minY, 72, 70));
        }
    },
    hidescreens: function () {
        $("section").addClass('hidden');
    },
    hidescreen: function (id) {
        $(id).addClass('hidden');
    },
    showscreen: function (id) {
        $(id).removeClass('hidden');
    },
    refresh: function () {
        $('.result').empty();
        tempframe = 0;
        meteors['objects'] = [];
        fuel['objects'] = [];
        stars['objects'] = [];
        rocket['object'].x = 0;
        rocket['object'].y = 360;
        stars['count'] = 0;
        fuel['count'] = 10;
    }
};

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}

function element(type, src, x ,y, width, height) {
    this.type = type;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = new Image();
    this.image.src = src;

    this.update = function() {
        ctx = GameArea.context;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    };

    this.newPos = function() {
        if(this.y < 50){
            this.y = 50;
        }
        if(this.y > 500){
            this.y = 500;
        }
        if(this.x < 0){
            this.x = 0;
        }
        if(this.x > GameArea.canvas.width - this.width){
            this.x = GameArea.canvas.width - this.width;
        }
        this.x += this.speedX;
        this.y += this.speedY;
        clearmove();
    };


    this.hitWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var hit = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            hit = false;
        }
        return hit;
    };
}

function obstacle(src, x ,y, width, height) {
    var n = Math.random() * (4 - 1) + 1;
    this.angle = 0;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.width = width / n;
    this.height = height / n;
    this.image = new Image();
    this.image.src = src;

    this.update = function() {
        ctx = GameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, this.width/-2, this.height/-2, this.width, this.height);
        ctx.restore();
    };
}

function text(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.update = function() {
        ctx = GameArea.context;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 3;
        ctx.shadowColor = "rgba(135, 189, 255, 0.6)";
        ctx.font = this.width + " " + this.height;
        ctx.fillStyle = color;
        ctx.fillText(this.text, this.x, this.y);

    }
}

function startGame() {
    GameArea.hidescreens();
    GameArea.showscreen('#start');
    //GameArea.start();
}

function updateGameArea() {

    // Проверка на столкновение со звездами
    stars.hit();
    // Конец проверки

    // Проверка на столкновение со топливом
    fuel.hit();
    // Конец проверки

    // Таймер
    timer.action();
    // Конец таймера

    // Управление топливом
    fuel.action();
    // Конец управления топливом

    // Добавление элементов на игровое поле
    GameArea.clear();
    GameArea.addObjects();

    rocket.controls();

    // Обновление элементов
    background.update();

    rocket.update();
    meteors.update();
    meteors.hit();

    timer.update();
    stars.update();
    fuel.update();


}

function clearmove() {
    rocket['object'].speedX = 0;
    rocket['object'].speedY = 0;
}