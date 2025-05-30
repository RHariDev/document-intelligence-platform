import chromadb
from chromadb.utils import embedding_functions

chroma_client = chromadb.Client()
chroma_model = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

collection = chroma_client.get_or_create_collection(name="documents", embedding_function=chroma_model)

def add_chunks_to_vector_db(document_id, chunks, metadatas):
    collection.add(
        documents=chunks,
        metadatas=metadatas,
        ids=[f"{document_id}_{i}" for i in range(len(chunks))]
    )

def search_similar_chunks(query, top_k=3):
    return collection.query(query_texts=[query], n_results=top_k)
