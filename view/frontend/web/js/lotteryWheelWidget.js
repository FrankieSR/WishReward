define(["jquery", "jquery/ui"], function ($) {
    "use strict";

    $.widget("doroshko.lotteryWheel", {
        options: {
            items: [],
            rotationDuration: 6000,
            colors: ["rgba(255, 69, 0, 0.9)", "#FFD700", "#018749"],
            textColor: "#000",
            borderColor: "#1C2541",
            borderWidth: 1,
            centerColor: "#0B132B",
            pointerColor: "#018749",
            outerRingColor: "#1C2541",
            outerRingWidth: 10,
            wheelRadius: 140,
            fontSize: 18,
            fontWeight: "bold",
            onSpinEnd: () => {}, // User callback
        },

        /**
         * Initializes the widget. Sets up initial values and renders the wheel.
         * This function is called when the widget is created.
         */
        _create: function () {
            this.currentRotation = 0;

            this._applyStyleTheme();
            this._renderWheel();
        },

        /**
         * Applies a color theme to each item in the wheel.
         * If no specific color is defined for an item, it will be assigned a color from the default color array.
         */
        _applyStyleTheme: function () {
            this.options.items.forEach((item, index) => {
                item.color = item.color || this.options.colors[index % this.options.colors.length];
            });
        },

        /**
         * Renders the entire wheel, including the outer ring, sectors, center circle, and pointer.
         * Appends the SVG wheel to the widget element.
         */
        _renderWheel: function () {
            const svg = this._createSVG();
            this._renderOuterRing(svg);
            this._renderSectors(svg);
            this._renderCenterCircle(svg);
            this._renderPointer();

            this.element.append(svg);
        },

        /**
         * Creates an SVG element for the wheel.
         * Sets the dimensions of the SVG based on the wheel radius and outer ring width.
         *
         * @return {SVGElement} The created SVG element.
         */
        _createSVG: function () {
            const totalRadius = this.options.wheelRadius + this.options.outerRingWidth;
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("class", "wheel");
            svg.setAttribute("width", `${totalRadius * 2}px`);
            svg.setAttribute("height", `${totalRadius * 2}px`);
            svg.setAttribute("viewBox", `0 0 ${totalRadius * 2} ${totalRadius * 2}`);
            return svg;
        },

        /**
         * Renders the outer ring of the wheel.
         * The outer ring is drawn as a circle with the defined color and stroke width.
         *
         * @param {SVGElement} svg The SVG element to append the outer ring to.
         */
        _renderOuterRing: function (svg) {
            const totalRadius = this.options.wheelRadius + this.options.outerRingWidth;
            const centerX = totalRadius;
            const centerY = totalRadius;

            const outerRing = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            outerRing.setAttribute("cx", centerX);
            outerRing.setAttribute("cy", centerY);
            outerRing.setAttribute("r", totalRadius - this.options.outerRingWidth / 2);
            outerRing.setAttribute("fill", "none");
            outerRing.setAttribute("stroke", this.options.outerRingColor);
            outerRing.setAttribute("stroke-width", this.options.outerRingWidth);

            svg.appendChild(outerRing);
        },

        /**
         * Renders the sectors of the wheel, creating paths and placing the corresponding text inside each sector.
         *
         * @param {SVGElement} svg The SVG element to append the sectors to.
         */
        _renderSectors: function (svg) {
            const { items, wheelRadius, borderColor, borderWidth, textColor, fontSize, fontWeight } = this.options;
            const numItems = items.length;
            const sectorAngle = 360 / numItems;
            const centerX = wheelRadius + this.options.outerRingWidth;
            const centerY = wheelRadius + this.options.outerRingWidth;

            items.forEach((item, index) => {
                const startAngle = index * sectorAngle - 90;
                const endAngle = (index + 1) * sectorAngle - 90;

                const path = this._createSectorPath(startAngle, endAngle, wheelRadius, centerX, centerY, item.color);
                path.setAttribute("stroke", borderColor);
                path.setAttribute("stroke-width", borderWidth);
                svg.appendChild(path);

                const text = this._createSectorText(item.label, startAngle, endAngle, wheelRadius, centerX, centerY);
                text.setAttribute("fill", textColor);
                text.setAttribute("font-size", fontSize);
                text.setAttribute("font-weight", fontWeight);
                svg.appendChild(text);
            });
        },

        /**
         * Creates the path (SVG path element) for a sector based on the given angles and radius.
         *
         * @param {number} startAngle The starting angle of the sector.
         * @param {number} endAngle The ending angle of the sector.
         * @param {number} radius The radius of the wheel.
         * @param {number} cx The center x-coordinate of the wheel.
         * @param {number} cy The center y-coordinate of the wheel.
         * @param {string} color The color to fill the sector.
         * 
         * @return {SVGElement} The created SVG path element representing the sector.
         */
        _createSectorPath: function (startAngle, endAngle, radius, cx, cy, color) {
            const largeArcFlag = (endAngle - startAngle) > 180 ? 1 : 0;
            const x1 = cx + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = cy + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = cx + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = cy + radius * Math.sin((endAngle * Math.PI) / 180);

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`);
            path.setAttribute("fill", color);
            return path;
        },

        /**
         * Creates the text element for a sector.
         * The text is placed at the calculated position based on the sector's angle and radius.
         * The text is also rotated to remain upright or perpendicular to the wheel's center.
         *
         * @param {string} text The text to display in the sector.
         * @param {number} startAngle The starting angle of the sector.
         * @param {number} endAngle The ending angle of the sector.
         * @param {number} radius The radius of the wheel.
         * @param {number} cx The center x-coordinate of the wheel.
         * @param {number} cy The center y-coordinate of the wheel.
         * 
         * @return {SVGElement} The created SVG text element.
         */
        _createSectorText: function (text, startAngle, endAngle, radius, cx, cy) {
            const angle = (startAngle + endAngle) / 2;
            const textRadius = radius * 0.65;
            const x = cx + textRadius * Math.cos((angle * Math.PI) / 180);
            const y = cy + textRadius * Math.sin((angle * Math.PI) / 180);

            const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textElement.setAttribute("x", x);
            textElement.setAttribute("y", y);
            textElement.setAttribute("text-anchor", "middle");
            textElement.setAttribute("alignment-baseline", "middle");
            textElement.textContent = text;

            // Adding rotation to keep the text upright or perpendicular to the center
            const rotationAngle = angle > 90 && angle < 270 ? angle + 180 : angle;
            textElement.setAttribute(
                "transform",
                `rotate(${rotationAngle}, ${x}, ${y})`
            );

            return textElement;
        },

        /**
         * Renders the center circle of the wheel.
         * The center circle is typically smaller and has a different color to distinguish it from the wheel.
         *
         * @param {SVGElement} svg The SVG element to append the center circle to.
         */
        _renderCenterCircle: function (svg) {
            const centerX = this.options.wheelRadius + this.options.outerRingWidth;
            const centerY = this.options.wheelRadius + this.options.outerRingWidth;

            const centerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            centerCircle.setAttribute("cx", centerX);
            centerCircle.setAttribute("cy", centerY);
            centerCircle.setAttribute("r", this.options.wheelRadius * 0.1);
            centerCircle.setAttribute("fill", this.options.centerColor);

            svg.appendChild(centerCircle);
        },

        /**
         * Renders the pointer element above the wheel.
         * The pointer is used to indicate the winning sector when the wheel stops spinning.
         */
        _renderPointer: function () {
            $("<div>", { class: "wheel-pointer" })
                .css({
                    position: "absolute",
                    width: 0,
                    height: 0,
                    borderLeft: "15px solid transparent",
                    borderRight: "15px solid transparent",
                    borderBottom: `30px solid ${this.options.pointerColor}`,
                    top: "5px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 10,
                })
                .appendTo(this.element);
        },

        /**
         * Spins the wheel to a specific item based on its ID.
         * Animates the wheel spin and calls the provided callback once the spin ends.
         *
         * @param {string} id The ID of the target item to spin to.
         * @param {Object} [data={}] Optional data to be passed to the callback.
         * @param {Function} [onSpinEndCallback] Optional callback to be executed after the spin ends.
         */
        spinToItem: function (id, data = {}, onSpinEndCallback) {
            const targetIndex = this.options.items.findIndex((item) => item.id === id);
            if (targetIndex === -1) {
                console.error(`Item with ID "${id}" not found.`);
                return;
            }

            const numItems = this.options.items.length;
            const sectorAngle = 360 / numItems;
            const targetAngle = 360 - (targetIndex * sectorAngle + sectorAngle / 2);

            const rotations = 5;
            const finalRotation = rotations * 360 + targetAngle;

            this._animateSpin(finalRotation, targetIndex, data, onSpinEndCallback);
        },

        /**
         * Animates the spin of the wheel.
         * Applies easing to create a smooth spinning effect.
         *
         * @param {number} finalRotation The final rotation angle the wheel should spin to.
         * @param {number} targetIndex The index of the target item to stop at.
         * @param {Object} data Optional data to pass to the callback.
         * @param {Function} onSpinEndCallback Optional callback to be executed after the spin ends.
         */
        _animateSpin: function (finalRotation, targetIndex, data, onSpinEndCallback) {
            const duration = this.options.rotationDuration;
            const easingOut = (t) => 1 - Math.pow(1 - t, 3);

            let startTime = null;
            const startRotation = this.currentRotation;

            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;

                const t = Math.min(elapsed / duration, 1);
                const easedT = easingOut(t);
                const currentRotation =
                    startRotation + easedT * (finalRotation - startRotation);

                this.element.find(".wheel").css("transform", `rotate(${currentRotation % 360}deg)`);

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.currentRotation = currentRotation % 360;

                    const winningItem = this.options.items[targetIndex];
                    const result = { id: winningItem.id, label: winningItem.label, data };

                    if (onSpinEndCallback) onSpinEndCallback(result);
                    if (typeof this.options.onSpinEnd === "function") this.options.onSpinEnd(result);
                }
            };

            requestAnimationFrame(animate);
        },
    });

    return $.doroshko.lotteryWheel;
});
