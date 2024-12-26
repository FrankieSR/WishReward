define(["jquery", "jquery/ui"], function ($) {
    "use strict";

    $.widget("doroshko.lotteryWheel", {
        options: {
            items: [],
            rotationDuration: 6000,
            onSpinEnd: null,
            colors: ["rgba(255, 69, 0, 0.9)", "#FFD700", "#018749"],
            textColor: "#000",
            borderColor: "#1C2541",
            borderWidth: 1,
            centerColor: "#0B132B",
            pointerColor: "#018749",
            outerRingColor: "#1C2541",
            outerRingWidth: 10,
            wheelRadius: 140,
        },

        _create: function () {
            this._applyStyleTheme();
            this._renderWheel();
            this.currentRotation = 0;
        },

        _applyStyleTheme: function () {
            this.options.items.forEach((item, index) => {
                if (!item.color) {
                    item.color = this.options.colors[index % this.options.colors.length];
                }
            });
        },

        _renderWheel: function () {
            const svgNS = "http://www.w3.org/2000/svg";
            const numItems = this.options.items.length;
            const sectorAngle = 360 / numItems;
            const wheelRadius = this.options.wheelRadius;
            const centerX = wheelRadius + this.options.outerRingWidth;
            const centerY = wheelRadius + this.options.outerRingWidth;
            const totalRadius = wheelRadius + this.options.outerRingWidth;

            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("class", "wheel");
            svg.setAttribute("width", `${totalRadius * 2}px`);
            svg.setAttribute("height", `${totalRadius * 2}px`);
            svg.setAttribute("viewBox", `0 0 ${totalRadius * 2} ${totalRadius * 2}`);

            const outerRing = document.createElementNS(svgNS, "circle");
            outerRing.setAttribute("cx", centerX);
            outerRing.setAttribute("cy", centerY);
            outerRing.setAttribute("r", totalRadius - this.options.outerRingWidth / 2);
            outerRing.setAttribute("fill", "none");
            outerRing.setAttribute("stroke", this.options.outerRingColor);
            outerRing.setAttribute("stroke-width", this.options.outerRingWidth);
            svg.appendChild(outerRing);

            this.options.items.forEach((item, index) => {
                const startAngle = index * sectorAngle - 90;
                const endAngle = (index + 1) * sectorAngle - 90;

                const largeArcFlag = sectorAngle > 180 ? 1 : 0;

                const x1 = centerX + wheelRadius * Math.cos((startAngle * Math.PI) / 180);
                const y1 = centerY + wheelRadius * Math.sin((startAngle * Math.PI) / 180);
                const x2 = centerX + wheelRadius * Math.cos((endAngle * Math.PI) / 180);
                const y2 = centerY + wheelRadius * Math.sin((endAngle * Math.PI) / 180);

                const path = document.createElementNS(svgNS, "path");
                path.setAttribute(
                    "d",
                    `M ${centerX} ${centerY} L ${x1} ${y1} A ${wheelRadius} ${wheelRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
                );
                path.setAttribute("fill", item.color);
                path.setAttribute("stroke", this.options.borderColor);
                path.setAttribute("stroke-width", this.options.borderWidth);
                svg.appendChild(path);

                const textAngle = (startAngle + endAngle) / 2;
                const textRadius = wheelRadius * 0.65;
                const textX = centerX + textRadius * Math.cos((textAngle * Math.PI) / 180);
                const textY = centerY + textRadius * Math.sin((textAngle * Math.PI) / 180);
        
                const text = document.createElementNS(svgNS, "text");
                text.setAttribute("x", textX);
                text.setAttribute("y", textY);
                text.setAttribute("fill", this.options.textColor);
                text.setAttribute("font-size", "18");
                text.setAttribute("font-weight", "bold");
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("alignment-baseline", "middle");
                text.setAttribute(
                    "transform",
                    `rotate(${textAngle}, ${textX}, ${textY})`
                );
                text.textContent = item.label;
        
                svg.appendChild(text);
            });

            const centerCircle = document.createElementNS(svgNS, "circle");
            centerCircle.setAttribute("cx", centerX);
            centerCircle.setAttribute("cy", centerY);
            centerCircle.setAttribute("r", wheelRadius * 0.1);
            centerCircle.setAttribute("fill", this.options.centerColor);
            svg.appendChild(centerCircle);

            const pointer = $("<div>", { class: "wheel-pointer" }).css({
                position: "absolute",
                width: "0",
                height: "0",
                borderLeft: "15px solid transparent",
                borderRight: "15px solid transparent",
                borderBottom: `30px solid ${this.options.pointerColor}`,
                top: `5px`,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
            });

            this.element.append(svg).append(pointer);
        },

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

                this.element
                    .find(".wheel")
                    .css("transform", `rotate(${currentRotation % 360}deg)`);

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.currentRotation = currentRotation % 360;

                    if (typeof this.options.onSpinEnd === "function" || typeof onSpinEndCallback === "function") {
                        const winningItem = this.options.items[targetIndex];
                        const onSpinEndData = { id: winningItem.id, label: winningItem.label, data };

                        onSpinEndCallback(onSpinEndData) || this.options.onSpinEnd(onSpinEndData);
                    }
                }
            };

            requestAnimationFrame(animate);
        },
    });

    return $.doroshko.lotteryWheel;
});
