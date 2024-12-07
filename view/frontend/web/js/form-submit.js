define([
    'jquery',
    'Doroshko_WishReward/js/lotteryWheel',
    'mage/url',
    'Magento_Ui/js/modal/alert'
], function ($, urlBuilder, alert) {    
    $("#wheel-container").lotteryWheel({
        items: [
            { label: "Prize 1", color: "#ff0000", value: "1" },
            { label: "Prize 2", color: "#00ff00", value: "2" },
            { label: "Prize 3", color: "#0000ff", value: "3" },
            { label: "Prize 4", color: "#ffff00", value: "4" },
            { label: "Prize 5", color: "#ff00ff", value: "5" },
        ],
        rotationDuration: 5000,
        onSpinEnd: function (value) {
            console.log("Stopped on value:", value);
        },
    });
    
    $("#spin-button").on("click", function () {
        $("#wheel-container").lotteryWheel("spinToItem", "3");
    });
});
