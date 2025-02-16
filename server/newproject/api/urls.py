from django.urls import path
from .views import todos, todo_detail, check_notifications

urlpatterns = [
    path("todos/", todos),
    path("todos/<int:pk>/", todo_detail),
    path("todos/notify/", check_notifications),
]
