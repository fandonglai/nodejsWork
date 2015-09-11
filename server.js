/**
 * Created by fdl on 15/9/11.
 */
var http = require('http');
var fs = require('fs');
var mime = require('mime');
var paths = require('path')
//创建目录
var dir = "a/b/c/d";
~function(dir,callback){
    var p = dir.split('/');
    for(var i =1; i<= p.length;i++){
        var path = p.slice(0,i).join('/');
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        }
    }
    callback();
}(dir,fn);

function removeDir(path){
    var paths = path.split('/');
    for (var i = paths.length; i >= 1; i--) {
        var p = paths.slice(0, i).join('/');
        if (fs.existsSync(path)) {
            if (fs.statSync(p).isDirectory()) {
                var fileList = fs.readdirSync(p);
                fileList.forEach(function (files) {
                    var cur = p + '/' + files;
                    if (fs.statSync(cur).isDirectory()) {
                        removeDir(cur)
                        console.log("erm"+cur);
                    } else {
                        console.log('adddd')
                        fs.unlinkSync(cur);
                    }
                });
                console.log(10000)
                fs.rmdirSync(path);
            } else {
                fs.unlinkSync(path);
            }
        }
    }
}
//将图片塞到目录里；
function fn(){
    var read = fs.createReadStream('./images/1.jpg');
    var write = fs.createWriteStream('./a/1.jpg');
    read.pipe(write);
    var file = fs.writeFile('./a/b/c/d/test.txt','helloWorld',function(){
        console.log('ok');
    })
}
var server = http.createServer(function(req,res){
    res.writeHead(200,{'content-type':'text/html'});
    var pathname = req.url;
    var path = pathname.split('?');
    var url = path[0];
    var content = '';
    var pwd = process.cwd();
    if(url=='/'){
        url='';
    }else if(url=='/del'){
        removeDir('./'+path[1].split('=')[1]);
        res.writeHead(302, {
            'Location': '/'
        });
        res.end();
    }
    var allPath =pwd+ url;
    if(fs.existsSync(allPath)){
        fs.stat(allPath,function(err,stats){
            if(stats.isFile()){
                res.writeHead(200,{'content-type':mime.lookup(allPath)});
                fs.readFile(allPath,function(err,data){
                    res.end(data);
                })
            }else if(stats.isDirectory()){
                res.writeHead(200,{'content-type':'text/html;charset=utf-8'});
                fs.readdir(allPath,function(err,fileds){
                    content+='<ul>';
                    for(var i = 0; i<fileds.length;i++){
                        var filed = fileds[i];
                        content+='<li>';
                        if(filed=='images' || filed =='node_modules' ||filed =='server.js' || filed=='css'){
                            content+='<span class="mama" href='+url+'/'+filed+'>'+filed+'</span>';
                            content+='<span  href=/del?path='+url+'/'+filed+'>系统文件</span>';
                        }else{
                            content+='<a class="mama" href='+url+'/'+filed+'>'+filed+'</a>';
                            content+='<a  href=/del?path='+url+'/'+filed+'>delete</a>';
                        }
                        content+='</li>';
                    }
                    content+='</ul>';
                    content += '<link rel="stylesheet" href="/css/index.css"/>';
                    res.end(content);
                });
            }
        })
    }
});
var ports = 3333;
server.listen(ports,function(){
    console.log('server'+ports);
});