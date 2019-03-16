var mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/boke", {
  useMongoClient: true
}, function (err) {
  if (!err) {
    console.log("数据库链接成功");
  } else {
    console.log("数据库链接失败");
    throw err;
  }
});
var bokeSchema = new mongoose.Schema({
  tbtitle: String,
  tbauthor: String,
  tbsource: String,
  ctime: String,
  tbcontent: String,
  tbtype:String
});
global.bokemodel = mongoose.model("bokecons", bokeSchema, "bokecons");

var liaomeiSchema = new mongoose.Schema({
  liaocontent:String
});

global.liaomeimodel=mongoose.model('liaocon',liaomeiSchema,'liaocon');
//登录数据库
var adminSchema = new mongoose.Schema({
  username:String,
  password:String
});

global.adminmodel=mongoose.model('admin',adminSchema,'admin');