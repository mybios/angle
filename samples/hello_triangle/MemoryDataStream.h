#pragma once
#include <memory>
#define CCASSERT(...)

namespace cocos2d
{

	// 双游标的内存数据流类
	class MemoryDataStream
	{
	public:
		MemoryDataStream();
		MemoryDataStream(char *buffer ,size_t dataSize, bool copyData = true);
		MemoryDataStream(size_t dataSize);
		virtual ~MemoryDataStream();
		
		// 是否有内容
		bool isNull()const
		{
			return mBuffer == 0;
		}
		// 获得当前可读游标
		char* getCurrentRead(void)const { return mCurrentRead; }
		// 获得总buffer的开始游标
		char* getBuffer(void)const { return mBuffer; }
		// 获得可写游标
		char* getCurrentWrite(void)const { return mCurrentWrite; }
		// 是否已经读完
		bool endOfRead(void) const
		{
			return mCurrentRead >= mCurrentWrite;
		}
		// 是否已经写完
		bool endOfWrite(void) const
		{
			return mCurrentWrite >= mBuffer + mSize;
		}
		// 复位写游标
		void resetWritter()
		{
			mCurrentWrite = mBuffer;
		}
		// 复位读游标
		void resetReader()
		{
			mCurrentRead = mBuffer;
		}
		// 复位读写游标
		void reset()
		{
			mCurrentRead = mCurrentWrite = mBuffer;
		}
		// 已写数据大小
		size_t getWritedDataSize()const
		{
			return mCurrentWrite - mBuffer;
		}
		// 已读数据大小
		size_t getReadedDataSize()const
		{
			return mCurrentRead - mBuffer;
		}
		// 剩余可读大小
		size_t getRemainReadSize()const
		{
			return mCurrentWrite - mCurrentRead;
		}
		// 剩余可写大小
		size_t getRemainWriteSize()const
		{
			return mSize - (mCurrentWrite - mBuffer);
		}
		// 整个数据块的大小
		size_t getBufferSize()const
		{
			return mSize;
		}

		// 写入数据，并移动写游标
		virtual size_t write(const void *data , size_t size);
		// 读取数据，并移动读游标
		virtual size_t read(void *buffer , size_t bufferSize , size_t readSize);

		// 通知写入了多少字节的数据
		void skipWriter(int size);
		// 通知读取了多少字节的数据
		void skipReader(int size);

		size_t tellReader()const
		{
			return getReadedDataSize();
		}
		size_t tellWriter()const
		{
			return getWritedDataSize();
		}

		// 把写入游标设置到这里
		void seekWriter(size_t pos);
		// 把读取游标设置到这里
		void seekReader(size_t pos);

		// 释放缓冲区，同时复位
		void clear();
		// 分配缓冲区，并复位
		void init(size_t dataSize);
	protected:
		// 内存流开始的指针
		char*           mBuffer;
		// 内存流的大小
		size_t          mSize;

		// 读取数据的当前位置
		char*           mCurrentRead;
		// 写入数据结束的位置
		char*           mCurrentWrite;
	};

	// 动态分配大小的内存流，当缓冲区写入不足时，会自动增长，并保留原来的数据
	class DynamicMemoryDataStream : public MemoryDataStream
	{
	public:
		DynamicMemoryDataStream(size_t dataSize = 1024);
		virtual ~DynamicMemoryDataStream();
		void reserve(size_t size);
		virtual size_t write(const void *data , size_t size);

		// 剩余可写大小
		size_t getRemainReserveWriteSize()const
		{
			return mReserveSize - (mCurrentWrite - mBuffer);
		}
	protected:
		size_t mReserveSize;
	};



	typedef std::shared_ptr<MemoryDataStream> MemoryDataStreamPtr;


};