#include "ccParamIO.glsl"


#ifdef OPENGL_ES
varying mediump vec2 TextureCoordOut;
#else
varying vec2 TextureCoordOut;
#endif
uniform vec4 u_color;

void main(void)
{
    gl_FragColor = texture2D(CC_Texture0, TextureCoordOut) * u_color;
	// ±ä»Ò
#ifdef GREY
	// Convert to greyscale using NTSC weightings              
	float grey = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
	gl_FragColor.rgb = vec3(grey, grey, grey);
#endif

}
