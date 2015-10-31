#include "BinarySerializer.h"
#define CCLOG(...)
//#include <Poco/UnicodeConverter.h>
namespace cocos2d
{
	uint32 BinarySerializer::HEADER_ID = 0x00000001;
	uint32 BinarySerializer::REVERSE_HEADER_ID = 0x10000000;
	uint32 BinarySerializer::CHUNK_HEADER_SIZE = 
		sizeof(uint32) + // id
		sizeof(uint16) + // version
		sizeof(uint32) + // length
		sizeof(uint32); // checksum

	BinarySerializer::BinarySerializer(const MemoryDataStreamPtr &stream, StreamByteOrder byteOrder  , bool autoHeader)
		: mDataStream(stream)
		, mReadWriteHeader(autoHeader)
	{
#if defined(POCO_ARCH_BIG_ENDIAN)
		mFlipBytes = (byteOrder == LITTLE_ENDIAN_BYTE_ORDER);
#else
		mFlipBytes = (byteOrder == BIG_ENDIAN_BYTE_ORDER);
#endif

	}

	BinarySerializer::BinarySerializer( size_t size, StreamByteOrder byteOrder  , bool autoHeader)
		: mDataStream(new DynamicMemoryDataStream(size))
		, mReadWriteHeader(autoHeader)
	{
#if defined(POCO_ARCH_BIG_ENDIAN)
		mFlipBytes = (byteOrder == LITTLE_ENDIAN_BYTE_ORDER);
#else
		mFlipBytes = (byteOrder == BIG_ENDIAN_BYTE_ORDER);
#endif
	}

	BinarySerializer::~BinarySerializer()
	{
		// really this should be empty if read/write was complete, but be tidy
		if (!mChunkStack.empty())
		{
			CCLOG("Warning: stream was not fully read / written; %d chunks remain unterminated." , mChunkStack.size());

		}
		for (ChunkStack::iterator i = mChunkStack.begin(); i != mChunkStack.end(); ++i)
			delete *i;
		mChunkStack.clear();


	}
	//---------------------------------------------------------------------
	void BinarySerializer::checkStream(bool failOnEof, bool validateReadable, bool validateWriteable) const
	{
	}
	//---------------------------------------------------------------------
	uint32 BinarySerializer::getCurrentChunkID() const
	{
		if (mChunkStack.empty())
			return 0;
		else
			return mChunkStack.back()->id;
	}
	//---------------------------------------------------------------------
	const BinarySerializer::Chunk* BinarySerializer::readChunkBegin()
	{
		// Have we figured out the endian mode yet?
		if (mReadWriteHeader)
			readHeader();
		Chunk* chunk = readChunkImpl();
		mChunkStack.push_back(chunk);

		return chunk;

	}
	//---------------------------------------------------------------------
	const BinarySerializer::Chunk* BinarySerializer::readChunkBegin(
		uint32 id, uint16 maxVersion, const char* msg)
	{
		const Chunk* c = readChunkBegin();
		if (c->id != id)
		{
			// rewind
			undoReadChunk(c->id);
			return 0;
		}
		else if (c->version > maxVersion)
		{
			CCLOG("Error: %s : Data version is %d but this software can only read up to version %d"
				, msg
				, c->version
				, maxVersion);
			// skip
			readChunkEnd(c->id);
			return 0;
		}

		return c;

	}
	//---------------------------------------------------------------------
	void BinarySerializer::undoReadChunk(uint32 id)
	{
		Chunk* c = popChunk(id);

		checkStream();

		mDataStream->seekReader(c->offset);

		delete c;

	}
	//---------------------------------------------------------------------
	uint32 BinarySerializer::peekNextChunkID()
	{
		checkStream();

		if (mDataStream->endOfRead())
			return 0;
		// Have we figured out the endian mode yet?
		if (mReadWriteHeader)
			readHeader();



		size_t homePos = mDataStream->tellReader();
		uint32 ret;
		read(ret);
		mDataStream->seekReader(homePos);

		return ret;
	}
	//---------------------------------------------------------------------
	void BinarySerializer::readChunkEnd(uint32 id)
	{
		Chunk* c = popChunk(id);

		checkStream();

		// skip to the end of the chunk if we were not there already
		// this lets us quite reading a chunk anywhere and have the read marker
		// automatically skip to the next one
		if (mDataStream->tellReader() < (c->offset + CHUNK_HEADER_SIZE + c->length))
			mDataStream->seekReader(c->offset + CHUNK_HEADER_SIZE + c->length);

		delete c;
	}
	//---------------------------------------------------------------------
	bool BinarySerializer::isEndOfChunk(uint32 id)
	{
		const Chunk* c = getCurrentChunk();
		CCASSERT(c->id == id , "isEndOfChunk");
		return mDataStream->tellReader() == (c->offset + CHUNK_HEADER_SIZE + c->length);
	}
	//---------------------------------------------------------------------
	void BinarySerializer::readHeader()
	{
		uint32 headerid;
		read(headerid);
		CCASSERT(headerid == HEADER_ID , "readHeader");

		mReadWriteHeader = false;

	}
	//---------------------------------------------------------------------
	const BinarySerializer::Chunk* BinarySerializer::getCurrentChunk() const
	{
		if (mChunkStack.empty())
			return 0;
		else
			return mChunkStack.back();
	}

	//---------------------------------------------------------------------
	void BinarySerializer::writeHeader()
	{
		write(HEADER_ID);
		mReadWriteHeader = false;
	}
	//---------------------------------------------------------------------
	void BinarySerializer::writeChunkBegin(uint32 id, uint16 version /* = 1 */)
	{
		checkStream(false, false, true);
		if (mReadWriteHeader)
			writeHeader();

		writeChunkImpl(id, version);

	}
	//---------------------------------------------------------------------
	void BinarySerializer::writeChunkEnd(uint32 id)
	{
		checkStream(false, false, true);

		Chunk* c = popChunk(id);

		// update the sizes
		size_t currPos = mDataStream->tellWriter();
		c->length = static_cast<uint32>(currPos - c->offset - CHUNK_HEADER_SIZE);

		// seek to 'length' position in stream for this chunk
		// skip id (32) and version (16)
		mDataStream->seekWriter(c->offset + sizeof(uint32) + sizeof(uint16));
		write(c->length);
		// write updated checksum
		uint32 checksum = calculateChecksum(c);
		write(checksum);

		// seek back to previous position
		mDataStream->seekWriter(currPos);

		delete c;

	}
	//---------------------------------------------------------------------
	size_t BinarySerializer::getOffsetFromChunkStart() const
	{
		checkStream(false, false, false);

		if (mChunkStack.empty())
		{
			return 0;
		}
		else
		{
			size_t pos = mDataStream->tellReader();
			size_t diff = pos - mChunkStack.back()->offset;
			if(diff >= CHUNK_HEADER_SIZE)
				return diff - CHUNK_HEADER_SIZE;
			else
				return 0; // not in a chunk?

		}

	}
	//---------------------------------------------------------------------
	BinarySerializer::Chunk* BinarySerializer::readChunkImpl()
	{
		Chunk *chunk = new Chunk();
		chunk->offset = static_cast<uint32>(mDataStream->tellReader());
		read(chunk->id);
		read(chunk->version);
		read(chunk->length);

		uint32 checksum;
		read(checksum);

		if (checksum != calculateChecksum(chunk))
		{
			// no good, this is an invalid chunk
			uint32 off = chunk->offset;
			delete chunk;
			CCLOG("Corrupt chunk detected in stream at byte %d BinarySerializer::readChunkImpl" , off);
			return 0;
		}
		else
		{
			return chunk;
		}

	}
	//---------------------------------------------------------------------
	void BinarySerializer::writeChunkImpl(uint32 id, uint16 version)
	{
		Chunk* c = new Chunk();
		c->id = id;
		c->version = version;
		c->offset = mDataStream->tellWriter();
		c->length = 0;

		mChunkStack.push_back(c);

		write(c->id);
		write(c->version);
		write(c->length);
		// write length again, this is just a placeholder for the checksum (to come later)
		write(c->length);

	}
	
	/** General hash function, derived from here
	http://www.azillionmonkeys.com/qed/hash.html
	Original by Paul Hsieh 
	*/
//#if OGRE_ENDIAN == OGRE_ENDIAN_LITTLE
#  define OGRE_GET16BITS(d) (*((const uint16 *) (d)))
//#else
//	// Cast to uint16 in little endian means first byte is least significant
//	// replicate that here
//#  define OGRE_GET16BITS(d) (*((const uint8 *) (d)) + (*((const uint8 *) (d+1))<<8))
//#endif
	uint32 FastHash (const char * data, int len, uint32 hashSoFar = 0)
	{
		uint32 hash;
		uint32 tmp;
		int rem;

		if (hashSoFar)
			hash = hashSoFar;
		else
			hash = len;

		if (len <= 0 || data == NULL) return 0;

		rem = len & 3;
		len >>= 2;

		/* Main loop */
		for (;len > 0; len--) {
			hash  += OGRE_GET16BITS (data);
			tmp    = (OGRE_GET16BITS (data+2) << 11) ^ hash;
			hash   = (hash << 16) ^ tmp;
			data  += 2*sizeof (uint16);
			hash  += hash >> 11;
		}

		/* Handle end cases */
		switch (rem) {
		case 3: hash += OGRE_GET16BITS (data);
			hash ^= hash << 16;
			hash ^= data[sizeof (uint16)] << 18;
			hash += hash >> 11;
			break;
		case 2: hash += OGRE_GET16BITS (data);
			hash ^= hash << 11;
			hash += hash >> 17;
			break;
		case 1: hash += *data;
			hash ^= hash << 10;
			hash += hash >> 1;
		}

		/* Force "avalanching" of final 127 bits */
		hash ^= hash << 3;
		hash += hash >> 5;
		hash ^= hash << 4;
		hash += hash >> 17;
		hash ^= hash << 25;
		hash += hash >> 6;

		return hash;
	}


	//---------------------------------------------------------------------
	uint32 BinarySerializer::calculateChecksum(Chunk* c)
	{
		// Always calculate checksums in little endian to make sure they match 
		// Otherwise checksums for the same data on different endians will not match
		uint32 id = c->id;
		uint16 version = c->version;
		uint32 length = c->length;

		uint32 hashVal = FastHash((const char*)&id, sizeof(uint32));
		hashVal = FastHash((const char*)&version, sizeof(uint16), hashVal);
		hashVal = FastHash((const char*)&length, sizeof(uint32), hashVal);

		return hashVal;
	}
	//---------------------------------------------------------------------
	BinarySerializer::Chunk* BinarySerializer::popChunk(uint id)
	{
		if (mChunkStack.empty())
		{
			CCLOG("No active chunk! BinarySerializer::popChunk");
			return 0;
		}

		const Chunk* chunk = mChunkStack.back();
		if (chunk->id != id)
		{
			CCLOG("Incorrect chunk id! BinarySerializer::popChunk:chunk->id[%d] != id[%d]", chunk->id , id);
			return 0;
		}

		Chunk* c = mChunkStack.back();
		mChunkStack.pop_back();
		return c;

	}

	//---------------------------------------------------------------------
	void BinarySerializer::writeData(const void* buf, size_t size)
	{
		mDataStream->write(buf , size);
	}
	//---------------------------------------------------------------------
	void BinarySerializer::write(const std::string& string)
	{
		// Poco::UInt32 of size first, then (unterminated) string
		ushort len = static_cast<ushort>(string.length());
		write(len);
		writeData(string.c_str(), len);
	}
	void BinarySerializer::write(const char* string)
	{
		// Poco::UInt32 of size first, then (unterminated) string
		ushort len = strlen(string);
		write(len);
		writeData(string, len);
	}
	//void BinarySerializer::write(const std::wstring& string)
	//{
	//	// Poco::UInt32 of size first, then (unterminated) string
	//	std::string utf8String;
	//	UnicodeConverter::toUTF8(string , utf8String);
	//	write(utf8String);
	//	//ushort len = static_cast<ushort>(string.length())* sizeof(wchar_t);
	//	//write(len);
	//	//for(size_t i = 0 ; i < string.length() ; i ++)
	//	//{
	//	//	write(string.at(i));
	//	//}
	//}
	//---------------------------------------------------------------------
	void BinarySerializer::write(const bool& val)
	{
		char c = (val)? 1 : 0;
		writeData(&c , sizeof(c));
	}
	//---------------------------------------------------------------------
	void BinarySerializer::readData(void* buf, size_t size)
	{
		mDataStream->read(buf , size , size);
	}
	//---------------------------------------------------------------------
	void BinarySerializer::read(std::string& string)
	{
		// std::string is stored as a Poco::UInt32 character count, then string
		ushort len = 0;
		read(len);
		string.resize(len);
		if (len)
			readData(&(string.at(0)), len);
	}
	//void BinarySerializer::read(std::wstring& string)
	//{
	//	UnicodeConverter::toUTF16(readAs<std::string>() , string);
	//	// std::string is stored as a Poco::UInt32 character count, then string
	//	//ushort len;
	//	//read(len);
	//	//len = len;
	//	//string.resize(len);
	//	//if (len)
	//	//{
	//	//	for(ushort i = 0 ; i < len ; i ++)
	//	//	{
	//	//		read(string[i]);
	//	//	}
	//	//}
	//}
	//---------------------------------------------------------------------
	void BinarySerializer::read(bool& val)
	{
		char c;
		read(c);
		val = (c == 1);
	}

	void BinarySerializer::write(const wchar_t &value)
	{
		if(mFlipBytes)
		{
			wchar_t valueFliped = ByteOrder::flipBytes((Int16)value);
			mDataStream->write(&valueFliped , sizeof(valueFliped));
		}
		else
		{
			mDataStream->write(&value , sizeof(value));
		}
	}
	void BinarySerializer::read(wchar_t &value)
	{
		mDataStream->read(&value , sizeof(value) , sizeof(value));
		if(mFlipBytes)
		{
			value = ByteOrder::flipBytes((Int16)value);
		}
	}

	void BinarySerializer::write(const short &value)
	{
		if(mFlipBytes)
		{
			short valueFliped = ByteOrder::flipBytes(value);
			mDataStream->write(&valueFliped , sizeof(valueFliped));
		}
		else
		{
			mDataStream->write(&value , sizeof(value));
		}
	}
	void BinarySerializer::read(short &value)
	{
		mDataStream->read(&value , sizeof(value) , sizeof(value));
		if(mFlipBytes)
		{
			value = ByteOrder::flipBytes(value);
		}
	}

	void BinarySerializer::write(const ushort &value)
	{
		if(mFlipBytes)
		{
			ushort valueFliped = ByteOrder::flipBytes(value);
			mDataStream->write(&valueFliped , sizeof(valueFliped));
		}
		else
		{
			mDataStream->write(&value , sizeof(value));
		}
	}
	void BinarySerializer::read(ushort &value)
	{
		mDataStream->read(&value , sizeof(value) , sizeof(value));
		if(mFlipBytes)
		{
			value = ByteOrder::flipBytes(value);
		}
	}

	void BinarySerializer::write(const int &value)
	{
		if(mFlipBytes)
		{
			int valueFliped = ByteOrder::flipBytes(value);
			mDataStream->write(&valueFliped , sizeof(valueFliped));
		}
		else
		{
			mDataStream->write(&value , sizeof(value));
		}
	}
	void BinarySerializer::read(int &value)
	{
		mDataStream->read(&value , sizeof(value) , sizeof(value));
		if(mFlipBytes)
		{
			value = ByteOrder::flipBytes(value);
		}
	}

	void BinarySerializer::write(const unsigned int &value)
	{
		if(mFlipBytes)
		{
			unsigned int valueFliped = ByteOrder::flipBytes(value);
			mDataStream->write(&valueFliped , sizeof(valueFliped));
		}
		else
		{
			mDataStream->write(&value , sizeof(value));
		}
	}
	void BinarySerializer::read(unsigned int &value)
	{
		mDataStream->read(&value , sizeof(value) , sizeof(value));
		if(mFlipBytes)
		{
			value = ByteOrder::flipBytes(value);
		}
	}

	void BinarySerializer::write(const unsigned long &value)
	{
		if (mFlipBytes)
		{
			unsigned long valueFliped = ByteOrder::flipBytes((UInt32)value);
			mDataStream->write(&valueFliped, sizeof(valueFliped));
		}
		else
		{
			mDataStream->write(&value, sizeof(value));
		}
	}
	void BinarySerializer::read(unsigned long &value)
	{
		mDataStream->read(&value, sizeof(value), sizeof(value));
		if (mFlipBytes)
		{
			value = ByteOrder::flipBytes((UInt32)value);
		}
	}

	void BinarySerializer::write(const float &value)
	{
		if(mFlipBytes)
		{
			int valueFliped = ByteOrder::flipBytes(*(int*)&value);
			mDataStream->write(&valueFliped , sizeof(valueFliped));
		}
		else
		{
			mDataStream->write(&value , sizeof(value));
		}
	}
	void BinarySerializer::read(float &value)
	{
		mDataStream->read(&value , sizeof(value) , sizeof(value));
		if(mFlipBytes)
		{
			int valueFliped = ByteOrder::flipBytes(*(int*)&value);
			value = *(float*)&valueFliped;
		}
	}

	void BinarySerializer::write(const llong &value)
	{
		if(mFlipBytes)
		{
			llong valueFliped = ByteOrder::flipBytes(value);
			mDataStream->write(&valueFliped , sizeof(valueFliped));
		}
		else
		{
			mDataStream->write(&value , sizeof(value));
		}
	}
	void BinarySerializer::read(llong &value)
	{
		mDataStream->read(&value , sizeof(value) , sizeof(value));
		if(mFlipBytes)
		{
			value = ByteOrder::flipBytes(value);
		}
	}

	void BinarySerializer::write(const double &value)
	{
		if(mFlipBytes)
		{
			Int64 valueFliped = ByteOrder::flipBytes(*(Int64*)&value);
			mDataStream->write(&valueFliped , sizeof(valueFliped));
		}
		else
		{
			mDataStream->write(&value , sizeof(value));
		}
	}

	void BinarySerializer::read(double &value)
	{
		Int64 valueInt64;
		mDataStream->read(&valueInt64, sizeof(valueInt64), sizeof(valueInt64));
		if (mFlipBytes)
		{
			valueInt64 = ByteOrder::flipBytes(valueInt64);
			value = *(double*)&valueInt64;
		}
	}


	void BinarySerializer::saveToFile(const std::string &fileName)
	{
		FILE *f = fopen(fileName.c_str() , "wb");
		if(f)
		{
			fwrite(mDataStream->getBuffer() , mDataStream->getWritedDataSize() , 1 , f);
			fclose(f);
		}
	}

	void BinarySerializer::loadFromFile(const std::string &fileName)
	{
		FILE *f = fopen(fileName.c_str(), "rb");
		fseek(f, 0, SEEK_END);
		long size = ftell(f);		
		fseek(f, 0, SEEK_SET);
		mDataStream.reset(new MemoryDataStream(size));
		fread(mDataStream->getBuffer(), size, 1, f);
		mDataStream->seekWriter(size);
		fclose(f);
	}



};