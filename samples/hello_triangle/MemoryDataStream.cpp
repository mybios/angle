#include "MemoryDataStream.h"


namespace cocos2d
{


	MemoryDataStream::MemoryDataStream()
	{
		mBuffer = 0;
		mCurrentRead = mCurrentWrite = mBuffer;
		mSize = 0;
	}

	MemoryDataStream::MemoryDataStream( size_t dataSize )
	{
		mBuffer = 0;
		mCurrentRead = mCurrentWrite = mBuffer;
		mSize = 0;
		init(dataSize);
	}

	MemoryDataStream::MemoryDataStream(char *buffer, size_t dataSize, bool copyData)
	{
		mBuffer = nullptr;
		mCurrentRead = mCurrentWrite = nullptr;
		mSize = 0;
		if (copyData)
		{
			init(dataSize);
			memcpy(mBuffer, buffer, dataSize);
		}
		else
		{
			mBuffer = buffer;
			mCurrentRead = mCurrentWrite = mBuffer;
			mSize = dataSize;
		}
		mCurrentWrite = mBuffer + dataSize;
	}

	MemoryDataStream::~MemoryDataStream()
	{
		if(mBuffer)
		{
			free(mBuffer);
			mBuffer = 0;
		}
	}

	void MemoryDataStream::init( size_t dataSize )
	{
		if(mBuffer)
		{
			free(mBuffer);
			mBuffer = 0;
		}
		mBuffer = (char*)malloc(dataSize);
		mCurrentRead = mCurrentWrite = mBuffer;
		mSize = dataSize;
	}

	void MemoryDataStream::clear()
	{
		if(mBuffer)
		{
			free(mBuffer);
			mBuffer = 0;
		}
		mBuffer = 0;
		mCurrentRead = mCurrentWrite = mBuffer;
		mSize = 0;
	}

	void MemoryDataStream::skipWriter( int size )
	{
		// 写入越界了抛异常
		if(mCurrentWrite + size > mBuffer + mSize || mCurrentWrite + size < mBuffer)
		{
			char str[128];
			snprintf(str , sizeof(str) , "write %u bytes overflow , remain %u writable bytes" , size , getRemainWriteSize());
			CCASSERT(false , str);
			return;
		}
		mCurrentWrite += size;
	}

	void MemoryDataStream::skipReader( int size )
	{
		if (mCurrentRead + size > mCurrentWrite || mCurrentRead + size < mBuffer)
		{
			char str[128];
			snprintf(str , sizeof(str) , "read %u bytes overflow , remain %u readable bytes" , size , getRemainReadSize());
			CCASSERT(false , str);
			return;
		}
		mCurrentRead += size;
	}
	// 把写入游标设置到这里
	void MemoryDataStream::seekWriter(size_t pos)
	{
		// 写入越界了抛异常
		if(mBuffer + pos > mBuffer + mSize || mBuffer + pos < mBuffer)
		{
			char str[128];
			snprintf(str , sizeof(str) , "setWriter %u overflow , remain %u writable bytes" , pos , getRemainWriteSize());
			CCASSERT(false , str);
			return;
		}
		mCurrentWrite = mBuffer + pos;
	}
	// 把读取游标设置到这里
	void MemoryDataStream::seekReader(size_t pos)
	{
		if (mBuffer + pos > mCurrentWrite || mBuffer + pos < mBuffer)
		{
			char str[128];
			snprintf(str , sizeof(str) , "setReader %u overflow , remain %u readable bytes" , pos , getRemainReadSize());
			CCASSERT(false , str);
			return;
		}
		mCurrentRead = mBuffer + pos;
	}


	size_t MemoryDataStream::write(const void *data , size_t size )
	{
		if(size > getRemainWriteSize())
		{
			char str[128];
			snprintf(str , sizeof(str) , "write %u bytes overflow , remain %u writable bytes" , size , getRemainWriteSize());
			CCASSERT(false , str);
			return 0;
		}
		memcpy(mCurrentWrite , data , size);
		mCurrentWrite += size;
		return size;
	}

	size_t MemoryDataStream::read( void *buffer , size_t bufferSize , size_t readSize )
	{
		if(readSize > getRemainReadSize())
		{
			char str[128];
			snprintf(str , sizeof(str) , "read %u bytes overflow , remain %u readable bytes" , readSize , getRemainReadSize());
			CCASSERT(false , str);
			return 0;
		}
		memcpy(buffer , mCurrentRead , readSize);
		mCurrentRead += readSize;
		return readSize;
	}

	DynamicMemoryDataStream::DynamicMemoryDataStream( size_t dataSize )
		: MemoryDataStream(dataSize)
		, mReserveSize(dataSize)
	{
		mSize = 0;
	}

	DynamicMemoryDataStream::~DynamicMemoryDataStream()
	{

	}

	size_t DynamicMemoryDataStream::write(const void *data , size_t size )
	{
		reserve(size);
		return MemoryDataStream::write(data , size);
	}

	void DynamicMemoryDataStream::reserve( size_t size )
	{
		size_t leftSize = getRemainWriteSize();
		if (leftSize < size)
		{
			if (getRemainReserveWriteSize() < size)
			{
				size_t newSize = (mReserveSize + size) * 2;

				size_t currentOffset = mCurrentRead - mBuffer;
				size_t endOffset = mCurrentWrite - mBuffer;

				char *newBuffer = (char*)malloc(newSize);
				if (mBuffer)
				{
					memcpy(newBuffer, mBuffer, mSize);
					free(mBuffer);
				}

				mBuffer = newBuffer;
				mCurrentRead = mBuffer + currentOffset;
				mCurrentWrite = mBuffer + endOffset;
				mReserveSize = newSize;
			}
			mSize = getWritedDataSize() + size;
		}
	}




};