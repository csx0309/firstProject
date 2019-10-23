var express = require("express");
var router = express.Router();
var mongoose = require("./mongo");
var cookie = require("cookie");
var http = require("http");
// 类似与jq来获取dom节点
var cheerio = require("cheerio");
// cheerio处理乱码的问题111
var iconv = require("iconv-lite");

const bodyParser = require("body-parser");

var multipart = require("connect-multiparty"); //在处理模块中引入第三方解析模块
var multipartMiddleware = multipart();
var uploadPath = "./public/upload";
var md5Path = "./public/file-md5";

var fs = require("fs");
var path = require("path");

var fileIndex = 1;
//解析需要遍历的文件夹，我这以E盘根目录为例
// var filePath = path.resolve('D:\app');
var filePath = path.resolve(__dirname, "..", "./upload");
// 查找文件夹
router.get("/wenjian", function(req, res, next) {
  fs.readdir(filePath, function(err, files) {
    res.json({
      downloadList: files
    });
  });
});
router.post("/bokeadd", function(req, res, next) {
  var tbtitle = req.body.tbtitle;
  var tbauthor = req.body.tbauthor;
  var tbsource = req.body.tbsource;
  var tbcontent = req.body.tbcontent;
  var tbtype = req.body.tbtype;
  var ctime = Date.parse(new Date());
  var bokeContent = new bokemodel({
    tbtitle: tbtitle,
    tbauthor: tbauthor,
    tbsource: tbsource,
    tbcontent: tbcontent,
    ctime: ctime,
    tbtype: tbtype
  });
  bokeContent.save(function(err) {
    if (!err) {
      res.send(true);
      console.log("数据添加成功" + ctime);
    }
  });
});
// 显示数据库中的内容
router.get("/bokeshow", function(req, res, next) {
  bokemodel
    .find({}, function(err, data) {
      if (!err) {
        res.send(data);
      }
    })
    .sort({ ctime: -1 });
});
// 分页
router.get("/show", function(req, res, next) {
  //1. 每页显示数量,必须转换为数字,否则查询不到数据
  var pageSize = parseInt(req.query.pageSize);
  //2. 当前页
  var currentPage = parseInt(req.query.currentPage);

  //3. 执行全集合查询
  bokemodel.find({}, function(err, totalData) {
    if (!err) {
      //4. 总记录数
      var totalRecordsCount = totalData.length;

      //5. 总页数
      var totalPages = Math.ceil(totalRecordsCount / pageSize);

      //6. 每一页的开始记录位置
      var recordStart = (currentPage - 1) * pageSize;

      /*显示第 start 至 end 项记录
            显示第 1 至 4 项记录    第一页    4条
            显示第 5 至 8 项记录    第二页    4条
            显示第 9 至 12 项记录   第三页    4条
            显示第 13 至 15 项记录  第四页    3条*/

      //7. 每一次发起分页数据显示时,只发送当前页的数据到前台
      //db.collection.find().skip(跳过上一页的数据量).limit(每页显示的大小)    可用来做分页，跳过5条数据再取5条数据
      //pagerData 每页显示的数据
      bokemodel
        .find({}, function(err, pagerData) {
          //console.log(pagerData); //默认是第一页的5条数据

          //封装发到前台的数据
          var resultJson = {
            pageSize: pageSize,
            currentPage: currentPage,
            totalRecordsCount: totalRecordsCount,
            totalPages: totalPages,
            recordStart: recordStart,
            logList: pagerData //每页显示的数据
          };
          //发送封装的数据到前台
          res.send(resultJson);
        })
        .sort({ ctime: -1 })
        .skip(recordStart)
        .limit(pageSize);
    }
  });
});
//显示单页面的内容
router.get("/content.html", function(req, res) {
  var id = req.query.id;
  bokemodel.findById(id).exec(function(err, data) {
    res.send(data);
  });
});
var multer = require("multer");
//获取时间
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate =
    date.getFullYear() + seperator1 + month + seperator1 + strDate;
  return currentdate.toString();
}
var datatime = "public/images/";
//将图片放到服务器
var multer = require("multer");
var storage = multer.diskStorage({
  // 如果你提供的 destination 是一个函数，你需要负责创建文件夹
  destination: datatime,
  //给上传文件重命名，获取添加后缀名
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({
  storage: storage
});

// multer
router.post("/uploads", upload.single("logo"), function(req, res, next) {
  res.send({ ret_code: "0" });
});
// 上传文件
router.post("/upload", multipartMiddleware, (req, res, next) => {
  let data = req.body;
  let fileData = req.files.fileContent;
  console.log("data", data);
  console.log("fileData", fileData);
  res.writeHead(200, { "Content-Type": "text/plain" });

  // 上传目录是否存在，不存在则创建
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
  }

  // 保存文件MD5的目录是否存在，不存在则创建
  if (!fs.existsSync(md5Path)) {
    fs.mkdirSync(md5Path);
  }

  if (fileIndex == 1) {
    if (fs.existsSync(md5Path + "/md5.txt")) {
      let fileContent = fs.readFileSync(md5Path + "/md5.txt", "utf-8");
      if (fileContent.indexOf(`[${data.fileMD5}]`) != -1) {
        res.write(JSON.stringify({ exist: 1, success: true }));
        res.end();
        return;
      }
    } else {
      fs.writeFile(md5Path + "/md5.txt", "");
    }
  }

  if (fileIndex == data.fileChunks) {
    fileIndex = 1;
    fs.renameSync(fileData.path, "./public/upload/" + data.fileName);
    fs.appendFileSync(md5Path + "./md5.txt", `[${data.fileMD5}]`);
  } else if (fileIndex == data.fileIndex) {
    fileIndex++;
    let fileChunk = fs.readFileSync(fileData.path);
    fs.appendFile("./public/upload/" + data.fileName, fileChunk);
  }

  res.write(JSON.stringify({ exist: 0, success: true }));
  res.end();
});
// 下载
router.get("/download", function(req, res, next) {
  var downId = req.query.downId;
  console.log(filePath + "/" + downId);
  res.download(filePath + "/" + downId);
  // 实现文件下载

  // res.setHeader('Content-type', 'application/octet-stream');
  //     res.setHeader('Content-Disposition', 'attachment;filename=aaa.txt');    // 'aaa.txt' can be customized.
  //     var fileStream = fs.createReadStream(filePath+"/"+downId);
  //     fileStream.on('data', function (data) {
  //         res.write(data, 'binary');
  //     });
  //     fileStream.on('end', function () {
  //         res.end();
  // })
});

// 获取dom节点信息
router.get("/getJobs", function(req, res, next) {
  // 浏览器端发来get请求
  var Res = res; //保存，防止下边的修改
  //url 获取信息的页面部分地址
  var url = "http://120.79.163.73/download/demo_symbol.html";

  http.get(url, function(res) {
    //通过get方法获取对应地址中的页面信息
    var chunks = [];
    var size = 0;
    res.on("data", function(chunk) {
      //监听事件 传输
      chunks.push(chunk);
      size += chunk.length;
    });
    res.on("end", function() {
      //数据传输完
      var data = Buffer.concat(chunks, size);
      var iconvData = iconv.decode(data, "utf-8");
      var html = iconvData.toString();
      //    console.log(html);
      var $ = cheerio.load(html, { decodeEntities: false }); //cheerio模块开始处理 DOM处理
      var jobs = [];
      var nameArrs = [];
      var jobs_list = $(".icon_lists li");
      $(".icon_lists>li").each(function() {
        //对页面岗位栏信息进行处理  每个岗位对应一个 li  ,各标识符到页面进行分析得出
        // var job = {};
        //  job.company = $(this).find(".hot_pos_r div").eq(1).find("a").html(); //公司名
        // job.period = $(this).find(".hot_pos_r span").eq(1).html(); //阶段
        var scale = $(this)
          .find(".fontclass")
          .html(); //规模
        var name = $(this)
          .find(".name")
          .html();
        //  job.name = $(this).find(".hot_pos_l a").attr("title"); //岗位名
        //   job.src = $(this).find(".hot_pos_l a").attr("href"); //岗位链接
        //    job.city = $(this).find(".hot_pos_l .c9").html(); //岗位所在城市
        //   job.salary = $(this).find(".hot_pos_l span").eq(1).html(); //薪资
        // job.exp = $(this).find(".hot_pos_l span").eq(2).html(); //岗位所需经验
        //  job.time = $(this).find(".hot_pos_l span").eq(5).html(); //发布时间

        // console.log(job.name);  //控制台输出岗位名
        // console.log(job.scale);  //控制台输出岗位名
        jobs.push(scale);
        nameArrs.push(name);
      });
      Res.json({
        //返回json格式数据给浏览器端
        jobs: jobs,
        nameArrs: nameArrs
      });
    });
  });
});

//获取种类的页面
router.get("/typecon.html", function(req, res) {
  var ty = req.query.ty;
  //1. 每页显示数量,必须转换为数字,否则查询不到数据
  var pageSize = parseInt(req.query.pageSize);
  //2. 当前页
  var currentPage = parseInt(req.query.currentPage);
  console.log(ty);
  // bokemodel.find({ tbtype: ty }, function(err, data) {
  //     if (!err) {
  //         res.send(data);
  //     }
  // })
  //3. 执行全集合查询
  bokemodel.find({ tbtype: ty }, function(err, totalData) {
    if (!err) {
      //4. 总记录数
      var totalRecordsCount = totalData.length;

      //5. 总页数
      var totalPages = Math.ceil(totalRecordsCount / pageSize);

      //6. 每一页的开始记录位置
      var recordStart = (currentPage - 1) * pageSize;

      /*显示第 start 至 end 项记录
            显示第 1 至 4 项记录    第一页    4条
            显示第 5 至 8 项记录    第二页    4条
            显示第 9 至 12 项记录   第三页    4条
            显示第 13 至 15 项记录  第四页    3条*/

      //7. 每一次发起分页数据显示时,只发送当前页的数据到前台
      //db.collection.find().skip(跳过上一页的数据量).limit(每页显示的大小)    可用来做分页，跳过5条数据再取5条数据
      //pagerData 每页显示的数据
      bokemodel
        .find({ tbtype: ty }, function(err, pagerData) {
          //console.log(pagerData); //默认是第一页的5条数据

          //封装发到前台的数据
          var resultJson = {
            pageSize: pageSize,
            currentPage: currentPage,
            totalRecordsCount: totalRecordsCount,
            totalPages: totalPages,
            recordStart: recordStart,
            logList: pagerData //每页显示的数据
          };
          //发送封装的数据到前台
          res.send(resultJson);
        })
        .sort({ ctime: -1 })
        .skip(recordStart)
        .limit(pageSize);
    }
  });
});
//获取type类别的数量
router.get("/typenum", function(req, res, next) {
  var typearr = ["HTML", "CSS", "JavaScript", "Java", "课外知识"];
  bokemodel.find({}, function(err, data) {
    if (err) {
      throw err;
    } else {
      tparr = [];
      (htmlnum = 0), (cssnum = 0), (jsnum = 0), (javanum = 0), (kewainum = 0);
      data.map(function(v, i) {
        tparr.push(v.tbtype);
        console.log(tparr);
      });
      tparr.map(function(v, i) {
        switch (v) {
          case "HTML":
            htmlnum += 1;
            break;
          case "CSS":
            cssnum += 1;
            break;
          case "JavaScript":
            jsnum += 1;
            break;
          case "Java":
            javanum += 1;
            break;
          case "课外知识":
            kewainum += 1;
            break;
        }
      });
      var shulnum = [
        { name: "HTML相关信息", tp: "HTML", ttnum: htmlnum },
        { name: "CSS相关信息", tp: "CSS", ttnum: cssnum },
        { name: "JavaScript相关信息", tp: "JavaScript", ttnum: jsnum },
        { name: "Java相关信息", tp: "Java", ttnum: javanum },
        { name: "课外知识相关信息", tp: "课外知识", ttnum: kewainum }
      ];
      res.send(shulnum);
    }
  });
});
//添加每日一语的视频
router.get("/liaomeiadd", function(req, res, next) {
  var liaocontent = req.query.liaocontent;
  var liaomeimo = new liaomeimodel({
    liaocontent: liaocontent
  });
  liaomeimo.save(function(err) {
    if (!err) {
      res.send(true);
      console.log("每日一语添加成功。。。");
    }
  });
});
//获取每日一语的全部数据
router.get("/meiri", function(req, res, next) {
  liaomeimodel.find({}, function(err, data) {
    if (!err) {
      res.send(data);
    }
  });
});
//删除数据
router.post("/dellist", function(req, res, next) {
  var id = req.body.id;
  console.log(id);
  bokemodel.remove({ _id: id }, function(err, uerlist) {
    if (!err) {
      res.send(true);
    }
  });
});
//获取种类的数据
router.post("/menulist", function(req, res, next) {
  var ty = req.body.ty;
  bokemodel
    .find({ tbtype: ty }, function(err, data) {
      if (!err) {
        res.send(data);
      }
    })
    .sort({ ctime: -1 });
});
//搜索的路由设置

router.get("/search.html", function(req, res, next) {
  var tbcontent = req.query.name;

  var searchcon = new RegExp(tbcontent);
  // bokemodel.find({ tbcontent: searchcon }, function(err, data) {
  //     if (!err) {
  //         console.log('数组的长度:' + data.length);
  //         if (data.length == 0) {
  //             res.send('');
  //             console.log('为空');
  //         } else {
  //             res.send(data);
  //         }

  //     }
  // })
  //1. 每页显示数量,必须转换为数字,否则查询不到数据
  var pageSize = parseInt(req.query.pageSize);
  //2. 当前页
  var currentPage = parseInt(req.query.currentPage);
  console.log("关键字为--" + currentPage);

  //3. 执行全集合查询
  bokemodel.find({ tbcontent: searchcon }, function(err, totalData) {
    if (!err) {
      //4. 总记录数
      var totalRecordsCount = totalData.length;

      //5. 总页数
      var totalPages = Math.ceil(totalRecordsCount / pageSize);

      //6. 每一页的开始记录位置
      var recordStart = (currentPage - 1) * pageSize;

      /*显示第 start 至 end 项记录
            显示第 1 至 4 项记录    第一页    4条
            显示第 5 至 8 项记录    第二页    4条
            显示第 9 至 12 项记录   第三页    4条
            显示第 13 至 15 项记录  第四页    3条*/

      //7. 每一次发起分页数据显示时,只发送当前页的数据到前台
      //db.collection.find().skip(跳过上一页的数据量).limit(每页显示的大小)    可用来做分页，跳过5条数据再取5条数据
      //pagerData 每页显示的数据
      bokemodel
        .find({ tbcontent: searchcon }, function(err, pagerData) {
          //console.log(pagerData); //默认是第一页的5条数据

          //封装发到前台的数据
          var resultJson = {
            pageSize: pageSize,
            currentPage: currentPage,
            totalRecordsCount: totalRecordsCount,
            totalPages: totalPages,
            recordStart: recordStart,
            logList: pagerData //每页显示的数据
          };
          //发送封装的数据到前台
          res.send(resultJson);
        })
        .sort({ ctime: -1 })
        .skip(recordStart)
        .limit(pageSize);
    }
  });
});
//登录路由
router.post("/checkLogin", function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  adminmodel.find({ username: username, password: password }, function(
    err,
    data
  ) {
    console.log(data);
    if (!err) {
      if (data.length) {
        //成功找到
        //设置cookie
        console.log(data);
        var userID = data[0]._id;
        console.log(userID);
        res.cookie("username", username);
        res.cookie("userID", userID);
        res.send(true);
      }
    }
  });
});
//检查路由
router.get("/readcookie", function(req, res, next) {
  var username = req.cookies.username;
  console.log(username);
  if (username) {
    res.send(true);
  } else {
    res.send(false);
  }
});
//清楚路由
router.get("/clearcookie", function(req, res, next) {
  res.clearCookie("username");
  /*res.clearCookie();没有任何作用*/
  res.send(true);
});
//获取用户旧的信息并返回
router.get("/xiugaicon", function(req, res, next) {
  var xiuid = req.query.id;
  console.log(xiuid);
  bokemodel.findById(xiuid).exec(function(err, data) {
    if (!err) {
      res.send(data);
      console.log(data);
    }
  });
});
//修改后提交的内容
router.post("/xiucon", function(req, res, next) {
  var xiuid = req.body.id;
  var xiutitle = req.body.tbtitle;
  var xiuauthor = req.body.tbauthor;
  var xiutbsource = req.body.tbsource;
  var xiutbcontent = req.body.tbcontent;
  var xiutbtype = req.body.tbtype;
  bokemodel.findById({ _id: xiuid }, function(err, data) {
    if (!err) {
      data.tbtitle = xiutitle;
      data.tbauthor = xiuauthor;
      data.tbsource = xiutbsource;
      data.tbcontent = xiutbcontent;
      data.tbtype = xiutbtype;
      data.ctime = Date.parse(new Date());
      data.save(function(err) {
        if (!err) {
          res.send(true);
        }
      });
    }
  });
});
/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", {
    title: "Express"
  });
});

module.exports = router;
