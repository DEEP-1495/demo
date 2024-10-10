

const express = require("express");
const http = require("http")
const socket = require("socket.io")
const {Chess} = require("chess.js")
const path = require("path")

const app = express();

// socket.io ke documentation se likha hai ye
// ismei humne http ka server bna rha hai aur use socket chla rha hai 
//aur hum usse express ke server ke sth jor de rhe hai
const server =http.createServer(app);
const io =socket(server)

const chess = new Chess();//ye chess js ke docs se aaya hai ab jo chiz chess js se kr skte the ab chess variable kr skte hai
let players ={};
let currentPlayer = "w";

app.set("view engine","ejs")//isse ejs use kr skte hai
app.use(express.static(path.join(__dirname,"public")));//isse aap vanilla js use kr skte hai aur static file use kr skte hai

app.get("/",function(req,res){
    res.render("index",{title:"Custom chess game"});
})

//socket io setup kr le aur ccallback function bhej diya hai humne
io.on("connection",function(uniquesocket){
    console.log("connected");//whenever a new person will come here ye show hoga ki connected.

    //jb churan frontend se aaye tb ye function chla dena
    // uniquesocket.on("churan",function(){
    //  io.emit("churan papdi") //sbko broadcast kr rhe hai message hum ye
    // })
   //disconnect krne ke liye
    // uniquesocket.on("disconnect",function(){
    //     console.log("disconnected");
    // })

    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole","w");//player ko white dedo
    }
    else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole","b");//player ko black dedo
    }
    else{
        uniquesocket.emit("spectatorRole")//aap spectator ho
    }

    //disconnect krne ka code hai yeh
    uniquesocket.on("disconnected",function(){
        if(uniquesocket.id === players.white){
            delete players.white;
        }else if(uniquesocket.id === players.black){
            delete players.black;
        }
    })

    //valid move ke liye check kr rhe hai
    uniquesocket.on("move",(move)=>{
        try{
            if(chess.turn() =="w" && uniquesocket.id !== players.white) return;//white ke time white hi chlne wala hai nhi toh error aa jayega
            if(chess.turn() == "b" && uniquesocket.id !== players.black) return;

            const result = chess.move(move); //isse dekhenge ki move thik hai ki nhi hai
            if(result){
                currentPlayer = chess.turn(); //isse hume pta chl jayega ki kiski turn chl rhi hai abhi
                io.emit("move",move);//ye backend se frontend mei bhej rhe hai 
                io.emit("boardState",chess.fen()) //konsa chiz kha pr hai iski current state dega ye
            }
            else{
                console.log("invalid move:",move);
                uniquesocket.emit("invalidMove",move)
            }
        }
        catch(err){
            console.log(err)
            uniquesocket.emit("invalidMove: ",move);//jisne galat move chla hai usko bhi bta denge ki ye galat move hai
        }
    })
})



server.listen(3000,function(){
    console.log("server is listening on 3000 port")
})