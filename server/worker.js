import { Worker } from 'bullmq';
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const worker = new Worker('file-upload-queue', 
    async job => {
    console.log('Worker job: ', job.data);
    const data = JSON.parse(job.data);
    /*
    Path: data.path
    read the pdf from the path
    chunk the pdf
    call the openai embedding model for every chunk,
    store the chunk in qdrant DB
    */

    // Load the pdf
    const loader = new PDFLoader(data.path);
    const docs = await loader.load();
    console.log('Docs:', docs);
    console.log('Plus 1');
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
    });
      
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: 'http://localhost:6333/',
      collectionName: "langchainjs-testing",
    });
    console.log('Plus 12');

    await vectorStore.addDocuments(docs);
    console.log('Documents added!');
    }, { 
            concurrency: 100, 
            connection: {
                host: 'localhost',
                port: '6379',
            } 
        }
    );