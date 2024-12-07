define(["jquery", "jquery/ui"], function ($) {
    "use strict";

    $.widget("doroshko.lotteryWheel", {
        options: {
            items: [],
            rotationDuration: 5000,
            onSpinEnd: null,
        },

        _create: function () {
            this._renderWheel();
            this.currentRotation = 0;
        },

        _renderWheel: function () {
            const svgNS = "http://www.w3.org/2000/svg";
            const numItems = this.options.items.length;
            const sectorAngle = 360 / numItems;
            const wheelRadius = 150;
            const centerX = wheelRadius;
            const centerY = wheelRadius;

            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("class", "wheel");
            svg.setAttribute("width", `${wheelRadius * 2}px`);
            svg.setAttribute("height", `${wheelRadius * 2}px`);
            svg.setAttribute("viewBox", `0 0 ${wheelRadius * 2} ${wheelRadius * 2}`);

            this.options.items.forEach((item, index) => {
                const startAngle = index * sectorAngle - 90; // Сектор начинается от -90°
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

                svg.appendChild(path);

                const textAngle = startAngle + sectorAngle / 2;
                const textX =
                    centerX + (wheelRadius / 1.5) * Math.cos((textAngle * Math.PI) / 180);
                const textY =
                    centerY + (wheelRadius / 1.5) * Math.sin((textAngle * Math.PI) / 180);

                const text = document.createElementNS(svgNS, "text");
                text.setAttribute("x", textX);
                text.setAttribute("y", textY);
                text.setAttribute("fill", "#fff");
                text.setAttribute("font-size", "12");
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("alignment-baseline", "middle");
                text.textContent = item.label;

                svg.appendChild(text);
            });

            const pointer = $("<div>", { class: "pointer" });

            this.element.append(svg).append(pointer);
        },

        spinToItem: function (value) {
            const targetIndex = this.options.items.findIndex(
                (item) => item.value === value
            );
            if (targetIndex === -1) {
                console.error(`Value "${value}" not found in items.`);
                return;
            }

            const numItems = this.options.items.length;
            const sectorAngle = 360 / numItems;

            // Рассчитываем угол для целевого сектора
            const targetAngle = 360 - (targetIndex * sectorAngle + sectorAngle / 2);

            const rotations = 5; // Количество полных оборотов
            const finalRotation = rotations * 360 + targetAngle;

            // Анимация вращения
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
                        this.options.onSpinEnd(value);
                    }
                }
            };

            requestAnimationFrame(animate);
        },
    });

    return $.doroshko.lotteryWheel;
});
