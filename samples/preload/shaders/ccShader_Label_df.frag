#include "ccParamIO.glsl"

#ifdef OPENGL_ES
precision lowp float; 
#endif
 
varying vec4 v_fragmentColor; 
varying vec2 v_texCoord;

uniform vec4 u_textColor;
 
void main() 
{
    vec4 color = texture2D(CC_Texture0, v_texCoord);
    //the texture use dual channel 16-bit output for distance_map 
    //float dist = color.b+color.g/256.0; 
    // the texture use single channel 8-bit output for distance_map 
    float dist = color.a; 
    //todo:Implementation 'fwidth' for glsl 1.0 
    //float width = fwidth(dist); 
    //assign width for constant will lead to a little bit fuzzy,it's temporary measure.
    float width = 0.04; 
    float alpha = smoothstep(0.5-width, 0.5+width, dist) * u_textColor.a; 
    gl_FragColor = v_fragmentColor * vec4(u_textColor.rgb,alpha);
	// ±ä»Ò
#ifdef GREY
	// Convert to greyscale using NTSC weightings              
	float grey = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
	gl_FragColor.rgb = vec3(grey, grey, grey);
#endif

}
