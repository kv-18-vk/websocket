const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });

let waitingPlayer = null;

server.on('connection', user => {
  console.log("A player connected.");

  user.on('close',()=>{
    console.log("player disconnected");

    if(waitingPlayer == user){
      waitingPlayer = null;
    }
  })

  if(!waitingPlayer){
    waitingPlayer = user;
  }else{
    player1 = waitingPlayer;
    player2 = user;
    waitingPlayer = null;
    player1.send(JSON.stringify({type:"status",msg:"Player Connected"}));
    player2.send(JSON.stringify({type:"status",msg:"Player Connected"}));
    player1.opponent = player2;
    player2.opponent = player1;

    [player1,player2].forEach(player=>{
      player.on('message',(msg)=>{
        try {
          const parsed = JSON.parse(msg);
          if (player.opponent && player.opponent.readyState === WebSocket.OPEN) {
            player.opponent.send(JSON.stringify(parsed)); // ← Ensure it's always sent as string
          }
        } catch (e) {
          console.error("Failed to parse incoming message:", msg);
        }
      })
    })
    

  }

});


