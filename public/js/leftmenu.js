$(function () {
    $(".dt").click(function () {
        var none = $(this).next().css("display");
        if (none == "block") {
            //$("dd").slideUp();
            $(this).next().slideUp();
            //$(this).find("span").text("+");
        } else {
            $(this).next().slideDown();
            //$(this).find("span").text("-");
        }
    });
    // // 点击增加的左边菜单栏的样式
  
    // //console.log($("head title").text("realAuth实名认证"));
    // //$(".brl a").each(function(){
    //     if($("head title").text()==="real-name"){
    //         $(".real-name").css("color","#fff").closest("p").addClass("activee");
    //     }else if($("head title").text()==="personal1"){
    //         $(".account").css("color","#fff").closest("p").addClass("activee");
    //     }
    //})
})