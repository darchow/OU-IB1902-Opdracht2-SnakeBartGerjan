import { einde } from './presenter.js';
import { R, STEP, XMIN, YMIN, DIRECTIONS, width, height, xMax, yMax } from './environment.js';
/***
Het model is het domein. Het is de bedoeling dat het domein geheel
onafhankelijk is. Het model hoeft dus de rest van de applicatie niet te
kennen. Het model kan, indien nodig, events gebruiken om naar de
buitenwereld te communiceren. Het model roept dus niet direct func-
ties aan van de andere lagen.
***/
const SNAKE = "DarkRed", // kleur van een slangsegment
FOOD = "Olive", // kleur van voedsel
HEAD = "DarkOrange", // kleur van de kop van de slang
// er moet gelden: WIDTH = HEIGHT
NUMFOODS = 5; // aantal voedselelementen
var snake, foods, // voedsel voor de slang
movable, // hulp-boolean die ervoor zorgt dat je maar \'e\'en
// keer een directie kunt opgeven in een interval.
direction = DIRECTIONS.UP;
/***************************************************************************
**                 Constructors                                          **
***************************************************************************/
class Snake {
    constructor(segments) {
        this.isAlive = () => {
            return this.lives;
        };
        this.canMove = (direction) => {
            var canMove = false;
            if (direction) {
                //De beweging kan als het laatste segment (kop van slang) + step
                //binnen het canvas blijft
                var _head = this.segments[this.segments.length - 1];
                switch (direction) {
                    case DIRECTIONS.UP:
                        canMove = _head.y - STEP >= 0;
                        break;
                    case DIRECTIONS.RIGHT:
                        canMove = _head.x + STEP <= xMax;
                        break;
                    case DIRECTIONS.DOWN:
                        canMove = _head.y + STEP <= yMax;
                        break;
                    case DIRECTIONS.LEFT:
                        canMove = _head.x - STEP >= 0;
                        break;
                }
            }
            return canMove;
        };
        //verplaats de slang naar de nieuwe locatie, maak hem langer in het geval
        //van eten, of laat hem sterven in het geval van het happen van de staart
        this.doMove = (direction) => {
            if (direction) {
                //pass by reference
                var _head = this.segments[this.segments.length - 1];
                var _new_head;
                switch (direction) {
                    case DIRECTIONS.UP:
                        _new_head = createSegment(_head.x, (_head.y - STEP));
                        break;
                    case DIRECTIONS.RIGHT:
                        _new_head = createSegment((_head.x + STEP), _head.y);
                        break;
                    case DIRECTIONS.DOWN:
                        _new_head = createSegment(_head.x, (_head.y + STEP));
                        break;
                    case DIRECTIONS.LEFT:
                        _new_head = createSegment((_head.x - STEP), _head.y);
                        break;
                }
                //_head is nu body, zet hem op de juiste kleur
                _head.color = SNAKE;
                //geef _new_head de juiste kleur en voeg toe aan de slang
                if (typeof (_new_head) != undefined) {
                    _new_head.color = HEAD;
                }
                //controleer of we niet in onze staart bijten
                this.segments.forEach((item, i) => {
                    if (detectCollision(item, _new_head)) {
                        this.lives = false;
                        //bijt de rest van de staart eraf
                        this.segments.splice(0, i);
                    }
                });
                //voeg de kop toe.
                this.segments.push(_new_head);
                //zet een tijdelijke variabele, zodat we niet los op collisions
                //hoeven te zoeken
                var _remove_tail = true;
                foods.forEach((item, i) => {
                    if (detectCollision(item, _new_head)) {
                        foods.splice(i, 1);
                        //staart niet verwijderen, want we zijn gegroeid door te eten.
                        _remove_tail = false;
                    }
                });
                if (_remove_tail) {
                    //verwijder het laatste element van de staart, want we zijn verplaatst
                    this.segments.splice(0, 1);
                }
            }
        };
        this.segments = segments;
        this.lives = true;
        //zet de kop van de slang op de juiste kleur
        this.segments[segments.length - 1].color = HEAD;
    }
}
class SnakeElement {
    /**
    @constructor SnakeElement
    @param radius straal
    @param {number} x x-coordinaat middelpunt
    @param {number} y y-coordinaat middelpunt
    @param {string} color kleur van het element
    @param {function} prototype.collidesWithOneOf(arguments) bepaalt of iets uit
            de lijst gelijke waarde en type heeft voor de x en y co\"ordinaten
    */
    constructor(radius, x, y, color) {
        // verplaatst naar prototype, omdat het een gedeelde functie is
        this.collidesWithOneOf = (parameters) => {
            var numEquals = 0;
            if (parameters) {
                parameters.forEach((item, i) => {
                    //controleer niet op co\"ordinaat inclusief de radius
                    if (detectCollision(item, this)) {
                        numEquals++;
                    }
                });
            }
            return numEquals > 0;
        };
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.color = color;
    }
}
/***************************************************************************
**                 HulpFuncties                                          **
***************************************************************************/
/**
@function createSegment(x,y) -> SnakeElement
@desc Slangsegment creeren op een bepaalde plaats
@param {number} x x-coordinaat middelpunt
@param {number} y y-coordinaart middelpunt
@return: {SnakeElement} met straal R en color SNAKE
*/
function createSegment(x, y) {
    return new SnakeElement(R, x, y, SNAKE);
}
/**
@function createFood(x,y) -> SnakeElement
@desc Voedselelement creeren op een bepaalde plaats
@param {number} x x-coordinaat middelpunt
@param {number} y y-coordinaart middelpunt
@return: {SnakeElement} met straal R en color FOOD
*/
function createFood(x, y) {
    return new SnakeElement(R, x, y, FOOD);
}
/**
@function detectCollision(a,b) -> boolean
@desc controleert of twee elementen overlappende x en y co\"ordinaten hebben
@param {SnakeElement} a eerste element voor de vergelijking
@param {SnakeElement} b tweede element voor de vergelijking
@return: true als hun co\"ordinaten overlappen, false wanneer dat niet zo is.
*/
function detectCollision(a, b) {
    return a.x >= b.x - R && a.x <= b.x + R && a.y >= b.y - R && a.y <= b.y + R;
}
/**
@function getRandomInt(min: number, max: number) -> number
@desc Creeren van random geheel getal in het interval [min, max]
@param {number} min een geheel getal als onderste grenswaarde
@param {number} max een geheel getal als bovenste grenswaarde (max > min)
@return {number} een random geheel getal x waarvoor geldt: min <= x <= max
*/
function getRandomInt(min, max) {
    return Math.floor((Math.random() * (max - min + 1) + min) / STEP) * STEP;
}
/**
@function createFoods() -> array met food
@desc [SnakeElement] array van random verdeelde voedselpartikelen
@return [SnakeElement] array met food
*/
function createFoods() {
    var i = 0, food;
    //we gebruiken een while omdat we, om een arraymethode te gebruiken,
    //eerst een nieuw array zouden moeten creëren (met NUMFOODS elementen)
    while (i < NUMFOODS) {
        food = createFood(XMIN + getRandomInt(0, xMax), YMIN + getRandomInt(0, yMax));
        if (!food.collidesWithOneOf(snake.segments)
            &&
                !food.collidesWithOneOf(foods)) {
            foods.push(food);
            i++;
        }
    }
}
/***************************************************************************
**                 Gamelogic                                              **
***************************************************************************/
/**
@function move(direction) -> void
@desc Beweeg slang in aangegeven richting
tenzij slang uit canvas zou verdwijnen
@param   {string} direction de richting (UP, DOWN, LEFT of RIGHT)
@return: de te nemen actie
*/
function move(direction) {
    //als het eten op is, hebben we gewonnen
    var actie;
    if (foods.length === 0) {
        einde(true);
        actie = "toon winnaarsscherm";
    }
    else if (snake.canMove(direction) && snake.isAlive()) {
        snake.doMove(direction);
        actie = "bewegen";
    }
    else {
        einde(false);
        actie = "toon verliezersscherm";
    }
    //nu de move klaar is accepteren we weer nieuwe inputs van de gebruiker
    movable = true;
    return actie;
}
/**
@function createStartSnake() -> Snake
@desc Slang creëren, bestaande uit  twee segmenten,
in het midden van het veld
@return: slang volgens specificaties
*/
function createStartSnake() {
    var segments = [createSegment(R + width / 2, R + height / 2),
        createSegment(R + width / 2, height / 2 - R)];
    snake = new Snake(segments);
}
/**
 * @function setFoods(f) -> void
 * @desc setter for foods
 * @param f {array} sets foods to f
 */
function setFoods(f) {
    foods = f;
}
/**
 * @function setDirection(d) -> void
 * @desc setter for direction
 * @param d {string} sets direction to d
 */
function setDirection(d) {
    direction = d;
}
/**
 * @function setMovable(m) -> void
 * @desc setter for movable
 * @param m {boolean} sets movable to m
 */
function setMovable(m) {
    movable = m;
}
export { createFoods, createStartSnake, createSegment, move, setFoods, setDirection, setMovable, snake, foods, direction, movable };
