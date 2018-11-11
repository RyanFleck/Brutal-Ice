class Input {
    constructor() {
        this.down = false;
        this.up = false;
        this.left = false;
        this.right = false;
        this.primary = false;
        this.secondary = false;

        document.addEventListener('keydown', (e) => {
            console.log(`>> KEY DOWN ${e.keyCode} + ${e.key} ${e.key.length}`);

            switch (e.keyCode) {
            case 87: // W Key.
            case 38: // Up arrow.
                this.up = true;
                break;
            case 65: // A key.
            case 37:
                this.left = true;
                break;
            case 83:
            case 40:
                this.down = true;
                break;
            case 68:
            case 39:
                this.right = true;
                break;
            case 74: // J key.
                this.secondary = true;
                break;
            case 32: // Spacebar.
                this.primary = true;
                break;
            default:
                break;
            }
        }, false);


        document.addEventListener('keyup', (e) => {
            console.log(`<< KEY UP ${e.keyCode} + ${e.key} ${e.key.length}`);

            switch (e.keyCode) {
            case 87: // W Key.
            case 38: // Up arrow.
                this.up = false;
                break;
            case 65: // A key.
            case 37:
                this.left = false;
                break;
            case 83:
            case 40:
                this.down = false;
                break;
            case 68:
            case 39:
                this.right = false;
                break;
            case 74: // J key.
                this.secondary = false;
                break;
            case 32: // Spacebar.
                this.primary = false;
                break;
            default:
                break;
            }
        }, false);
    }


    static notSetWarning() {
        console.trace('Action not set!');
    }
}

export default Input;
