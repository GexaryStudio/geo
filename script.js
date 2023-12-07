console.clear();

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const w = 512; // Canvas Width
const h = 512; // Canvas height
const hW = w / 2; // Canvas Width
const hH = h / 2; // Canvas height

canvas.addEventListener("contextmenu", (e) => e.preventDefault());

let pixelRatio = 0;
function resizeCanvas() {
    pixelRatio = Math.ceil(window.devicePixelRatio || 1); // Pixel Ratio
    // const pixelRatio = 1; // Pixel Ratio
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = w * pixelRatio;
    canvas.height = h * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: parseInt(e.clientX - rect.left),
        y: parseInt(e.clientY - rect.top),
    };
}

canvas.setAttribute("tabindex", "0");
canvas.focus();

// window.addEventListener("resize", resizeCanvas, false);

resizeCanvas();
function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

/*






















*/
let mousePos = { x: 0, y: 0 };
let zF = 1; // Zoom Level
let dSS = 64; // Default Square Size
let sS = dSS; // Square Size
const subS = 4; // Sub Square Number

let scale = 1,
    panning = false,
    pointX = hW,
    pointY = hH,
    start = { x: 0, y: 0 };
const maxScale = 32,
    minScale = 0.2;

const zoom = 1.2;
let zoomF;
function setTransform() {
    clear();
    sS = dSS * scale;
    zoomF = 2 ** Math.floor(Math.log2(scale));
    sS = sS / zoomF;

    updateScreen();
    ctx.beginPath();
    ctx.moveTo(0, pointY);
    const precision = 1;
    for (let x = 0; x <= w; x += precision) {
        ctx.lineTo(x, pointY + Math.sin((x - pointX - hW) / (dSS * scale)) * (dSS * scale));
    }
    ctx.strokeStyle = "#0000ff";
    ctx.lineWidth = 4;
    ctx.stroke();
    // ctx.fillStyle = "#000000";
    // ctx.fillRect(pointX, pointY, dSS * scale, dSS * scale);
}
setTransform();
canvas.onmousedown = function (e) {
    e.preventDefault();
    const mP = getMousePos(e);
    start = { x: mP.x - pointX, y: mP.y - pointY };
    panning = true;
};

canvas.onmouseup = function (e) {
    panning = false;
};

canvas.onmousemove = function (e) {
    e.preventDefault();
    mP = getMousePos(e);
    mousePos = mP;
    if (!panning) {
        return;
    }
    pointX = mP.x - start.x;
    pointY = mP.y - start.y;
    setTransform();
};

canvas.onwheel = function (e) {
    e.preventDefault();
    const mP = getMousePos(e);

    const delta = Math.sign(-e.deltaY);
    if (scale * zoom > maxScale && delta > 0) {
        return;
    }
    if (scale * zoom < minScale && delta < 0) {
        return;
    }

    const xs = (mP.x - pointX) / scale;
    const ys = (mP.y - pointY) / scale;
    delta > 0 ? (scale *= zoom) : (scale /= zoom);
    pointX = mP.x - xs * scale;
    pointY = mP.y - ys * scale;

    setTransform();
};
function drawCoordsX(value) {
    const text = `${dSS}`;
    const margin = 4;
    const padding = 2;
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px Cascadia Code";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const textData = ctx.measureText(text);
    ctx.fillRect(
        (pointX % sS) + sS * value - textData.width / 2 - padding / 2,
        pointY + margin - padding / 2,
        textData.width + padding,
        14 + padding
    );
    ctx.fillStyle = "#000000";
    ctx.fillText(text, (pointX % sS) + sS * value, pointY + margin);
}
function drawCoordsY(value) {
    const text = `${(1 / zoomF) * value}`;
    const margin = 4;
    const padding = 2;
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px Cascadia Code";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const textData = ctx.measureText(text);
    const y = (pointY % sS) + sS * value;
    if (y === pointY) {
        return;
    }
    ctx.fillRect(
        pointX - textData.width - padding / 2 - margin,
        y - 14 / 2 - padding / 2,
        textData.width + padding,
        14 + padding
    );
    ctx.fillStyle = "#000000";
    let x = Math.max(pointX - margin, textData.width);
    x = Math.min(x, w);
    ctx.fillText(text, x, (pointY % sS) + sS * value);
}
function updateScreen() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#e7e7e7";

    drawGridLine(pointX % (sS / subS), sS / subS, "x");
    drawGridLine(pointY % (sS / subS), sS / subS, "y");

    ctx.strokeStyle = "#c8c8c8";
    drawGridLine(pointX % sS, sS, "x");
    drawGridLine(pointY % sS, sS, "y");

    ctx.strokeStyle = "#444444";
    drawCenter();

    for (let x = 0; x < w / sS; x++) {
        // drawCoordsX(x);
    }
    for (let y = 0; y < w / sS; y++) {
        drawCoordsY(y);
    }
}

function drawGridLine(o, s, axe) {
    ctx.beginPath();
    if (axe === "x") {
        for (let i = 0; i <= w / s + 1; i++) {
            ctx.moveTo(o + i * s, 0);
            ctx.lineTo(o + i * s, h);
        }
    } else if (axe === "y") {
        for (let i = 0; i <= h / s + 1; i++) {
            ctx.moveTo(0, o + i * s);
            ctx.lineTo(w, o + i * s);
        }
    }
    ctx.stroke();
}

function drawCenter() {
    ctx.beginPath();
    if (pointX >= 0 && pointX <= w) {
        ctx.moveTo(pointX, 0);
        ctx.lineTo(pointX, h);
    }
    if (pointY >= 0 && pointY <= h) {
        ctx.moveTo(0, pointY);
        ctx.lineTo(w, pointY);
    }
    ctx.stroke();
}

canvas.addEventListener("keydown", function (e) {
    e.preventDefault();
    let delta = 1;

    if (e.key === "w") {
        delta = -1;
    } else if (e.key === "x") {
        delta = 1;
    } else return;
    const mP = mousePos;

    if (scale * zoom > maxScale && delta > 0) {
        return;
    }
    if (scale * zoom < minScale && delta < 0) {
        return;
    }

    const xs = (mP.x - pointX) / scale;
    const ys = (mP.y - pointY) / scale;
    delta > 0 ? (scale *= zoom) : (scale /= zoom);
    pointX = mP.x - xs * scale;
    pointY = mP.y - ys * scale;

    setTransform();
});
