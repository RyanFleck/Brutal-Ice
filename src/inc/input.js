class Input {
    constructor() {
        this.downaction = this.constructor.notSetWarning;
        this.upaction = this.constructor.notSetWarning;
        this.leftaction = this.constructor.notSetWarning;
        this.rightaction = this.constructor.notSetWarning;
        this.primaryaction = this.constructor.notSetWarning;
        this.secondaryaction = this.constructor.notSetWarning;

        document.addEventListener('keydown', (e) => {
            console.log(`KEYDOWNx ${e.keyCode} + ${e.key} ${e.key.length}`);

            switch (e.keyCode) {
            case 87: // W Key.
            case 38: // Up arrow.
                this.upaction();
                break;
            case 65: // A key.
            case 37:
                this.leftaction();
                break;
            case 83:
            case 40:
                this.downaction();
                break;
            case 68:
            case 39:
                this.rightaction();
                break;
            case 74: // J key.
                this.secondaryaction();
                break;
            case 32: // Spacebar.
                this.primaryaction();
                break;
            default:
                break;
            }
        }, false);

        console.log('Input set up!');
    }

    static notSetWarning() {
        console.trace('Action not set!');
    }
}

export default Input;
