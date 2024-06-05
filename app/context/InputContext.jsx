import { useContext,createContext,useState } from "react";
import React from 'react'
const InputContext=createContext()

function InputProvider({children}){
    const [language,setLanguage]=useState('en')
    const [searchBar,setSearchBar]=useState("")
    const [searchBy,setSearchBy]=useState("TrackInfo")
    const [playing,setPlaying]=useState(false)
    const [currentSong,setCurrentSong]=useState({id:{videoId:0}})
    const [showMusic,setShowMusic]=useState(false)
    const [results, setResults] = useState([]);

    const handleLanguange=(lang)=>setLanguage(lang)
    const handleSearchBar=(val)=>setSearchBar(val)
    const handleSearchBy=(type)=>setSearchBy(type)
    const handleShowMusic=(showVal)=>setShowMusic(showVal)
    const handleCurrentSong=(song)=>setCurrentSong(song)
    const handleResult=(songs)=>setResults(songs)
    const playNext=()=>{
        const idx=results.indexOf(currentSong)
        if(!results[idx+1]) return
        setCurrentSong(results[idx+1])
    }
    const playPrev=()=>{
        const idx=results.indexOf(currentSong)
        if(!results[idx-1]) return
        setCurrentSong(results[idx-1])
    }

    return(
        <InputContext.Provider value={{
            language,
            searchBar,
            searchBy,
            playing,
            currentSong,
            showMusic,
            results, handleResult,
            handleLanguange,
            handleSearchBar,
            handleSearchBy,
            setPlaying,
            handleShowMusic,
            handleCurrentSong,
            setCurrentSong,
            playNext,
            playPrev

        }}>
        {children}
        
        </InputContext.Provider>
    )
}

function useInput(){
    const inputContext=useContext(InputContext)
    return inputContext
}
export {InputProvider,useInput}