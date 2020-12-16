// template: `
//   <div class="ui fluid action input">
//     <input type="text" v-model="value" placeholder="ID"/>
//     <div @click="send" class="ui button">Login</div>
//   </div>
//   `,
var LoginForm = {
  template: `
  <form class="ui form id">
    <div class="ui fluid action input">
      <input type="text" v-model="value" placeholder="ID" autocomplete="off"/>
      <button @click="send" class="ui button">Login</button>
    </div>
  </form>
  `,
  data: function() {
    return {
      value: null,
    }
  },
  methods:{
    send:function() {
      const regExp = /^[가-힣]{2,8}$/;
      if(false == regExp.test(this.value)) {
        $('.mini.modal.wrong').modal('show');
        return;
      }
      this.value = this.value.trim();
      this.$emit('send-id', this.value);
    }
  }
};

var chatUI = {
  template: `
  <div class="chat-ui">
    <ul id="messages"></ul>
    <form class="ui form msg">
      <div class="ui fluid action input">
        <input id="message" type="text" autocomplete="off" />
        <button class="ui button">Send</button>
      </div>
    </form>
  </div>
  `
};

var content = new Vue ({
  el: '.content',
  data() {
    return {
      login: false,
      ID: ''
    }
  },
  components: {
    'login-form' : LoginForm,
    'chat-ui': chatUI
  },
  methods: {
    sendID: function(id) {
      this.ID = id;
      socketIOConnection(this.ID);
    }
  },
});

var socket;
const IDcheck = function(ID) {
  socket.emit('IDcheck', ID);
  socket.on('IDcheck', function(chk) {
    if(true === chk) {
      content.login = true;
      socket.emit('enter', ID);
      socket.on('enter', function(msg){
        var info = $('<li>').text(msg);
        info.addClass("info");
        $('#messages').append(info);
        $('#messages').scrollTop($('#messages').height());
      });
    }
    else {
      $('.mini.modal.duplicated').modal('show');
    }
  });
}

const socketIOConnection = function (ID) {
  socket = io('https://chat.sleepyjun.com', {
        path: '/socket.io'
  });
  IDcheck(ID);

  socket.on('chat message', function(msgJSON){
    var msgObj = JSON.parse(msgJSON);
    var msg = $('<li>').text(msgObj.message);
    if(msgObj.user == content.ID) {
      msg.addClass("me");
      msg.append("<span> > </span>")
    }
    else {
      msg.prepend(`<span>${msgObj.user+" > "}</span>`)
    }
    $('#messages').append(msg);
    $('#messages').scrollTop($('#messages').height());
  });
  socket.on('quit', function(msg) {
    var info = $('<li>').text(msg);
    info.addClass("info");
    $('#messages').append(info);
    $('#messages').scrollTop($('#messages').height());
  });
};

$(function () {
  $(document).on('submit', 'form', function(e) {
    e.preventDefault();
  })
  $(document).on('submit', 'form.ui.form.msg', function(){
    var msg =  $('#message').val();
    var msgObj = {
      message: msg,
      user: content.ID
    };

    socket.emit('chat message', JSON.stringify(msgObj));
    $('#message').val('');
    return false;
  });
});