import requests
from .chunker import chunk_text
from .embedder import embed_chunks
from .vector_store import add_chunks_to_vector_db, search_similar_chunks
from documents.models import ChatSession, ChatMessage

def call_lm_studio(prompt):
    url = "http://127.0.0.1:1234/v1/chat/completions"
    payload = {
        "model": "tinyllama-1.1b-chat-v1.0",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3
    }

    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]

def answer_question(document_id, question, top_k=3, user=None, session_id=None):
    results = search_similar_chunks(question, top_k)
    top_chunks = results["documents"][0]
    context = "\n\n".join(top_chunks)

    prompt = f"Context:\n{context}\n\nQuestion: {question}\nAnswer:"
    answer = call_lm_studio(prompt)

    # Save chat session & message
    if user:
        if session_id:
            session = ChatSession.objects.get(id=session_id)
        else:
            session = ChatSession.objects.create(user=user, document_id=document_id)

        ChatMessage.objects.create(
            session=session,
            question=question,
            answer=answer,
            sources=top_chunks,
        )

        return answer, top_chunks, session.id

    return answer, top_chunks
#   return response.choices[0].message.content
#   return response.choices[0].message.content, results["documents"][0]
