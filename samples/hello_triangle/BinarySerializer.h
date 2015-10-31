#pragma once
#include "ByteOrder.h"
#include "MemoryDataStream.h"
#include <string>
#include <vector>
#include <list>
#include <map>
#include <set>
#include <deque>
namespace cocos2d
{
	class BinarySerializer;

	class BinarySerializer
	{
	public:
		friend class NetClient;
		enum StreamByteOrder
		{
			NATIVE_BYTE_ORDER        = 1, /// the host's native byte-order
			BIG_ENDIAN_BYTE_ORDER    = 2, /// big-endian (network) byte-order
			NETWORK_BYTE_ORDER       = 2, /// big-endian (network) byte-order
			DEFAULT_BYTE_ORDER		 = 2, /// default byte-order
			LITTLE_ENDIAN_BYTE_ORDER = 3, /// little-endian byte-order
		};

		/// Definition of a chunk of data in a file
		struct Chunk
		{
			/// Identifier of the chunk (for example from makeIdentifier)  (stored)
			uint32 id;
			/// Version of the chunk (stored)
			uint16 version;
			/// Length of the chunk data in bytes, excluding the header of this chunk (stored)
			uint32 length;
			/// Location of the chunk (header) in bytes from the start of a stream (derived)
			uint32 offset;

			Chunk() : id(0), version(1), length(0), offset(0) {}
		};

		BinarySerializer(const MemoryDataStreamPtr &stream, StreamByteOrder byteOrder = LITTLE_ENDIAN_BYTE_ORDER, bool autoHeader = true);
		BinarySerializer(size_t size = 1024, StreamByteOrder byteOrder = LITTLE_ENDIAN_BYTE_ORDER, bool autoHeader = true);
		virtual ~BinarySerializer();

		/// Returns the byte ordering used by the writer, which is
		/// either BIG_ENDIAN_BYTE_ORDER or LITTLE_ENDIAN_BYTE_ORDER.
		StreamByteOrder byteOrder() const
		{
#if defined(POCO_ARCH_BIG_ENDIAN)
			return mFlipBytes ? LITTLE_ENDIAN_BYTE_ORDER : BIG_ENDIAN_BYTE_ORDER;
#else
			return mFlipBytes ? BIG_ENDIAN_BYTE_ORDER : LITTLE_ENDIAN_BYTE_ORDER;
#endif
		}
		/** Write arbitrary data to a stream. 
		@param buf Pointer to bytes
		@param size The size of each element to write; each will be endian-flipped if
		necessary
		@param count The number of elements to write
		*/
		void writeData(const void* buf, size_t size);


		void write(const uchar &value){mDataStream->write(&value , sizeof(value));}
		void read(uchar &value){mDataStream->read(&value , sizeof(value) , sizeof(value));}

		void write(const char &value){mDataStream->write(&value , sizeof(value));}
		void read(char &value){mDataStream->read(&value , sizeof(value) , sizeof(value));}

		void write(const wchar_t &value);
		void read(wchar_t &value);

		void write(const short &value);
		void read(short &value);

		void write(const ushort &value);
		void read(ushort &value);

		void write(const int &value);
		void read(int &value);

		void write(const unsigned int &value);
		void read(unsigned int &value);

		void write(const unsigned long &value);
		void read(unsigned long &value);

		void write(const float &value);
		void read(float &value);


		void write(const llong &value);
		void read(llong &value);

		void write(const double &value);
		void read(double &value);

		// Special-case float since we need to deal with single/double precision
		void write(const char* string);
		void write(const std::string& string);
		//void write(const std::wstring& string);
		void write(const bool& boolean);

		/** Read arbitrary data from a stream. 
		@param buf Pointer to bytes
		@param size The size of each element to read; each will be endian-flipped if
		necessary
		@param count The number of elements to read
		*/
		void readData(void* buf, size_t size);

		// Special case float, single/double-precision issues
		void read(std::string& string);
		//void read(std::wstring& string);
		void read(bool& val);

		// 写入一个C数组
		template<size_t _Size, typename _DstType>
		void write(_DstType (&_Dst)[_Size])
		{
			for(size_t i = 0 ; i < _Size ; i ++)
			{
				write(_Dst[i]);
			}
		}
		template<size_t _Size>void write(char (&_Dst)[_Size]){mDataStream->write(_Dst , _Size * sizeof(char));}
		template<size_t _Size>void write(uchar (&_Dst)[_Size]){mDataStream->write(_Dst , _Size * sizeof(uchar));}
		template<size_t _Size>void write(short (&_Dst)[_Size])
		{
			if(mFlipBytes)
			{
				for(size_t i = 0 ; i < _Size ; i ++)
				{
					write(_Dst[i]);
				}
			}
			else
			{
				mDataStream->write(_Dst , _Size * sizeof(short));
			}
		}
		template<size_t _Size>void write(ushort (&_Dst)[_Size])
		{
			if(mFlipBytes)
			{
				for(size_t i = 0 ; i < _Size ; i ++)
				{
					write(_Dst[i]);
				}
			}
			else
			{
				mDataStream->write(_Dst , _Size * sizeof(ushort));
			}
		}
		template<size_t _Size>void write(int (&_Dst)[_Size])
		{
			if(mFlipBytes)
			{
				for(size_t i = 0 ; i < _Size ; i ++)
				{
					write(_Dst[i]);
				}
			}
			else
			{
				mDataStream->write(_Dst , _Size * sizeof(int));
			}
		}
		template<size_t _Size>void write(unsigned int (&_Dst)[_Size])
		{
			if(mFlipBytes)
			{
				for(size_t i = 0 ; i < _Size ; i ++)
				{
					write(_Dst[i]);
				}
			}
			else
			{
				mDataStream->write(_Dst , _Size * sizeof(unsigned int));
			}
		}
		template<size_t _Size>void write(float (&_Dst)[_Size])
		{
			if(mFlipBytes)
			{
				for(size_t i = 0 ; i < _Size ; i ++)
				{
					write(_Dst[i]);
				}
			}
			else
			{
				mDataStream->write(_Dst , _Size * sizeof(float));
			}
		}

		void write(float *floats , size_t count)
		{
			if (mFlipBytes)
			{
				for (size_t i = 0; i < count; i++)
				{
					write(floats[i]);
				}
			}
			else
			{
				mDataStream->write(floats, count * sizeof(float));
			}
		}

        void write(int *ints, size_t count)
        {
            if (mFlipBytes)
            {
                for (size_t i = 0; i < count; i++)
                {
                    write(ints[i]);
                }
            }
            else
            {
                mDataStream->write(ints, count * sizeof(int));
            }
        }

		template<size_t _Size>void write(llong (&_Dst)[_Size])
		{
			if(mFlipBytes)
			{
				for(size_t i = 0 ; i < _Size ; i ++)
				{
					write(_Dst[i]);
				}
			}
			else
			{
				mDataStream->write(_Dst , _Size * sizeof(llong));
			}
		}
		// 读取一个C数组
		template<size_t _Size, typename _DstType>
		void read(_DstType (&_Dst)[_Size])
		{
			for(size_t i = 0 ; i < _Size ; i ++)
			{
				read(_Dst[i]);
			}
		}
		template<size_t _Size>void read(char (&_Dst)[_Size]){mDataStream->read(_Dst , _Size * sizeof(char) , _Size * sizeof(char));}
		template<size_t _Size>void read(uchar (&_Dst)[_Size]){mDataStream->read(_Dst , _Size * sizeof(uchar) , _Size * sizeof(uchar));}
		template<size_t _Size>void read(short (&_Dst)[_Size])
		{
			if(mFlipBytes)
			{
				for(size_t i = 0 ; i < _Size ; i ++)
				{
					read(_Dst[i]);
				}
			}
			else
			{
				mDataStream->read(_Dst , _Size * sizeof(short) , _Size * sizeof(short));
			}
		}
		template<size_t _Size>void read(ushort (&_Dst)[_Size])
		{
			if(mFlipBytes)
			{
				for(size_t i = 0 ; i < _Size ; i ++)
				{
					read(_Dst[i]);
				}
			}
			else
			{
				mDataStream->read(_Dst , _Size * sizeof(ushort) , _Size * sizeof(ushort));
			}
		}
		template<size_t _Size>void read(int (&_Dst)[_Size])
		{
			if(mFlipBytes)
			{
				for(size_t i = 0 ; i < _Size ; i ++)
				{
					read(_Dst[i]);
				}
			}
			else
			{
				mDataStream->read(_Dst , _Size * sizeof(int) , _Size * sizeof(int));
			}
		}
		template<size_t _Size>void read(unsigned int (&_Dst)[_Size])
		{
			if(mFlipBytes)
			{
				for(size_t i = 0 ; i < _Size ; i ++)
				{
					read(_Dst[i]);
				}
			}
			else
			{
				mDataStream->read(_Dst , _Size * sizeof(unsigned int) , _Size * sizeof(unsigned int));
			}
		}
		template<size_t _Size>void read(float (&_Dst)[_Size])
		{
			if(mFlipBytes)
			{
				for(size_t i = 0 ; i < _Size ; i ++)
				{
					read(_Dst[i]);
				}
			}
			else
			{
				mDataStream->read(_Dst , _Size * sizeof(float) , _Size * sizeof(float));
			}
		}

		void read(float *floats , size_t count)
		{
			if (mFlipBytes)
			{
				for (size_t i = 0; i < count; i++)
				{
					read(floats[i]);
				}
			}
			else
			{
				mDataStream->read(floats, count * sizeof(float), count * sizeof(float));
			}
		}

        void read(int *ints, size_t count)
        {
            if (mFlipBytes)
            {
                for (size_t i = 0; i < count; i++)
                {
                    read(ints[i]);
                }
            }
            else
            {
                mDataStream->read(ints, count * sizeof(int), count * sizeof(int));
            }
        }

		template<size_t _Size>void read(llong (&_Dst)[_Size])
		{
			if(mFlipBytes)
			{
				for(size_t i = 0 ; i < _Size ; i ++)
				{
					read(_Dst[i]);
				}
			}
			else
			{
				mDataStream->read(_Dst , _Size * sizeof(llong) , _Size * sizeof(llong));
			}
		}

		// 写入一个map
		template<typename K , typename V , typename P , typename A>
		void write(const std::map<K,V,P,A>& params)
		{
			ushort size = (ushort)params.size();
			// 写入数量
			write(size);
			// 所有名称和值
			for(typename std::map<K,V,P,A>::const_iterator iter = params.begin() ; iter != params.end() ; iter ++)
			{
				write(iter->first);
				write(iter->second);
			}
		}

		// 读取一个map
		template<typename K , typename V , typename P , typename A>
		void read(std::map<K,V,P,A> &params)
		{
			ushort size = 0;
			read(size);
			K name;
			for(unsigned int i = 0 ; i < size ; i ++)
			{
				read(name);
				read(params[name]);
			}
		}

		// 写入一个vector
		template<typename V , typename A>
		void write(const std::vector<V,A>& params)
		{
			ushort size = (ushort)params.size();
			// 写入数量
			write(size);
			// 所有名称和值
			for(typename std::vector<V,A>::const_iterator iter = params.begin() ; iter != params.end() ; iter ++)
			{
				write(*iter);
			}
		}
		// 读取一个vector
		template<typename V , typename A>
		void read(std::vector<V,A> &params)
		{
			ushort size = 0;
			read(size);
			params.resize(size);
			for(unsigned int i = 0 ; i < size ; i ++)
			{
				read(params[i]);
			}
		}


		// 写入一个list
		template<typename V , typename A>
		void write(const std::list<V,A>& params)
		{
			ushort size = (ushort)params.size();
			// 写入数量
			write(size);
			// 所有名称和值
			for(typename std::list<V,A>::const_iterator iter = params.begin() ; iter != params.end() ; iter ++)
			{
				write(*iter);
			}
		}
		// 读取一个list
		template<typename V , typename A>
		void read(std::list<V,A> &params)
		{
			ushort size = 0;
			read(size);
			typename std::list<V,A>::value_type name;
			for(unsigned int i = 0 ; i < size ; i ++)
			{
				read(name);
				params.push_back(name);
			}
		}

		// 写入一个set
		template<typename V , typename P , typename A>
		void write(const std::set<V,P,A>& params)
		{
			ushort size = (ushort)params.size();
			// 写入数量
			write(size);
			// 所有名称和值
			for(typename std::set<V,P,A>::const_iterator iter = params.begin() ; iter != params.end() ; iter ++)
			{
				write(*iter);
			}
		}
		// 读取一个set
		template<typename V , typename P , typename A>
		void read(std::set<V,P,A> &params)
		{
			ushort size = 0;
			read(size);
			typename std::set<V,P,A>::value_type name;
			for(unsigned int i = 0 ; i < size ; i ++)
			{
				read(name);
				params.push_back(name);
			}
		}
		template<typename T>
		T readAs()
		{
			T value;
			read(value);
			return value;
		}


		// 已写数据大小
		size_t getWritedDataSize()const
		{
			return mDataStream.get() ? mDataStream->getWritedDataSize() : 0;
		}
		// 已读数据大小
		size_t getReadedDataSize()const
		{
			return mDataStream.get() ? mDataStream->getReadedDataSize() : 0;
		}
		// 剩余可读大小
		size_t getRemainReadSize()const
		{
			return mDataStream.get() ? mDataStream->getRemainReadSize() : 0;
		}
		// 剩余可写大小
		size_t getRemainWriteSize()const
		{
			return mDataStream.get() ? mDataStream->getRemainWriteSize() : 0;
		}
		// 整个数据块的大小
		size_t getBufferSize()const
		{
			return mDataStream.get() ? mDataStream->getBufferSize() : 0;
		}

		void resetReader()
		{
			if (mDataStream.get())
			{
				mDataStream->resetReader();
			}
		}
		// 获得数据流给网络模块使用，除此以外不允许其他模块直接修改内存流
		MemoryDataStreamPtr _getData()
		{
			return mDataStream;
		}


		
		/** Report the current depth of the chunk nesting, whether reading or writing. 
		@remarks
			Returns how many levels of nested chunks are currently being processed, 
			either writing or reading. In order to tidily finish, you must call
			read/writeChunkEnd this many times.
		*/
		size_t getCurrentChunkDepth() const { return mChunkStack.size(); }

		/** Get the ID of the chunk that's currently being read/written, if any.
		@return The id of the current chunk being read / written (at the tightest
			level of nesting), or zero if no chunk is being processed.
		*/
		uint32 getCurrentChunkID() const;

		/** Get the current byte position relative to the start of the data section
			of the last chunk that was read or written. 
		@return the offset. Note that a return value of 0 means that either the
			position is at the start of the chunk data section (ie right after the
			header), or that no chunk is currently active. Use getCurrentChunkID
			or getCurrentChunkDepth to determine if a chunk is active.
		*/
		size_t getOffsetFromChunkStart() const;

		/** Reads the start of the next chunk in the file.
		@remarks
			Files are serialised in a chunk-based manner, meaning that each section
			of data is prepended by a chunk header. After reading this chunk header, 
			the next set of data is available directly afterwards. 
		@note
			When you have finished with this chunk, you should call readChunkEnd. 
			This will perform a bit of validation and clear the chunk from 
			the stack. 
		@return The Chunk that comes next
		*/
		virtual const Chunk* readChunkBegin();

		/** Reads the start of the next chunk so long as it's of a given ID and version.
		@remarks
			This method operates like readChunkBegin, except it checks the ID and
			version.
		@param id The ID you're expecting. If the next chunk isn't of this ID, then
			the chunk read is undone and the method returns null.
		@param maxVersion The maximum version you're able to process. If the ID is correct
			but the version	exceeds what is passed in here, the chunk is skipped over,
			the problem logged and null is returned. 
		@param msg Descriptive text added to the log if versions are not compatible
		@return The chunk if it passes the validation.
		*/
		virtual const Chunk* readChunkBegin(uint32 id, uint16 maxVersion, const char *msg = "");

		/** Call this to 'rewind' the stream to just before the start of the current
			chunk. 
		@remarks
			The most common case of wanting to use this is if you'd calledReadChunkBegin(), 
			but the chunk you read wasn't one you wanted to process, and rather than
			skipping over it (which readChunkEnd() would do), you want to backtrack
			and give something else an opportunity to read it. 
		@param id The id of the chunk that you were reading (for validation purposes)
		*/
		virtual void undoReadChunk(uint32 id);

		/** Call this to 'peek' at the next chunk ID without permanently moving the stream pointer. */
		virtual uint32 peekNextChunkID(); 

		/** Finish the reading of a chunk.
		@remarks
			You can call this method at any point after calling readChunkBegin, even
			if you didn't read all the rest of the data in the chunk. If you did 
			not read to the end of a chunk, this method will automatically skip 
			over the remainder of the chunk and position the stream just after it. 
		@param id The id of the chunk that you were reading (for validation purposes)
		*/
		virtual void readChunkEnd(uint32 id);

		/** Return whether the current data pointer is at the end of the current chunk.
		@param id The id of the chunk that you were reading (for validation purposes)
		*/
		virtual bool isEndOfChunk(uint32 id);
		/** Get the definition of the current chunk being read (if any). */
		virtual const Chunk* getCurrentChunk() const;

		/** Begin writing a new chunk.
		@remarks
			This starts the process of writing a new chunk to the stream. This will 
			write the chunk header for you, and store a pointer so that the
			class can automatically go back and fill in the size for you later
			should you need it to. If you have already begun a chunk without ending
			it, then this method will start a nested chunk within it. Once written, 
			you can then start writing chunk-specific data into your stream.
		@note If this is the first chunk in the file
		@param id The identifier of the new chunk. Any value that's unique in the
			file context is valid, except for the numbers 0x0001 and 0x1000 which are reserved
			for internal header identification use. 
		@param version The version of the chunk you're writing
		*/
		virtual void writeChunkBegin(uint32 id, uint16 version = 1);
		/** End writing a chunk. 
		@param id The identifier of the chunk - this is really just a safety check, 
			since you can only end the chunk you most recently started.
		*/
		virtual void writeChunkEnd(uint32 id);


		void saveToFile(const std::string &fileName);
		void loadFromFile(const std::string &fileName);

	protected:
		MemoryDataStreamPtr mDataStream;
		bool mFlipBytes;
		bool mReadWriteHeader;

		typedef std::deque<Chunk*> ChunkStack;
		/// Current list of open chunks
		ChunkStack mChunkStack;


		static uint32 HEADER_ID;
		static uint32 REVERSE_HEADER_ID;
		static uint32 CHUNK_HEADER_SIZE;

		virtual Chunk* readChunkImpl();
		virtual void writeChunkImpl(uint32 id, uint16 version);
		virtual void readHeader();
		virtual void writeHeader();
		virtual uint32 calculateChecksum(Chunk* c);
		virtual void checkStream(bool failOnEof = false, 
			bool validateReadable = false, bool validateWriteable = false) const;
		virtual Chunk* popChunk(uint id);


	};
};
