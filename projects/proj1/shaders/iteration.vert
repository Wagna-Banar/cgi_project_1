attribute vec2 vOldPosition;

varying vec2 vNewPosition;
varying float newFunction;
varying vec4 FragColor;

uniform mat3 matrizes[4]; // TODO: replace 4 to 7
uniform float probabi[4];
// uniform int nfuncs;

void main() {
    // vec2 point = (gl_FragCoord.xy / vec2(800.0, 600.0)) * 2.0 - vec2(1.0, 1.0);
    vec3 color = vec3(0.0); // cor inicial

    for (int i = 0; i < 4; ++i) {
        float r = fract(sin(dot(vOldPosition.xy, vec2(12.9898, 78.233))) * 43758.545);
        int index = int(r * 4.0); // índice varia de 0 a 6  // TODO: replace 4 to 7

        float prob = probabi[i];
        if (r < prob) {
            vNewPosition = (matrizes[index] * vec3(vOldPosition, 1.0)).xy;
        }
        // newFunction = r;
    }
    //gl_Position = vNewPosition;
    color = vec3(vNewPosition, 0.0);
    FragColor = vec4(color, 1.0);
}