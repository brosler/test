//Draws the grid to the specified number when enter is pressed, and checks input
//number for validity
document.getElementById("dimensions").onkeypress = function (event) {
    if (!event) {
        event = window.event;
    }
    let keyPressed = event.keyPressed || event.which;
    if (keyPressed === 13) {
        let dimensions = event.target.value;
        dimensions = Number(dimensions);
        if (dimensions > 1 && dimensions <= 50) {
            let element = document.getElementById("inputDescr");
            element.innerHTML = "Enter one number, it will be used as both Length and Width";
            gridInit(dimensions, false);
        } else {
            let element = document.getElementById("inputDescr");
            element.innerHTML = "Enter one number, it will be used as both Length and Width. Number must be at least 2 and no more than 50";
        }
    }
}

//Draws the grid to the specified number when enter is pressed, and check input
//number for validity
document.getElementById("enter").onclick = function (event) {

    let dimensions = document.getElementById("dimensions").value;
    dimensions = Number(dimensions);
    if (dimensions > 1 && dimensions <= 50) {
        let element = document.getElementById("inputDescr");
        element.innerHTML = "Enter one number, it will be used as both Length and Width";
        gridInit(dimensions, false);
    } else {
        let element = document.getElementById("inputDescr");
        element.innerHTML = "Enter one number, it will be used as both Length and Width. Number must be at least 2 and no more than 50";
    }
}

//Draws a grid of dimensions by dimensions, with each square being blocksize by
//blocksize pixels, and the entire thing being offset from the top and left by offSet
function gridDraw(blockSize, offSet, dimensions, fill, ctx) {
    ctx.lineWidth = 3;
    let offSetFull = Math.floor(600 % dimensions);
    let gridEnd = (600 - (offSetFull - offSet));
    if (fill) {
        for (let i = 0 + offSet; i < gridEnd; i += blockSize) {
            for (let j = 0 + offSet; j < gridEnd; j += blockSize) {
                ctx.fillRect(i, j, blockSize, blockSize);
                ctx.strokeRect(i, j, blockSize, blockSize);
            }
        }
    } else {
        for (let i = 0 + offSet; i < gridEnd; i += blockSize) {
            for (let j = 0 + offSet; j < gridEnd; j += blockSize) {
                ctx.strokeRect(i, j, blockSize, blockSize);
            }
        }
    }
}

//Calculate the offSet to fit a grid of dimensions by dimensions
//in the center of a 600 by 600 pixel canvas. Also calculates the maximum size of each square of
//the grid, creates a backend 2d array of dimensions by dimensions, and then calls
//drawGrid to draw the grid with the calculated specifications Additionally, defines useful
//variables used throughout diffent event calls from buttons and the mouse, as well as the
//event functions for these interactions and some functions necessary for the snake game and 
//the path solving function to work
function gridInit(dimensions, wrap) {
    let mouseClicked = false;
    let offSet = Math.floor((600 % dimensions) / 2);
    let blockSize = Math.floor(600 / dimensions);
    let myCanvas = document.getElementById("myCanvas");
    let ctx = myCanvas.getContext("2d");
    let errorMent = document.getElementById("errorText");
    errorMent.innerHTML = "Message Text: ";
    let solved = false; //gets set if the grid gets solved
    let maze = false; //gets set if the user created walls in the grid
    let snakeNum = 0; //Get set if snake is run. Becomes 1 if it's running, and 2 if it's paused 
    let snakeDir = 1; //Current movement direction of snake, get set depending on which WASD key is pressed
    let tempSnakeDir = 1; //Current direciton pressed by user for snake to travel in, based on WASD. 
    let fillOrRemove = false; //Variable that tells whether the current mouse dragging should fill blocks or
                              //remove unoccupied ones
    let wrapState = wrap; //Whether the snake wraps around the edges
    if (!wrapState) {
        document.getElementById("wraparound").innerHTML = "Wraparound - off";
    }
    ctx.strokeStyle = "blue";
    ctx.fillStyle = "white";
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    gridDraw(blockSize, offSet, dimensions, true, ctx);
    let backArray = [];
    for (let i = 0; i < dimensions; i++) {
        backArray.push([]);
        backArray[i].length = dimensions;
        backArray[i].fill(0);
    }

    //Sets the mouseClicked status variable to false, stopping the mousemove function
    myCanvas.onmouseup = function (event) {
        mouseClicked = false;
    }

    //If the grid has not been solved or is not playing snake, will set any unoccupied block
    //it clicks to occupied by a wall, and any occupied one to unoccupied. Also sets the fillOrRemove
    //variable to true if you clicked on an unoccupied space, and false if it was occupied.
    //Finally, sets the mouseClicked variable and the maze variable, as the mouse has now been clicked
    //and you have committed to making a maze. If the maze has already been solved, it also calls reInitGrid
    //which redraws the grid without the solved path, sets all the grid spots that are 2 to 0. Finally if the grid 
    //was solved it also sets the solved flag to false.
    myCanvas.onmousedown = function (event) {
        if (solved || snakeNum) {
            reInitGrid(backArray, dimensions, blockSize, offSet, ctx);
            solved = false;
            snakeNum = 0;
        }
        if (!snakeNum) {
            let xDown = event.clientX - ((this.offsetLeft - Math.floor(window.scrollX)) + (5 + offSet));
            let yDown = event.clientY - ((this.offsetTop - Math.floor(window.scrollY)) + (5 + offSet));
            let xDex = Math.floor(xDown / blockSize);
            let yDex = Math.floor(yDown / blockSize);
            if (xDex >= 0 && xDex < dimensions && yDex >= 0 && yDex < dimensions) {
                if (backArray[xDex][yDex] === 0) {
                    fillOrRemove = true;
                    ctx.fillStyle = "brown";
                    ctx.strokeStyle = "brown";
                    backArray[xDex][yDex] = 1;
                    ctx.fillRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                    ctx.strokeRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                } else {
                    fillOrRemove = false;
                    ctx.fillStyle = "white";
                    ctx.strokeStyle = "blue";
                    backArray[xDex][yDex] = 0;
                    ctx.fillRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                    ctx.strokeRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                }
                mouseClicked = true;
                maze = true;
            }
        }
    }

    //Sets mouse clicked to false, stopping the mousemove function
    myCanvas.onmouseleave = function (event) {
        mouseClicked = false;
    }

    //If the game is not snake and the mouse is clicked, then the function does one of 2 things. If fillOrRemove
    //is set, it will fill everyspace it comes across with brown, and occupy them making them walls. If it is not
    //set, it will make every square it comes across white with blue boundaries, as well as unset them 
    myCanvas.onmousemove = function (event) {
        if (mouseClicked && !snakeNum) {
            let xDown = event.clientX - ((this.offsetLeft - Math.floor(window.scrollX)) + (5 + offSet));
            let yDown = event.clientY - ((this.offsetTop - Math.floor(window.scrollY)) + (5 + offSet));
            let xDex = Math.floor(xDown / blockSize);
            let yDex = Math.floor(yDown / blockSize);
            if (xDex >= 0 && xDex < dimensions && yDex >= 0 && yDex < dimensions) {
                if (fillOrRemove) {
                    ctx.fillStyle = "brown";
                    ctx.strokeStyle = "brown";
                    backArray[xDex][yDex] = 1;
                    ctx.fillRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                    ctx.strokeRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                } else {
                    ctx.fillStyle = "white";
                    ctx.strokeStyle = "blue";
                    backArray[xDex][yDex] = 0;
                    ctx.fillRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                    ctx.strokeRect((xDex * blockSize) + offSet, (yDex * blockSize) + offSet, blockSize, blockSize);
                }
            }
        }
    }

    //Signals the pathing algorithm to start solving the maze if snake is not being played and
    //if it has not already been solved. Also sets the solved flag to true.
    document.getElementById("solve").onclick = function (event) {
        if (snakeNum) {
            snakeNum = 0;
        }
        reInitGrid(backArray, dimensions, blockSize, offSet, ctx);
        pathing(backArray, blockSize, offSet, ctx);
        solved = true;
        maze = true;
    }

    //Sets the tempSnakeDir variable to the appropriate direction based on which of WASD is clicked. It
    //also checks that you are not setting that variable to the direct opposite direction that the snake would be traveling,
    //because snakes can't go backwards
    document.onkeydown = function (event) {
        if (!event) {
            event = window.event;
        }
        let keyPressed = event.keyPressed || event.which;
        if (keyPressed === 68 && snakeDir != 3) {
            tempSnakeDir = 1;
        } else if (keyPressed === 83 && snakeDir != 4) {
            tempSnakeDir = 2;
        } else if (keyPressed === 65 && snakeDir != 1) {
            tempSnakeDir = 3;
        } else if (keyPressed === 87 && snakeDir != 2) {
            tempSnakeDir = 4;
        }
    }

    //Starts the snake game when the snake button is pressed. Starts the snake in the upper left corner with a length of 3.
    //If the game has already been started, it pauses the game, and if the game has already been paused it resumes.
    document.getElementById("snake").onclick = function (event) {
        if (maze) {
            ctx.strokeStyle = "blue";
            ctx.fillStyle = "white";
            gridDraw(blockSize, offSet, dimensions, true, ctx);
        }
        if (!snakeNum) {
            maze = false;
            snake = []
            snake.push(new snakeNode(1, 0));
            snake.push(new snakeNode(0, 0));
            snake.push(new snakeNode(-1, 0));
            do {
                food = [];
                food[0] = Math.floor(Math.random() * dimensions);
                food[1] = Math.floor(Math.random() * dimensions);
            } while (snakeContact(snake, food[0], food[1]) ||
                (food[0] === (snake[0].x + 1) && food[1] === snake[0].y));
            snakeNum = 1;
            updateSnake(snake, snakeNum, snakeDir, wrapState, food, blockSize, offSet, dimensions, ctx);
        } else if (snakeNum === 2) {
            snakeNum = 1;
            updateSnake(snake, snakeNum, snakeDir, wrapState, food, blockSize, offSet, dimensions, ctx);
        } else {
            snakeNum = 2;
        }
    }

    //Sets the wrapState variable if it is not set, and vice versa. Also changes the test of the
    //button to reflect the state of the variable
    document.getElementById("wraparound").onclick = function (event) {
        if (wrapState) {
            document.getElementById("wraparound").innerHTML = "Wraparound - off";
            wrapState = false;
        } else {
            document.getElementById("wraparound").innerHTML = "Wraparound - on";
            wrapState = true;
        }
    }

    //Reinitializes the grid upon pressing the restart button.
    document.getElementById("restart").onclick = function (event) {
        snakeNum = 0;
        gridInit(dimensions, wrapState);
    }

    //This function calls the updateSnake function, but with new variables in case they have
    //been set by the reactionary functions. It is part of the window to that it can be called
    //from outside the gridInit function. This allows the state variables in gridInit to stay
    //inaccessible from the outside, while also providing a method for updateSnake to call with setTimeout
    window.updateSnakeVal = (function (snake, food, dimensions, ctx) {
        if (snakeNum) {
            snakeDir = tempSnakeDir;
            updateSnake(snake, snakeNum, snakeDir, wrapState, food, blockSize, offSet, dimensions, ctx);
        }
    });
}

//Goes through the grid and redraws every block the way it was, unless it was part of the solved path or set
//to 2 by the pathing algorith. Solved path blocks are redrawn to empty, and all spots set to 2 are set to 0.
function reInitGrid(grid, dimensions, blockSize, offSet, ctx) {
    for (let i = 0; i < dimensions; i++) {
        for (let j = 0; j < dimensions; j++) {
            if (grid[i][j] === 2 || grid[i][j] === 0) {
                grid[i][j] = 0;
                ctx.fillStyle = "white";
                ctx.strokeStyle = "blue";
                ctx.fillRect((i * blockSize) + offSet, (j * blockSize) + offSet, blockSize, blockSize);
                ctx.strokeRect((i * blockSize) + offSet, (j * blockSize) + offSet, blockSize, blockSize);
            } else {
                ctx.fillStyle = "brown";
                ctx.strokeStyle = "brown";
                ctx.fillRect((i * blockSize) + offSet, (j * blockSize) + offSet, blockSize, blockSize);
                ctx.strokeRect((i * blockSize) + offSet, (j * blockSize) + offSet, blockSize, blockSize);
            }
        }
    }
}

//A snakeNode class to store the locations of a snake node. If possible
//I would have put this class and all the snake functions in another file,
//but I didn't because of browser compatibility issues.
class snakeNode {
    constructor(xPos, yPos) {
        this._x = xPos;
        this._y = yPos;
    }

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;
    }
}

//Main snake function. Checks to see if it should continue. If yes it calls updateSnakeNode to move
//the head node in snakeDir, then updates each other snake node with location of the node ahead of it, starting with 
//the node after the head. This essentially moves the snake, and after moving the snake it stores the previous location of the tail of the snake.
//Then it calls snakeFail to check if the snake has hit itself or the wall, and to move the head across the grid if wrapState
//is set. If the snake has hit something it shouldn't have, snakeFail returns 0 and updateSnake exits early. Then it calls
//snakeAteFood to check if the snake has eaten the food, and add a snakenode at the tails previous location if it has eaten
//the food. snakeAteFood also creates a new food object, and returns whether it ate food or not. If it didn't eat food, then
//updateSnake sets the tales previous location to a blank squre, as there is no longer a snake node there. Finally, the function
//calls drawSnake to draw the snake and it's food on the grid, and then it calls updateSnakeVal in 400 ms to update its
//state variables and start the whole process again.
function updateSnake(snake, snakeNum, snakeDir, wrapState, food, blockSize, offSet, dimensions, ctx) {
    if (snakeNum === 1) {
        let ateFood = false;
        let xOld = snake[0].x;
        let yOld = snake[0].y;
        updateSnakeNode(snake[0], snakeDir);
        let xTemp;
        let yTemp;
        for (let i = 1; i < snake.length; i++) {
            xTemp = snake[i].x;
            yTemp = snake[i].y;
            snake[i].x = xOld;
            snake[i].y = yOld;
            xOld = xTemp;
            yOld = yTemp;
        }
        if (!snakeFail(snake, dimensions, wrapState)) {
            ctx.strokeStyle = "red";
            gridDraw(blockSize, offSet, dimensions, false, ctx);
            return false;
        }
        ateFood = snakeAteFood(snake, food, xOld, yOld, dimensions);
        if (!ateFood && xOld >= 0 && xOld < dimensions &&
            yOld >= 0 && yOld < dimensions) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "blue";
            ctx.fillRect((xOld * blockSize) + offSet, (yOld * blockSize) + offSet, blockSize, blockSize);
            ctx.strokeRect((xOld * blockSize) + offSet, (yOld * blockSize) + offSet, blockSize, blockSize);
        }
        drawSnake(snake, offSet, blockSize, food, dimensions, ctx);
        setTimeout(updateSnakeVal, 250, snake, food, dimensions, ctx);
    }
}

//Checks if the head of the snake has moved onto the food. It it hasn't, then it just returns false. If it
//has, then it adds a snake node to the end of the snake at xOld, yOld, generates a new food piece, and returns true
function snakeAteFood(snake, food, xOld, yOld, dimensions) {
    if (snake[0].x === food[0] && snake[0].y === food[1]) {
        let foodX = food[0];
        let foodY = food[1]
        snake.push(new snakeNode(xOld, yOld));
        do {
            food[0] = Math.floor(Math.random() * dimensions);
            food[1] = Math.floor(Math.random() * dimensions);
        } while (snakeContact(snake, food[0], food[1]) ||
            ((food[0] === foodX) && (food[1] === foodY)));
        return true;
    }
    return false;
}

//If wrapState is set it will check if the snake's head has gone outside of the boundaries, and move
//it to the opposite side if it has, wrapping around the grid. It then checks if the snake has come into 
//contact with itself, and if it hasn't it goes to the end and returns true. If it has, it returns false.
//If wrapState is set, then it checks if the head has gone out of bounds or come into contact with the body, it
//returns false. Otherwise, it returns true.
function snakeFail(snake, dimensions, wrapState) {
    if (wrapState) {
        if (snake[0].x < 0) {
            snake[0].x = dimensions + snake[0].x;
        } else if (snake[0].x >= dimensions) {
            snake[0].x = dimensions - snake[0].x;
        } else if (snake[0].y < 0) {
            snake[0].y = dimensions + snake[0].y;
        } else if (snake[0].y >= dimensions) {
            snake[0].y = dimensions - snake[0].y;
        }
        if (snakeContact(snake, snake[0].x, snake[0].y)) {
            let errorMent = document.getElementById("errorText");
            errorMent.innerHTML = "Message Text: Snake done";
            return false;
        }
    } else {
        if (snake[0].x < 0 || snake[0].x >= dimensions ||
            snake[0].y < 0 || snake[0].y >= dimensions
            || snakeContact(snake, snake[0].x, snake[0].y)) {
            let errorMent = document.getElementById("errorText");
            errorMent.innerHTML = "Message Text: Snake done";
            return false;
        }
    }
    return true;
}

//returns true if the given xPos and yPos are inside the snake. Returns false if they aren't
function snakeContact(snake, xPos, yPos) {
    let status = false;
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === xPos && snake[i].y === yPos) {
            status = true;
        }
    }
    return status;
}

//Draws the snake blue with a grey outline, and draws the food orange.
function drawSnake(snake, offSet, blockSize, food, dimensions, ctx) {
    ctx.fillStyle = "orange";
    ctx.strokeStyle = "orange";
    ctx.fillRect((food[0] * blockSize) + offSet, (food[1] * blockSize) + offSet, blockSize, blockSize);
    ctx.strokeRect((food[0] * blockSize) + offSet, (food[1] * blockSize) + offSet, blockSize, blockSize);
    ctx.fillStyle = "blue";
    ctx.strokeStyle = "SlateGrey";
    snake.forEach(function (element) {
        ctx.fillRect((element.x * blockSize) + offSet, (element.y * blockSize) + offSet, blockSize, blockSize);
        ctx.strokeRect((element.x * blockSize) + offSet, (element.y * blockSize) + offSet, blockSize, blockSize);
    });
}

//Moves the snake node in the direction specified by direction. 1 = right,
//2 = down, 3 = left, and 4 = up
function updateSnakeNode(snakeNode, direction) {
    if (direction === 1) {
        snakeNode.x++;
    } else if (direction === 2) {
        snakeNode.y++;
    } else if (direction === 3) {
        snakeNode.x--;
    } else if (direction === 4) {
        snakeNode.y--;
    }
}

//pathNode function that contains the position, value (combination of estimated cost
//to end and movement cost from start), estimated cost to end, movement cost from beginning,
//and parent node you travel to this node from.
class pathNode {
    constructor(xPos, yPos, worth, estCost, moveCost, parent) {
        this._x = xPos;
        this._y = yPos;
        this._worth = worth;
        this._estCost = estCost;
        this._moveCost = moveCost;
        this._parent = parent;
    }
    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get worth() {
        return this._worth;
    }

    set worth(value) {
        this._worth = value;
    }

    get moveCost() {
        return this._moveCost;
    }

    set moveCost(value) {
        this._moveCost = value;
    }

    get estCost() {
        return this._estCost;
    }

    set estCost(value) {
        this._estCost = value;
    }

    get parent() {
        return this._parent;
    }

    set parent(value) {
        this._parent = value;
    }
}

//A path class, used to store the open list and perform actions on them. I ideally would
//have had this, the pathNode class, and the other path functions in another class but
//I did not do that for browser compatibility issues.
class path {
    constructor() {
        this._open = [];
    }

    //Checks the open array to see if the existing node with the given x and y exists. If the node exists then
    //the function checks if the new version of the node has a smaller move cost, and if it does then it
    //changes the existing nodes moveCost to the new one, worth to the new one, and parentNode
    //to the new one
    update(xPos, yPos, value, parentNode) {
        for (let i = 0; i < (this._open).length; i++) {
            let tempNode = this._open[i];
            if (tempNode.x === xPos && tempNode.y === yPos) {
                if (tempNode.moveCost > value) {
                    tempNode.worth = tempNode.estCost + value;
                    tempNode.moveCost = value;
                    tempNode.parent = parentNode;
                }
                return true;
            }
        }
        return false;
    }

    //Adds the node to the open array if the node does not already exist in the array. If it already exists
    //it checks if the new version of the node has a smaller move cost. if it has a better move cost then it
    //changes the existing nodes moveCost to the new one, worth to the new one, and parentNode
    //to the new one
    add(node) {
        if (!(this.update(node.x, node.y, node.moveCost, node.parent))) {
            this._open.push(node);
        }
    }

    //Deletes the node from the open list. It is named swap because traditionally
    //A* would have a closed list of nodes that have already been checked that you would
    //swap the node into. I did not implement the closed list because I simply set visited nodes in the grid,
    //so this function only removes the node from open
    swap(xPos, yPos) {
        for (let i = 0; i < (this._open).length; i++) {
            let tempNode = this._open[i];
            if (tempNode.x === xPos && tempNode.y === yPos) {
                ((this._open).splice(i, 1))[0];
                return true;
            }
        }
        return false;
    }

    //Returns a boolean on whether or not the open array has values
    valid() {
        if ((this._open).length !== 0) {
            return true;
        } else {
            return false;
        }
    }

    //Determines the next node and returns it. Returns the node from open with the lowest
    //worth. If there are multiple nodes with the same worth it will check if any are directly adjacent to 
    //the current node. If only one is  directly adjacent then it returns that one, but if there are multiple it
    //chooses them in the importance right->down->left->up. If none are adjacent it chooses 
    //the first one it finds in the list, starting from 0.
    next(node) {
        let least = (this._open)[0];
        let proximity = 5;
        (this._open).forEach(function (element) {
            if (element.worth < least.worth) {
                least = element;
            } else if (element.worth === least.worth) {
                let newProximity;
                if (element.x === node.x) {
                    if (element.y - 1 === node.y) {
                        newProximity = 2;
                    } else if (element.y + 1 === node.y) {
                        newProximity = 4;
                    }
                }
                if (element.y === node.y) {
                    if (element.x - 1 === node.x) {
                        newProximity = 1;
                    } else if (element.x + 1 === node.x) {
                        newProximity = 3;
                    }
                }
                if (newProximity < proximity) {
                    least = element;
                    proximity = newProximity;
                }
            }
        });
        return least;
    }

    get open() {
        return this._open;
    }
}


//Calculates the least cost to the bottom right corner from the top corner. Avoids any obstacles
//created by the user, a
function pathing(grid, blockSize, offSet, ctx) {
    let pathMain = new path();
    let lastEntry = grid.length - 1;
    let node = new pathNode(lastEntry, lastEntry, (grid.length * 2), (grid.length * 2), 0, null);
    if (grid[lastEntry][lastEntry] === 0) {
        pathMain.add(node);
    }
    while (pathMain.valid() && ((node.x !== (0)) || (node.y !== (0)))) {
        grid[node.x][node.y] = 2;
        pathMain.swap(node.x, node.y);
        calculatePath(node, pathMain, grid);
        node = pathMain.next(node);
    }

    if (pathMain.valid()) {
        ctx.fillStyle = "green";
        ctx.strokeStyle = "blue";
        drawPath(node, blockSize, offSet, ctx)
        let errorMent = document.getElementById("errorText");
        errorMent.innerHTML = "Message Text: Path found successfully";
    } else {
        let errorMent = document.getElementById("errorText");
        errorMent.innerHTML = "Message Text: Could not find path";
        ctx.strokeStyle = "red";
        gridDraw(blockSize, offSet, grid.length, false, ctx);
    }
}

//Draws the path back to the origin from the given node in green
function drawPath(node, blockSize, offSet, ctx) {
    if (node !== null) {
        ctx.fillRect((node.x * blockSize) + offSet, (node.y * blockSize) + offSet, blockSize, blockSize);
        setTimeout(drawPath, 25, node.parent, blockSize, offSet, ctx);
    }
}

// Adds all the available nodes directly adjacent to the given node to the open list of pathMain
function calculatePath(parentNode, pathMain, grid) {
    let pathTemp = checkPath(parentNode.x - 1, parentNode.y, parentNode.moveCost + 1, parentNode, grid);
    if (pathTemp) {
        pathMain.add(pathTemp);
    }
    pathTemp = checkPath(parentNode.x, parentNode.y - 1, parentNode.moveCost + 1, parentNode, grid);
    if (pathTemp) {
        pathMain.add(pathTemp);
    }
    pathTemp = checkPath(parentNode.x + 1, parentNode.y, parentNode.moveCost + 1, parentNode, grid);
    if (pathTemp) {
        pathMain.add(pathTemp);
    }
    pathTemp = checkPath(parentNode.x, parentNode.y + 1, parentNode.moveCost + 1, parentNode, grid);
    if (pathTemp) {
        pathMain.add(pathTemp);
    }
}

// Determines if the given location is valid, and if it is calculates the correct movement distance from
// the origin(moveCost), the estimated travel time to the endpoint(estCost), and the combination of the
// two. Returns a node object created with those values if the location is valid, otherwise returns false;
function checkPath(xPos, yPos, moveCost, parentNode, grid) {
    if (validPoint(xPos, yPos, grid)) {
        let shortPath = (xPos) + (yPos);
        let pathCost = shortPath + moveCost;
        return new pathNode(xPos, yPos, pathCost, shortPath, moveCost, parentNode);
    } else {
        return false;
    }
}

// Deterimines whether or not the desired point is valid (within the grid and walkable)
function validPoint(xPos, yPos, grid) {
    if (xPos >= 0 && xPos < grid.length && yPos >= 0 && yPos < grid.length
        && grid[xPos][yPos] === 0) {
        return true;
    } else {
        return false;
    }
}

//Pre-initialize the grid to 10.
gridInit(10);