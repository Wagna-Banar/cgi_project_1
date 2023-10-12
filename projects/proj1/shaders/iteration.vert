attribute vec2 vOldPosition;

varying vec2 vNewPosition;
varying float newFunction;

uniform mat3 matrizes[7];

void main() {
    vNewPosition = vOldPosition + normalize(vOldPosition) * 0.01;

    // vec2 point = (gl_FragCoord.xy / vec2(800.0, 600.0)) * 2.0 - vec2(1.0, 1.0);
    vec2 point = (vOldPosition + 1.0) / 2.0; // Normaliza vOldPosition para o intervalo [0, 1]

    float r = fract(sin(dot(vOldPosition.xy, vec2(12.9898, 78.233))) * 43758.545);

    for (int i = 0; i < 4; i++) {
        int index = int(r * 7.0); // índice varia de 0 a 6

        //p += if(p)
        vNewPosition = (matrizes[index] * vec3(vOldPosition, 1.0)).xy;
        newFunction = r;
    }
}