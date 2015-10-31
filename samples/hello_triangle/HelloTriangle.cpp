//
// Copyright (c) 2014 The ANGLE Project Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//

//            Based on Hello_Triangle.c from
// Book:      OpenGL(R) ES 2.0 Programming Guide
// Authors:   Aaftab Munshi, Dan Ginsburg, Dave Shreiner
// ISBN-10:   0321502795
// ISBN-13:   9780321502797
// Publisher: Addison-Wesley Professional
// URLs:      http://safari.informit.com/9780321563835
//            http://www.opengles-book.com

#include "SampleApplication.h"
#include "shader_utils.h"
#include "BinarySerializer.h"
#define GP_ASSERT(x) x
#define GL_ASSERT(x) x
#define GP_ERROR(...)
// Graphics (GLSL)
#define VERTEX_ATTRIBUTE_POSITION_NAME              "a_position"
#define VERTEX_ATTRIBUTE_NORMAL_NAME                "a_normal"
#define VERTEX_ATTRIBUTE_COLOR_NAME                 "a_color"
#define VERTEX_ATTRIBUTE_TANGENT_NAME               "a_tangent"
#define VERTEX_ATTRIBUTE_BINORMAL_NAME              "a_binormal"
#define VERTEX_ATTRIBUTE_BLENDWEIGHTS_NAME          "a_blendWeights"
#define VERTEX_ATTRIBUTE_BLENDINDICES_NAME          "a_blendIndices"
#define VERTEX_ATTRIBUTE_TEXCOORD                   "a_texCoord"
#define VERTEX_ATTRIBUTE_TEXCOORD1                   "a_texCoord1"
#define VERTEX_ATTRIBUTE_TEXCOORD2                   "a_texCoord2"
#define VERTEX_ATTRIBUTE_TEXCOORD3                   "a_texCoord3"
#define VERTEX_ATTRIBUTE_TEXCOORD4                   "a_texCoord4"
#define VERTEX_ATTRIBUTE_TEXCOORD5                   "a_texCoord5"
#define VERTEX_ATTRIBUTE_TEXCOORD6                   "a_texCoord6"
#define VERTEX_ATTRIBUTE_TEXCOORD7                   "a_texCoord7"

#define OPENGL_ES_DEFINE  "OPENGL_ES"

namespace GL
{
	enum
	{
		VERTEX_ATTRIB_POSITION,
		VERTEX_ATTRIB_COLOR,
		VERTEX_ATTRIB_TEX_COORD,
		VERTEX_ATTRIB_NORMAL,
		//VERTEX_ATTRIB_TANGENT,
		//VERTEX_ATTRIB_BINORMAL,
		VERTEX_ATTRIB_BLENDWEIGHTS,
		VERTEX_ATTRIB_BLENDINDICES,
		VERTEX_ATTRIB_TEX_COORD1,
		VERTEX_ATTRIB_TEX_COORD2,
		//VERTEX_ATTRIB_TEX_COORD3,
		//VERTEX_ATTRIB_TEX_COORD4,
		//VERTEX_ATTRIB_TEX_COORD5,
		//VERTEX_ATTRIB_TEX_COORD6,
		//VERTEX_ATTRIB_TEX_COORD7,

		VERTEX_ATTRIB_MAX,

		// backward compatibility
		VERTEX_ATTRIB_TEX_COORDS = VERTEX_ATTRIB_TEX_COORD,
	};
	/** vertex attrib flags */
	enum {
		VERTEX_ATTRIB_FLAG_NONE = 0,

		VERTEX_ATTRIB_FLAG_POSITION = 1 << 0,
		VERTEX_ATTRIB_FLAG_COLOR = 1 << 1,
		VERTEX_ATTRIB_FLAG_TEX_COORD = 1 << 2,

		VERTEX_ATTRIB_FLAG_POS_COLOR_TEX = (VERTEX_ATTRIB_FLAG_POSITION | VERTEX_ATTRIB_FLAG_COLOR | VERTEX_ATTRIB_FLAG_TEX_COORD),
	};
};

class HelloTriangleSample : public SampleApplication
{
  public:
    HelloTriangleSample()
        : SampleApplication("HelloTriangle", 1280, 720)
    {
    }


	static void replaceDefines(const char* defines, std::string& out)
	{
		const char* globalDefines = NULL;

		// Build full semicolon delimited list of defines
		out = OPENGL_ES_DEFINE;
		if (globalDefines && strlen(globalDefines) > 0)
		{
			if (out.length() > 0)
				out += ';';
			out += globalDefines;
		}
		if (defines && strlen(defines) > 0)
		{
			if (out.length() > 0)
				out += ';';
			out += defines;
		}

		// Replace semicolons
		if (out.length() > 0)
		{
			size_t pos;
			out.insert(0, "#define ");
			while ((pos = out.find(';')) != std::string::npos)
			{
				out.replace(pos, 1, "\n#define ");
			}
			out += "\n";
		}
	}

	static void replaceIncludes(const char* filepath, const char* source, std::string& out)
	{
		// Replace the #include "xxxx.xxx" with the sourced file contents of "filepath/xxxx.xxx"
		std::string str = source;
		size_t lastPos = 0;
		size_t headPos = 0;
		size_t fileLen = str.length();
		size_t tailPos = fileLen;
		while (headPos < fileLen)
		{
			lastPos = headPos;
			if (headPos == 0)
			{
				// find the first "#include"
				headPos = str.find("#include");
			}
			else
			{
				// find the next "#include"
				headPos = str.find("#include", headPos + 1);
			}

			// If "#include" is found
			if (headPos != std::string::npos)
			{
				// append from our last position for the legth (head - last position) 
				out.append(str.substr(lastPos, headPos - lastPos));

				// find the start quote "
				size_t startQuote = str.find("\"", headPos) + 1;
				if (startQuote == std::string::npos)
				{
					// We have started an "#include" but missing the leading quote "
					GP_ERROR("Compile failed for shader '%s' missing leading \".", filepath);
					return;
				}
				// find the end quote "
				size_t endQuote = str.find("\"", startQuote);
				if (endQuote == std::string::npos)
				{
					// We have a start quote but missing the trailing quote "
					GP_ERROR("Compile failed for shader '%s' missing trailing \".", filepath);
					return;
				}

				// jump the head position past the end quote
				headPos = endQuote + 1;

				// File path to include and 'stitch' in the value in the quotes to the file path and source it.
				std::string filepathStr = filepath;
				std::string directoryPath = filepathStr.substr(0, filepathStr.rfind('/') + 1);
				size_t len = endQuote - (startQuote);
				std::string includeStr = str.substr(startQuote, len);
				directoryPath.append(includeStr);

				FILE *f = fopen(directoryPath.c_str(), "rb");
				fseek(f, 0, SEEK_END);
				long size = ftell(f);
				fseek(f, 0, SEEK_SET);
				char *buf = new char[size + 1];
				memset(buf, 0, size + 1);
				fread(buf, size, 1, f);
				fclose(f);

				// Valid file so lets attempt to see if we need to append anything to it too (recurse...)
				replaceIncludes(directoryPath.c_str(), (const char*)buf, out);
				delete []buf;
			}
			else
			{
				// Append the remaining
				out.append(str.c_str(), lastPos, tailPos);
			}
		}
	}

	GLint createFromSource(const char* vshPath, const char* vshSource, const char* fshPath, const char* fshSource, const char* defines)
	{
		GP_ASSERT(vshSource);
		GP_ASSERT(fshSource);

		//CCLOG("Effect::createFromSource(%s,%s,%s,%s,%s)" , vshPath, vshSource, fshPath ? fshPath : "", fshSource ? fshSource : "", defines ? defines : "");

		const unsigned int SHADER_SOURCE_LENGTH = 3;
		const GLchar* shaderSource[SHADER_SOURCE_LENGTH];
		char* infoLog = NULL;
		GLuint vertexShader;
		GLuint fragmentShader;
		GLuint program;
		GLint length;
		GLint success;

		// Replace all comma separated definitions with #define prefix and \n suffix
		std::string definesStr = "";
		replaceDefines(defines, definesStr);

		shaderSource[0] = definesStr.c_str();
		shaderSource[1] = "\n";
		std::string vshSourceStr = "";
		if (vshPath)
		{
			// Replace the #include "xxxxx.xxx" with the sources that come from file paths
			replaceIncludes(vshPath, vshSource, vshSourceStr);
			if (vshSource && strlen(vshSource) != 0)
				vshSourceStr += "\n";
		}
		shaderSource[2] = vshPath ? vshSourceStr.c_str() : vshSource;
		GL_ASSERT(vertexShader = glCreateShader(GL_VERTEX_SHADER));
		GL_ASSERT(glShaderSource(vertexShader, SHADER_SOURCE_LENGTH, shaderSource, NULL));
		GL_ASSERT(glCompileShader(vertexShader));
		GL_ASSERT(glGetShaderiv(vertexShader, GL_COMPILE_STATUS, &success));
		if (success != GL_TRUE)
		{
			GL_ASSERT(glGetShaderiv(vertexShader, GL_INFO_LOG_LENGTH, &length));
			if (length == 0)
			{
				length = 4096;
			}
			if (length > 0)
			{
				infoLog = new char[length];
				GL_ASSERT(glGetShaderInfoLog(vertexShader, length, NULL, infoLog));
				infoLog[length - 1] = '\0';
			}

			//// Write out the expanded shader file.
			//if (vshPath)
			//	writeShaderToErrorFile(vshPath, shaderSource[2]);

			GP_ERROR("Compile failed for vertex shader '%s'[%s] with error '%s'.", vshPath == NULL ? vshSource : vshPath, defines ? defines : "", infoLog == NULL ? "" : infoLog);
			delete[](infoLog);

			// Clean up.
			GL_ASSERT(glDeleteShader(vertexShader));

			return NULL;
		}

		// Compile the fragment shader.
		std::string fshSourceStr;
		if (fshPath)
		{
			// Replace the #include "xxxxx.xxx" with the sources that come from file paths
			replaceIncludes(fshPath, fshSource, fshSourceStr);
			if (fshSource && strlen(fshSource) != 0)
				fshSourceStr += "\n";
		}
		shaderSource[2] = fshPath ? fshSourceStr.c_str() : fshSource;
		GL_ASSERT(fragmentShader = glCreateShader(GL_FRAGMENT_SHADER));
		GL_ASSERT(glShaderSource(fragmentShader, SHADER_SOURCE_LENGTH, shaderSource, NULL));
		GL_ASSERT(glCompileShader(fragmentShader));
		GL_ASSERT(glGetShaderiv(fragmentShader, GL_COMPILE_STATUS, &success));
		if (success != GL_TRUE)
		{
			GL_ASSERT(glGetShaderiv(fragmentShader, GL_INFO_LOG_LENGTH, &length));
			if (length == 0)
			{
				length = 4096;
			}
			if (length > 0)
			{
				infoLog = new char[length];
				GL_ASSERT(glGetShaderInfoLog(fragmentShader, length, NULL, infoLog));
				infoLog[length - 1] = '\0';
			}

			//// Write out the expanded shader file.
			//if (fshPath)
			//	writeShaderToErrorFile(fshPath, shaderSource[2]);

			GP_ERROR("Compile failed for fragment shader (%s)[%s]: %s", fshPath == NULL ? fshSource : fshPath, defines ? defines : "", infoLog == NULL ? "" : infoLog);
			delete[](infoLog);

			// Clean up.
			GL_ASSERT(glDeleteShader(vertexShader));
			GL_ASSERT(glDeleteShader(fragmentShader));

			return NULL;
		}

		// Link program.
		GL_ASSERT(program = glCreateProgram());
		GL_ASSERT(glAttachShader(program, vertexShader));
		GL_ASSERT(glAttachShader(program, fragmentShader));

		// 预约顶点声明位置
		{
			static const struct {
				const char *attributeName;
				int location;
			} attribute_locations[] =
			{
				{ VERTEX_ATTRIBUTE_POSITION_NAME, GL::VERTEX_ATTRIB_POSITION },
				{ VERTEX_ATTRIBUTE_COLOR_NAME, GL::VERTEX_ATTRIB_COLOR },
				{ VERTEX_ATTRIBUTE_TEXCOORD, GL::VERTEX_ATTRIB_TEX_COORD },
				{ VERTEX_ATTRIBUTE_NORMAL_NAME, GL::VERTEX_ATTRIB_NORMAL },
				//{ VERTEX_ATTRIBUTE_TANGENT_NAME, GL::VERTEX_ATTRIB_TANGENT },
				//{ VERTEX_ATTRIBUTE_BINORMAL_NAME, GL::VERTEX_ATTRIB_BINORMAL },
				{ VERTEX_ATTRIBUTE_BLENDWEIGHTS_NAME, GL::VERTEX_ATTRIB_BLENDWEIGHTS },
				{ VERTEX_ATTRIBUTE_BLENDINDICES_NAME, GL::VERTEX_ATTRIB_BLENDINDICES },
				{ VERTEX_ATTRIBUTE_TEXCOORD1, GL::VERTEX_ATTRIB_TEX_COORD1 },
				{ VERTEX_ATTRIBUTE_TEXCOORD2, GL::VERTEX_ATTRIB_TEX_COORD2 },
				//{ VERTEX_ATTRIBUTE_TEXCOORD3, GL::VERTEX_ATTRIB_TEX_COORD3 },
				//{ VERTEX_ATTRIBUTE_TEXCOORD4, GL::VERTEX_ATTRIB_TEX_COORD4 },
				//{ VERTEX_ATTRIBUTE_TEXCOORD5, GL::VERTEX_ATTRIB_TEX_COORD5 },
				//{ VERTEX_ATTRIBUTE_TEXCOORD6, GL::VERTEX_ATTRIB_TEX_COORD6 },
				//{ VERTEX_ATTRIBUTE_TEXCOORD7, GL::VERTEX_ATTRIB_TEX_COORD7 },
			};

			const int size = sizeof(attribute_locations) / sizeof(attribute_locations[0]);

			for (int i = 0; i < size; i++) {
				glBindAttribLocation(program, attribute_locations[i].location, attribute_locations[i].attributeName);
			}
		}

		GL_ASSERT(glLinkProgram(program));
		GL_ASSERT(glGetProgramiv(program, GL_LINK_STATUS, &success));

		// Delete shaders after linking.
		GL_ASSERT(glDeleteShader(vertexShader));
		GL_ASSERT(glDeleteShader(fragmentShader));

		// Check link status.
		if (success != GL_TRUE)
		{
			GL_ASSERT(glGetProgramiv(program, GL_INFO_LOG_LENGTH, &length));
			if (length == 0)
			{
				length = 4096;
			}
			if (length > 0)
			{
				infoLog = new char[length];
				GL_ASSERT(glGetProgramInfoLog(program, length, NULL, infoLog));
				infoLog[length - 1] = '\0';
			}
			//CCLOGWARN("Linking program failed (%s,%s)[%s]: %s", vshPath == NULL ? "NULL" : vshPath, fshPath == NULL ? "NULL" : fshPath, defines ? defines : "", infoLog == NULL ? "" : infoLog);
			delete[](infoLog);

			// Clean up.
			GL_ASSERT(glDeleteProgram(program));

			return NULL;
		}
		return program;
	}

    virtual bool initialize()
    {
        const std::string vs = SHADER_SOURCE
        (
            attribute vec4 vPosition;
            void main()
            {
                gl_Position = vPosition;
            }
        );

        const std::string fs = SHADER_SOURCE
        (
            precision mediump float;
            void main()
            {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            }
        );

        mProgram = CompileProgram(vs, fs);
        if (!mProgram)
        {
            return false;
        }

        glClearColor(0.0f, 0.0f, 0.0f, 0.0f);

		std::string id , vshSource , fshSource , vshPath , fshPath , defines;
		{
			cocos2d::BinarySerializer stream;
			stream.loadFromFile("preload_shaders_ccShader_PositionTextureColor_vert_preload_shaders_ccShader_PositionTextureColor_frag_");
			stream.readChunkBegin(1, 1);
			stream.read(id);
			stream.read(vshSource);
			stream.read(fshSource);
			stream.read(vshPath);
			stream.read(fshPath);
			stream.read(defines);
		}
		GLint program = createFromSource(vshPath.c_str(), vshSource.c_str(), fshPath.c_str(), fshSource.c_str(), defines.c_str());
		{
			int length = 0;
			GL_ASSERT(glGetProgramiv(program, GL_PROGRAM_BINARY_LENGTH_OES, &length));
			std::vector<char> programData(length);
			GLenum binaryFormat;
			GL_ASSERT(glGetProgramBinaryOES(program, length, NULL, &binaryFormat, programData.data()));

			cocos2d::BinarySerializer stream;
			stream.writeChunkBegin(1, 1);
			stream.write(id);
			stream.write(vshSource);
			stream.write(fshSource);
			stream.write(vshPath);
			stream.write(fshPath);
			stream.write(defines);
			stream.write(length);
			stream.writeData(programData.data(), length);
			stream.writeChunkEnd(1);
			stream.saveToFile("preload_shaders_ccShader_PositionTextureColor_vert_preload_shaders_ccShader_PositionTextureColor_frag_.shaderbin");
		}

        return true;
    }

    virtual void destroy()
    {
        glDeleteProgram(mProgram);
    }

    virtual void draw()
    {
        GLfloat vertices[] =
        {
             0.0f,  0.5f, 0.0f,
            -0.5f, -0.5f, 0.0f,
             0.5f, -0.5f, 0.0f,
        };

        // Set the viewport
        glViewport(0, 0, getWindow()->getWidth(), getWindow()->getHeight());

        // Clear the color buffer
        glClear(GL_COLOR_BUFFER_BIT);

        // Use the program object
        glUseProgram(mProgram);

        // Load the vertex data
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, vertices);
        glEnableVertexAttribArray(0);

        glDrawArrays(GL_TRIANGLES, 0, 3);
    }

  private:
    GLuint mProgram;
};

int main(int argc, char **argv)
{
    HelloTriangleSample app;
    return app.run();
}
