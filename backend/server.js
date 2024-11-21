import http from "http";
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoutes.js'


// app config

const app =  express()

const port = process.env.PORT || 4000
connectDB()
connectCloudinary()


// middlewares
app.use(express.json())
app.use(cors())


// api endpoints
app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)

app.get('/', (req,res) =>{
    res.send('API working great')
})

app.listen(port, ()=> console.log("server started",port )
)

//   websocket server for appointments
import { Socket } from "socket.io";
import { Server } from 'socket.io';
import { UserManager } from './ws/userManager.js'


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const userManager = new UserManager();

io.on("connect",(socket)=>{
    const { name, appointmentId } = socket.handshake.query;
    console.log(name);
    
    userManager.addUser(name,appointmentId,socket)


    socket.on("disconnect",(socket)=>{
        userManager.removeUser(socket.id)
    })

})


server.listen(3000, () => {
    console.log('ws listening on *:3000');
});