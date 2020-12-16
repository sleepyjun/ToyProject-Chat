var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
  path: '/socket.io'
});
var port = process.env.PORT || 8080;
var userSet = new Set();

io.on('connection', function(socket){

  socket.on('IDcheck', function(ID){
    if(true == userSet.has(ID)) 
    {
      socket.emit('IDcheck', false);
      socket.disconnect(true);
    }
    else {
      socket.user = ID;
      userSet.add(socket.user);
      socket.emit('IDcheck', true);
    }
  });

  socket.on('enter', function(ID){
    console.log(ID+" Entered");
    io.emit('enter', ">>"+socket.user+"님이 들어오셨습니다<<");
  });

  socket.on('chat message', function(msg){
    console.log(msg);
    io.emit('chat message', msg);
  });
  
  socket.on('disconnect', function() {
    if(socket.user != undefined) {
      console.log(socket.user+' disconnected');
      io.emit('quit', ">>"+socket.user+"님이 나가셨습니다<<");
      userSet.delete(socket.user);
    }
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
