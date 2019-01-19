(function() {

    var width, height, header, canvas, ctx, circles, animateHeader = true;

    // Main
    initHeader();
    addListeners();

    function initHeader() {
        header = $('#ethereal-header')[0];
        canvas = $('#ethereal-canvas')[0];

        resize();

        ctx = canvas.getContext('2d');

        // Create particles
        circles = [];
        for(let x = 0; x < width*0.5; x++) {
            let c = new Circle();
            circles.push(c);
        }
        animate();
    }

    // Event handling
    function addListeners() {
        window.addEventListener('scroll', scrollCheck);
        window.addEventListener('resize', resize);
    }

    function scrollCheck() {
        if(document.body.scrollTop > height) animateHeader = false;
        else animateHeader = true;
    }

    function resize() {
        width = $(header).parent().width();
        height = $(header).parent().height();
        $(header).css('height', `${height}px`);
        $(canvas).attr('width', width);
        $(canvas).attr('height', height);
    }

    function animate() {
        if(animateHeader) {
            ctx.clearRect(0,0,width,height);
            for(let i in circles) {
                circles[i].draw();
            }
        }
        requestAnimationFrame(animate);
    }

    // Canvas manipulation
    function Circle() {
        let _this = this;

        // constructor
        (function() {
            _this.pos = {};
            init();
        })();

        function init() {
            _this.pos.x = Math.random()*width;
            _this.pos.y = height+Math.random()*100;
            _this.alpha = 0.1+Math.random()*0.5;
            _this.scale = 0.1+Math.random()*0.3;
            _this.velocity = Math.random();
        }

        this.draw = function() {
            if(_this.alpha <= 0) {
                init();
            }
            _this.pos.y -= _this.velocity;
            _this.alpha -= 0.0005;
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.scale*10, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(255,255,255,'+ _this.alpha+')';
            ctx.fill();
        };
    }

})();