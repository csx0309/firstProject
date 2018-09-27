使用sublime text3 对vue文件使用格式化的方法

在安装完Package Control插件之后，用使用CTRL + SHIFT + P快捷键调出面板，输入package control或者install联想调出 
 
选择Package Control:Install Package 
搜索prettify 选择HTML-CSS-JS-Prettify,点击安装 
 
安装完成之后打开配置文件 set node path： 
 
在配置文件global_file_rules对象的html对象的allowed_file_e..数组添加”vue”,保存，重启编辑器。 


格式化快捷键： 
ctrl + shift + h     
