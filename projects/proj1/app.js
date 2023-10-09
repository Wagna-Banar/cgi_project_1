import { loadShadersFromURLS, loadShadersFromScripts, setupWebGL, buildProgramFromSources } from "../../libs/utils.js";
import { vec2, sizeof, flatten } from "../../libs/MV.js";

/** @type {WebGL2RenderingContext} */
var gl;

/** @type {WebGLProgram} */
var drawProgram;

/** @type {WebGLProgram} */
var iterationProgram;

/** @type {HTMLCanvasElement} */
var canvas;

var aspect;

/** @type {WebGLBuffer} */
var aBuffer, bBuffer;

const nPoints = 500000;

const ifs = [
    { transformation: transform1, probability: 0.01 },
    { transformation: transform2, probability: 0.85 },
    { transformation: transform3, probability: 0.07 },
    { transformation: transform4, probability: 0.07 }
  ];

  function transform1(x, y) {
    // Implemente a primeira transformação aqui
    var xx = 0;
    var yy = 0.16*y;
    return { x: xx, y: yy };
  }

  function transform2(x, y) {
    // Implemente a segunda transformação aqui
    var xx = 0.85*x + 0.04*y + 0;
    var yy = -0.04*x + 0.85*y + 1.6;
    return { x: xx, y: yy };
  }

  function transform3(x, y) {
    // Implemente a segunda transformação aqui
    var xx = 0.2*x + (-0.26*y) + 0;
    var yy = 0.23*x + 0.22*y + 1.6;
    return { x: xx, y: yy };
  }

  function transform4(x, y) {
    // Implemente a segunda transformação aqui
    var xx = -0.15*x + 0.28*y + 0;
    var yy = -0.26*x + 0.24*y + 0.44;
    return { x: xx, y: yy };
  }

  function applyRandomTransformation(point) {
    const random = Math.random();
    let cumulativeProbability = 0;
  
    for (const { transformation, probability } of ifs) {
        console.log(probability);
      cumulativeProbability += probability;
      if (random < cumulativeProbability) {
        // Aplica a transformação selecionada ao ponto e retorna o novo ponto
        return transformation(point.x, point.y);
      }
    }
  
    // Se não houver correspondência, retorne o ponto original
    return point;
  }

/**
 */
function startUiControls() {
    // func redimensionar:
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        aspect = canvas.width / canvas.height;

        // Setup the viewport
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // resize
    window.addEventListener("resize", resize);
    resize();
}

function setup(shaders)
{
    // Setup
    canvas = document.getElementById("gl-canvas");
    gl = setupWebGL(canvas, { alpha: true });

    drawProgram = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);
    iterationProgram = buildProgramFromSources(gl, shaders["iteration.vert"], shaders["iteration.frag"], ["vNewPosition"]);

    const vertices = [];

    /*for(let i=0; i<nPoints; i++){
        vertices.push(vec2(Math.random(), Math.random()));
    }*/
    const initialPoint = { x: 0, y: 0 };

    let currentPoint = initialPoint;
    for (let i = 0; i < nPoints; i++) {
        currentPoint = applyRandomTransformation(currentPoint);
        /**
         * Use o ponto resultante para desenhar ou fazer qualquer outra coisa
         */
        vertices.push(vec2(currentPoint.x, currentPoint.y));
        //console.log(`Iteração ${i + 1}: x = ${currentPoint.x}, y = ${currentPoint.y}`);
    }

    aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STREAM_COPY);

    bBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, nPoints * sizeof["vec2"], gl.STREAM_COPY);

    startUiControls();

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Setup the background color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Call animate for the first time
    window.requestAnimationFrame(animate);
}

function animate()
{
    window.requestAnimationFrame(animate);

    // Drawing code
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(drawProgram);

    const uBottomLeft = gl.getUniformLocation(drawProgram, "uBottomLeft");
    gl.uniform2f(uBottomLeft, -aspect, -1.0);
    const uTopRight = gl.getUniformLocation(drawProgram, "uTopRight");
    gl.uniform2f(uTopRight, aspect, 1.0);

    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    const vPosition = gl.getAttribLocation(drawProgram, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    /*
    for (let i = 0; i < 4; i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);//
        const uM = gl.getAttribLocation(iterationProgram, "m[" + i + "]");
        gl.uniformMatrix3fv(uM, false, flatten(1));
    }
    */

    gl.drawArrays(gl.POINTS, 0, nPoints);

    // Iteration code

    /*
    gl.useProgram(iterationProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    const vOldPosition = gl.getAttribLocation(iterationProgram, "vOldPosition");
    gl.vertexAttribPointer(vOldPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vOldPosition);

    const transformFeedback = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);

    gl.enable(gl.RASTERIZER_DISCARD);

    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bBuffer);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, nPoints);
    gl.endTransformFeedback();
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);

    gl.disable(gl.RASTERIZER_DISCARD);

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.deleteTransformFeedback(transformFeedback);
    */


    const temp = aBuffer;
    aBuffer = bBuffer;
    bBuffer = temp;
}

loadShadersFromURLS(["shader.vert", "shader.frag", "iteration.vert", "iteration.frag"]).then(shaders => setup(shaders));
