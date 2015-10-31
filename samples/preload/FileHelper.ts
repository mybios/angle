/**
 * Created by TreyTang on 2015/7/14.
 */


    // version xml file
    // file structure description xml file
    // full addition file
    //

module game
{
    export class FileHelper
    {
        static getFilePath(path:string)
        {
            return path.replace(/^(.+[\\/])?([^\\/]+?)(\.[^\.\\/]*?)?$/gi,"$1");
        }

        static getFileNameNoExtName(path:string)
        {
            return path.replace(/^(.+[\\/])?([^\\/]+?)(\.[^\.\\/]*?)?$/gi,"$2");
        }

        static getFileName(path:string)
        {
            return path.replace(/^(.+[\\/])?([^\\/]+?\.[^\.\\/]*?)?$/gi,"$2");
        }

        static getFileExtName(path:string)
        {
            return path.replace(/.+\./,"");
        }

        static downLoad (path:string , func:func , startPos?:number , dataSize?:number)
        {
            if (dataSize)
                cc.CURLManager.getInstance ().createTask (path , func , 0 , startPos , dataSize);
            else if (startPos)
                cc.CURLManager.getInstance ().createTask (path , func , 0 , startPos);
            else
                cc.CURLManager.getInstance ().createTask (path , func);
        }

        static saveFile (stream:cc.MemoryDataStreamWrap , filePath:string)
        {
            filePath = FileHelper.fullPathForFilename (filePath);
            stream.saveToFile (filePath);
        }

        static addToFile (stream:cc.MemoryDataStreamWrap , filePath:string)
        {
            filePath = FileHelper.fullPathForFilename (filePath);
            stream.addToFile (filePath);
        }

        static fullPathForFilename (path:string):string
        {
            return path;
        }

        static readData (filePath:string):cc.MemoryDataStreamWrap
        {
            filePath = FileHelper.fullPathForFilename (filePath);
            return cc.FileSystem.readData (filePath);
        }

        static compress (source:cc.MemoryDataStreamWrap):cc.MemoryDataStreamWrap
        {
            return cc.ExtTools.snappyCompress(source);
        }

        static uncompress (source:cc.MemoryDataStreamWrap):cc.MemoryDataStreamWrap
        {
            return cc.ExtTools.snappyUncompress(source);
        }

        static decrypt (source:cc.MemoryDataStreamWrap):cc.MemoryDataStreamWrap
        {
            return cc.ExtTools.decrypt (source);
        }

        static encrypt (source:cc.MemoryDataStreamWrap):cc.MemoryDataStreamWrap
        {
            return cc.ExtTools.encrypt (source);
        }

        static createServerStream (filePath:string):cc.MemoryDataStreamWrap
        {
            let stream1 = FileHelper.readData (filePath);
            let stream2 = FileHelper.encrypt (stream1);
            stream1.clear ();
            let stream3 = FileHelper.compress (stream2);
            stream2.clear ();
            return stream3;
        }

        static createClientStream (filePath:string):cc.MemoryDataStreamWrap
        {
            let stream1 = FileHelper.readData (filePath);
            let stream2 = FileHelper.encrypt (stream1);
            stream1.clear ();
            return stream2;
        }

        static readFromServerFile (filePath:string):cc.MemoryDataStreamWrap
        {
            let stream1 = FileHelper.readData (filePath);
            let stream2 = FileHelper.uncompress (stream1);
            stream1.clear ();
            let stream3 = FileHelper.decrypt (stream2);
            stream2.clear ();
            return stream3;
        }

        static readFromClientFile (filePath:string):cc.MemoryDataStreamWrap
        {
            let stream1 = FileHelper.readData (filePath);
            let stream2 = FileHelper.decrypt (stream1);
            stream1.clear ();
            return stream2;
        }

        static readFromClientStream (stream:cc.MemoryDataStreamWrap):cc.MemoryDataStreamWrap
        {
            return FileHelper.decrypt (stream);
        }

        static readFromServerStream (stream:cc.MemoryDataStreamWrap):cc.MemoryDataStreamWrap
        {
            let stream1 = FileHelper.uncompress (stream);
            let stream2 = FileHelper.decrypt (stream1);
            stream1.clear ();
            return stream2;
        }

        static clientStreamToServerStream (client:cc.MemoryDataStreamWrap)
        {
            return FileHelper.compress (client);
        }

        static serverStreamToClientStream (server:cc.MemoryDataStreamWrap)
        {
            return FileHelper.uncompress (server);
        }

        static convertToClientStream(stream:cc.MemoryDataStreamWrap)
        {
            return FileHelper.decrypt (stream);
        }

        static convertToServerStream(stream:cc.MemoryDataStreamWrap)
        {
            let stream1 = FileHelper.encrypt (stream);
            let stream2 = FileHelper.compress (stream1);
            stream1.clear ();
            return stream2;
        }

    }
}