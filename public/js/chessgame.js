

    // const { render } = require("ejs");

    const socket =io(); //isse humlog socket ka connect krte hai 

    /*frontend ke socket se bhej rhe hai humlog
    socket.emit("churan");
    //backend se jo aaya hai message usko received kr rhe hai frontend mei
    socket.on("churan papdi",function(){
        console.log("churan papdi received")
    })*/

    const chess = new Chess();
    const boardElement = document.querySelector(".chessboard");

    let playerRole = null;
    let draggedPiece = null;
    let sourceSquare = null;

    const renderBoard = () =>{
        const board = chess.board();
        boardElement.innerHTML = "";
        board.forEach((row,rowindex) =>{
            row.forEach((square,squareindex)=>{
                const sqaureElement = document.createElement("div")
                sqaureElement.classList.add(
                "square",
                (rowindex+squareindex) % 2 === 0?"light":"dark"
                )

                sqaureElement.dataset.row = rowindex;
                sqaureElement.dataset.col = squareindex;

                // creating logic for the piece which has chess element
                if(square){
                    const pieceElement =document.createElement("div")
                    pieceElement.classList.add(
                        "piece",
                        square.color === "w"? "white":"black"
                    )
                    pieceElement.innerText = getPieceUnicode(square); //element ka design humlog unicode se layenge
                    pieceElement.draggable = playerRole === square.color;

                    pieceElement.addEventListener("dragstart",(e)=>{
                        if(pieceElement.draggable){
                            draggedPiece = pieceElement;
                            sourceSquare ={ row: rowindex, col: squareindex}
                            e.dataTransfer.setData("Text/plain","") //ye likhna jarui hai taki aapke drag mei koi parishani na aaye.
                            // css nhi likha hai abhi toh woh likhna baki hai abhi
                        }
                    })
                    //jb dragged piece khtm ho gya 
                    pieceElement.addEventListener("dragend",(e)=>{
                        draggedPiece = null;
                        sourceSquare = null;
                    });
                    sqaureElement.appendChild(pieceElement);//aapne ye square mei hathi attach kr diya hai
                }
                sqaureElement.addEventListener("dragover",function(e){
                e.preventDefault();
                })

                sqaureElement.addEventListener("drop",function(e){
                    e.preventDefault();
                    if(draggedPiece){
                        const targetSource ={
                            row:parseInt(sqaureElement.dataset.row),
                            col:parseInt(sqaureElement.dataset.col),
                        }
                        handleMove(sourceSquare,targetSource)
                    }
                })
                boardElement.appendChild(sqaureElement);
            })
        })
    

    if(playerRole === "b"){
        boardElement.classList.add("flipped")
    }
    else{
        boardElement.classList.remove("flipped")
    }
}

    const handleMove = (source,target) =>{
        const move ={
            from:`${String.fromCharCode(97 + source.col)}${8 - source.row}`,
            to:`${String.fromCharCode(97 + target.col)}${8 - target.row}`,
            promotion:"q" //by default we are suppositon that promotion mei bss queen hi milegi
        }
        socket.emit("move",move);
    }

    const getPieceUnicode = (piece) => {
        const unicodePieces={
            p:"♙",
            r:"♜",
            n:"♞",
            b:"♝",
            q:"♛",
            k:"♚",
            P:"♙",
            R:"♖",
            N:"♘",
            B:"♗",
            Q:"♕",
            K:"♔"
            
        }
    return unicodePieces[piece.type] || "";
    }

    socket.on("playerRole",function(role){
        playerRole = role;
        renderBoard();
    })

    socket.on("spectator",function(){
        playerRole = null;
        renderBoard();
    })

    socket.on("boardState",function(fen){
        chess.load(fen); //new state ko load kr skte hai
        renderBoard();
    })

    socket.on("move",function(move){
        chess.move(move);
        renderBoard();
    })

    renderBoard();