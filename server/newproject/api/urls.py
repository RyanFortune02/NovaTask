from django.urls import path
from .views import (
    todos,
    todo_detail,
    check_notifications,
    time_entries,
    time_entry_detail,
)

urlpatterns = [
    path("todos/", todos),
    path("todos/<int:pk>/", todo_detail),
    path("todos/notify/", check_notifications),
    path("times/", time_entries),
    path("times/<int:fpk>/", time_entry_detail),
]
