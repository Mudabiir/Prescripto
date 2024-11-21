import { useEffect, useContext,useState,useRef } from "react";
import React from 'react'
import Room from "./Room";
import { AppContext } from '../context/AppContext'
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";

// import useContext

function Landing() {
    // const [name, setName] = useState("");
    const {appointmentId}=useParams()
    const { token, backendUrl, userData, setUserData } = useContext(AppContext)
    const name=userData?.name;
    const [localAudioTrack, setLocalAudioTrack] = useState(null);
    const [localVideoTrack, setlocalVideoTrack] = useState(null);
    const videoRef = useRef(null);
    const [joined,setJoined]=useState(false)
    const [appointment,setAppointment]=useState();
    const location = useLocation();
    // const appointmentId

    useEffect(()=>{
        
        const data = location.state?.data; 
        setAppointment(data)
        console.log(location.state);
        
        // if(!data.appointment) 
    },[appointmentId])


    const getCam=async ()=>{
        if(!appointment) return;
        const stream = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
        const audioTrack=stream.getAudioTracks()[0]
        const videoTrack=stream.getVideoTracks()[0]
        
        setLocalAudioTrack(audioTrack) 
        setlocalVideoTrack(videoTrack)
        if (!videoRef.current) {
            return;
        }

        videoRef.current.srcObject = new MediaStream([videoTrack])
        videoRef.current.play();

        
    }
    useEffect(()=>{
        if(videoRef && videoRef.current){
            getCam();
        }
    },[videoRef,appointment]) 

    if (joined) {
        return (
          <Room
            name={name}
            setLocalVideoTrack={setlocalVideoTrack}
            setLocalAudioTrack={setLocalAudioTrack}
            localAudioTrack={localAudioTrack}
            localVideoTrack={localVideoTrack}
          />
        );
      } else {
        if (appointment?.userId !== userData?._id) {
          return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f3f4' }}>
              <h2 style={{ color: '#d93025' }}>Unauthorized Request!</h2>
            </div>
          );
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f1f3f4', padding: '20px' }}>
            <video
              autoPlay
              ref={videoRef}
              style={{
                width: '400px',
                height: '300px',
                borderRadius: '10px',
                backgroundColor: '#000',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                marginBottom: '20px',
              }}
            />
            <button
              onClick={() => setJoined(true)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '20px',
                backgroundColor: '#1a73e8',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#1558b0')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#1a73e8')}
            >
              Join Meeting
            </button>
            <h3 style={{ marginTop: '20px', color: '#202124' }}>
              Hi {name}, click "Join Meeting" to enter.
            </h3>
          </div>
        );
      }
      
}

export default Landing
