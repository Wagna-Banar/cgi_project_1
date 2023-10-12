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

const nPoints = 5000000;

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
    iterationProgram = buildProgramFromSources(gl, shaders["iteration.vert"], shaders["iteration.frag"], ["vNewPosition", "newFunction"]);

    const vertices = [];

    for (let i = 0; i < nPoints; i++) {
      vertices.push(vec2(Math.random(), Math.random()));
    }

    // TODO: adicionar restantes...
    const ifsTransform = [
      [0, 0, 0, 0, 0.16, 0, 0, 0, 1],
      [0.85, 0.04, 0, -0.04, 0.85, 1.6, 0, 0, 1],
      [0.2, -0.26, 0, 0.23, 0.22, 1.6, 0, 0, 1],
      [-0.15, 0.28, 0, 0.26, 0.24, 0.44, 0, 0, 1]
    ];
  
    // Converter o array plano em um array de matrizes 3x3
    const matriz3x3 = [];
    for (let i = 0; i < ifsTransform.length; i++) {
      for (let j = 0; j < ifsTransform[i].length; j+=3) {
        matriz3x3.push(ifsTransform[i].slice(j, j + 3));
      }
    }

    for(let i = 0; i < ifsTransform.length; i++) {
      const matrizes = gl.getUniformLocation(iterationProgram, "matrizes[" + i + "]");
      gl.uniformMatrix3fv(matrizes, false, flatten(matriz3x3[i])); 
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

    gl.drawArrays(gl.POINTS, 0, nPoints);

    // Iteration code

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


    const temp = aBuffer;
    aBuffer = bBuffer;
    bBuffer = temp;
}

loadShadersFromURLS(["shader.vert", "shader.frag", "iteration.vert", "iteration.frag"]).then(shaders => setup(shaders));
