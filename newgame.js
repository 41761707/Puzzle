class Piece 
{
    constructor(id, image, x, y, width, height) 
    {
        this.id = id;
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hovered = false;
    }

    draw(context, x, y, height, width) 
    {
        if (this.hovered)
         {
            context.save();
            context.globalAlpha = 0.7;
        }
        context.drawImage(this.image, this.x, this.y, this.width, this.height, x, y, height, width);
        if (this.hovered) 
        {
            context.restore();
        }
    }
}

class RedRect
 {
    constructor(id) 
    {
        this.id = id;
    }

    draw(context, x, y, width, height) 
    {
        context.fillStyle = "#FF0000";
        context.fillRect(x, y, width, height);
    }
}

class Game 
{
    constructor(canvas, rows , columns) 
    {
        this.mixed = false;

        this.rows = rows;
        this.columns = columns;
        this.canvas = canvas;

        this.win = null;

        this.pieces = [];
        this.redRectRow=-1;
        this.redRectColumn=-1;
    }

    loadImage(image)
     {
        let pieceHeight = image.naturalHeight / this.rows;
        let pieceWidth = image.naturalWidth / this.columns;

        let redFlag = false;
        for (let i = 0; i < this.rows; i++) 
        {
            this.pieces.push([]);
            for (let j = 0; j < this.columns; j++) 
            {
                let id = i * this.columns + j;
                if ((redFlag==false && (Math.random() < 1 / (this.rows * this.columns) || i === this.rows - 1 && j === this.columns - 1))) 
                {
                    this.pieces[i].push(new RedRect(id));
                    this.redRectRow = i;
                    this.redRectColumn = j;
                    redFlag = true;
                } else
                {
                    this.pieces[i].push(new Piece(id, image, pieceWidth * j, pieceHeight * i, pieceWidth, pieceHeight));
                }
            }
        }
    }

    isSwapPossible(row, column) 
    {
        if (row === this.redRectRow) 
        {
            if (Math.abs(column - this.redRectColumn) === 1) 
            {
                return true;
            }
        } 
        else if (Math.abs(row - this.redRectRow) === 1) 
        {
            if (column === this.redRectColumn) 
            {
                return true;
            }
        }
        return false;
    }

    swap(row, column) 
    {
        if (this.isSwapPossible(row, column))
         {
            let tmp=this.pieces[row][column];
            this.pieces[row][column]=this.pieces[this.redRectRow][this.redRectColumn]
            this.pieces[this.redRectRow][this.redRectColumn]=tmp
            this.redRectRow = row;
            this.redRectColumn = column;

            if (!this.mixed && this.checkWin()) 
            {
                if (this.win) this.win();
            }
        }
    }

    draw(canvasElement = this.canvas) 
    {
        let context = canvasElement.getContext('2d');
        context.clearRect(0, 0, canvasElement.width, canvasElement.height);

        let pieceHeight = canvasElement.height / this.rows;
        let pieceWidth = canvasElement.width / this.columns;

        this.pieces.forEach((row, i) => {
            row.forEach((piece, j) => {
                piece.draw(context, pieceWidth * j, pieceHeight * i, pieceWidth, pieceHeight);
            });
        })
    }

    redraw(row, column, canvasElement = this.canvas) 
    {
        let context = canvasElement.getContext('2d');
        let pieceHeight = canvasElement.height / this.rows;
        let pieceWidth = canvasElement.width / this.columns;

        context.clearRect(pieceWidth * column, pieceHeight * row, pieceWidth, pieceHeight);
        this.pieces[row][column].draw(context, pieceWidth * column, pieceHeight * row, pieceWidth, pieceHeight);
    }
    setOnWin(check) 
    {
        this.win = check;
    }
    checkWin()
     {
        let prevId = -1;
        for (let row of this.pieces) 
        {
            for (let piece of row) 
            {
                if (piece.id < prevId)
                { 
                    return false;
                }
                prevId = piece.id;
            }
        }
        return true;
    }
}

class Listeners
{
    constructor(game, action) 
    {
        this.game = game;
        action.addEventListener('click', event => {
            let row = Math.floor(event.layerY / (action.height / game.rows));
            let column = Math.floor(event.layerX / (action.width / game.columns));
                this.game.swap(row, column);
                this.game.draw();
        });
        action.addEventListener('pointermove', event => {
            let row = Math.floor(event.layerY / (action.height / game.rows));
            let column = Math.floor(event.layerX / (action.width / game.columns));

            this.game.pieces.forEach((piecesRow, i) => piecesRow.forEach((piece, j) => {
                if (piece.hovered !== (i === row && j === column) && game.isSwapPossible(i, j)) {
                   if(i==row && j==column)
                   {
                        piece.hovered=true;
                   }
                   else
                   {
                        piece.hovered=false;
                   }
                    this.game.redraw(i, j);
                }
            }));
        });
    }
}

function Mix(game) 
{
    if (game.mixed) 
    {
        return;
    }
    game.mixed = true;

    let i = 1000;
    let redRow = game.redRectRow;
    let redColumn = game.redRectColumn;

    while (i>0) 
    {
        let row, column;
        if (Math.random() > 0.5) 
        {
            column = redColumn;
            if (redRow == game.rows - 1) 
            {
                row = redRow - 1;
            } 
            else if (redRow == 0) 
            {
                row = 1;
            } 
            else
            {
                if(Math.random()>0.5)
                {
                    row=redRow-1;
                }
                else
                {
                    row=redRow+1;
                }
            }
        }
        else 
        {
            row = redRow;
            if (redColumn == game.columns - 1) 
            {
                column = redColumn - 1;
            } 
            else if (redColumn == 0) 
            {
                column = 1;
            } 
            else 
            {
                if(Math.random()>0.5)
                {
                    column=redColumn-1;
                }
                else
                {
                    column=redColumn+1;
                }
            }
        }
        game.swap(row, column);
        redColumn = column;
        redRow = row;
        i=i-1;
    }
    game.mixed=false;
    game.draw();
}

const images = [
    {photo : 'everywhere.jpg'},
    {photo : 'art.jpg'},
    {photo : 'end.jpg'},
    {photo : 'medallion.jpg'},
    {photo : 'idontknow.jpg'},
    {photo : 'wolf.jpg'},
    {photo : 'bobby.jpg'},
    {photo : 'ronaldinho.jpg'},
    {photo : 'slapshot.jpg'},
    {photo : 'eurobeat.jpg'},
    {photo : 'takeover.jpg'},
    {photo : 'zmigrod.jpg'}
];

function resize(canvas, image) {
    if (window.innerHeight > window.innerWidth) {
        if (window.innerHeight*0.4 > window.innerWidth) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerWidth;
        } else {
            canvas.height = window.innerHeight*0.4;
            canvas.width = window.innerHeight*0.4;
        }
    } else {
        canvas.height = window.innerWidth*0.4;
        canvas.width = window.innerWidth*0.4;
    }
    if (image) {
        let context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.height, canvas.width);
    }
}
function resizePreview(canvas, image) {
    if (window.innerHeight > window.innerWidth) {
        if (window.innerHeight*0.4 > window.innerWidth) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerWidth;
        } else {
            canvas.height = window.innerHeight*0.2;
            canvas.width = window.innerHeight*0.2;
        }
    } else {
        canvas.height = window.innerWidth*0.2;
        canvas.width = window.innerWidth*0.2;
    }
    if (image) {
        let context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.height, canvas.width);
    }
}

function newGame(rows, columns, image, container) {
    let canvas = document.createElement('canvas');

    while (container.firstChild) container.removeChild(container.firstChild);
    container.append(canvas);
    resize(canvas);

    let game = new Game(canvas, rows, columns);
    new Listeners(game, canvas);

    game.setOnWin(() => alert('Zwycięstwo!'));
    game.loadImage(image);
    game.draw();

    return {
        game: game,
        canvas: canvas
    };
}

function showPictures(images, container, imageCanvas, gameContainer) {
    let data = {
        game: null,
        image: null,
        canvas: null,
    };
    images.forEach(image => {
        let img = document.createElement('img');
        img.src = image.photo;
        img.addEventListener('click', () => {
            let rows = Number(document.getElementById('rows').value);
            let cols = Number(document.getElementById('columns').value);

            loadImage(image.photo).then((image) => {
                resizePreview(imageCanvas, image);
                let result = newGame(rows, cols, image, gameContainer);
                data.game = result.game;
                data.canvas = result.canvas;
                data.image = image;
            }).catch(err => {
                console.error(err);
            });
        });
        container.append(img);
    });
    return data;
}

function loadImage(source) {
    let image = new Image();
    let promise = new Promise((resolve, reject) => {
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', err => reject(err));
    });
    image.src = source;
    return promise;
}

window.addEventListener('load', () => {
    const canvasContainer = document.getElementById('canvas-container');
    const imageCanvas = document.getElementById('image');
    const mixButton = document.getElementById('mix');
    const pictures = document.getElementById('pictures');
    const data = showPictures(images, pictures, imageCanvas, canvasContainer);

    window.addEventListener('resize', () => {
        if (data.image) {
            resizePreview(imageCanvas, data.image);
        }
        if (data.canvas) {
            resize(data.canvas);
        }
        if (data.game) {
            data.game.draw();
        }
    });

    mixButton.addEventListener('click', event => {
        event.preventDefault();

        mixButton.enabled = false;
        Mix(data.game);
    });
});