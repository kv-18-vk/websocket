const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();

// Optional: handle root ping so Render knows the service is alive
app.get('/', (req, res) => {
  res.send("WebSocket server is running!");
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let waitingPlayer = null;

wss.on('connection', user => {
  console.log("A player connected.");

  user.on('close', () => {
    console.log("Player disconnected");
    if (waitingPlayer === user) {
      waitingPlayer = null;
    }
    if (user.opponent && user.opponent.readyState === WebSocket.OPEN){
      user.opponent.send(JSON.stringify({type:"opponent_quit"}));
    }
  });

  if (!waitingPlayer || waitingPlayer.readyState !== WebSocket.OPEN) {
    waitingPlayer = user;
  } else {
    const player1 = waitingPlayer;
    const player2 = user;
    waitingPlayer = null;

    player1.send(JSON.stringify({ type: "status", msg: "Player Connected" }));
    player2.send(JSON.stringify({ type: "status", msg: "Player Connected" }));

    player1.opponent = player2;
    player2.opponent = player1;

    [player1, player2].forEach(player => {
      player.on('message', msg => {
        try {
          const parsed = JSON.parse(msg);
          if (player.opponent && player.opponent.readyState === WebSocket.OPEN) {
            player.opponent.send(JSON.stringify(parsed));
          }
        } catch (err) {
          console.error("Invalid JSON received:", msg);
        }
      });
    });
  }
});

// Render sets PORT via env variable
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});



