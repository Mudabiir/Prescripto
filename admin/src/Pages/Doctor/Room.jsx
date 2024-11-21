import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Socket,io } from 'socket.io-client';
const url = "http://localhost:3000";
function Room({
    name,
    appointmentId,
    localAudioTrack,
    localVideoTrack,
    setLocalAudioTrack,
    setLocalVedioTrack,
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [lobby, setLobby] = useState(true);
    const navigate=useNavigate();
    const [socket, setSocket] = useState(null);
    const [sendingPc, setSendingPc] = useState(null);
    const [receivingPc, setReceivingPc] = useState(null);
    const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState(null);
    const [remoteMediaStream, setRemoteMediaStream] = useState(null);
    const [room_id,setRoomId]=useState(0);
    const remoteVideoRef = useRef();
    const localVideoRef = useRef();
    // const [remoteSdp,setRemoteSdp]=useState();
    

    useEffect(()=>{
        const socket = io(url, {
            query: {
              name: name,
              appointmentId: appointmentId,
            //   doctorId
            },
          });
                  

        socket.on("send-offer",({room_id})=>{
            setRoomId(room_id);
            const pc=new RTCPeerConnection()
            setLobby(false)
            console.log("send-offer");
            setSendingPc(pc)
            if(localAudioTrack){
                pc.addTrack(localAudioTrack)
            }
            if(localVideoTrack){
                pc.addTrack(localVideoTrack)
            }
            pc.onicecandidate=async (e)=>{
                if(e.candidate){
                    socket.emit("add ice-candidate",{
                        roomId:room_id,
                        type:"sender",
                        candidate:e.candidate,
                    })
                }
            }  // stun server wala thing



/// *** IMPORTANT *** 
            pc.onnegotiationneeded=async()=>{ 
                // console.log("answering 1");
                
                const sdp=await pc.createOffer();
                pc.setLocalDescription(sdp)
                socket.emit("offer", {
                    sdp,
                    room_id,
                })
            }
        })



        socket.on("offer",async ({remoteSdp,room_id})=>{
            // setRemoteSdp(remoteSdp)
            // console.log("offer recieved");
            // if(remoteSdp.type==="answer") return;
            setLobby(false)
            // console.log(123456);
            
            const pc=new RTCPeerConnection()  // setting recived sdp by server
            // console.log(remoteSdp,1);
            // await pc.setRemoteDescription(new RTCSessionDescription(remoteSdp));
            pc.setRemoteDescription(remoteSdp)
            const sdp=await pc.createAnswer()  // my sdp
            // console.log("oksaz");
            
            pc.setLocalDescription(sdp)
            // console.log(remoteSdp);
            
            const stream = new MediaStream();
            // console.log("in-offer");
            if (remoteVideoRef.current) {
                
                remoteVideoRef.current.srcObject = stream;
                console.log(remoteVideoRef.current.srcObject);
            }
            setRemoteMediaStream(stream)
            
            setReceivingPc(pc)
            window.pcr = pc;
            console.log(window.pcr);
            
            pc.ontrack=(e)=>{
                console.log("on track");
            }

            pc.onicecandidate = async (e) => {
                if (!e.candidate) {
                    return;
                }
                // console.log("omn ice candidate on receiving seide");
                
                if (e.candidate) {
                   socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "receiver",
                    roomId:room_id,
                   })
                }
            }
            // console.log(sdp);
            
            socket.emit("answer", {
                room_id,
                sdp: sdp
            });

            setTimeout(() => {
                if(room_id==0) return;
                const track1=pc.getTransceivers()[0].receiver.track
                const track2=pc.getTransceivers()[1].receiver.track
                // console.log(track1);
                // console.log(track2);
                
                if (track1.kind === "video") {
                    
                    
                    setRemoteVideoTrack(track1)
                    setRemoteAudioTrack(track2)
                } else {
                    // console.log(1234);
                    setRemoteVideoTrack(track2)
                    setRemoteAudioTrack(track1)
                }
                remoteVideoRef?.current.srcObject.addTrack(track1)
            remoteVideoRef?.current.srcObject.addTrack(track2)
            remoteVideoRef?.current.play();
            }, 5000);
            
        })



        socket.on("answer", ({room_id,remoteSdp}) => {
            setLobby(false);
            console.log("answer recived");
            setSendingPc(pc => {
                // console.log("in answer of first sender");
                // console.log(pc);
                
                pc?.setRemoteDescription(remoteSdp)
                return pc;
            });
            // console.log("loop closed");
        })



        socket.on("lobby", () => {
            // console.log("in loby");
            setRoomId(0);
            setLobby(true);
        })

        socket.on("add-ice-candidate", ({candidate, type}) => {
            console.log("add ice candidate from remote");
            // console.log({candidate, type})
            if (type == "sender") {
                setReceivingPc(pc => {
                    if (!pc) {
                        console.error("receicng pc nout found")
                    } else {
                        console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate)
                    return pc;
                });
            } else {
                setSendingPc(pc => {
                    if (!pc) {
                        console.error("sending pc nout found")
                    } else {
                        // console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate)
                    return pc;
                });
            }
        })

        socket.on("skip", ({ room_id }) => {
            // Stop local media tracks
            if (localVideoTrack) {
                console.log("Stopping local video track during skip");
                localVideoTrack.stop();
                // localVideoTrack = null; // Clear the reference
            }
        
            if (localAudioTrack) {
                console.log("Stopping local audio track during skip");
                localAudioTrack.stop();
                // localAudioTrack = null; // Clear the reference
            }
        
            // Reset video element sources
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
            }
        
            // Reset state and clean up
            setLobby(true);
            setReceivingPc(null);
            setSendingPc(null);
            setRemoteAudioTrack(null);
            setRemoteVideoTrack(null);
            setRemoteMediaStream(null);
            setRoomId(0);
        
            // Acknowledge skip to the server
            socket.emit("skip-accept");
            navigate('/doctor-appointments');
        });
        

        // console.log("inside-cas");
        
        setSocket(socket)

       
    },[name])

// local video issues
    useEffect(() => {
        if (localVideoRef.current) {
            if (localVideoTrack) {
                localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
                localVideoRef.current.play();
            }
        }
    }, [localVideoRef])


    // useEffect(() => {
       
        
    //     if (remoteVideoRef.current) {
    //         if (remoteVideoTrack) {
    //             console.log("in remotr video ref");
    //             remoteVideoRef.current.srcObject = new MediaStream([remoteVideoTrack]);
    //             remoteVideoRef.current.play(); 
    //         }
    //     }
    // }, [remoteVideoRef])
    const backToLobby = () => {
        if (socket) {
            socket.emit("skip", { roomId: room_id });
        }
    
        // Stop local media tracks
        if (localVideoTrack) {
            console.log("Stopping local video track:", localVideoTrack);
            localVideoTrack.stop();
            // setLocalVedioTrack(null);
        }
        if (localAudioTrack) {
            console.log("Stopping local audio track:", localAudioTrack);
            localAudioTrack.stop();
            // setLocalAudioTrack(null);
        }
    
        // Reset video element srcObject
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
    
        // Clean up state
        setLobby(true);
        setReceivingPc(null);
        setSendingPc(null);
        setRemoteAudioTrack(null);
        setRemoteVideoTrack(null);
        setRemoteMediaStream(null);
        setRoomId(0);
    
        // Navigate back to appointments
        navigate('/doctor-appointments');
    };
    

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', backgroundColor: '#f1f3f4', padding: '20px' }}>
          <h2 style={{ marginBottom: '20px', color: '#202124' }}>Hi {name}</h2>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <video
              autoPlay
              ref={localVideoRef}
              style={{
                width: '400px',
                height: '300px',
                borderRadius: '10px',
                backgroundColor: '#000',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            />
            
            <video
              autoPlay
              ref={remoteVideoRef}
              style={{
                width: '400px',
                height: '300px',
                borderRadius: '10px',
                backgroundColor: '#000',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            />
          </div>
      
          <div style={{ marginTop: '20px' }}>
            {lobby ? (
              <p style={{ color: '#5f6368', fontSize: '18px', fontWeight: '500' }}>Waiting to connect you to someone...</p>
            ) : (
              <button
                onClick={backToLobby}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '20px',
                  backgroundColor: '#d93025',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#a7231b')}
                onMouseOut={(e) => (e.target.style.backgroundColor = '#d93025')}
              >
                End Call
              </button>
            )}
          </div>
        </div>
      );
      
  
}

export default Room
