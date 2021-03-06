/*
 * LICENSE ???
 */
#include "ccParamIO.glsl"
#ifdef OPENGL_ES
precision lowp float; 
#endif
 
varying vec4 v_fragmentColor; 
varying vec2 v_texCoord;

uniform vec4 u_effectColor;
uniform vec4 u_textColor;
 
void main()
{
    vec4 sample = texture2D(CC_Texture0, v_texCoord);
    float fontAlpha = sample.a; 
    if (fontAlpha > 0.0){ 
        gl_FragColor = v_fragmentColor * vec4( u_textColor.rgb ,u_textColor.a*fontAlpha);
		// ���
	#ifdef GREY
		// Convert to greyscale using NTSC weightings              
		float grey = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
		gl_FragColor.rgb = vec3(grey, grey, grey);
	#endif

    }
    else {
        discard;
    }
}
