import os
from rest_framework import generics, permissions
from .models import Document
from .serializers import DocumentSerializer
from .serializers import RegisterSerializer
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.views import APIView 
from rest_framework_simplejwt.tokens import RefreshToken
from PyPDF2 import PdfReader
from docx import Document as DocxDocument

def extract_text_from_file(uploaded_file):
    file_ext = os.path.splitext(uploaded_file.name)[1].lower()

    if file_ext == '.pdf':
        pdf = PdfReader(uploaded_file)
        return "\n".join([page.extract_text() or "" for page in pdf.pages])

    elif file_ext == '.docx':
        doc = DocxDocument(uploaded_file)
        return "\n".join([para.text for para in doc.paragraphs])

    elif file_ext == '.txt':
        # Assuming uploaded_file is InMemoryUploadedFile or similar
        return uploaded_file.read().decode('utf-8')

    else:
        raise ValueError("Unsupported file type. Please upload a PDF, DOCX, or TXT file.")
    
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "User registered successfully",
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DocumentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

class DocumentListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        document = serializer.save(user=self.request.user)

        try:
            extracted_text = extract_text_from_file(document.file)
            document.extracted_text = extracted_text
            document.save()
        except Exception as e:
            # Optionally handle exceptions here (e.g., log or notify user)
            raise e


# Your existing APIViews remain unchanged

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .rag.rag_pipeline import answer_question
from documents.models import ChatMessage

class AskDocumentQuestionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, document_id):
        question = request.data.get("question")
        top_k = int(request.data.get("top_k", 3))
        chat_session_id = request.data.get("chat_session_id")

        if not question:
            return Response({"error": "Question is required"}, status=400)

        answer, sources, session_id = answer_question(
            document_id, question, top_k, user=request.user, session_id=chat_session_id
        )

        return Response({
            "answer": answer,
            "sources": sources,
            "chat_session_id": session_id
        })

class ChatHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        messages = ChatMessage.objects.filter(session_id=session_id).order_by("created_at")
        return Response([
            {
                "question": m.question,
                "answer": m.answer,
                "sources": m.sources,
                "timestamp": m.created_at
            } for m in messages
        ])
