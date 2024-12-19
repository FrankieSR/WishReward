define(["jquery", "jquery/ui"], function ($) {
    "use strict";

    $.widget("doroshko.lotteryWheel", {
        options: {
            items: [],
            rotationDuration: 6000,
            onSpinEnd: null,
            colors: ["#FFD700", "#f81e3d"],
            textColor: "#fff",
            borderColor: "#07403a",
            borderWidth: 0,
            centerColor: "#07403a",
            pointerColor: "#fff",
            outerRingColor: "#07403a",
            outerRingWidth: 8,
            wheelRadius: 200
        },

        _create: function () {
            this._applyStyleTheme();
            this._renderWheel();
            this.currentRotation = 0;
        },

        _applyStyleTheme: function () {
            this.options.items.forEach((item, index) => {
                console.log(this.options.items, 'this.options.items');
                if (!item.color) {
                    item.color = this.options.colors[index % this.options.colors.length];
                }
            });
        },

        _renderWheel: function () {
            console.log(this.options.wheelRadius, 'mainContainer');
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
        
            // Внешний обод
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
        
                const largeArcFlag = sectorAngle > 180 ? 1 : 0;
        
                const x1 = centerX + wheelRadius * Math.cos((startAngle * Math.PI) / 180);
                const y1 = centerY + wheelRadius * Math.sin((startAngle * Math.PI) / 180);
                const x2 = centerX + wheelRadius * Math.cos((endAngle * Math.PI) / 180);
                const y2 = centerY + wheelRadius * Math.sin((endAngle * Math.PI) / 180);
        
                // Создание сектора
                const path = document.createElementNS(svgNS, "path");
                path.setAttribute(
                    "d",
                    `M ${centerX} ${centerY} L ${x1} ${y1} A ${wheelRadius} ${wheelRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
                );
                path.setAttribute("fill", item.color);
                path.setAttribute("stroke", this.options.borderColor);
                path.setAttribute("stroke-width", this.options.borderWidth);
                path.setAttribute("stroke-linejoin", "round");
                svg.appendChild(path);
        
                // Текст в секторе
                const textAngle = (startAngle + endAngle) / 2; // Центр сектора
                const textRadius = wheelRadius * 0.7; // Радиус для текста
                const textX = centerX + textRadius * Math.cos((textAngle * Math.PI) / 180);
                const textY = centerY + textRadius * Math.sin((textAngle * Math.PI) / 180);
        
                const text = document.createElementNS(svgNS, "text");
                text.setAttribute("x", textX);
                text.setAttribute("y", textY);
                text.setAttribute("fill", this.options.textColor);
                text.setAttribute("font-size", "16");
                text.setAttribute("font-family", "Arial, sans-serif");
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
        
            // Указатель (капля)
            const pointer = $("<div>", { class: "wheel-pointer" }).css({
                position: "absolute",
                width: "20px",
                height: "50px",
                backgroundColor: "#ffffff",
                border: "3px solid #d3d3d3",
                borderRadius: "50%",
                clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
                top: `0px`,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
            });
        
            this.element.append(svg).append(pointer);
        },
        
        
        spinToItem: function (id, data = {}) {
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
                        const winningItem = this.options.items[targetIndex];
                        this.options.onSpinEnd({ id: winningItem.id, label: winningItem.label, data });
                    }
                }
            };

            requestAnimationFrame(animate);
        },
    });

    return $.doroshko.lotteryWheel;
});
