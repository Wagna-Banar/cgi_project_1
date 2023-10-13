
attribute vec2 vOldPosition;

varying vec2 vNewPosition;
varying float newFunction;

uniform mat3 matrizes[4]; // TODO: replace 4 to 7
uniform float probabi[4];
// uniform int nfuncs;

void main() {
    float r = fract(sin(dot(vOldPosition.xy, vec2(12.9898, 78.233))) * 43758.545);

    float probA = 0.0;
    for (int i = 0; i < 4; ++i) {

        float prob = probabi[i];
        probA = probA+prob;

        if (r < probA) {
            vNewPosition = (matrizes[i] * vec3(vOldPosition, 1.0)).xy;
            newFunction = float(i/4);
            break;
        }
    }
}