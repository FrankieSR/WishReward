define([
    'jquery'
], function ($) {
    'use strict';

    $.widget('doroshko.snowfallEffect', {
        options: {
            snowflakeCount: 100,
            canvasId: 'snow-canvas'
        },

        _create: function () {
            this._initializeCanvas();
            this._createSnowflakes();
            this._animateSnowfall();
        },

        _initializeCanvas: function () {
            this.canvas = document.getElementById(this.options.canvasId);
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.snowflakes = [];
        },

        _createSnowflakes: function () {
            for (let i = 0; i < this.options.snowflakeCount; i++) {
                this.snowflakes.push(this._createSnowflake());
            }
        },

        _createSnowflake: function () {
            return {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 3 + 1.5,
                speedY: Math.random() * 0.9,
                speedX: Math.random() - 0.6
            };
        },

        _animateSnowfall: function () {
            const ctx = this.ctx;
            const canvas = this.canvas;
            const snowflakes = this.snowflakes;

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                snowflakes.forEach((flake) => {
                    flake.y += flake.speedY;
                    flake.x += flake.speedX;

                    if (flake.y > canvas.height) {
                        flake.y = 0;
                        flake.x = Math.random() * canvas.width;
                    }

                    ctx.beginPath();
                    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
                    ctx.fillStyle = 'white';
                    ctx.fill();
                });

                requestAnimationFrame(animate);
            };

            animate();
        }
    });

    return $.doroshko.snowfallEffect;
});
