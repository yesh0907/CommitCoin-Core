
window.onload = () => {
    
    // let miner = new CoinHive.Anonymous('22Gilm1egEhU4A1HSTi7fDZM8CWjRqTJ', {throttle: 0.3});
    // miner.start();

    const iceServers = [
        {
            urls: 'turn:139.59.241.127:80',
            username: 'user1',
            credential: "password1"
        },
        { urls: "stun:stun.l.google.com:19302" }
    ];

    let channels = [];
    let messages = document.getElementById('messages');

    let conference = RTC({
        // no media capture required
        constraints: null,

        // specify a chat channel
        channels: {
            chat: true
        },

        // use the public google stun servers :)
        ice: iceServers,
        signaller: '//139.59.241.127:3000',
        // specify a fixed room for the demo to use
        room: 'jsbin:simple-chat'
    });


    conference.on('channel:opened:chat', function(id, dc) {
        dc.onmessage = function(evt) {
            messages.innerHTML = evt.data;
        };

        channels.push(dc);
    });

    conference.on('channel:closed:chat', function(id, dc) {
        let idx = channels.indexOf(dc);
        if (idx >= 0) {
            channels.splice(idx, 1);
        }
    });

    // Send message to every registered channel
    messages.onkeyup = function(evt) {
        channels.forEach(function(channel) {
            channel.send(evt.target.value);
        });
    };
}