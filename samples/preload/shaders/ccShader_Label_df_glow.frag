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
    float dist = texture2D(CC_Texture0, v_texCoord).a;
    //todo:Implementation 'fwidth' for glsl 1.0 
    //float width = fwidth(dist); 
    //assign width for constant will lead to a little bit fuzzy,it's temporary measure.
    float width = 0.04; 
    float alpha = smoothstep(0.5-width, 0.5+width, dist); 
    //glow 
    float mu = smoothstep(0.5, 1.0, sqrt(dist)); 
    vec4 color = u_effectColor*(1.0-alpha) + u_textColor*alpha;
    gl_FragColor = v_fragmentColor * vec4(color.rgb, max(alpha,mu)*color.a); 
	// ���
#ifdef GREY
	// Convert to greyscale using NTSC weightings              
	float grey = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
	gl_FragColor.rgb = vec3(grey, grey, grey);
#endif

}
