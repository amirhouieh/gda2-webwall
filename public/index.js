const simulateMouseMove = (context) => (x, y) => {
    const event = new MouseEvent('mousemove', {
        view: context,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y
    });
    context.dispatchEvent(event);
};

const simulateMouseClick = (context) => (x, y) => {
    const event = new MouseEvent('click', {
        view: context,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y
    });
    context.dispatchEvent(event);
};

const ignoreTrusted = (event) => {
    if(event.isTrusted) return;
};

const remap = (num, in_min, in_max, out_min, out_max) => {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const triggerMouseMove = (frame, event) => {
    frame.contentWindow.eval(`simulateMouseMove(${event.clientX}, ${event.clientY});`);
};

const triggerMouseClick = (frame, event) => {
    frame.contentWindow.eval(`simulateMouseClick(${event.clientX}, ${event.clientY});`);
};

const global = {};

global.props = {
    GRID_PADDING: 50,
    COLUMN_NUMBER: 7,
    ROW_NUMBER:  Math.ceil(framesUrl.length / 7),
    GAP: 5
};

global.state = {
    gapWInPercent: 0,
    gapHInPercent: 0,
    colW: 0,
    colH: 0
};

const createFrame = (url, b, grid) => {
    const frameWrapper = document.createElement("div");
    const frame = document.createElement("iframe");
    frame.frameBorder = "0";
    frame.src = url;
    frame.style.maxHeight = `${global.state.colH}vh`;
    frameWrapper.id = "frame"+b;
    frameWrapper.classList.add("grid-cell");
    frameWrapper.append(frame);
    grid.append(frameWrapper);

    frame.contentWindow.simulateMouseMove = simulateMouseMove(frame.contentWindow);
    frame.contentWindow.simulateMouseClick = simulateMouseClick(frame.contentWindow);

    frame.onload = () => {
        frame.contentWindow.document.body.style.zoom = `${global.state.colW}%`;
    };

    frame.contentWindow.onerror = () => {
        frame.classList.add("error");
    };

    return frame;
};

const updateState = () => {
    const {
        COLUMN_NUMBER,
        ROW_NUMBER,
        GAP,
        GRID_PADDING
    } = global.props;

    const gridW =  window.innerWidth - 2*GRID_PADDING;
    const gridH =  window.innerHeight - 2*GRID_PADDING;

    const gridWInPercent = (gridW*100) / window.innerWidth;
    const gridHInPercent = (gridH*100) / window.innerHeight;

    const gapWInPercent = (GAP*100) / gridW;
    const gapHInPercent = (GAP*100) / gridH;

    global.state = {
        gapWInPercent,
        gapHInPercent,
        colW: (gridWInPercent-((COLUMN_NUMBER-1)*gapWInPercent)) / COLUMN_NUMBER,
        colH: (gridHInPercent-((ROW_NUMBER-1)*gapHInPercent)) / ROW_NUMBER-1,
    };
};

const setUpGridStyle = (grid) => {
    const {
        COLUMN_NUMBER,
        ROW_NUMBER,
        GAP,
        GRID_PADDING,
    } = global.props;

    grid.style.width = `calc(100vw - ${2*GRID_PADDING}px)`;
    grid.style.height = `calc(100vh - ${2*GRID_PADDING}px)`;
    grid.style.gridTemplateColumns = `repeat(${COLUMN_NUMBER}, auto)`;
    grid.style.gridTemplateRows = `repeat(${ROW_NUMBER}, auto)`;
    grid.style.gridGap = `${GAP}px`;
};

window.onload = () => {
    const grid = document.querySelector(".grid");
    const canvas = document.querySelector(".canvas");

    updateState();
    setUpGridStyle(grid);

    const frames = framesUrl.map((path, i) => {
        return createFrame(`frames/${path}/index.html`, i, grid)
    });

    canvas.onmousemove = (event) => {
        frames.forEach((frame) => {
            triggerMouseMove(frame, event)
        });
    };

    canvas.onclick = (event) => {
        frames.forEach((frame) => {
            triggerMouseClick(frame, event)
        });
    };


    window.onresize = () => {
        updateState();
    }
}
