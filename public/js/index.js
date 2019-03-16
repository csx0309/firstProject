 $(function() {
     //分页函数的封装

     var fenye = function(data, shuliang) {
         $('.pagination').remove();
         $(".pagesSubstr").append('<ul id="pagination" class="pagination"></ul>');
         var pagesize = shuliang; // 自己定一个每页显示多少条
         var totalcount = data.length; // 计算出数据总条数
         var totalpage = Math.ceil(totalcount / pagesize); // 计算出总页数              
         $('#pagination').twbsPagination({
             totalPages: totalpage, // 总页数
             visiblePages: 5, // 当前展示几页
             first: '首页',
             next: '下一页',
             prev: '上一页',
             last: '尾页',
             onPageClick: function(event, page) { // 点击页码， 触发事件
                 var start = (page - 1) * pagesize;
                 var end = Math.min(start + pagesize, totalcount);
                 var arr = data.slice(start, end);
                 // 渲染模板
                 var rst = template('tmpl', { dd: arr });
                 $('.right-con').html(rst);
             }
         })
     }
     //请求搜索的路由
     $('#btnsearch').click(function() {
         var seacon = $('#searchcon').val();
         location.href = 'searchcon.html?name=' + seacon;
     })
     $('#searchcon').on('keypress', function(event) {
         if (event.keyCode == '13') {
             var seacon = $(this).val();
             location.href = 'searchcon.html?name=' + seacon;
         }
     })
     //显示所有数据
     // $.get("/bokecon/bokeshow", function(data) {
     //     fenye(data, 4)
     // })
     var pageSize = 4;
     var currentPage = 1;
     var maxPage;
     var html = function(currentPage) {

         $.get("/bokecon/show", { pageSize: pageSize, currentPage: currentPage }, function(data) {
             var arr = data.logList;
             var rst = template('tmpl', { dd: arr });
             $('.right-con').html(rst);
         })
     }
     // 20181225
     $.get("/bokecon/show", { pageSize: pageSize, currentPage: currentPage }, function(data) {
       
         var arr = data.logList;
         var rst = template('tmpl', { dd: arr });
         $('.right-con').html(rst);
         $(".totalPage").text(data.totalPages);
         maxPage = data.totalPages;
     })
     $(".page").click(function() {
         var val = $(".noePage").val();
         var pageNum = $(this).attr("data-page");
         switch (pageNum) {
             case "firstPage":
                 if (val != 1) {
                     html(1)
                     $(".noePage").val("1")
                 };
                 break;
             case "lastPage":
                 if (val == 1) {
                     val == 1
                     $(".noePage").val("1");
                 } else {
                     val -= 1;
                     $(".noePage").val(val);
                     html(val)
                 }

                 break;
             case "nextPage":
                 if (val >= maxPage) {

                 } else {
                     val = parseInt(val) + 1;
                     html(val)
                     $(".noePage").val(val);
                 }

                 break;
             case "endPage":
                 html(maxPage)
                 $(".noePage").val(maxPage);
                 break;
         }
     })
     // 请求添加内容的类型的数量返回的是一个数组
     $.get("/bokecon/typenum", function(data) {
         var html = template("typeNumtmpl", {
             typenum: data
         })
         $("#typeNum").html(html);
     })
     $(document).click(function() {
         $('.nav-list').removeClass('open')
     })
     $('.nav-menu,.nav-list').click(function(e) {
         e.stopPropagation()
     })
     $('nav').find('.nav-menu').click(function(e) {
         $('.nav-list').toggleClass('open')
     })
     // 返回顶部

     $(document).ready(function() {
         $(".side ul li").hover(function() {
             $(this).find(".sidebox").stop().animate({
                 "width": "150px"
             }, 200).css({
                 "opacity": "1",
                 "filter": "Alpha(opacity=100)",
                 "background": "#ae1c1c"
             })
         }, function() {

             $(this).find(".sidebox").stop().animate({
                 "width": "54px"
             }, 600).css({
                 "opacity": "0.8",
                 "filter": "Alpha(opacity=80)",
                 "background": "#000"
             })
         });
     });
     //回到顶部
     function goTop() {
         $('html,body').animate({
             'scrollTop': 0
         }, 600);
     }
     //获取每日一语的数据
     $.get('/bokecon/meiri', function(data) {
         function getshu(min, max) {
             return Math.floor(Math.random() * (max - min + 1)) + min;
         }
         var num = getshu(0, data.length - 1);
         $('.meiri-con').html(data[num].liaocontent);
     })
     //点击右侧菜单刷新数据

     $('#typeNum').click(function(e) {
         var ty = e.target.getAttribute('data-ty');
         $.post('/bokecon/menulist', { ty: ty }, function(da) {
             fenye(da, 1)
             // var html = template("tmpl", {
             // dd: data
             // })
             // $(".right-con").html(html);
         })
     })
 })