define([
    'jquery'
], function ($) {
    'use strict';

    $.widget('doroshko.snowfallEffect', {
        options: {
            snowflakeCount: 100,
            canvasId: 'snow-canvas',
            snowflakeColor: 'white'
        },

        /**
         * Initializes the snowfall effect by setting up the canvas, 
         * creating snowflakes, and starting the snowfall animation.
         */
        _create: function () {
            this._initializeCanvas();
            this._createSnowflakes();
            this._animateSnowfall();
        },

        /**
         * Sets up the canvas element where the snowfall effect will be rendered.
         * It also initializes the drawing context and sets the canvas size to 
         * fit the window dimensions.
         */
        _initializeCanvas: function () {
            this.canvas = document.getElementById(this.options.canvasId);  // Get the canvas element
            this.ctx = this.canvas.getContext('2d');  // Get the 2D context for drawing
            this.canvas.width = window.innerWidth;  // Set the canvas width to the window's width
            this.canvas.height = window.innerHeight;  // Set the canvas height to the window's height
            this.snowflakes = [];  // Initialize the array for storing snowflakes
        },

        /**
         * Creates an array of snowflakes with random positions, speeds, and sizes.
         */
        _createSnowflakes: function () {
            const { snowflakeCount } = this.options;

            for (let i = 0; i < snowflakeCount; i++) {
                this.snowflakes.push(this._createSnowflake());
            }
        },

        /**
         * Generates a single snowflake object with random properties such as position, 
         * size, and speed.
         * @returns {Object} Snowflake object with x, y, radius, speedX, and speedY properties.
         */
        _createSnowflake: function () {
            const canvasWidth = this.canvas.width;
            const canvasHeight = this.canvas.height;

            return {
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
                radius: Math.random() * 3 + 1.5,
                speedY: Math.random() * 0.9,
                speedX: Math.random() - 0.6 
            };
        },

        /**
         * Starts the animation loop for the snowfall effect.
         * The animation continuously moves the snowflakes and redraws them on the canvas.
         */
        _animateSnowfall: function () {
            const { ctx, canvas, snowflakes, options } = this;
            const snowflakeColor = options.snowflakeColor;

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                snowflakes.forEach(flake => {
                    flake.y += flake.speedY;
                    flake.x += flake.speedX;

                    if (flake.y > canvas.height) {
                        flake.y = 0;
                        flake.x = Math.random() * canvas.width;
                    }

                    ctx.beginPath();
                    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
                    ctx.fillStyle = snowflakeColor;
                    ctx.fill();
                });

                requestAnimationFrame(animate);  // Request the next animation frame
            };

            animate();
        }
    });

    return $.doroshko.snowfallEffect;
});
