
#include "ccParamIO.glsl"

#ifdef OPENGL_ES
varying lowp vec4 DestinationColor;
#else
varying vec4 DestinationColor;
#endif
uniform vec4 u_color;

void main(void)
{
    gl_FragColor = u_color;
	// ±ä»Ò
#ifdef GREY
	// Convert to greyscale using NTSC weightings              
	float grey = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
	gl_FragColor.rgb = vec3(grey, grey, grey);
#endif

}
