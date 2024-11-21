import { RoomManager } from "./roomManager.js";

export class User{
    name;
    socket;
    constructor(name,socket){
        this.name=name;
        this.socket=socket;
    }
}
export class UserManager{
    users;
    map;
    roomManager;
    constructor(){
       this.users=[];
       this.map=new Map();
       this.roomManager=new RoomManager();
    }

    addUser=(name="randomUser",appointmentId,socket)=>{
       const user= new User(name,socket);
       this.users.push(user);
    //    this.queue.push(user);
    console.log(name);
    
       socket.emit("lobby")
       console.log("user added to users ");
       this.clearQueue(user,appointmentId);
       this.initHandlers(socket);
       
    }

    
    removeUser(socketId) {
        const user = this.users.find(x => x.socket.id === socketId);
        this.users = this.users.filter(x => x.socket.id !== socketId);
        // this.queue = this.queue.filter(x => x.socket.id !== socketId);
    }

    clearQueue(user1,appointmentId){
        
        if(this.map.has(appointmentId)){
            // const user1=this.queue.pop()
            
            const user2=this.map.get(appointmentId);
            this.map.delete(appointmentId);
            if(!user1 || !user2) return;
            this.roomManager.createRoom(user1,user2);
            console.log("created room ++");
        }

        else {
            this.map.set(appointmentId,user1);
        }
        
        
        
        
       
        
        // this.clearQueue()
    }

    initHandlers(socket){

        //  add ice-candidate
        // offer
        // answer
        socket.on("offer",({sdp,room_id})=>{
            // console.log("hello");
            
            const user= this.users.find(x=>x.socket===socket)
            this.roomManager.onOffer(sdp,room_id,user)
        })

        socket.on("answer",({sdp,room_id})=>{
            // console.log("hello2");

            const user= this.users.find(x=>x.socket===socket)
            this.roomManager.onAnswer(sdp,room_id,user)
        })

        socket.on("add-ice-candidate", ({candidate, roomId, type}) => {
            // console.log(roomId,candidate,type);
            
            this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
        });

        socket.on("skip",({roomId})=>{
            const candidate= this.users.find(x=>x.socket===socket)
            // const room=this.roomManager.rooms.find(x=>x.user1.socketId)
            this.roomManager.skip(candidate,roomId);
            // this.queue.push(candidate)
            // this.clearQueue();
        })
        socket.on("skip-accept",()=>{
            // console.log(12345678);
            
            const candidate= this.users.find(x=>x.socket===socket)
            // this.roomManager.skip(candidate,roomId);
            // this.queue.push(candidate)
            // this.clearQueue();
        })

    }

}