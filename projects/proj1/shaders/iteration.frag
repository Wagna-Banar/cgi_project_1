precision mediump float;
precision highp float;

varying vec2 vNewPosition;
varying float newFunction;
varying vec4 FragColor;

void main() {
    discard;
    gl_FragColor = FragColor; // vec4(1.0, 0.0, 0.0, 0.01);
}