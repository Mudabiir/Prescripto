
class Pair{
    user1;
    user2;
    constructor(user1,user2){
        this.user1=user1;
        this.user2=user2;
    }
}
let ROOM_ID=1;
export class RoomManager{
    rooms
    constructor(){
        this.rooms=new Map()
    }

    createRoom(user1,user2){
        // console.log(user1==user2,ROOM_ID);
        
        const room_id=ROOM_ID++;
        this.rooms.set(room_id,new Pair(user1,user2))
// console.log("in create rom");

        user1.socket.emit("send-offer",{
            room_id 
        })
        user2.socket.emit("send-offer",{
            room_id
        })


    }

    onOffer(sdp,room_id,user){
        // console.log(sdp);
        const room=this.rooms.get(room_id)
        if(!sdp) return;
        
        if(room){
            // console.log(123);
            // console.log(sdp);
            if(user.socket.id===room.user1.socket.id){
                // console.log("in here");
               room.user2.socket.emit("offer",{
                remoteSdp:sdp,
                 room_id,
               })
            }
            else{
                // console.log(sdp);
                console.log("in here");
                room.user1.socket.emit("offer",{
                    
                    remoteSdp:sdp,
                     room_id,
                   })

            }
        }  
    }


    onAnswer(sdp,room_id,user){
        // console.log(sdp,room_id,user);
        if(!sdp) return;
        // console.log(123);
        
        const room=this.rooms.get(room_id)
        if(room){
            if(user==room.user1){
               room.user2.socket.emit("answer",{
                 remoteSdp:sdp,
                 room_id,
               })
            }
            else{
                room.user1.socket.emit("answer",{
                remoteSdp:sdp,
                room_id,
             })

            }
        }
    }


    onIceCandidates(roomId, senderSocketid, candidate, type) {
        
        
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2: room.user1;
        // console.log(receivingUser.socket.id===senderSocketid);
        receivingUser.socket.emit("add-ice-candidate", ({candidate, type}));
    }


    skip(candidate,room_id){
        const room=this.rooms.get(room_id);
        // console.log(candidate.socket.id);
        if(!room) return;
        
        const receivingUser=room.user1.socket.id===candidate.socket.id? room.user2:room.user1;
        // console.log(receivingUser);
        receivingUser.socket.emit("skip",({room_id}));
    }
   
}