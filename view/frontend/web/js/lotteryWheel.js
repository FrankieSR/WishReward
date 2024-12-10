define(["jquery", "jquery/ui"], function ($) {
    "use strict";

    $.widget("doroshko.lotteryWheel", {
        options: {
            items: [],
            rotationDuration: 5000,
            onSpinEnd: null,
            defaultColors: ["#f44336", "#4caf50"], // Красный и зеленый по умолчанию
            borderColor: "#000", // Черная граница секторов
            centerColor: "#fff", // Центральный круг белого цвета
            textColor: "#000", // Черный цвет текста
            borderWidth: 2, // Ширина линии границы
            outerRingColor: "#000", // Цвет внешней полосы
            outerRingWidth: 10, // Ширина внешней полосы
        },

        _create: function () {
            this._applyDefaultColors();
            this._renderWheel();
            this.currentRotation = 0;
        },

        _applyDefaultColors: function () {
            this.options.items.forEach((item, index) => {
                if (!item.color) {
                    item.color =
                        this.options.defaultColors[index % this.options.defaultColors.length];
                }
            });
        },

        _renderWheel: function () {
            const svgNS = "http://www.w3.org/2000/svg";
            const numItems = this.options.items.length;
            const sectorAngle = 360 / numItems;
            const wheelRadius = 150;
            const centerX = wheelRadius + this.options.outerRingWidth;
            const centerY = wheelRadius + this.options.outerRingWidth;
            const totalRadius = wheelRadius + this.options.outerRingWidth;

            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("class", "wheel");
            svg.setAttribute("width", `${totalRadius * 2}px`);
            svg.setAttribute("height", `${totalRadius * 2}px`);
            svg.setAttribute("viewBox", `0 0 ${totalRadius * 2} ${totalRadius * 2}`);

            // Внешняя полоса
            const outerRing = document.createElementNS(svgNS, "circle");
            outerRing.setAttribute("cx", centerX);
            outerRing.setAttribute("cy", centerY);
            outerRing.setAttribute("r", totalRadius - this.options.outerRingWidth / 2);
            outerRing.setAttribute("fill", "none");
            outerRing.setAttribute("stroke", this.options.outerRingColor);
            outerRing.setAttribute("stroke-width", this.options.outerRingWidth);
            svg.appendChild(outerRing);

            // Генерация секторов
            this.options.items.forEach((item, index) => {
                const startAngle = index * sectorAngle - 90;
                const endAngle = (index + 1) * sectorAngle - 90;

                const x1 = centerX + wheelRadius * Math.cos((startAngle * Math.PI) / 180);
                const y1 = centerY + wheelRadius * Math.sin((startAngle * Math.PI) / 180);

                const x2 = centerX + wheelRadius * Math.cos((endAngle * Math.PI) / 180);
                const y2 = centerY + wheelRadius * Math.sin((endAngle * Math.PI) / 180);

                const path = document.createElementNS(svgNS, "path");
                const largeArcFlag = sectorAngle > 180 ? 1 : 0;

                path.setAttribute(
                    "d",
                    `M ${centerX} ${centerY} L ${x1} ${y1} A ${wheelRadius} ${wheelRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
                );
                path.setAttribute("fill", item.color);
                path.setAttribute("stroke", this.options.borderColor);
                path.setAttribute("stroke-width", this.options.borderWidth);

                svg.appendChild(path);

                // Текст в секторе
                const textAngle = startAngle + sectorAngle / 2;
                const textX =
                    centerX + (wheelRadius / 1.5) * Math.cos((textAngle * Math.PI) / 180);
                const textY =
                    centerY + (wheelRadius / 1.5) * Math.sin((textAngle * Math.PI) / 180);

                const text = document.createElementNS(svgNS, "text");
                text.setAttribute("x", textX);
                text.setAttribute("y", textY);
                text.setAttribute("fill", this.options.textColor);
                text.setAttribute("font-size", "12");
                text.setAttribute("font-family", "Arial, sans-serif");
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("alignment-baseline", "middle");
                text.textContent = item.label;

                svg.appendChild(text);
            });

            // Центральный круг
            const centerCircle = document.createElementNS(svgNS, "circle");
            centerCircle.setAttribute("cx", centerX);
            centerCircle.setAttribute("cy", centerY);
            centerCircle.setAttribute("r", wheelRadius / 6);
            centerCircle.setAttribute("fill", this.options.centerColor);
            centerCircle.setAttribute("stroke", this.options.borderColor);
            centerCircle.setAttribute("stroke-width", this.options.borderWidth);

            svg.appendChild(centerCircle);

            // Указатель (Pointer)
            const pointer = $("<div>", { class: "pointer" }).css({
                position: "absolute",
                width: "30px",
                height: "50px",
                backgroundColor: this.options.borderColor,
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                top: `-${this.options.outerRingWidth + 40}px`,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
            });

            this.element.append(svg).append(pointer);
        },

        spinToItem: function (id) {
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

                    if (typeof this.options.onSpinEnd === "function") {
                        this.options.onSpinEnd(id);
                    }
                }
            };

            requestAnimationFrame(animate);
        },
    });

    return $.doroshko.lotteryWheel;
});
