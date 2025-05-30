from django.urls import path
from .views import DocumentListCreateAPIView, DocumentRetrieveUpdateDestroyAPIView, AskDocumentQuestionAPIView, ChatHistoryAPIView, RegisterView 

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('documents/', DocumentListCreateAPIView.as_view(), name='document-list-create'),
    path('documents/<int:pk>/', DocumentRetrieveUpdateDestroyAPIView.as_view(), name='document-detail'),
    path('documents/<int:document_id>/ask/', AskDocumentQuestionAPIView.as_view(), name='ask-question'),
    path('chat/<int:session_id>/history/', ChatHistoryAPIView.as_view(), name='chat-history'),
]
