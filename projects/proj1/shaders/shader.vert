attribute vec2 vPosition;
attribute float vFunction;

uniform vec2 uBottomLeft;
uniform vec2 uTopRight;

varying vec3 color;

void main() 
{
    //float width = uTopRight.x - uBottomLeft.x;
    //float height = uTopRight.y - uBottomLeft.y;
    //vec2 tmp = (vPosition - uBottomLeft) * vec2(2.0/width, 2.0/height) - vec2(1.0, 1.0);

    vec2 size = uTopRight - uBottomLeft;
    vec2 tmp = (vPosition - uBottomLeft) * 2.0 / size - vec2(1.0, 1.0);
    
    gl_PointSize = 1.3;
    gl_Position = vec4(tmp, 0.0, 1.0);

    color = vec3(vPosition, vFunction);
}
