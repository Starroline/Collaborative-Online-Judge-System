const redisClient = require('../modules/redisClient');
const TIMEOUT_IN_SECONDS = 1800;  

module.exports = function(io) {


    //collaboration sessions
    const collaborations = {}; //for each problem, store the participants
    //data structure looks like below:
    // {
    //     "1": {
    //         "participants": ["123", "234"];
    //     }
    //     "2": {
    //         "participants": ["122", "333"];
    //     }    
    // }

    //second project will use redis as well, so we set the sessionPath to different folder in case of chaos
    const sessionPath = '/temp_sessions';
    //map from socketId to sessionId
    const socketIdToSessionId = {};

    io.on('connection', (socket) => {
        // below is an example of server getting message from client and sending out a message to client
        //console.log(socket); // you can find socketID here
        // const message = socket.handshake.query['message'];
        // console.log('message seen at server ' + message);
        // io.to(socket.id).emit('message', 'hehehehe sent from server');

        const sessionId = socket.handshake.query['sessionId']; //get the sessionId(no. of problem)

        socketIdToSessionId[socket.id] = sessionId; //somebody(socketId) is doing this problem(sessionId)

        //Below is before redis is used
        // if(!(sessionId in collaborations)){ //there is no one solving this problem
        //     collaborations[sessionId] = {
        //         'participants': []
        //     };    
        // }
        // collaborations[sessionId]['participants'].push(socket.id);

        if(sessionId in collaborations){ //people are solving this problem
            collaborations[sessionId]['participants'].push(socket.id);
        } else { //no one is solving this problem now
            redisClient.get(sessionPath + '/' + sessionId, data => {
                if (data) { //people did it before
                    console.log('session terminated previously, pulling back from redis');
                    collaborations[sessionId] = {
                        'cachaedInstructions': JSON.parse(data),
                        'participants': []
                    };
                } else { //no one solved it before
                    console.log('creating new session');
                    collaborations[sessionId] = {
                        'cachaedInstructions': [],
                        'participants': []                        
                    }
                }
                collaborations[sessionId]['participants'].push(socket.id);
            });
        }

        //when server got the change from client, it has to tell other people the changes
        socket.on('change', delta => {
            const sessionId = socketIdToSessionId[socket.id]; 
            
            if (sessionId in collaborations){ //store the change
                collaborations[sessionId]['cachaedInstructions'].push(['change', delta, Date.now()]);                
            }
            
            // if (sessionId in collaborations){                
            //     const participants = collaborations[sessionId]['participants'];
            //     for(let participant of participants){
            //         if(participant !== socket.id){ //tell the participant if he is not the one who made the change
            //             io.to(participant).emit('change', delta);
            //         }
            //     }
            // } else {
            //     console.error('You are not solving this problem!');
            // }

            forwardEvent(socket.id, 'change', delta);
        });

        socket.on('cursorMove', cursor => {
            console.log('cursor move for session: ' + socketIdToSessionId[socket.id] + ', socketId' + socket.id);
            cursor = JSON.parse(cursor);
            cursor['socketId'] = socket.id;
            forwardEvent(socket.id, 'cursorMove', JSON.stringify(cursor));
        });

        socket.on('restoreBuffer', () => {
            const sessionId = socketIdToSessionId[socket.id];
            if (sessionId in collaborations) {
                const instructions = collaborations[sessionId]['cachaedInstructions'];
                for (let instruction of instructions){ //send out all the changes
                    socket.emit(instruction[0], instruction[1]);
                }
            }
        });

        socket.on('disconnect', () => {
            const sessionId = socketIdToSessionId[socket.id];
            let foundAndRemove = false;
            if (sessionId in collaborations) {
                const participants = collaborations[sessionId]['participants'];
                const index = participants.indexOf(socket.id);
                if (index >= 0) {
                    participants.splice(index, 1); //delete the element at index, and delete length is 1
                    foundAndRemove = true;
                    if (participants.length === 0) { //the last person has left, store everything to redis
                        const key = sessionPath + '/' + sessionId;
                        const value = JSON.stringify(collaborations[sessionId]['cachaedInstructions']);
                        redisClient.set(key, value, redisClient.redisPrint);
                        redisClient.expire(key, TIMEOUT_IN_SECONDS);
                        delete collaborations[sessionId];
                    } //otherwise it's just stored in memory
                }
            }
            if (!foundAndRemove) {
                console.error('warning');
            }
        });
    });

    const forwardEvent = function(socketId, eventName, dataString) {
        const sessionId = socketIdToSessionId[socketId];
        if (sessionId in collaborations) {
            const participants = collaborations[sessionId]['participants'];
            for(let participant of participants) {
                if (socketId != participant) {
                    io.to(participant).emit(eventName, dataString);
                }
            }
        } else {
            console.warn('WARNING');
        }
    }
}



