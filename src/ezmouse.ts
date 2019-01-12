const _ = require('lodash');
const $ = require('jquery');
const jss = require('jss').default;
const preset = require('jss-preset-default').default;

enum MoveDirection {
    up,
    down,
    left,
    right,
    none
}

type MoveDelta = {
    delta: number,
    direction: MoveDirection
}

type Position = {
    left: number,
    top: number
}

const imageBase64Data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAA8CAQAAAC+sDBrAAAABGdBTUEAALGPC/xhBQAAAAJiS0dEAP+Hj8y/AAAAB3RJTUUH4wEMFgo2Bkz3VQAAAuNJREFUWMOt1k1IFGEcx/Hvrua7borQy6XAg6fKY2UHezloCh0NCToaaN3KNTOJzBcCkaJLQYEQepMuCtLNuhmU1E1PvYBm6rq4q/ny6zDj4tq87s5zeZjn5cNv5j8PM9BDhABbDu+AGbaCI0WcHoqDBAMmFTSpFPkwGFKoVMUBkkJ16lZ5YKRQoxb0VBGD7M6WFGpQXEkNGuRatqRQg9YkJfbILFOmwH1kVin3gcGQaaCU0MAe+SAz8gB4gCwKAMyWtACzIy3BNLLLH2kDSgn1Z0TaggZZ5pt0ADMjHcF9ZIz73kgX0D/pCkrr6vNBegD9kZ7ANLLTmfQISut64on0DHolfYBpZJTCAEAvpE9QWlevSh1I36AbmQHoTGYE7iNX6UgnMwSldT22JDMGjZRlB8hct6MOYgNZzoRpJcEwiQidwDOSnsAkw8wQtiHjHAJIkR7AQmDcfVmELuCFA7hDiDAQook3zIFYIknIdkOYFtZswRVGuMQpAKq5whzsMsIIOJAhNm2qvKq7KlGvds3rSVUIMcFh93u3AFd1T4VC5/TDHPmjBiGWuerGWRQvRh/PSQKzTJtjFVwjH8qNzlfCvXRssIWaFTfH53RaiDnO+EqYSrfIIJ9gmllz5iQNhFKdx4Sr6jDS/aaNfKJshxTVtpnxg44J8ZHjHsE0Lg+oYR7VaN4E42o2fumvewDjih3koIBXKF8vU893VCVCjFHiAjbqu6J7XLvJATSxghq1bII/dV6IX9S6gBfUpqL/OahkClVqygR31a8cscsAOY5gofKsOIB2/qI2bZrkZ1UJ8YUqRxAhliw4qOYbqtZXE9xQq/GOtrqBS9y24CCXIZSroVRhxozCTFDhBNpxABdZQHValLSot7qsXCFWqLcHnTiIMI4ieq1R1RvpRJwJztptWOSOAwdwk0RIR43PkYgzSQuV9stvUIBzO8EMHjHA7agDYR6xQ4wJd8xrq+U9tzjiZek/hK/RFl8CoeAAAAArdEVYdENvbW1lbnQAUmVzaXplZCBvbiBodHRwczovL2V6Z2lmLmNvbS9yZXNpemVCaY0tAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTAxLTEyVDIxOjEwOjU0KzAxOjAw+pP8jQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wMS0xMlQyMToxMDo1NCswMTowMIvORDEAAAASdEVYdFNvZnR3YXJlAGV6Z2lmLmNvbaDDs1gAAAAASUVORK5CYII=";

export default class EZMouse {
    shown: boolean = false;
    moveDelta: MoveDelta = {
        delta: 0,
        direction: MoveDirection.none
    };
    currentElement: Node | null = null;

    constructor() {
        this.shown = false;
        this.moveDelta = {
            delta: 1,
            direction: MoveDirection.none
        };
    }

    private resetDeltaDebounced = _.debounce(() => {
        this.resetDelta();
    }, 100);

    private createNode(): void {
        if ($('img.ez-mouse').length === 0) {
            jss.setup(preset());

            const styles = {
                '@global': {
                    '.ezmouse-highlight': {
                        boxShadow: '0px 0px 21px 0px rgba(36,137,150,1)'
                    }
                },
                'ez-mouse': {
                    position: 'absolute',
                    marginLeft: 1,
                    marginTop: 1,
                    zIndex: 16777271, // maximum value
                    height: 16
                }
            };
            const {classes} = jss.createStyleSheet(styles).attach();

            $(`<img 
                src="${imageBase64Data}"
                class="ez-mouse ${classes['ez-mouse']}">`).appendTo($('body'));

        }
    }

    private resetDelta(): void {
        this.moveDelta = {
            delta: 1,
            direction: MoveDirection.none
        };
    }

    private keyboardDispatcher(keyCode: number, isCtrl: boolean = false): boolean {
        let preventDefault: boolean = false;

        if (isCtrl && keyCode === 77) {
            this.toggleShow();
            preventDefault = true;
        }
        else if (keyCode === 37) {
            this.moveLeft();
            preventDefault = true;
        }
        else if (keyCode === 39) {
            this.moveRight();
            preventDefault = true;
        }
        else if (keyCode === 38) {
            this.moveUp();
            preventDefault = true;
        }
        else if (keyCode === 40) {
            this.moveDown();
            preventDefault = true;
        }
        else if (keyCode === 17) {
            this.rightClick();
            preventDefault = true;
        }
        else if (keyCode === 32) {
            this.mousedown();
            this.click();
            this.focus();
            this.mouseup();
            preventDefault = true;
        }
        this.resetDeltaDebounced();
        return preventDefault;
    }

    private destroyNode(): void {
        $('img.ez-mouse').remove();
    }

    private keyboardEventHandler(event: KeyboardEvent): void {
        if (this.keyboardDispatcher(event.keyCode, event.ctrlKey)) {
            event.preventDefault();
        }
    }

    private onMouseMove(position: Position): void {
        const mouseNode = document.elementFromPoint(position.left, position.top);

        if (this.currentElement && this.currentElement !== mouseNode) {
            $(this.currentElement).removeClass('ezmouse-highlight');
            // $(this.currentElement).mouseout();
            $(this.currentElement).mouseleave();

            // $(mouseNode).mousemove();
            $(mouseNode).mouseenter();
            // $(mouseNode).mouseover();
        }
        this.currentElement = mouseNode;
        if (mouseNode) {
            $(mouseNode).addClass('ezmouse-highlight');
        }
    }

    private moveUp(): void {
        if (this.moveDelta.direction == MoveDirection.up) {
            this.moveDelta.delta++;
        }
        else {
            this.moveDelta.direction = MoveDirection.up;
            this.moveDelta.delta = 1;
        }

        const $pointer = $('img.ez-mouse');
        const $position = $pointer.position();

        $position.top = Math.round($position.top) - this.moveDelta.delta;
        if ($position.top < 0) {
            return;
        }
        $pointer.css('top', `${$position.top}px`);
        this.onMouseMove($position);
    }

    private moveDown(): void {
        if (this.moveDelta.direction === MoveDirection.down) {
            this.moveDelta.delta++;
        }
        else {
            this.moveDelta.direction = MoveDirection.down;
            this.moveDelta.delta = 1;
        }

        const $pointer = $('img.ez-mouse');
        const $position = $pointer.position();

        $position.top = Math.round($position.top) + this.moveDelta.delta;

        $pointer.css('top', `${$position.top}px`);
        this.onMouseMove($position);
    }

    private moveLeft(): void {
        if (this.moveDelta.direction === MoveDirection.left) {
            this.moveDelta.delta++;
        }
        else {
            this.moveDelta.direction = MoveDirection.left;
            this.moveDelta.delta = 1;
        }
        const $pointer = $('img.ez-mouse');
        const $position = $pointer.position();

        $position.left = Math.round($position.left) - this.moveDelta.delta;
        if ($position.left < 0)
            return;

        $pointer.css('left', `${$position.left}px`);
        this.onMouseMove($position);
    }

    private moveRight(): void {
        if (this.moveDelta.direction === MoveDirection.right) {
            this.moveDelta.delta++;
        }
        else {
            this.moveDelta.direction = MoveDirection.right;
            this.moveDelta.delta = 1;
        }
        const $pointer = $('img.ez-mouse');
        const $position = $pointer.position();

        $position.left = Math.round($position.left) + this.moveDelta.delta;
        $pointer.css('left', `${$position.left}px`);

        this.onMouseMove($position);
    }

    private click(): void {
        if (this.currentElement) {
            $(this.currentElement).click();
        }
    }

    private focus(): void {
        if (this.currentElement) {
            $(this.currentElement).focus();
        }
    }

    private rightClick(): void {
        if (this.currentElement) {
            $(this.currentElement).contextmenu();
        }
    }

    private mousedown(): void {
        if (this.currentElement) {
            $(this.currentElement).mousedown();
        }
    }

    private mouseup(): void {
        if (this.currentElement) {
            $(this.currentElement).mouseup();
        }
    }

    private toggleShow(): void {
        this.show(!this.shown);
        this.moveDelta.direction = MoveDirection.none;
    }

    public run(): void {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            this.keyboardEventHandler(event);
        });
        this.createNode();
        this.show(true);
    }

    public stop(): void {
        document.removeEventListener('keydown', (event: KeyboardEvent) => {
            this.keyboardEventHandler(event);
        });
        this.destroyNode();
        this.show(false);
    }

    public hide(): void {
        this.show(false);
    }

    public show(show = true): void {
        if (show) {
            if (this.shown == false) {
                $('img.ez-mouse').show();
                this.shown = true;
            }
        }
        else {
            $('img.ez-mouse').hide();
            this.shown = false;
        }
    }
}
